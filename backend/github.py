import requests
from typing import List, Dict, Any

def fetch_github_prs_graphql(owner: str, repo: str, token: str) -> List[Dict[Any, Any]]:
    query = """
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequests(last: 100, states: [MERGED, CLOSED]) {
          nodes {
            databaseId
            number
            title
            state
            createdAt
            mergedAt
            closedAt
            additions
            deletions
            author {
              login
              avatarUrl
            }
            comments {
              totalCount
            }
          }
        }
      }
    }
    """

    url = 'https://api.github.com/graphql'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    response = requests.post(
        url,
        json={'query': query, 'variables': {'owner': owner, 'repo': repo}},
        headers=headers
    )
    
    if response.status_code != 200:
        raise Exception(f"GitHub API Error: {response.status_code} - {response.text}")
        
    data = response.json()
    if 'errors' in data:
        raise Exception(f"GraphQL Error: {data['errors'][0]['message']}")
        
    return data['data']['repository']['pullRequests']['nodes']
