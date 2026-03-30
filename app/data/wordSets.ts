export interface WordPool {
  letters: string[];
  words: string[];
}

export const WORD_SETS: WordPool[] = [
  {
    letters: ['T', 'R', 'A', 'V', 'E', 'L', 'S'],
    words: ['TRAVEL', 'TRAVELS', 'RAVEL', 'TALES', 'STARE', 'RATES', 'LATER', 'ALERT', 'ALTER', 'EARS', 'REAL', 'TALE', 'SALE', 'LAST', 'TARS', 'EATS', 'STAR'],
  },
  {
    letters: ['W', 'O', 'R', 'L', 'D', 'S', 'E'],
    words: ['WORLD', 'WORLDS', 'OLDER', 'SWORD', 'WORDS', 'LOWER', 'OWES', 'WORE', 'LORE', 'DOES', 'ROWS', 'OLDS', 'OWLS', 'ORES', 'LORDS', 'DOER'],
  },
  {
    letters: ['J', 'O', 'U', 'R', 'N', 'E', 'Y'],
    words: ['JOURNEY', 'ENJOY', 'RUNE', 'EURO', 'YOUR', 'YORE', 'ERNE', 'JURY', 'JUNE'],
  },
  {
    letters: ['C', 'O', 'A', 'S', 'T', 'L', 'E'],
    words: ['COAST', 'CASTLE', 'COALS', 'TALES', 'STEAL', 'LEAST', 'CLOSE', 'STOLE', 'SLATE', 'SCALE', 'TACO', 'COLA', 'LACE', 'OAST'],
  },
  {
    letters: ['E', 'X', 'P', 'L', 'O', 'R', 'E'],
    words: ['EXPLORE', 'REEL', 'LORE', 'ROLE', 'POLE', 'PORE', 'REPEL', 'LOPER', 'PROLE'],
  },
];
