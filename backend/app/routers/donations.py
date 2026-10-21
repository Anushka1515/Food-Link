from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_donor, require_ngo
from ..models import Donation, User
from ..schemas import DonationCreate, DonationResponse


router = APIRouter(
    prefix="/donations",
    tags=["Donations"],
)


# --------------------------------------------------
# DONOR: Create a donation
# --------------------------------------------------

@router.post("/", response_model=DonationResponse)
def create_donation(
    donation_data: DonationCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db),
):
    donation = Donation(
        food_name=donation_data.food_name,
        quantity=donation_data.quantity,
        category=donation_data.category,
        description=donation_data.description,
        expiry_time=donation_data.expiry_time,
        pickup_location=donation_data.pickup_location,
        status="available",
        donor_id=current_user.id,
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)

    return donation


# --------------------------------------------------
# DONOR: Get my donations
# --------------------------------------------------

@router.get("/my", response_model=list[DonationResponse])
def get_my_donations(
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db),
):
    donations = (
        db.query(Donation)
        .filter(Donation.donor_id == current_user.id)
        .order_by(Donation.id.desc())
        .all()
    )

    return donations


# --------------------------------------------------
# NGO: Get available donations
# --------------------------------------------------

@router.get("/available", response_model=list[DonationResponse])
def get_available_donations(
    current_user: User = Depends(require_ngo),
    db: Session = Depends(get_db),
):
    donations = (
        db.query(Donation)
        .filter(Donation.status == "available")
        .order_by(Donation.expiry_time.asc())
        .all()
    )

    return donations


# --------------------------------------------------
# Get a single donation
# --------------------------------------------------

@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(
    donation_id: int,
    current_user: User = Depends(
        # Any authenticated user can view a donation
        # for now; role-specific restrictions come later.
        require_ngo
    ),
    db: Session = Depends(get_db),
):
    donation = (
        db.query(Donation)
        .filter(Donation.id == donation_id)
        .first()
    )

    if donation is None:
        raise HTTPException(
            status_code=404,
            detail="Donation not found",
        )

    return donation