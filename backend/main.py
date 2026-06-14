from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import models
import schemas
import database
from github import fetch_github_prs_graphql

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="PR Intelligence API")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/sync")
def sync_repository(req: schemas.SyncRequest, db: Session = Depends(database.get_db)):
    try:
        prs = fetch_github_prs_graphql(req.owner, req.repo, req.token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Upsert Repository
    repo = db.query(models.Repository).filter(
        models.Repository.owner == req.owner,
        models.Repository.name == req.repo
    ).first()
    
    if not repo:
        repo = models.Repository(owner=req.owner, name=req.repo)
        db.add(repo)
        db.commit()
        db.refresh(repo)

    count = 0
    for pr_data in prs:
        if not pr_data.get('author') or not pr_data['author'].get('login'):
            continue
            
        author_login = pr_data['author']['login']
        author_avatar = pr_data['author'].get('avatarUrl')
        
        # Upsert Author
        author = db.query(models.Author).filter(models.Author.login == author_login).first()
        if not author:
            author = models.Author(login=author_login, avatar_url=author_avatar)
            db.add(author)
            db.commit()
            db.refresh(author)
        elif author.avatar_url != author_avatar:
            author.avatar_url = author_avatar
            db.commit()

        # Upsert PR
        db_pr = db.query(models.PullRequest).filter(models.PullRequest.github_id == pr_data['databaseId']).first()
        
        created_at = datetime.fromisoformat(pr_data['createdAt'].replace('Z', '+00:00'))
        merged_at = datetime.fromisoformat(pr_data['mergedAt'].replace('Z', '+00:00')) if pr_data.get('mergedAt') else None
        closed_at = datetime.fromisoformat(pr_data['closedAt'].replace('Z', '+00:00')) if pr_data.get('closedAt') else None
        
        if not db_pr:
            db_pr = models.PullRequest(
                github_id=pr_data['databaseId'],
                number=pr_data['number'],
                title=pr_data['title'],
                state=pr_data['state'],
                created_at=created_at,
                merged_at=merged_at,
                closed_at=closed_at,
                additions=pr_data['additions'],
                deletions=pr_data['deletions'],
                comments=pr_data['comments']['totalCount'],
                repository_id=repo.id,
                author_id=author.id
            )
            db.add(db_pr)
        else:
            db_pr.state = pr_data['state']
            db_pr.merged_at = merged_at
            db_pr.closed_at = closed_at
            db_pr.comments = pr_data['comments']['totalCount']
            
        count += 1
        
    db.commit()
    return {"success": True, "count": count}

@app.get("/api/repositories")
def get_repositories(db: Session = Depends(database.get_db)):
    repos = db.query(models.Repository).order_by(models.Repository.created_at.desc()).all()
    
    result = []
    for r in repos:
        result.append({
            "id": r.id,
            "owner": r.owner,
            "name": r.name,
            "pr_count": len(r.pull_requests),
            "updated_at": r.created_at
        })
    return result

@app.get("/api/repositories/{repo_id}")
def get_repository(repo_id: int, db: Session = Depends(database.get_db)):
    repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    prs = repo.pull_requests
    
    # Calculate metrics
    total_merge_time_ms = 0
    merged_count = 0
    author_stats = {}
    
    pr_list = []
    
    for pr in prs:
        author = pr.author
        login = author.login
        
        if login not in author_stats:
            author_stats[login] = {
                "login": login,
                "avatar_url": author.avatar_url,
                "prs": 0,
                "merged": 0,
                "total_merge_time_ms": 0
            }
            
        author_stats[login]["prs"] += 1
        
        if pr.merged_at:
            merged_count += 1
            merge_time = (pr.merged_at - pr.created_at).total_seconds() * 1000
            total_merge_time_ms += merge_time
            author_stats[login]["merged"] += 1
            author_stats[login]["total_merge_time_ms"] += merge_time
            
        pr_list.append({
            "number": pr.number,
            "title": pr.title,
            "state": pr.state,
            "created_at": pr.created_at,
            "merged_at": pr.merged_at,
            "additions": pr.additions,
            "deletions": pr.deletions,
            "comments": pr.comments,
            "author": {
                "login": author.login,
                "avatar_url": author.avatar_url
            }
        })
        
    avg_merge_time_hours = (total_merge_time_ms / merged_count) / (1000 * 60 * 60) if merged_count > 0 else 0
    
    engineers = []
    for stats in author_stats.values():
        eng_avg = (stats["total_merge_time_ms"] / stats["merged"]) / (1000 * 60 * 60) if stats["merged"] > 0 else 0
        engineers.append({
            "login": stats["login"],
            "avatar_url": stats["avatar_url"],
            "merged_prs": stats["merged"],
            "average_merge_time_hours": eng_avg
        })
        
    engineers.sort(key=lambda x: x["merged_prs"], reverse=True)
    pr_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "repository": {
            "id": repo.id,
            "owner": repo.owner,
            "name": repo.name,
            "total_prs": len(prs),
            "merged_prs": merged_count,
            "average_merge_time_hours": avg_merge_time_hours
        },
        "pull_requests": pr_list[:100], # Send last 100
        "engineers": engineers
    }

@app.delete("/api/repositories/{repo_id}")
def delete_repository(repo_id: int, db: Session = Depends(database.get_db)):
    repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    # Delete associated PRs first to maintain referential integrity
    db.query(models.PullRequest).filter(models.PullRequest.repository_id == repo_id).delete()
    
    # Delete the repository
    db.delete(repo)
    db.commit()
    return {"success": True}

