export interface RoutingResult {
  departmentId: string;
  departmentCode: string;
  divisionId: string;
  divisionName: string;
}

export const CATEGORY_DEPARTMENT_MAP: Record<string, { code: string; name: string }> = {
  POTHOLE: { code: 'ROADS', name: 'Roads & Infrastructure' },
  GARBAGE_DUMP: { code: 'SANITATION', name: 'Sanitation & Solid Waste Management' },
  WATER_LEAKAGE: { code: 'WATER', name: 'Water Supply & Sewerage Board' },
  BROKEN_STREETLIGHT: { code: 'POWER', name: 'Electricity & Public Lighting' },
  OPEN_MANHOLE: { code: 'DRAINAGE', name: 'Drainage & Stormwater Department' },
};

export const routeComplaintAutomatically = (category: string, lat: number, lng: number): RoutingResult => {
  const deptInfo = CATEGORY_DEPARTMENT_MAP[category] || { code: 'GENERAL', name: 'General Municipal Department' };
  
  // Assign division based on latitude quadrant in municipality
  let divisionName = 'Central Division';
  let divisionId = 'division-central-01';

  if (lat > 19.10) {
    divisionName = 'North Division';
    divisionId = 'division-north-01';
  } else if (lat < 19.00) {
    divisionName = 'South Division';
    divisionId = 'division-south-01';
  }

  return {
    departmentId: `dept-${deptInfo.code.toLowerCase()}-01`,
    departmentCode: deptInfo.code,
    divisionId,
    divisionName,
  };
};
