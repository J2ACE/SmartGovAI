"""Domain enums persisted by SmartGovAI models."""

from enum import Enum


class OfficerRole(str, Enum):
    DIVISION_HEAD = "DIVISION_HEAD"
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD"


class ComplaintCategory(str, Enum):
    GARBAGE = "GARBAGE"
    POTHOLE = "POTHOLE"
    WATER_DRAINAGE = "WATER_DRAINAGE"
    STREET_LIGHT_DAMAGE = "STREET_LIGHT_DAMAGE"


class ComplaintStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    DUPLICATE = "DUPLICATE"
    REJECTED = "REJECTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ContractorType(str, Enum):
    GOVERNMENT = "GOVERNMENT"
    LOCAL = "LOCAL"


class AssignmentStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
