"""SmartGovAI SQLAlchemy model package."""

from app.models.ai_prediction import AIPrediction
from app.models.base import Base
from app.models.citizen import Citizen
from app.models.city import City
from app.models.complaint import Complaint
from app.models.complaint_image import ComplaintImage
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.contractor import Contractor
from app.models.contractor_assignment import ContractorAssignment
from app.models.department import Department
from app.models.division import Division
from app.models.officer import Officer

__all__ = ["AIPrediction", "Base", "Citizen", "City", "Complaint", "ComplaintImage", "ComplaintStatusHistory", "Contractor", "ContractorAssignment", "Department", "Division", "Officer"]
