from fastapi import Depends, FastAPI
from sqlalchemy import text

from .database import engine, Base
from . import models
from .dependencies import (
    get_current_user,
    require_donor,
    require_ngo,
    require_volunteer,
)
from .models import User
from .routers import auth, donations, requests, pickups


app = FastAPI(
    title="FoodRescue API",
    description="Backend API for the FoodRescue mobile application",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(donations.router)
app.include_router(requests.router)
app.include_router(pickups.router)
Base.metadata.create_all(bind=engine)



@app.get("/")
def root():
    return {
        "message": "FoodRescue API is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


@app.get("/database-test")
def database_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "status": "success",
        }

    except Exception as e:
        return {
            "database": "connection failed",
            "error": str(e),
        }


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }

@app.get("/donor-test")
def donor_test(current_user: User = Depends(require_donor)):
    return {
        "message": "Donor access granted",
        "user": current_user.name,
        "role": current_user.role,
    }


@app.get("/ngo-test")
def ngo_test(current_user: User = Depends(require_ngo)):
    return {
        "message": "NGO access granted",
        "user": current_user.name,
        "role": current_user.role,
    }


@app.get("/volunteer-test")
def volunteer_test(current_user: User = Depends(require_volunteer)):
    return {
        "message": "Volunteer access granted",
        "user": current_user.name,
        "role": current_user.role,
    }