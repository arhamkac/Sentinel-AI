from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.dependencies import get_current_active_user
from app.repositories.user_repository import UserRepository
from app.models.user import User, Organization
from app.schemas.auth import (
    RegisterRequest,
    TokenResponse,
    UserResponse,
    RefreshRequest,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    existing_user = await repo.get_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Find or create organization
    org = await repo.get_organization_by_name(payload.organization)
    if not org:
        org = Organization(
            name=payload.organization,
            domain=payload.email.split("@")[-1],
            industry="Default"
        )
        await repo.create_organization(org)

    # Create new user
    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="analyst",
        is_active=True,
        organization_id=org.id
    )
    await repo.create(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        token_data = decode_token(payload.refresh_token)
        if token_data.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        user_id = token_data.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    new_access = create_access_token(subject=user.id)
    new_refresh = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout the current user.

    Note: JWT tokens are stateless and cannot be server-side invalidated without
    a token blacklist (e.g. Redis). The client is responsible for discarding tokens.
    This endpoint validates the token is still valid before acknowledging logout.
    """
    return {"detail": f"User {current_user.email} logged out successfully"}
