from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    qp_name = Column(String)
    score = Column(Float)
    accuracy = Column(Float)
    time_taken = Column(Integer)  # in seconds
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
