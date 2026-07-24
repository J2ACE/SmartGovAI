# Authentication Flows

## Division Admin Flow
**Path**: City Selection → Role Selection → Admin Login (Division + Credentials) → Dashboard

1. **City Selection** (`/city-selection`)
   - User selects city
   - Stores: `selectedCity`
   - Navigate to: `/role-selection`

2. **Role Selection** (`/role-selection`)
   - User selects "Division Admin"
   - Stores: `selectedRole = 'division-admin'`
   - Navigate to: `/admin-login`

3. **Admin Login** (`/admin-login`)
   - **Step 1**: Select Division (North/East/West/South/Central)
   - **Step 2**: Enter credentials (email + password)
   - Stores: `adminDivision`, `isAuthenticated`, `adminEmail`
   - Navigate to: `/admin` (Division Admin Dashboard)

### Division Admin Credentials
- **North**: admin.north@nivaran.gov / North@2025
- **East**: admin.east@nivaran.gov / East@2025
- **West**: admin.west@nivaran.gov / West@2025
- **South**: admin.south@nivaran.gov / South@2025
- **Central**: admin.central@nivaran.gov / Central@2025

---

## Department Head Flow
**Path**: City Selection → Role Selection → Division Selection (No Login) → Department Selection → Login → Department Dashboard

1. **City Selection** (`/city-selection`)
   - User selects city
   - Stores: `selectedCity`
   - Navigate to: `/role-selection`

2. **Role Selection** (`/role-selection`)
   - User selects "Department Head"
   - Stores: `selectedRole = 'department-head'`
   - Navigate to: `/division-selection`

3. **Division Selection** (`/division-selection`)
   - User selects division (North/East/West/South/Central)
   - **No credentials required at this step**
   - Stores: `adminDivision`
   - Navigate to: `/department-selection`

4. **Department Selection** (`/department-selection`)
   - User selects department category:
     - Dept. of Road
     - Dept. of Sanitation & Waste Management
     - Dept. of Water Supply & Sewage
     - Dept. of Electricity & Energy
   - Stores: `selectedDepartment`
   - Navigate to: `/department-head-login`

5. **Department Head Login** (`/department-head-login`)
   - Enter credentials (email + password)
   - Credentials are division-specific
   - Stores: `isAuthenticated`, `adminEmail`
   - Navigate to: `/admin/dept-dashboard`

### Department Head Credentials (by Division)
- **North**: dh.north@cityfix.gov / North@123
- **East**: dh.east@cityfix.gov / East@123
- **West**: dh.west@cityfix.gov / West@123
- **South**: dh.south@cityfix.gov / South@123
- **Central**: dh.central@cityfix.gov / Central@123

---

## Quick Test Access
Use `/dept-test` to bypass authentication and go directly to Department Head Dashboard with mock data.

---

## Key Differences

| Aspect | Division Admin | Department Head |
|--------|---------------|----------------|
| Login Timing | After division selection | After department selection |
| Division Selection | With credentials | Without credentials |
| Department Selection | Not required | Required |
| Dashboard Route | `/admin` | `/admin/dept-dashboard` |
| Sidebar | Visible | Hidden |
| Filters | Division-wide | Department-specific |

---

## localStorage Keys Used

- `selectedCity`: The selected city name
- `selectedRole`: Either 'division-admin' or 'department-head'
- `adminDivision`: The selected division (north/east/west/south/central)
- `selectedDepartment`: The department category (road/sanitation/water/electricity)
- `isAuthenticated`: Boolean flag for authentication status
- `adminEmail`: The logged-in user's email

---

## Navigation Components

### New Files Created
1. **DivisionSelection.tsx** - Division selection without login (Department Head only)
2. **DepartmentHeadLogin.tsx** - Login page after department selection
3. **DepartmentSelection.tsx** - Department category selection (Already existed, updated routing)

### Modified Files
1. **RoleSelection.tsx** - Routes Department Heads to division selection instead of login
2. **AdminLogin.tsx** - Now only handles Division Admin login, redirects Department Heads
3. **App.tsx** - Added new routes for division selection and department head login
