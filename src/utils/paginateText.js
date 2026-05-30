import { graphemeLength, normalizeDisplayText, splitGraphemes } from './text.js';

export const normalizeMessageText = (value) =>
  normalizeDisplayText(value)
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

const splitLongWord = (word, maxLineLength) => {
  const characters = splitGraphemes(word);
  const chunks = [];

  for (let index = 0; index < characters.length; index += maxLineLength) {
    chunks.push(characters.slice(index, index + maxLineLength).join(''));
  }

  return chunks;
};

export const paginateText = (value, options = {}) => {
  const {
    maxChars = 360,
    maxLines = 10,
    maxLineLength = 38,
  } = options;
  const normalized = normalizeMessageText(value);

  if (!normalized) {
    return [''];
  }

  const pages = [];
  let lines = [];
  let charCount = 0;

  const commitPage = () => {
    const page = lines.join('\n').trim();

    if (page) {
      pages.push(page);
    }

    lines = [];
    charCount = 0;
  };

  const pushLine = (line = '') => {
    const normalizedLine = normalizeDisplayText(line).trimEnd();
    const wouldOverflow =
      lines.length >= maxLines || (charCount + graphemeLength(normalizedLine) > maxChars && lines.length > 0);

    if (wouldOverflow) {
      commitPage();
    }

    lines.push(normalizedLine);
    charCount += graphemeLength(normalizedLine);
  };

  normalized.split('\n').forEach((paragraph, paragraphIndex, paragraphs) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
      pushLine('');
      return;
    }

    let currentLine = '';

    words.forEach((rawWord) => {
      const wordParts =
        graphemeLength(rawWord) > maxLineLength ? splitLongWord(rawWord, maxLineLength) : [rawWord];

      wordParts.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;

        if (graphemeLength(candidate) > maxLineLength && currentLine) {
          pushLine(currentLine);
          currentLine = word;
          return;
        }

        currentLine = candidate;
      });
    });

    if (currentLine) {
      pushLine(currentLine);
    }

    if (paragraphIndex < paragraphs.length - 1) {
      pushLine('');
    }
  });

  commitPage();
  return pages.length ? pages : [''];
};

export const getPageFontSize = (text) => {
  const length = graphemeLength(normalizeMessageText(text));

  if (length > 330) {
    return 0.066;
  }

  if (length > 240) {
    return 0.076;
  }

  if (length > 150) {
    return 0.088;
  }

  return 0.104;
};
