const fs = require('fs');

const code = export interface KidsTemplateField {
  name: string;
  label: string;
  type: string;
}

export interface KidsTemplateConfig {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  layoutEngine: string;
  editorFields: KidsTemplateField[];
}

export const KIDS_TEMPLATES: KidsTemplateConfig[] = [
  { id: 'line_tracing', category: 'Tracing & Fine Motor', title: 'Line Tracing', description: 'Connect two objects with dotted lines.', icon: '〰️', layoutEngine: 'tracing', editorFields: [ {name: 'pairs', label: 'Object Pairs', type: 'image_pairs'} ] },
  { id: 'letter_tracing', category: 'Tracing & Fine Motor', title: 'Letter Tracing', description: 'Dotted strokes for alphabets.', icon: '🔤', layoutEngine: 'tracing', editorFields: [ {name: 'text', label: 'Letters to Trace', type: 'text'} ] },
  { id: 'shape_tracing', category: 'Tracing & Fine Motor', title: 'Shape Tracing', description: 'Dotted borders for shapes.', icon: '⭕', layoutEngine: 'grid', editorFields: [ {name: 'shapes', label: 'Shapes', type: 'shape_array'} ] },
  { id: 'maze', category: 'Tracing & Fine Motor', title: 'Maze Traversal', description: 'Help animal find food.', icon: '🌀', layoutEngine: 'tracing', editorFields: [ {name: 'start', label: 'Start Image', type: 'image'}, {name: 'end', label: 'End Image', type: 'image'} ] },
  
  { id: 'odd_one_out', category: 'Visual Discrimination', title: 'Odd One Out', description: 'Circle the different object.', icon: '🎯', layoutEngine: 'grid', editorFields: [ {name: 'same', label: 'Common Images', type: 'image_array'}, {name: 'odd', label: 'Odd Image', type: 'image'} ] },
  { id: 'shadow_match', category: 'Visual Discrimination', title: 'Shadow Matching', description: 'Match object to shadow.', icon: '👥', layoutEngine: 'match_columns', editorFields: [ {name: 'items', label: 'Objects', type: 'image_array'} ] },
  { id: 'size_sorting', category: 'Visual Discrimination', title: 'Size Sorting', description: 'Arrange big to small.', icon: '📏', layoutEngine: 'sequence', editorFields: [ {name: 'image', label: 'Object to resize', type: 'image'} ] },
  
  { id: 'cap_small_match', category: 'Phonics & Literacy', title: 'Capital to Small Match', description: 'Match A to a.', icon: 'Aa', layoutEngine: 'match_columns', editorFields: [ {name: 'letters', label: 'Letters to match', type: 'text'} ] },
  { id: 'missing_vowel', category: 'Phonics & Literacy', title: 'Missing Vowel (CVC)', description: 'Fill in the blank (c_t).', icon: '_a_', layoutEngine: 'sequence', editorFields: [ {name: 'words', label: 'CVC Words', type: 'text_array'} ] },
  
  { id: 'count_write', category: 'Math & Numeracy', title: 'Count and Write', description: 'Count objects and write number.', icon: '1️⃣', layoutEngine: 'grid', editorFields: [ {name: 'image', label: 'Object Image', type: 'image'}, {name: 'counts', label: 'Counts (e.g. 3, 5, 2)', type: 'text'} ] },
  { id: 'missing_numbers', category: 'Math & Numeracy', title: 'Missing Numbers', description: 'Fill in missing numbers in sequence.', icon: '1_3', layoutEngine: 'sequence', editorFields: [ {name: 'start', label: 'Start Number', type: 'text'}, {name: 'end', label: 'End Number', type: 'text'} ] },
  
  { id: 'what_comes_next', category: 'Patterns & Spatial', title: 'What Comes Next?', description: 'Complete the pattern.', icon: '🔴🔵', layoutEngine: 'sequence', editorFields: [ {name: 'patterns', label: 'Pattern Type', type: 'text'} ] },
  { id: 'directional', category: 'Patterns & Spatial', title: 'Left vs Right', description: 'Circle object facing left.', icon: '⬅️', layoutEngine: 'grid', editorFields: [ {name: 'image', label: 'Object Image', type: 'image'} ] },
  
  { id: 'animal_baby', category: 'EVS', title: 'Animal & Baby', description: 'Match dog to puppy.', icon: '🐶', layoutEngine: 'match_columns', editorFields: [ {name: 'pairs', label: 'Animal & Baby Pairs', type: 'image_pairs'} ] },
  { id: 'good_bad_habits', category: 'EVS', title: 'Good vs Bad', description: 'Tick good, cross bad.', icon: '✅', layoutEngine: 'grid', editorFields: [ {name: 'good', label: 'Good Habit Images', type: 'image_array'}, {name: 'bad', label: 'Bad Habit Images', type: 'image_array'} ] }
];;

fs.writeFileSync('src/services/KidsTemplates.ts', code);
