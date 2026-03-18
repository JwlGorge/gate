from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class ResultBase(BaseModel):
    user_email: str
    qp_name: str
    score: float
    accuracy: float
    time_taken: int

class ResultCreate(ResultBase):
    pass

class Result(ResultBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class Ranking(BaseModel):
    name: str
    email: str
    score: float
    rank: int
