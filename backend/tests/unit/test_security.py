import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

def test_password_hashing():
    password = "StrongSecureP@ssword1"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_tokens():
    user_id = "test-user-id"
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    assert access_token is not None
    assert refresh_token is not None

    decoded_access = decode_token(access_token)
    assert decoded_access["sub"] == user_id
    assert decoded_access["type"] == "access"

    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh["sub"] == user_id
    assert decoded_refresh["type"] == "refresh"


def test_invalid_token():
    with pytest.raises(ValueError, match="Invalid or expired token"):
        decode_token("invalid-token-string")
