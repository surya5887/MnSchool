const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('DefaultersList')) {
  appContent = appContent.replace(
    "import SystemSettings from './pages/SystemSettings';",
    "import SystemSettings from './pages/SystemSettings';\nimport DefaultersList from './pages/DefaultersList';"
  );
  
  appContent = appContent.replace(
    "<Route path=\"/settings\" element={<SystemSettings />} />",
    "<Route path=\"/settings\" element={<SystemSettings />} />\n            <Route path=\"/defaulters\" element={<DefaultersList />} />"
  );
  fs.writeFileSync('src/App.tsx', appContent);
  console.log("App.tsx updated");
}

// 2. Update Sidebar.tsx
let sidebarContent = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
if (!sidebarContent.includes('/defaulters')) {
  sidebarContent = sidebarContent.replace(
    "import { LayoutDashboard, UserPlus, Users, GraduationCap, Settings, CalendarCheck, BookOpen, LogOut } from 'lucide-react';",
    "import { LayoutDashboard, UserPlus, Users, GraduationCap, Settings, CalendarCheck, BookOpen, LogOut, AlertTriangle } from 'lucide-react';"
  );
  
  const newMenuItem = `          <li className={location.pathname === '/defaulters' ? 'active' : ''}>
            <Link to="/defaulters">
              <AlertTriangle size={20} />
              <span className="menu-text">Fee Defaulters</span>
            </Link>
          </li>
          
          <li className={location.pathname === '/settings' ? 'active' : ''}>`;
          
  sidebarContent = sidebarContent.replace(
    "<li className={location.pathname === '/settings' ? 'active' : ''}>",
    newMenuItem
  );
  fs.writeFileSync('src/components/Sidebar.tsx', sidebarContent);
  console.log("Sidebar.tsx updated");
}
