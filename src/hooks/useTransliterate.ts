

export const useTransliterate = () => {
  const transliterateWord = async (word: string): Promise<string> => {
    if (!word || word.trim() === '') return word;
    
    // Ignore pure numbers or symbols
    if (/^[\d!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]+$/.test(word)) return word;

    try {
      const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=1`, {
        method: 'GET'
      });
      const data = await response.json();
      if (data && data[0] === 'SUCCESS') {
        return data[1][0][1][0] || word;
      }
    } catch (err) {
      console.error('Transliteration error:', err);
    }
    return word;
  };

  const processText = async (text: string, cursorPosition: number): Promise<{ text: string, cursorPosition: number }> => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const textAfterCursor = text.slice(cursorPosition);
    
    if (!textBeforeCursor.endsWith(' ')) {
      return { text, cursorPosition }; 
    }

    const words = textBeforeCursor.slice(0, -1).split(/(\s+)/);
    const lastWordIndex = words.length - 1;
    const lastWord = words[lastWordIndex];

    if (!lastWord || lastWord.trim() === '') {
      return { text, cursorPosition };
    }

    const transliterated = await transliterateWord(lastWord);
    
    words[lastWordIndex] = transliterated;
    
    const newTextBeforeCursor = words.join('') + ' ';
    const newText = newTextBeforeCursor + textAfterCursor;
    const newCursorPosition = newTextBeforeCursor.length;

    return { text: newText, cursorPosition: newCursorPosition };
  };

  return { processText, transliterateWord };
};
