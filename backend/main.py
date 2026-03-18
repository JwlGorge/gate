from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import os
import logging
from typing import List

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    logger.info("Health check pinged")
    return {"status": "ok"}

@app.post("/login", response_model=schemas.User)
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    logger.info(f"Login attempt for email: {user.email}")
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if not db_user:
            logger.info(f"Creating new user: {user.name} ({user.email})")
            db_user = models.User(name=user.name, email=user.email)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return db_user
    except Exception as e:
        logger.error(f"Error during login for {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during login")

@app.get("/questions/{qp_name}")
def get_questions(qp_name: str):
    # Currently only one QP, and we serve it from gate1.json
    filename = "gate1.json"
    if not os.path.exists(os.path.join(os.path.dirname(__file__), filename)):
        raise HTTPException(status_code=404, detail="Question paper not found")
    
    with open(os.path.join(os.path.dirname(__file__), filename), "r") as f:
        questions = json.load(f)
    return questions

@app.post("/submit", response_model=schemas.Result)
def submit_result(result: schemas.ResultCreate, db: Session = Depends(database.get_db)):
    db_result = models.Result(**result.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

@app.get("/rankings", response_model=List[schemas.Ranking])
def get_rankings(email: str = None, db: Session = Depends(database.get_db)):
    # Fetch top 10 unique users by their highest score
    from sqlalchemy import func
    
    subquery = db.query(
        models.Result.user_email,
        func.max(models.Result.score).label("max_score")
    ).group_by(models.Result.user_email).subquery()
    
    rankings_query = db.query(
        models.User.name,
        models.User.email,
        subquery.c.max_score
    ).join(models.User, models.User.email == subquery.c.user_email).order_by(subquery.c.max_score.desc()).limit(10)
    
    results = []
    for idx, (name, email_addr, score) in enumerate(rankings_query.all()):
        results.append({
            "name": name,
            "email": email_addr,
            "score": score,
            "rank": idx + 1
        })
        
    # If email provided and not in top 10, find its rank
    if email and not any(r["email"] == email for r in results):
        user_best_score_query = db.query(func.max(models.Result.score)).filter(models.Result.user_email == email).scalar()
        if user_best_score_query is not None:
             user_rank = db.query(func.count(subquery.c.user_email)).filter(subquery.c.max_score > user_best_score_query).scalar() + 1
             user_data = db.query(models.User).filter(models.User.email == email).first()
             results.append({
                 "name": user_data.name if user_data else "Unknown",
                 "email": email,
                 "score": user_best_score_query,
                 "rank": user_rank
             })
             
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
