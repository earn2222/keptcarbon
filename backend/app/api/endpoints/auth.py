from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.schemas.auth import Token, UserLogin, UserRegister, GoogleLogin
from app.models.models import User

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    # Note: In a real app, you should verify the password here
    # For now, we'll keep it simple as requested
    
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/google", response_model=Token)
async def google_login(
    data: GoogleLogin,
    db: Session = Depends(get_db)
):
    """Google Login and get access token"""
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            data.token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        email = idinfo["email"]
        name = idinfo.get("name", "")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user if not exists
            user = User(
                email=email,
                name=name,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)), # Random password for Google users
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = create_access_token(subject=user.email)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )


@router.post("/register")
async def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        name=user_in.name,
        province=user_in.province
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


@router.post("/logout")
async def logout():
    """Logout current user"""
    return {"message": "Logged out successfully"}
