import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# I need to update the images and shapes interfaces inside QuestionPaperData
# images?: { url: string; width: number; align: 'left' | 'center' | 'right'; borderWidth?: number; borderColor?: string }[];
# shapes?: { type: string; width: number; color: string; rotation: number; align: 'left' | 'center' | 'right' }[];

code = code.replace("images?: { url: string; width: number; align: 'left' | 'center' | 'right' }[];", "images?: { url: string; width: number; align: 'left' | 'center' | 'right'; borderWidth?: number; borderColor?: string }[];")
code = code.replace("shapes?: { type: string; width: number; color: string; rotation: number; flipX: boolean; flipY: boolean; align: 'left' | 'center' | 'right' }[];", "shapes?: { type: string; width: number; color: string; rotation: number; align: 'left' | 'center' | 'right' }[];")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
