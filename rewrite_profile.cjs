const fs = require('fs');

const code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Inject new states
const injectStates = `  const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'documents'>('profile');
  const [newDocs, setNewDocs] = useState<{name: string, file: File | null}[]>([]);
  const [docsToRemove, setDocsToRemove] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const handleAddDoc = () => {
    if (newDocName && newDocFile) {
      setNewDocs([...newDocs, { name: newDocName, file: newDocFile }]);
      setNewDocName('');
      setNewDocFile(null);
    }
  };

  const handleRemoveNewDoc = (idx: number) => {
    setNewDocs(newDocs.filter((_, i) => i !== idx));
  };
`;

let updatedCode = code.replace(
  "  const [saving, setSaving] = useState(false);",
  "  const [saving, setSaving] = useState(false);\n" + injectStates
);

// 2. Update handleSaveProfile
const oldSave = `  const handleSaveProfile = async () => {
    if (!id || !student) return;
    setSaving(true);
    try {
      let finalPhotoUrl = editData.photoUrl;
      
      if (newPhotoFile) {
        finalPhotoUrl = await uploadImageToCloudinary(newPhotoFile);
      } 
      else if (editData.photoUrl === '') {
         finalPhotoUrl = '';
      }

      const updatedData = { ...editData, photoUrl: finalPhotoUrl };
      if (!updatedData.password || updatedData.password.startsWith('$2a$') || updatedData.password.startsWith('$2b$')) {
        delete updatedData.password;
      }

      await updateStudent(id, updatedData);
      setStudent(updatedData as StudentData);
      setIsEditing(false);
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
    } catch (e) {
      console.error("Error updating profile", e);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };`;

const newSave = `  const handleSaveProfile = async () => {
    if (!id || !student) return;
    setSaving(true);
    try {
      let finalPhotoUrl = editData.photoUrl;
      if (newPhotoFile) {
        finalPhotoUrl = await uploadImageToCloudinary(newPhotoFile);
      } else if (editData.photoUrl === '') {
        finalPhotoUrl = '';
      }

      // Handle documents
      let updatedDocs = (editData.documents || []).filter(d => !docsToRemove.includes(d.url));
      for (const doc of newDocs) {
        if (doc.file) {
          const url = await uploadImageToCloudinary(doc.file);
          updatedDocs.push({ name: doc.name, url });
        }
      }

      const updatedData = { ...editData, photoUrl: finalPhotoUrl, documents: updatedDocs };
      if (!updatedData.password || updatedData.password.startsWith('$2a$') || updatedData.password.startsWith('$2b$')) {
        delete updatedData.password;
      }

      await updateStudent(id, updatedData);
      setStudent(updatedData as StudentData);
      setIsEditing(false);
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
      setNewDocs([]);
      setDocsToRemove([]);
    } catch (e) {
      console.error("Error updating profile", e);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };`;

updatedCode = updatedCode.replace(oldSave, newSave);

fs.writeFileSync('src/pages/StudentProfile_tmp.tsx', updatedCode, 'utf8');
console.log("Injected state and save logic.");
