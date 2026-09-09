import re

file_path = 'src/pages/NewAdmission.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Reset\n                    </button>", "Reset Form\n                    </button>")
content = content.replace("<Save size={20} /> Enroll</>}", "<Save size={20} /> Enroll Student</>}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored button text.")
