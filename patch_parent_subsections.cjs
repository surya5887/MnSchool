const fs = require('fs');
const filePath = 'src/pages/StudentProfile.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const oldParentGrid = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {/* Father Details */}
              <InfoBadge icon={<User size={20} color="#2563eb" />} bg="#dbeafe" label="Father's Name" value={student.parentName} />
              <InfoBadge icon={<Shield size={20} color="#2563eb" />} bg="#dbeafe" label="Father Aadhar" value={student.fatherAadhar || student.parentAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#2563eb" />} bg="#dbeafe" label="Father Qual." value={student.fatherQualification} />
              <InfoBadge icon={<Activity size={20} color="#2563eb" />} bg="#dbeafe" label="Father Occ." value={student.fatherOccupation} />
              
              {/* Mother Details */}
              <InfoBadge icon={<User size={20} color="#db2777" />} bg="#fce7f3" label="Mother's Name" value={student.motherName} />
              <InfoBadge icon={<Shield size={20} color="#db2777" />} bg="#fce7f3" label="Mother Aadhar" value={student.motherAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#db2777" />} bg="#fce7f3" label="Mother Qual." value={student.motherQualification} />
              <InfoBadge icon={<Activity size={20} color="#db2777" />} bg="#fce7f3" label="Mother Occ." value={student.motherOccupation} />
              
              {/* Contact Details */}
              <InfoBadge icon={<Phone size={20} color="#16a34a" />} bg="#dcfce7" label="Primary Phone" value={student.parentPhone || student.phone} />
              <InfoBadge icon={<AlertTriangle size={20} color="#ea580c" />} bg="#ffedd5" label="Emergency Contact" value={student.emergencyContact} />
              <InfoBadge icon={<Mail size={20} color="#8b5cf6" />} bg="#ede9fe" label="Email Address" value={student.email} />
              <div style={{ gridColumn: '1 / -1' }}>
                  <InfoBadge icon={<MapPin size={20} color="#0284c7" />} bg="#e0f2fe" label="Full Address" value={student.address} wrapText={true} />
              </div>
            </div>`;

const newParentGrid = `{/* Father Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#2563eb', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Father's Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <InfoBadge icon={<User size={20} color="#2563eb" />} bg="#dbeafe" label="Father's Name" value={student.parentName} />
              <InfoBadge icon={<Shield size={20} color="#2563eb" />} bg="#dbeafe" label="Father Aadhar" value={student.fatherAadhar || student.parentAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#2563eb" />} bg="#dbeafe" label="Father Qual." value={student.fatherQualification} />
              <InfoBadge icon={<Activity size={20} color="#2563eb" />} bg="#dbeafe" label="Father Occ." value={student.fatherOccupation} />
            </div>

            {/* Mother Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#db2777', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Mother's Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <InfoBadge icon={<User size={20} color="#db2777" />} bg="#fce7f3" label="Mother's Name" value={student.motherName} />
              <InfoBadge icon={<Shield size={20} color="#db2777" />} bg="#fce7f3" label="Mother Aadhar" value={student.motherAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#db2777" />} bg="#fce7f3" label="Mother Qual." value={student.motherQualification} />
              <InfoBadge icon={<Activity size={20} color="#db2777" />} bg="#fce7f3" label="Mother Occ." value={student.motherOccupation} />
            </div>

            {/* Contact Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#0d9488', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Contact Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <InfoBadge icon={<Phone size={20} color="#16a34a" />} bg="#dcfce7" label="Primary Phone" value={student.parentPhone || student.phone} />
              <InfoBadge icon={<AlertTriangle size={20} color="#ea580c" />} bg="#ffedd5" label="Emergency Contact" value={student.emergencyContact} />
              <InfoBadge icon={<Mail size={20} color="#8b5cf6" />} bg="#ede9fe" label="Email Address" value={student.email} />
              <div style={{ gridColumn: '1 / -1' }}>
                  <InfoBadge icon={<MapPin size={20} color="#0284c7" />} bg="#e0f2fe" label="Full Address" value={student.address} wrapText={true} />
              </div>
            </div>`;

if (code.includes(oldParentGrid)) {
    code = code.replace(oldParentGrid, newParentGrid);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Sub-sections added!");
} else {
    console.log("Could not find the target code string.");
}
