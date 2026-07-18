export const students = [
  { id: 'MN23001', name: 'Aarav Sharma', class: '10th A', roll: 1, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543210', attendance: '98%' },
  { id: 'MN23002', name: 'Priya Patel', class: '10th A', roll: 2, status: 'Active', feeStatus: 'Pending', parentPhone: '+91 9876543211', attendance: '85%' },
  { id: 'MN23003', name: 'Rohan Singh', class: '9th B', roll: 15, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543212', attendance: '92%' },
  { id: 'MN23004', name: 'Sneha Gupta', class: '10th A', roll: 5, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543213', attendance: '95%' },
  { id: 'MN23005', name: 'Aditya Verma', class: '8th C', roll: 8, status: 'Inactive', feeStatus: 'Defaulter', parentPhone: '+91 9876543214', attendance: '45%' },
  { id: 'MN23006', name: 'Kavya Reddy', class: '7th A', roll: 12, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543215', attendance: '99%' },
  { id: 'MN23007', name: 'Ishaan Joshi', class: '10th B', roll: 22, status: 'Active', feeStatus: 'Pending', parentPhone: '+91 9876543216', attendance: '78%' },
  { id: 'MN23008', name: 'Ananya Desai', class: '9th A', roll: 3, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543217', attendance: '96%' },
  { id: 'MN23009', name: 'Dev Mehta', class: '6th B', roll: 11, status: 'Active', feeStatus: 'Paid', parentPhone: '+91 9876543218', attendance: '91%' },
  { id: 'MN23010', name: 'Riya Kapoor', class: '10th A', roll: 18, status: 'Active', feeStatus: 'Defaulter', parentPhone: '+91 9876543219', attendance: '88%' },
];

export const teachers = [
  { id: 'T001', name: 'Rajesh Kumar', subject: 'Mathematics', experience: '12 Yrs', salaryStatus: 'Paid' },
  { id: 'T002', name: 'Meenakshi Iyer', subject: 'Science', experience: '8 Yrs', salaryStatus: 'Pending' },
  { id: 'T003', name: 'Vikram Singh', subject: 'English', experience: '5 Yrs', salaryStatus: 'Paid' },
  { id: 'T004', name: 'Anita Desai', subject: 'Social Studies', experience: '15 Yrs', salaryStatus: 'Paid' },
];

export const feeTransactions = [
  { id: 'TXN8912', student: 'Aarav Sharma', amount: 2500, date: '2023-10-05', status: 'Completed', method: 'Cash' },
  { id: 'TXN8913', student: 'Rohan Singh', amount: 2500, date: '2023-10-06', status: 'Completed', method: 'UPI' },
  { id: 'TXN8914', student: 'Sneha Gupta', amount: 2500, date: '2023-10-08', status: 'Completed', method: 'Bank Transfer' },
  { id: 'TXN8915', student: 'Priya Patel', amount: 2500, date: '2023-10-10', status: 'Failed', method: 'UPI' },
  { id: 'TXN8916', student: 'Kavya Reddy', amount: 2000, date: '2023-10-11', status: 'Completed', method: 'Cash' },
];

export const expenses = [
  { id: 'EXP001', category: 'Electricity Bill', amount: 15000, date: '2023-10-02' },
  { id: 'EXP002', category: 'Stationary & Chalk', amount: 4500, date: '2023-10-04' },
  { id: 'EXP003', category: 'Internet', amount: 2000, date: '2023-10-05' },
  { id: 'EXP004', category: 'School Bus Maintenance', amount: 25000, date: '2023-10-12' },
];

export const revenueData = [
  { name: 'Apr', revenue: 420000, expenses: 140000 },
  { name: 'May', revenue: 380000, expenses: 139000 },
  { name: 'Jun', revenue: 200000, expenses: 980000 },
  { name: 'Jul', revenue: 478000, expenses: 190000 },
  { name: 'Aug', revenue: 389000, expenses: 180000 },
  { name: 'Sep', revenue: 439000, expenses: 180000 },
  { name: 'Oct', revenue: 249000, expenses: 43000 },
];

export const recentActivities = [
  { time: '10 mins ago', action: 'Fee Collected', details: '₹2,500 collected from Aarav Sharma' },
  { time: '1 hour ago', action: 'Attendance Marked', details: 'Class 10th A marked by Rajesh Kumar' },
  { time: '2 hours ago', action: 'Expense Logged', details: '₹4,500 spent on Stationary' },
  { time: 'Yesterday', action: 'New Admission', student: 'Karan Malhotra enrolled in 6th A' },
];
