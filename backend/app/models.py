from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

    donations = relationship("Donation", back_populates="donor")
    requests = relationship("DonationRequest", back_populates="ngo")
    pickups = relationship("Pickup", back_populates="volunteer")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)

    food_name = Column(String(150), nullable=False)
    quantity = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    expiry_time = Column(DateTime, nullable=False)
    pickup_location = Column(String(255), nullable=False)

    status = Column(String(30), default="available", nullable=False)

    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    donor = relationship("User", back_populates="donations")
    requests = relationship("DonationRequest", back_populates="donation")
    pickup = relationship("Pickup", back_populates="donation", uselist=False)


class DonationRequest(Base):
    __tablename__ = "donation_requests"

    id = Column(Integer, primary_key=True, index=True)

    status = Column(String(30), default="pending", nullable=False)

    donation_id = Column(
        Integer,
        ForeignKey("donations.id"),
        nullable=False
    )

    ngo_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    donation = relationship("Donation", back_populates="requests")
    ngo = relationship("User", back_populates="requests")
    pickup = relationship("Pickup", back_populates="request", uselist=False)


class Pickup(Base):
    __tablename__ = "pickups"

    id = Column(Integer, primary_key=True, index=True)

    status = Column(String(30), default="assigned", nullable=False)

    pickup_address = Column(String(255), nullable=False)
    drop_address = Column(String(255), nullable=False)
    delivered_quantity = Column(Numeric(10, 2), nullable=True)
    quantity_unit = Column(String(30), nullable=True)

    donation_id = Column(
        Integer,
        ForeignKey("donations.id"),
        nullable=False
    )

    request_id = Column(
        Integer,
        ForeignKey("donation_requests.id"),
        nullable=False
    )

    volunteer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    donation = relationship("Donation", back_populates="pickup")
    request = relationship("DonationRequest", back_populates="pickup")
    volunteer = relationship("User", back_populates="pickups")