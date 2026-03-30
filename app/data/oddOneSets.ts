export interface OddOneSet {
  items: string[];   // 4 emoji, one is the odd one out
  odd: string;       // the odd one out
  hint: string;      // shown after answer e.g. "Not a fruit"
}

export const ODD_ONE_SETS: OddOneSet[] = [
  { items: ['🍎', '🍊', '🍋', '🥦'], odd: '🥦', hint: 'Not a fruit' },
  { items: ['✈️', '🚁', '🛸', '🚂'], odd: '🚂', hint: 'Not an aircraft' },
  { items: ['🦁', '🐯', '🦊', '🐠'], odd: '🐠', hint: 'Not a land animal' },
  { items: ['⚽', '🏀', '🎾', '🎸'], odd: '🎸', hint: 'Not a sport' },
  { items: ['☀️', '🌧️', '❄️', '🌊'], odd: '🌊', hint: 'Not a weather type' },
  { items: ['🗼', '🗽', '🏯', '🌴'], odd: '🌴', hint: 'Not a landmark' },
  { items: ['🐟', '🦑', '🦀', '🦁'], odd: '🦁', hint: 'Not a sea creature' },
  { items: ['🌹', '🌷', '🌻', '🍄'], odd: '🍄', hint: 'Not a flower' },
  { items: ['🎸', '🎹', '🎺', '⚽'], odd: '⚽', hint: 'Not a musical instrument' },
  { items: ['🚗', '🏎️', '🚕', '🛶'], odd: '🛶', hint: 'Not a road vehicle' },
  { items: ['🌙', '⭐', '🌟', '🌺'], odd: '🌺', hint: 'Not in the sky' },
  { items: ['🍕', '🍔', '🌮', '🍰'], odd: '🍰', hint: 'Not a savoury meal' },
  { items: ['🐝', '🦋', '🐛', '🐬'], odd: '🐬', hint: 'Not an insect' },
  { items: ['🏔️', '🌋', '⛰️', '🌊'], odd: '🌊', hint: 'Not a mountain' },
  { items: ['🔴', '🟡', '🟢', '🎵'], odd: '🎵', hint: 'Not a colour' },
  { items: ['🍦', '🍩', '🍪', '🥗'], odd: '🥗', hint: 'Not a sweet treat' },
  { items: ['🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵'], odd: '🇯🇵', hint: 'Not in Europe' },
  { items: ['🎃', '🎄', '🎆', '🌞'], odd: '🌞', hint: 'Not a holiday symbol' },
  { items: ['🏊', '🚴', '🤸', '🎮'], odd: '🎮', hint: 'Not a physical activity' },
  { items: ['🌍', '🌎', '🌏', '🌕'], odd: '🌕', hint: 'Not Earth' },
];
