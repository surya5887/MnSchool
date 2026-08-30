const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

const initialDataBlock = `const INITIAL_FORM_DATA: Partial<StudentData> = {
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
  rollNumber: '' as any,
  address: '',
  fatherOccupation: '',
};

const NewAdmission: React.FC = () => {`;

content = content.replace('const NewAdmission: React.FC = () => {', initialDataBlock);

content = content.replace(
  /const \[formData, setFormData\] = useState<Partial<StudentData>>\(\{[\s\S]*?address: '',[\s\S]*?\}\);/,
  'const [formData, setFormData] = useState<Partial<StudentData>>(INITIAL_FORM_DATA);'
);

const oldHasDataStr = `const hasData = formData.firstName || formData.lastName || formData.parentName || formData.parentPhone;`;
const newHasDataStr = `const hasData = Object.keys(formData).some(key => {
          if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;
          return Boolean(formData[key as keyof typeof formData]);
        });`;
content = content.replace(oldHasDataStr, newHasDataStr);

const oldClearDraftStr = `        // Clear draft on success
        const existingStr = localStorage.getItem('admission_drafts');
        if (existingStr) {
          const draftsObj = JSON.parse(existingStr);
          delete draftsObj[draftId];
          localStorage.setItem('admission_drafts', JSON.stringify(draftsObj));
        }
        setDraftId(Date.now().toString());`;

const newClearDraftStr = `        // Clear draft on success
        const existingStr = localStorage.getItem('admission_drafts');
        if (existingStr) {
          const draftsObj = JSON.parse(existingStr);
          delete draftsObj[draftId];
          localStorage.setItem('admission_drafts', JSON.stringify(draftsObj));
        }
        
        // Reset form to prevent new ghost draft being saved immediately
        setFormData(INITIAL_FORM_DATA);
        setPhotoFile(null);
        setPhotoPreview('');
        setBirthCertFile(null);
        setTcFile(null);
        setCustomDocs([]);
        
        setDraftId(Date.now().toString());`;

content = content.replace(oldClearDraftStr, newClearDraftStr);

fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("Drafts logic fixed!");
