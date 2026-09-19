import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EXAM_MARKS_COLLECTION = 'exam_marks';

export interface ExamMarkData {
  id?: string;
  studentId: string;
  examTerm: string;
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
}

export const saveExamMark = async (data: ExamMarkData) => {
  try {
    // Check if it already exists to update
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("studentId", "==", data.studentId),
      where("examTerm", "==", data.examTerm),
      where("subject", "==", data.subject)
    );
    const querySnapshot = await getDocs(q as any);
    
    if (!querySnapshot.empty) {
      // Update existing
      const existingDoc = querySnapshot.docs[0];
      const docRef = doc(db, EXAM_MARKS_COLLECTION, existingDoc.id);
      await updateDoc(docRef, {
        theoryMarks: data.theoryMarks,
        practicalMarks: data.practicalMarks
      });
      return existingDoc.id;
    } else {
      // Add new
      const docRef = await addDoc(collection(db, EXAM_MARKS_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving exam mark: ", error);
    throw error;
  }
};

export const getExamMarks = async (examTerm: string, subject: string) => {
  try {
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("examTerm", "==", examTerm),
      where("subject", "==", subject)
    );
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamMarkData));
  } catch (error) {
    console.error("Error fetching exam marks: ", error);
    throw error;
  }
};

export const getAllExamMarksForTerm = async (examTerm: string) => {
  try {
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("examTerm", "==", examTerm)
    );
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamMarkData));
  } catch (error) {
    console.error("Error fetching all exam marks for term: ", error);
    throw error;
  }
};

export const getAllExamMarks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, EXAM_MARKS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamMarkData));
  } catch (error) {
    console.error("Error fetching all exam marks: ", error);
    throw error;
  }
};


const EXAM_SCHEDULE_COLLECTION = 'exam_schedules';
const QUESTION_PAPER_COLLECTION = 'question_papers';

export interface ExamScheduleData {
  id?: string;
  classId: string;
  examTerm: string;
  schedule: {
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export type BlockType = 
  | 'text'
  | 'mcq'
  | 'match'
  | 'table'
  | 'image_group'
  | 'split_column'
  | 'word_bank'
  | 'header'
  | 'marks_box'
  | 'kids_activity';

export interface BaseBlock {
  id: string;
  type: BlockType;
  marks?: number;
  showMarks?: boolean;
}

export interface HeaderBlock extends BaseBlock {
  type: 'header';
  title: string;
  subtitle?: string;
  leftLogo?: string;
  rightLogo?: string;
  fields: { label: string; value: string; width?: string }[];
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface MCQBlock extends BaseBlock {
  type: 'mcq';
  question: string;
  layout: '1-col' | '2-col' | '4-col' | 'inline';
  options: { text: string; image?: string }[];
  showBracket?: boolean;
}

export interface MatchBlock extends BaseBlock {
  type: 'match';
  leftColumn: { text: string; image?: string }[];
  rightColumn: { text: string; image?: string }[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: number;
  cols: number;
  cells: { rowIndex: number; colIndex: number; content: string; hideBorder?: boolean }[];
}

export interface ImageGroupBlock extends BaseBlock {
  type: 'image_group';
  images: { url: string; width: number; caption?: string; showTickBox?: boolean }[];
  layout: 'grid' | 'row';
}

// Forward declare PaperBlock for recursive use

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
 TextBlock | MCQBlock | MatchBlock | TableBlock | ImageGroupBlock | SplitColumnBlock | WordBankBlock | MarksBoxBlock | HeaderBlock;

export interface SplitColumnBlock extends BaseBlock {
  type: 'split_column';
  leftBlocks: PaperBlock[];
  rightBlocks: PaperBlock[];
}

export interface WordBankBlock extends BaseBlock {
  type: 'word_bank';
  words: string[];
}

export interface MarksBoxBlock extends BaseBlock {
  type: 'marks_box';
  text: string;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  border?: boolean;
}

export interface QuestionPaperData {
  id?: string;
  classId: string;
  sectionId?: string;
  subject: string;
  examTerm: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string[];
  hideStandardHeader?: boolean;
  includeOMR?: boolean;
  globalFontSize?: string;
  wordContent?: string;
  worksheetElements?: CanvasElement[];
  blocks?: PaperBlock[];
  sections?: {
    sectionTitle: string;
    questions: {
      text: string;
      marks: number;
      type?: 'subjective' | 'objective' | 'instruction' | 'match' | 'fill_in_the_blanks' | 'true_false' | 'tracing' | 'passage';
      options?: string[];
      optionImages?: string[];
      wordBank?: string[];
      hint?: string;
      label?: string;
      images?: { url: string; width: number; align: 'left' | 'center' | 'right' }[];
      shapes?: { type: string; width: number; color: string; rotation: number; flipX: boolean; flipY: boolean; align: 'left' | 'center' | 'right' }[];
    }[];
  }[];
  createdAt: string;
}

export const saveExamSchedule = async (data: ExamScheduleData) => {
  try {
    const q = query(
      collection(db, EXAM_SCHEDULE_COLLECTION),
      where("classId", "==", data.classId),
      where("examTerm", "==", data.examTerm)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, EXAM_SCHEDULE_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, { schedule: data.schedule });
      return querySnapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(db, EXAM_SCHEDULE_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving exam schedule: ", error);
    throw error;
  }
};

export const getExamSchedulesByClass = async (classId: string) => {
  try {
    const q = query(collection(db, EXAM_SCHEDULE_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamScheduleData));
  } catch (error) {
    console.error("Error fetching exam schedules: ", error);
    throw error;
  }
};

export const saveQuestionPaper = async (data: QuestionPaperData) => {
  try {
    const q = query(
      collection(db, QUESTION_PAPER_COLLECTION),
      where("classId", "==", data.classId),
      where("sectionId", "==", data.sectionId || ''),
      where("subject", "==", data.subject),
      where("examTerm", "==", data.examTerm)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, QUESTION_PAPER_COLLECTION, querySnapshot.docs[0].id);
      // Update existing paper
      const updateData = { ...data };
      delete updateData.id;
      await updateDoc(docRef, updateData as any);
      return querySnapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(db, QUESTION_PAPER_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving question paper: ", error);
    throw error;
  }
};

export const getQuestionPapersByClass = async (classId: string) => {
  try {
    const q = query(collection(db, QUESTION_PAPER_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as QuestionPaperData));
  } catch (error) {
    console.error("Error fetching question papers: ", error);
    throw error;
  }
};

export const getExamSchedulesByTerm = async (examTerm: string) => {
  try {
    const q = query(collection(db, EXAM_SCHEDULE_COLLECTION), where("examTerm", "==", examTerm));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamScheduleData));
  } catch (error) {
    console.error("Error fetching schedules by term: ", error);
    return [];
  }
};




