
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# -------------------------
# User
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# -------------------------
# Donation
# -------------------------

class DonationCreate(BaseModel):
    food_name: str
    quantity: str
    category: str
    description: str | None = None
    expiry_time: datetime
    pickup_location: str


class DonationResponse(BaseModel):
    id: int
    food_name: str
    quantity: str
    category: str
    description: str | None = None
    expiry_time: datetime
    pickup_location: str
    status: str
    donor_id: int

    class Config:
        from_attributes = True


# -------------------------
# Donation Request
# -------------------------

class DonationRequestCreate(BaseModel):
    donation_id: int


class DonationRequestResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    status: str

    class Config:
        from_attributes = True


# -------------------------
# Pickup
# -------------------------

class PickupCreate(BaseModel):
    donation_id: int
    request_id: int
    pickup_address: str
    drop_address: str


class PickupComplete(BaseModel):
    delivered_quantity: float = Field(gt=0, le=99999999)
    quantity_unit: Literal[
        "kg", "g", "meals", "portions", "boxes"
    ]


class PickupResponse(BaseModel):
    id: int
    donation_id: int
    request_id: int
    volunteer_id: int
    pickup_address: str
    drop_address: str
    status: str
    delivered_quantity: float | None = None
    quantity_unit: str | None = None

    class Config:
        from_attributes = True


class PickupOpportunityResponse(BaseModel):
    request_id: int
    donation_id: int
    food_name: str
    quantity: str
    category: str
    description: str | None = None
    expiry_time: datetime
    pickup_location: str
    ngo_name: str
