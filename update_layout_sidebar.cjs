const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!content.includes('/defaulters')) {
  content = content.replace(
    "import { LayoutDashboard, Users, UserPlus, BookOpen, Settings, LogOut, FileText, Bell, CheckCircle2, AlertCircle } from 'lucide-react';",
    "import { LayoutDashboard, Users, UserPlus, BookOpen, Settings, LogOut, FileText, Bell, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';"
  );
  
  const newMenuItem = `              <li className={location.pathname === '/defaulters' ? 'active' : ''}>
                <Link to="/defaulters">
                  <AlertTriangle size={20} />
                  <span className="menu-text">Fee Defaulters</span>
                </Link>
              </li>
              <li className="menu-category">ACADEMICS & OPERATIONS</li>`;
              
  content = content.replace(
    "<li className=\"menu-category\">ACADEMICS & OPERATIONS</li>",
    newMenuItem
  );
  fs.writeFileSync('src/components/Layout.tsx', content);
  console.log("Layout updated");
}
