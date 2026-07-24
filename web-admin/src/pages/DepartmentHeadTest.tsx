import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function DepartmentHeadTest() {
  const navigate = useNavigate();

  const setupTestData = () => {
    // Set up test data in localStorage
    localStorage.setItem('selectedCity', 'Delhi');
    localStorage.setItem('adminDivision', 'north');
    localStorage.setItem('selectedDepartment', 'road');
    localStorage.setItem('selectedRole', 'department-head');
    
    // Navigate to department head dashboard
    navigate('/admin/dept-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Department Head Dashboard Test
        </h1>
        <p className="text-gray-600 mb-6">
          This page will set up test data and navigate you to the Department Head Dashboard.
        </p>
        
        <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm"><strong>City:</strong> Delhi</p>
          <p className="text-sm"><strong>Division:</strong> North</p>
          <p className="text-sm"><strong>Department:</strong> Road</p>
          <p className="text-sm"><strong>Role:</strong> Department Head</p>
        </div>

        <Button onClick={setupTestData} className="w-full">
          Go to Department Head Dashboard
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
          Or navigate through the normal flow:<br/>
          Landing → Login → City → Role → Division → Department
        </p>
      </div>
    </div>
  );
}
