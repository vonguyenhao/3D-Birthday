export const normalizeDisplayText = (value) => String(value ?? '').normalize('NFC');

export const splitGraphemes = (value) => {
  const normalized = normalizeDisplayText(value);

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(
      new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(normalized),
      (part) => part.segment,
    );
  }

  return Array.from(normalized);
};

export const graphemeLength = (value) => splitGraphemes(value).length;
