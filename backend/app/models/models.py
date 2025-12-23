from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255))
    province = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plots = relationship("Plot", back_populates="owner")


class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    planting_year = Column(Integer, nullable=False)
    area_sqm = Column(Float, default=0)
    area_rai = Column(Float, default=0)
    geometry = Column(Geometry("POLYGON", srid=4326))
    notes = Column(Text)
    status = Column(String(50), default="pending")  # pending, completed
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="plots")
    carbon_assessments = relationship("CarbonAssessment", back_populates="plot")


class CarbonAssessment(Base):
    __tablename__ = "carbon_assessments"

    id = Column(Integer, primary_key=True, index=True)
    plot_id = Column(Integer, ForeignKey("plots.id"))
    assessment_year = Column(Integer, nullable=False)
    tree_age = Column(Integer, nullable=False)
    biomass_tons = Column(Float, default=0)
    carbon_tons = Column(Float, default=0)
    co2_equivalent_tons = Column(Float, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plot = relationship("Plot", back_populates="carbon_assessments")
