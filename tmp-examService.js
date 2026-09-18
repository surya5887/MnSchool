const fs = require('fs');
let code = fs.readFileSync('src/services/examService.ts', 'utf8');

if (!code.includes('export interface CanvasElement')) {
  code = code.replace(
    /export interface QuestionPaperData \{/,
    'export interface CanvasElement { id: string; type: \\'text\\' | \\'image\\' | \\'shape\\' | \\'line\\'; x: number; y: number; width: number; height: number; content?: string; imageUrl?: string; border?: boolean; }\\n\\nexport interface QuestionPaperData {'
  );
  code = code.replace(
    /blocks\?: PaperBlock\[\];/,
    'blocks?: PaperBlock[];\\n  worksheetElements?: CanvasElement[];\\n  hideStandardHeader?: boolean;'
  );
  fs.writeFileSync('src/services/examService.ts', code);
}
