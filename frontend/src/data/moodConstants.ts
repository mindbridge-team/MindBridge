export const MOOD_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_EMOJI: Record<number, string> = {
  1: '😭',
  2: '😟',
  3: '😐',
  4: '😊',
  5: '😄',
};

export const MOOD_STRIP: { value: number; short: string }[] = [
  { value: 1, short: 'Very Bad' },
  { value: 2, short: 'Bad' },
  { value: 3, short: 'Okay' },
  { value: 4, short: 'Good' },
  { value: 5, short: 'Great' },
];
