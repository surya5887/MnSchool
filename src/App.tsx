import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Login from './pages/Login';
import Staff from './pages/Staff';
import StudentProfile from './pages/StudentProfile';
import MasterLedger from './pages/MasterLedger';
import LegacyData from './pages/LegacyData';
import NewAdmission from './pages/NewAdmission';
import Attendance from './pages/Attendance';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import Examination from './pages/Examination';
import Timetable from './pages/Timetable';
import Transport from './pages/Transport';
import Library from './pages/Library';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="admission" element={<NewAdmission />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="staff" element={<Staff />} />
          <Route path="fees" element={<Fees />} />
          <Route path="ledger" element={<MasterLedger />} />
          <Route path="legacy" element={<LegacyData />} />
          <Route path="exam" element={<Examination />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="transport" element={<Transport />} />
          <Route path="library" element={<Library />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
