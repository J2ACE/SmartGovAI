export interface RoutingResult {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  divisionId: string;
  divisionName: string;
}

export const CATEGORY_DEPARTMENT_MAP: Record<string, { code: string; name: string }> = {
  POTHOLE: { code: 'ROADS', name: 'Road Department' },
  ROAD_DAMAGE: { code: 'ROADS', name: 'Road Department' },
  GARBAGE: { code: 'SANITATION', name: 'Sanitation Department' },
  GARBAGE_DUMP: { code: 'SANITATION', name: 'Sanitation Department' },
  WASTE: { code: 'SANITATION', name: 'Sanitation Department' },
  WATER_LEAK: { code: 'WATER', name: 'Water Supply Department' },
  WATER_LEAKAGE: { code: 'WATER', name: 'Water Supply Department' },
  STREET_LIGHT: { code: 'ELECTRICAL', name: 'Electrical Department' },
  BROKEN_STREETLIGHT: { code: 'ELECTRICAL', name: 'Electrical Department' },
  ELECTRIC_POLE: { code: 'ELECTRICAL', name: 'Electrical Department' },
  DRAINAGE: { code: 'DRAINAGE', name: 'Drainage Department' },
  SEWAGE: { code: 'DRAINAGE', name: 'Drainage Department' },
  OPEN_MANHOLE: { code: 'DRAINAGE', name: 'Drainage Department' },
};

export const routeComplaintAutomatically = (category: string, lat: number, lng: number): RoutingResult => {
  const normCategory = (category || 'POTHOLE').toUpperCase();
  const deptInfo = CATEGORY_DEPARTMENT_MAP[normCategory] || { code: 'ROADS', name: 'Road Department' };
  
  // GPS Bounding Box Division Auto-Detection
  let divisionName = 'Central Division';
  let divisionId = 'division-central-01';

  if (lat >= 28.65 || lat >= 19.12) {
    divisionName = 'North Division';
    divisionId = 'division-north-01';
  } else if (lat <= 28.52 || lat <= 19.00) {
    divisionName = 'South Division';
    divisionId = 'division-south-01';
  } else if (lng >= 77.28) {
    divisionName = 'East Division';
    divisionId = 'division-east-01';
  } else if (lng <= 77.10) {
    divisionName = 'West Division';
    divisionId = 'division-west-01';
  }

  return {
    departmentId: `dept-${deptInfo.code.toLowerCase()}-01`,
    departmentCode: deptInfo.code,
    departmentName: deptInfo.name,
    divisionId,
    divisionName,
  };
};
