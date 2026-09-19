import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Add kids_activity to BlockType
code = code.replace(
'''export type BlockType = 
  | 'text'
  | 'mcq'
  | 'match'
  | 'table'
  | 'image_group'
  | 'split_column'
  | 'word_bank'
  | 'header'
  | 'marks_box';''',
'''export type BlockType = 
  | 'text'
  | 'mcq'
  | 'match'
  | 'table'
  | 'image_group'
  | 'split_column'
  | 'word_bank'
  | 'header'
  | 'marks_box'
  | 'kids_activity';'''
)

# Add KidsActivityBlock interface
kids_interfaces = '''
export type KidsCategory = 'TRACING' | 'VISUAL_DISCRIMINATION' | 'PHONICS' | 'NUMERACY' | 'PATTERNS' | 'EVS';
export type KidsLayoutType = 'grid' | 'match_columns' | 'tracing' | 'sequence';

export interface KidsActivityItem {
  id: string;
  imageUrl?: string;
  text?: string;
  isTarget?: boolean;
  matchId?: string;
  traceStrokes?: string;
}

export interface KidsActivityBlock {
  id: string;
  type: 'kids_activity';
  category: KidsCategory;
  subType: string;
  instruction: string;
  layoutType: KidsLayoutType;
  items: KidsActivityItem[];
  marks?: number;
  config: {
    columns?: number;
    showCheckboxes?: boolean;
    imageSize?: 'small' | 'medium' | 'large';
  };
}

export type PaperBlock =
'''

code = code.replace("export type PaperBlock =", kids_interfaces)

# Add to PaperBlock union
code = code.replace(
'''  | { id: string; type: 'header'; logos: string[]; centerText: string }
  | { id: string; type: 'marks_box'; maxMarks: number };''',
'''  | { id: string; type: 'header'; logos: string[]; centerText: string }
  | { id: string; type: 'marks_box'; maxMarks: number }
  | KidsActivityBlock;'''
)

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
