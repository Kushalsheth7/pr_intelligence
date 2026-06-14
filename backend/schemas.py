from pydantic import BaseModel
from typing import List, Optional
import datetime

class SyncRequest(BaseModel):
    owner: str
    repo: str
    token: str

class AuthorBase(BaseModel):
    login: str
    avatar_url: Optional[str] = None

class PullRequestBase(BaseModel):
    number: int
    title: str
    state: str
    created_at: datetime.datetime
    merged_at: Optional[datetime.datetime] = None
    additions: int
    deletions: int
    comments: int
    author: AuthorBase

class RepositoryMetrics(BaseModel):
    id: int
    owner: str
    name: str
    total_prs: int
    merged_prs: int
    average_merge_time_hours: float

class EngineerMetrics(BaseModel):
    login: str
    avatar_url: Optional[str]
    merged_prs: int
    average_merge_time_hours: float

class DashboardResponse(BaseModel):
    repository: RepositoryMetrics
    pull_requests: List[PullRequestBase]
    engineers: List[EngineerMetrics]
