import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update the interface
old_interface = '''interface QuestionPaperProps {
  paperData: QuestionPaperData;
  onClose?: () => void;
  mode?: 'print' | 'inline';
}'''

new_interface = '''interface QuestionPaperProps {
  paperData: QuestionPaperData;
  onClose?: () => void;
  mode?: 'print' | 'inline';
  isEditor?: boolean;
  selectedItem?: { type: 'section' | 'question', sIdx: number, qIdx?: number } | null;
  onItemClick?: (item: { type: 'section' | 'question', sIdx: number, qIdx?: number } | null) => void;
}'''
code = code.replace(old_interface, new_interface)

# Add destructuring for new props
old_comp = '''const QuestionPaperPrintView: React.FC<QuestionPaperProps> = ({ paperData, onClose, mode = 'print' }) => {'''
new_comp = '''const QuestionPaperPrintView: React.FC<QuestionPaperProps> = ({ paperData, onClose, mode = 'print', isEditor = false, selectedItem = null, onItemClick }) => {'''
code = code.replace(old_comp, new_comp)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

