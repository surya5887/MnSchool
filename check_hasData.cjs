const INITIAL_FORM_DATA = {
  admissionType: 'New',
  originalAdmissionDate: '',
  previousDues: 0,
  previousPaidAmount: 0,
  previousSession: '',
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'Male',
  classId: '',
  sectionId: '',
  feeGroup: 'General Fee Category',
  transportRoute: 'Not Required',
  aadharNumber: '',
  bloodGroup: '',
  parentName: '',
  motherName: '',
  parentPhone: '',
  email: '',
  status: 'Active',
  admissionNo: '',
  rollNumber: '',
  address: '',
  fatherOccupation: '',
};

let formData = { ...INITIAL_FORM_DATA };

// Let's mock what PhoneInput does on mount
formData.parentPhone = '+91';

const keysThatReturnedTrue = [];

const hasData = Object.keys(formData).some(key => {
  if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;
  
  const val = formData[key];
  if (!val) return false;
  
  if (key === 'parentPhone' && (val === '+' || val === '+91' || val === '91')) return false;
  
  const initialVal = INITIAL_FORM_DATA[key];
  if (val === initialVal) return false;
  
  keysThatReturnedTrue.push(key);
  return true;
});

console.log("hasData:", hasData);
console.log("keysThatReturnedTrue:", keysThatReturnedTrue);
