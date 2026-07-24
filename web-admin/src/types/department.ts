import { Complaint } from '@/lib/mockData';

// Extended Complaint type for Department Head
export interface DepartmentComplaint extends Complaint {
  department?: string;
  damageCategory?: string;
  assignedWorkerId?: string;
  slaDueAt?: string;
  inspectionStatus?: 'not_inspected' | 'inspected' | 'pending_inspection';
  fieldPhotos?: string[];
  notes?: Array<{ author: string; text: string; timestamp: string }>;
  resolutionTime?: number; // in hours
  assignedContractorId?: string;
  contractorName?: string;
  age?: string;
}
