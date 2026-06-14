from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    owner = Column(String, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    pull_requests = relationship("PullRequest", back_populates="repository")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    avatar_url = Column(String)

    pull_requests = relationship("PullRequest", back_populates="author")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    number = Column(Integer)
    title = Column(String)
    state = Column(String)
    created_at = Column(DateTime)
    merged_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    additions = Column(Integer)
    deletions = Column(Integer)
    comments = Column(Integer)

    repository_id = Column(Integer, ForeignKey("repositories.id"))
    author_id = Column(Integer, ForeignKey("authors.id"))

    repository = relationship("Repository", back_populates="pull_requests")
    author = relationship("Author", back_populates="pull_requests")
