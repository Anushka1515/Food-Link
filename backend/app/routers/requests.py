
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_donor, require_ngo
from ..models import Donation, DonationRequest, User
from ..schemas import (
    DonationRequestCreate,
    DonationRequestResponse,
)

router = APIRouter(prefix="/requests", tags=["Donation Requests"])


# NGO: Request an available donation
@router.post("/", response_model=DonationRequestResponse)
def create_request(
    request_data: DonationRequestCreate,
    current_user: User = Depends(require_ngo),
    db: Session = Depends(get_db),
):
    donation = (
        db.query(Donation)
        .filter(Donation.id == request_data.donation_id)
        .with_for_update()
        .first()
    )

    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status != "available":
        raise HTTPException(
            status_code=400,
            detail="Donation is no longer available",
        )

    existing_request = (
        db.query(DonationRequest)
        .filter(
            DonationRequest.donation_id == donation.id,
            DonationRequest.ngo_id == current_user.id,
        )
        .first()
    )

    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="You have already requested this donation",
        )

    donation_request = DonationRequest(
        donation_id=donation.id,
        ngo_id=current_user.id,
        status="pending",
    )

    donation.status = "requested"
    db.add(donation_request)
    db.commit()
    db.refresh(donation_request)

    return donation_request


# NGO: View my requests
@router.get("/my", response_model=list[DonationRequestResponse])
def get_my_requests(
    current_user: User = Depends(require_ngo),
    db: Session = Depends(get_db),
):
    return (
        db.query(DonationRequest)
        .filter(DonationRequest.ngo_id == current_user.id)
        .order_by(DonationRequest.id.desc())
        .all()
    )


# Donor: View requests for my donations
@router.get("/donor")
def get_donor_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_donor),
):
    requests = (
        db.query(DonationRequest, Donation, User)
        .join(Donation, DonationRequest.donation_id == Donation.id)
        .join(User, DonationRequest.ngo_id == User.id)
        .filter(Donation.donor_id == current_user.id)
        .order_by(DonationRequest.id.desc())
        .all()
    )

    return [
        {
            "id": request.id,
            "donation_id": donation.id,
            "food_name": donation.food_name,
            "quantity": donation.quantity,
            "category": donation.category,
            "pickup_location": donation.pickup_location,
            "ngo_id": ngo.id,
            "ngo_name": ngo.name,
            "status": request.status,
        }
        for request, donation, ngo in requests
    ]


# Donor: Approve an NGO request
@router.put(
    "/{request_id}/approve",
    response_model=DonationRequestResponse,
)
def approve_request(
    request_id: int,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db),
):
    donation_request = (
        db.query(DonationRequest)
        .join(
            Donation,
            DonationRequest.donation_id == Donation.id,
        )
        .filter(
            DonationRequest.id == request_id,
            Donation.donor_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if donation_request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    if donation_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be approved",
        )

    donation = (
        db.query(Donation)
        .filter(Donation.id == donation_request.donation_id)
        .with_for_update()
        .first()
    )

    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status != "requested":
        raise HTTPException(
            status_code=400,
            detail="This donation is not awaiting approval",
        )

    donation_request.status = "approved"
    donation.status = "claimed"

    db.commit()
    db.refresh(donation_request)
    return donation_request


# Donor: Reject an NGO request
@router.put(
    "/{request_id}/reject",
    response_model=DonationRequestResponse,
)
def reject_request(
    request_id: int,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db),
):
    donation_request = (
        db.query(DonationRequest)
        .join(
            Donation,
            DonationRequest.donation_id == Donation.id,
        )
        .filter(
            DonationRequest.id == request_id,
            Donation.donor_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if donation_request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    if donation_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be rejected",
        )

    donation = (
        db.query(Donation)
        .filter(Donation.id == donation_request.donation_id)
        .with_for_update()
        .first()
    )

    donation_request.status = "rejected"

    # Release the donation if it was reserved for this request.
    if donation and donation.status == "requested":
        donation.status = "available"

    db.commit()
    db.refresh(donation_request)
    return donation_request

