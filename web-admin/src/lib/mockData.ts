// Mock data for the Nivāraṇam Admin Dashboard

export const divisions = ["North", "South", "East", "West", "Central"] as const;
export type Division = typeof divisions[number];

export const complaintStatuses = [
  "Submitted",
  "Verified", 
  "Assigned",
  "In Progress",
  "Completed",
  "Closed"
] as const;
export type ComplaintStatus = typeof complaintStatuses[number];

export const categories = [
  "Garbage",
  "Pothole",
  "Streetlight",
  "Water Supply",
  "Drainage",
  "Road Damage",
  "Sewage",
  "Illegal Parking"
] as const;
export type Category = typeof categories[number];

export const priorities = ["High", "Medium", "Low"] as const;
export type Priority = typeof priorities[number];

export interface Complaint {
  id: string;
  category: Category;
  description: string;
  division: Division;
  ward: string;
  status: ComplaintStatus;
  priority: Priority;
  upvotes: number;
  userName: string;
  userPhone: string;
  submittedAt: string;
  thumbnail: string;
  location: { lat: number; lng: number };
}

export interface Contractor {
  id: string;
  name: string;
  type: "Government" | "Local";
  divisions: Division[];
  rating: number;
  completedJobs: number;
  activeJobs: number;
  status: "Active" | "Busy" | "Suspended" | "Flagged";
  phone: string;
  email: string;
}

export interface Alert {
  id: string;
  type: "Repeated Issue" | "Long Pending" | "Unresponsive Contractor" | "High Volume" | "Hotspot Warning";
  message: string;
  division: Division;
  timestamp: string;
  relatedId?: string;
}

export const mockComplaints: Complaint[] = [
  {
    id: "CF-2024-001",
    category: "Pothole",
    description: "Large pothole causing accidents near main junction",
    division: "North",
    ward: "Ward 12",
    status: "Assigned",
    priority: "High",
    upvotes: 45,
    userName: "Rajesh Kumar",
    userPhone: "+91 98765 43210",
    submittedAt: "2024-01-15T10:30:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: "CF-2024-002",
    category: "Garbage",
    description: "Garbage not collected for 3 days in residential area",
    division: "South",
    ward: "Ward 8",
    status: "Verified",
    priority: "Medium",
    upvotes: 23,
    userName: "Priya Sharma",
    userPhone: "+91 98765 43211",
    submittedAt: "2024-01-15T09:15:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.5355, lng: 77.3910 }
  },
  {
    id: "CF-2024-003",
    category: "Streetlight",
    description: "Street light not working for a week",
    division: "East",
    ward: "Ward 15",
    status: "In Progress",
    priority: "Medium",
    upvotes: 12,
    userName: "Amit Patel",
    userPhone: "+91 98765 43212",
    submittedAt: "2024-01-14T18:45:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.6280, lng: 77.2169 }
  },
  {
    id: "CF-2024-004",
    category: "Water Supply",
    description: "No water supply since morning",
    division: "West",
    ward: "Ward 3",
    status: "Submitted",
    priority: "High",
    upvotes: 67,
    userName: "Sunita Devi",
    userPhone: "+91 98765 43213",
    submittedAt: "2024-01-15T06:00:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.6692, lng: 77.4538 }
  },
  {
    id: "CF-2024-005",
    category: "Drainage",
    description: "Blocked drain causing waterlogging",
    division: "Central",
    ward: "Ward 1",
    status: "Completed",
    priority: "High",
    upvotes: 34,
    userName: "Mohammed Ali",
    userPhone: "+91 98765 43214",
    submittedAt: "2024-01-13T14:20:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.6304, lng: 77.2177 }
  },
  {
    id: "CF-2024-006",
    category: "Road Damage",
    description: "Road surface damaged after recent construction",
    division: "North",
    ward: "Ward 10",
    status: "Assigned",
    priority: "Medium",
    upvotes: 19,
    userName: "Vikram Singh",
    userPhone: "+91 98765 43215",
    submittedAt: "2024-01-14T11:30:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: "CF-2024-007",
    category: "Sewage",
    description: "Sewage overflow on main road",
    division: "South",
    ward: "Ward 5",
    status: "In Progress",
    priority: "High",
    upvotes: 56,
    userName: "Lakshmi Nair",
    userPhone: "+91 98765 43216",
    submittedAt: "2024-01-15T07:45:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.5245, lng: 77.1855 }
  },
  {
    id: "CF-2024-008",
    category: "Illegal Parking",
    description: "Vehicles blocking pedestrian pathway",
    division: "Central",
    ward: "Ward 2",
    status: "Closed",
    priority: "Low",
    upvotes: 8,
    userName: "Arun Gupta",
    userPhone: "+91 98765 43217",
    submittedAt: "2024-01-12T16:00:00",
    thumbnail: "/placeholder.svg",
    location: { lat: 28.6315, lng: 77.2167 }
  }
];

export const mockContractors: Contractor[] = [
  {
    id: "CON-001",
    name: "Metro Construction Co.",
    type: "Government",
    divisions: ["North", "Central"],
    rating: 4.5,
    completedJobs: 234,
    activeJobs: 5,
    status: "Active",
    phone: "+91 11 2345 6789",
    email: "contact@metroconstruction.com"
  },
  {
    id: "CON-002",
    name: "City Works Ltd.",
    type: "Government",
    divisions: ["South", "East"],
    rating: 4.2,
    completedJobs: 189,
    activeJobs: 8,
    status: "Busy",
    phone: "+91 11 2345 6790",
    email: "info@cityworks.com"
  },
  {
    id: "CON-003",
    name: "Quick Fix Services",
    type: "Local",
    divisions: ["West"],
    rating: 4.8,
    completedJobs: 156,
    activeJobs: 3,
    status: "Active",
    phone: "+91 98765 11111",
    email: "quickfix@gmail.com"
  },
  {
    id: "CON-004",
    name: "Green Clean Solutions",
    type: "Local",
    divisions: ["North", "East"],
    rating: 4.6,
    completedJobs: 98,
    activeJobs: 4,
    status: "Active",
    phone: "+91 98765 22222",
    email: "greenclean@gmail.com"
  },
  {
    id: "CON-005",
    name: "Urban Repair Hub",
    type: "Local",
    divisions: ["South", "Central"],
    rating: 3.2,
    completedJobs: 67,
    activeJobs: 2,
    status: "Flagged",
    phone: "+91 98765 33333",
    email: "urbanrepair@gmail.com"
  },
  {
    id: "CON-006",
    name: "Municipal Services Unit",
    type: "Government",
    divisions: ["North", "South", "East", "West", "Central"],
    rating: 4.0,
    completedJobs: 512,
    activeJobs: 15,
    status: "Busy",
    phone: "+91 11 2345 6791",
    email: "msu@gov.in"
  }
];

export const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "Hotspot Warning",
    message: "High concentration of complaints detected in Ward 12, North Division",
    division: "North",
    timestamp: "2024-01-15T08:00:00",
    relatedId: "Ward 12"
  },
  {
    id: "ALT-002",
    type: "Long Pending",
    message: "Complaint CF-2024-004 pending for more than 48 hours",
    division: "West",
    timestamp: "2024-01-15T06:30:00",
    relatedId: "CF-2024-004"
  },
  {
    id: "ALT-003",
    type: "Unresponsive Contractor",
    message: "Urban Repair Hub has not responded to 3 assigned tasks",
    division: "South",
    timestamp: "2024-01-14T18:00:00",
    relatedId: "CON-005"
  },
  {
    id: "ALT-004",
    type: "High Volume",
    message: "25% increase in complaints from Central Division today",
    division: "Central",
    timestamp: "2024-01-15T10:00:00"
  },
  {
    id: "ALT-005",
    type: "Repeated Issue",
    message: "Same pothole location reported 5 times this month",
    division: "North",
    timestamp: "2024-01-15T09:30:00",
    relatedId: "Ward 12"
  }
];

export const dashboardStats = {
  newComplaints: 24,
  activeIssues: 156,
  highPriority: 18,
  avgResolutionTime: "3.2 days",
  contractorsAvailable: 12,
  predictionAlerts: 5
};

export const statusDistribution = {
  Submitted: 45,
  Verified: 32,
  Assigned: 28,
  "In Progress": 35,
  Completed: 12,
  Closed: 8
};

export const divisionComplaints = {
  North: 42,
  South: 35,
  East: 28,
  West: 31,
  Central: 24
};

export const monthlyTrend = [
  { month: "Aug", complaints: 145 },
  { month: "Sep", complaints: 167 },
  { month: "Oct", complaints: 189 },
  { month: "Nov", complaints: 156 },
  { month: "Dec", complaints: 198 },
  { month: "Jan", complaints: 210 }
];

export const predictionData = {
  nextWeekTotal: 185,
  hotspots: [
    { ward: "Ward 12", division: "North", predicted: 28 },
    { ward: "Ward 5", division: "South", predicted: 22 },
    { ward: "Ward 1", division: "Central", predicted: 19 }
  ],
  departmentLoad: [
    { dept: "Sanitation", load: "High", predicted: 45 },
    { dept: "Roads", load: "Medium", predicted: 32 },
    { dept: "Water", load: "High", predicted: 38 }
  ]
};

export const predictionVsActual = [
  { month: "Oct", predicted: 180, actual: 189, diff: 9 },
  { month: "Nov", predicted: 165, actual: 156, diff: -9 },
  { month: "Dec", predicted: 190, actual: 198, diff: 8 },
  { month: "Jan", predicted: 205, actual: 210, diff: 5 }
];
