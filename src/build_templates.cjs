const fs = require('fs');

const fileContent = `export interface KidsTemplateField {
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
  // Category 1: Tracing & Fine Motor Skills
  { id: 'pre_writing_tracing', category: 'Tracing & Fine Motor Skills', title: 'Pre-Writing Pattern Tracing', description: 'Trace the wavy and zig-zag lines.', icon: '??', layoutEngine: 'tracing', editorFields: [] },
  { id: 'alphabet_arrow_tracing', category: 'Tracing & Fine Motor Skills', title: 'Alphabet Arrow Tracing', description: 'Follow the arrows to trace alphabets.', icon: '??', layoutEngine: 'tracing', editorFields: [] },
  { id: 'number_stroke_tracing', category: 'Tracing & Fine Motor Skills', title: 'Number Stroke Tracing', description: 'Follow the arrows to trace numbers.', icon: '??', layoutEngine: 'tracing', editorFields: [] },
  { id: 'geometric_shape_tracing', category: 'Tracing & Fine Motor Skills', title: 'Geometric Shape Tracing', description: 'Trace shapes like circles and squares.', icon: '?', layoutEngine: 'tracing', editorFields: [] },
  { id: 'character_maze', category: 'Tracing & Fine Motor Skills', title: 'Character Maze Traversal', description: 'Help the character find their way through the maze.', icon: '??', layoutEngine: 'tracing', editorFields: [] },
  { id: 'numeric_connect_dots', category: 'Tracing & Fine Motor Skills', title: 'Numeric Connect-the-Dots', description: 'Connect dots 1 to 10 to reveal the picture.', icon: '???', layoutEngine: 'tracing', editorFields: [] },
  { id: 'alphabet_connect_dots', category: 'Tracing & Fine Motor Skills', title: 'Alphabetical Connect-the-Dots', description: 'Connect A to Z to reveal the picture.', icon: '??', layoutEngine: 'tracing', editorFields: [] },
  { id: 'grid_symmetry', category: 'Tracing & Fine Motor Skills', title: 'Grid Symmetry Completion', description: 'Draw the other half of the picture symmetrically.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'scissor_cutting', category: 'Tracing & Fine Motor Skills', title: 'Scissor Cutting Guide Lines', description: 'Trace the dashed line as a cutting practice.', icon: '??', layoutEngine: 'tracing', editorFields: [] },

  // Category 2: Visual Discrimination & Observation
  { id: 'attribute_odd_out', category: 'Visual Discrimination & Observation', title: 'Visual Attribute Odd-One-Out', description: 'Circle the object that looks different.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'concept_odd_out', category: 'Visual Discrimination & Observation', title: 'Conceptual Odd-One-Out', description: 'Circle the object that does not belong in the group.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'spot_difference', category: 'Visual Discrimination & Observation', title: 'Classic Spot-the-Difference', description: 'Find 5 differences between the two pictures.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'shadow_matching', category: 'Visual Discrimination & Observation', title: 'Shadow / Silhouette Matching', description: 'Match the object to its correct shadow.', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'i_spy_hunt', category: 'Visual Discrimination & Observation', title: 'I-Spy Object Hunt', description: 'Find and count the hidden objects.', icon: '???', layoutEngine: 'grid', editorFields: [] },
  { id: 'relative_size', category: 'Visual Discrimination & Observation', title: 'Relative Size Discrimination', description: 'Circle the biggest/smallest object.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'dimension_compare', category: 'Visual Discrimination & Observation', title: 'Dimension Comparison', description: 'Tick the taller/shorter or longer/shorter object.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'weight_capacity', category: 'Visual Discrimination & Observation', title: 'Weight & Capacity Intuition', description: 'Identify heavier/lighter or full/empty objects.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'identical_pair', category: 'Visual Discrimination & Observation', title: 'Identical Pair Matching', description: 'Draw a line to match identical objects.', icon: '??', layoutEngine: 'match_columns', editorFields: [] },

  // Category 3: Early Literacy & Phonics
  { id: 'case_matching', category: 'Early Literacy & Phonics', title: 'Case Matching', description: 'Match Capital letters to Small letters.', icon: 'Aa', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'beginning_sound', category: 'Early Literacy & Phonics', title: 'Beginning Phonics Sound', description: 'Circle the picture starting with the given letter.', icon: '???', layoutEngine: 'grid', editorFields: [] },
  { id: 'ending_sound', category: 'Early Literacy & Phonics', title: 'Ending Consonant Sound', description: 'Circle the picture ending with the given letter.', icon: '???', layoutEngine: 'grid', editorFields: [] },
  { id: 'cvc_vowel', category: 'Early Literacy & Phonics', title: 'CVC Middle Vowel Hunt', description: 'Fill in the missing middle vowel (a, e, i, o, u).', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'visual_word_search', category: 'Early Literacy & Phonics', title: 'Visual Word Search', description: 'Find and circle the given words in the grid.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'rhyming_pair', category: 'Early Literacy & Phonics', title: 'Rhyming Pair Connection', description: 'Match words/pictures that rhyme (e.g. Cat-Hat).', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'missing_alphabet', category: 'Early Literacy & Phonics', title: 'Missing Alphabet Ladder', description: 'Fill in the missing letters in A-Z sequence.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'sight_word', category: 'Early Literacy & Phonics', title: 'Sight Word Highlighter', description: 'Color or circle specific sight words.', icon: '???', layoutEngine: 'grid', editorFields: [] },
  { id: 'letter_unscramble', category: 'Early Literacy & Phonics', title: 'Letter Unscramble Builder', description: 'Unscramble letters to form the correct word.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'action_verb', category: 'Early Literacy & Phonics', title: 'Action Verb Association', description: 'Match the picture with the correct action word.', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'singular_plural', category: 'Early Literacy & Phonics', title: 'Singular / Plural Visuals', description: 'Match one object to its plural form (e.g. Apple -> Apples).', icon: '????', layoutEngine: 'match_columns', editorFields: [] },

  // Category 4: Early Math & Numeracy
  { id: 'freehand_count_write', category: 'Early Math & Numeracy', title: 'Freehand Count and Write', description: 'Count the objects and write the correct number.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'multiple_choice_count', category: 'Early Math & Numeracy', title: 'Multiple-Choice Count', description: 'Count the objects and circle the correct number.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'number_to_quantity', category: 'Early Math & Numeracy', title: 'Number-to-Quantity Drawing', description: 'Draw objects to match the given number.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'ten_frame_counter', category: 'Early Math & Numeracy', title: 'Ten-Frame Counter Filling', description: 'Color the dots in the ten-frame to match the number.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'forward_number_chain', category: 'Early Math & Numeracy', title: 'Forward Number Chain', description: 'Fill in missing numbers counting forward.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'backward_countdown', category: 'Early Math & Numeracy', title: 'Backward Countdown Strip', description: 'Fill in missing numbers counting backward.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'sequence_boundaries', category: 'Early Math & Numeracy', title: 'Sequence Boundaries', description: 'Write What Comes Before, After, and Between.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'set_quantity_compare', category: 'Early Math & Numeracy', title: 'Set Quantity Comparison', description: 'Count and use <, > or = signs.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'visual_addition', category: 'Early Math & Numeracy', title: 'Visual Concrete Addition', description: 'Count and add sets of objects.', icon: '?', layoutEngine: 'grid', editorFields: [] },
  { id: 'cross_out_subtraction', category: 'Early Math & Numeracy', title: 'Cross-Out Subtraction', description: 'Cross out objects to subtract and find the answer.', icon: '?', layoutEngine: 'grid', editorFields: [] },
  { id: 'tally_mark', category: 'Early Math & Numeracy', title: 'Tally Mark Correlation', description: 'Match tally marks to the correct number.', icon: '?', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'ordinal_position', category: 'Early Math & Numeracy', title: 'Ordinal Position Marker', description: 'Circle the 1st, 2nd, 3rd object in the line.', icon: '??', layoutEngine: 'sequence', editorFields: [] },

  // Category 5: Patterns, Sorting & Spatial Reasoning
  { id: 'ab_abc_pattern', category: 'Patterns, Sorting & Spatial Reasoning', title: 'AB / ABC Shape Repeating', description: 'Draw what comes next in the pattern.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'logical_evolution', category: 'Patterns, Sorting & Spatial Reasoning', title: 'Next-Step Logical Evolution', description: 'Identify the next logical step in the picture sequence.', icon: '??', layoutEngine: 'sequence', editorFields: [] },
  { id: 'color_bin_sorting', category: 'Patterns, Sorting & Spatial Reasoning', title: 'Color-Bin Sorting', description: 'Sort objects by their color into the correct bin.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'shape_sorting', category: 'Patterns, Sorting & Spatial Reasoning', title: 'Shape-Geometry Sorting', description: 'Sort everyday objects by their geometric shape.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'vector_direction', category: 'Patterns, Sorting & Spatial Reasoning', title: 'Vector Direction Isolation', description: 'Find the object facing left, right, up, or down.', icon: '??', layoutEngine: 'grid', editorFields: [] },
  { id: 'positional_prepositions', category: 'Patterns, Sorting & Spatial Reasoning', title: 'Positional Prepositions', description: 'Identify objects that are Under, Over, Inside, or Outside.', icon: '??', layoutEngine: 'grid', editorFields: [] },

  // Category 6: EVS, GK & Real-World Associations
  { id: 'animal_parent_offspring', category: 'EVS, GK & Real-World Associations', title: 'Animal Parent-Offspring Match', description: 'Match the adult animal to its baby.', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'animal_habitat', category: 'EVS, GK & Real-World Associations', title: 'Animal Habitat Correlation', description: 'Match the animal to where it lives (e.g. Bird -> Nest).', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'dietary_habit', category: 'EVS, GK & Real-World Associations', title: 'Dietary Habit Association', description: 'Match the animal to its food (e.g. Rabbit -> Carrot).', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'community_helper', category: 'EVS, GK & Real-World Associations', title: 'Community Helper & Tool Pairing', description: 'Match helpers to their tools (e.g. Doctor -> Stethoscope).', icon: '??', layoutEngine: 'match_columns', editorFields: [] },
  { id: 'living_nonliving', category: 'EVS, GK & Real-World Associations', title: 'Living / Non-Living Sorting', description: 'Sort objects into living or non-living categories.', icon: '??', layoutEngine: 'grid', editorFields: [] }
];
`;

fs.writeFileSync('C:/Users/AneesChaudhary/Desktop/MN_Public_School/frontend/src/services/KidsTemplates.ts', fileContent);
fs.writeFileSync('C:/Users/AneesChaudhary/Desktop/Rahimya_Model_School/frontend/src/services/KidsTemplates.ts', fileContent);

console.log("Updated KidsTemplates.ts successfully!");
