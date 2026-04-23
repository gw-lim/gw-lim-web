const WORDS_PER_MINUTE = 300;

export const calcReadTime = (body: string | undefined): string => {
  const text = body ?? '';
  const chars = text.replace(/\s+/g, '').length;
  const minutes = Math.max(1, Math.ceil(chars / WORDS_PER_MINUTE));
  return `${minutes}분`;
};
