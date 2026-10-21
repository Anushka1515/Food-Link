
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_volunteer
from ..models import Donation, DonationRequest, Pickup, User
from ..schemas import (
    PickupCreate,
    PickupResponse,
    PickupComplete,
    PickupOpportunityResponse,
)

router = APIRouter(prefix="/pickups", tags=["Pickups"])


@router.get(
    "/available",
    response_model=list[PickupOpportunityResponse],
)
def get_available_pickups(
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    return (
        db.query(
            DonationRequest.id.label("request_id"),
            Donation.id.label("donation_id"),
            Donation.food_name,
            Donation.quantity,
            Donation.category,
            Donation.description,
            Donation.expiry_time,
            Donation.pickup_location,
            User.name.label("ngo_name"),
        )
        .join(
            Donation,
            DonationRequest.donation_id == Donation.id,
        )
        .join(
            User,
            DonationRequest.ngo_id == User.id,
        )
        .outerjoin(
            Pickup,
            Pickup.donation_id == Donation.id,
        )
        .filter(
            DonationRequest.status == "approved",
            Donation.status == "claimed",
            Pickup.id.is_(None),
        )
        .order_by(Donation.expiry_time.asc())
        .all()
    )


@router.post("/", response_model=PickupResponse)
def create_pickup(
    pickup_data: PickupCreate,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    donation = (
        db.query(Donation)
        .filter(Donation.id == pickup_data.donation_id)
        .with_for_update()
        .first()
    )

    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found")

    donation_request = (
        db.query(DonationRequest)
        .filter(
            DonationRequest.id == pickup_data.request_id,
            DonationRequest.donation_id == donation.id,
        )
        .with_for_update()
        .first()
    )

    if donation_request is None:
        raise HTTPException(
            status_code=404,
            detail="Donation request not found",
        )

    if donation_request.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved requests can be accepted",
        )

    if donation.status != "claimed":
        raise HTTPException(
            status_code=400,
            detail="This donation is not ready for pickup",
        )

    existing_pickup = (
        db.query(Pickup)
        .filter(Pickup.donation_id == donation.id)
        .first()
    )

    if existing_pickup:
        raise HTTPException(
            status_code=409,
            detail="Another volunteer has already accepted this pickup",
        )

    pickup = Pickup(
        donation_id=donation.id,
        request_id=donation_request.id,
        volunteer_id=current_user.id,
        pickup_address=pickup_data.pickup_address,
        drop_address=pickup_data.drop_address,
        status="assigned",
    )

    db.add(pickup)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not assign this pickup. It may already be assigned.",
        )

    db.refresh(pickup)
    return pickup


@router.get("/my", response_model=list[PickupResponse])
def get_my_pickups(
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    return (
        db.query(Pickup)
        .filter(Pickup.volunteer_id == current_user.id)
        .order_by(Pickup.id.desc())
        .all()
    )


@router.put("/{pickup_id}/start", response_model=PickupResponse)
def start_pickup(
    pickup_id: int,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    pickup = (
        db.query(Pickup)
        .filter(
            Pickup.id == pickup_id,
            Pickup.volunteer_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if pickup is None:
        raise HTTPException(status_code=404, detail="Pickup not found")

    if pickup.status != "assigned":
        raise HTTPException(
            status_code=400,
            detail="Only assigned pickups can be started",
        )

    pickup.status = "in_transit"
    db.commit()
    db.refresh(pickup)
    return pickup


@router.put(
    "/{pickup_id}/complete",
    response_model=PickupResponse,
)
def complete_pickup(
    pickup_id: int,
    completion_data: PickupComplete,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    pickup = (
        db.query(Pickup)
        .filter(
            Pickup.id == pickup_id,
            Pickup.volunteer_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if pickup is None:
        raise HTTPException(status_code=404, detail="Pickup not found")

    if pickup.status != "in_transit":
        raise HTTPException(
            status_code=400,
            detail="Pickup must be in transit before completion",
        )

    donation = (
        db.query(Donation)
        .filter(Donation.id == pickup.donation_id)
        .with_for_update()
        .first()
    )

    donation_request = (
        db.query(DonationRequest)
        .filter(DonationRequest.id == pickup.request_id)
        .with_for_update()
        .first()
    )

    if donation is None or donation_request is None:
        raise HTTPException(
            status_code=404,
            detail="Associated donation or request not found",
        )

    if donation_request.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved requests can be completed",
        )

    pickup.delivered_quantity = completion_data.delivered_quantity
    pickup.quantity_unit = completion_data.quantity_unit
    pickup.status = "completed"
    donation.status = "completed"
    donation_request.status = "completed"

    db.commit()
    db.refresh(pickup)
    return pickup
