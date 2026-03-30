export interface Level {
  id: number;
  e: string;
  type: 'memory' | 'logic' | 'speed' | 'pattern';
  domain: string;
  desc: string;
  done: boolean;
  curr?: boolean;
  boss?: boolean;
  stars?: number;
}

export const LEVELS: Level[] = [
  { id: 1, e: '🌸', type: 'memory', domain: 'Memory', desc: 'Flip cards, find the matching pairs. Your memory journey begins!', done: true, stars: 3 },
  { id: 2, e: '🔤', type: 'logic', domain: 'Logic', desc: 'Which one doesn\'t belong? Spot the odd one out from four options.', done: true, stars: 3 },
  { id: 3, e: '🌊', type: 'memory', domain: 'Memory', desc: 'More pairs, bigger board — your memory is warming up.', done: true, stars: 2 },
  { id: 4, e: '⚡', type: 'speed', domain: 'Speed', desc: 'A symbol flashes — tap its match fast! Build combos for bonus points.', done: false, curr: true },
  { id: 5, e: '🔮', type: 'pattern', domain: 'Pattern', desc: 'Watch the sequence light up. What comes next? Trust your instincts.', done: false },
  { id: 6, e: '🎯', type: 'logic', domain: 'Logic', desc: 'Trickier groups, sneakier odd ones out. Think before you tap!', done: false },
  { id: 7, e: '🌺', type: 'memory', domain: 'Memory', desc: 'More cards, more challenge — hold the whole board in your mind.', done: false },
  { id: 8, e: '🚀', type: 'speed', domain: 'Speed', desc: 'Faster rounds, tighter timer. How quick is your brain today?', done: false },
  { id: 9, e: '🧩', type: 'pattern', domain: 'Pattern', desc: 'Longer sequences, trickier rules. The patterns get sneakier!', done: false },
  { id: 10, e: '🏆', type: 'memory', domain: 'Memory', desc: "Boss level! Biggest board yet — show what you've got.", done: false, boss: true },
  { id: 11, e: '🌙', type: 'logic', domain: 'Logic', desc: 'Seven rounds of odd one out — can you go clean?', done: false },
  { id: 12, e: '💫', type: 'speed', domain: 'Speed', desc: 'Speed Match with similar-looking symbols. Stay sharp!', done: false },
  { id: 13, e: '🦋', type: 'pattern', domain: 'Pattern', desc: 'Trickier sequences — can you spot the hidden rule?', done: false },
  { id: 14, e: '🌴', type: 'memory', domain: 'Memory', desc: 'Symbols rotate between flips — memory and focus combined.', done: false },
  { id: 15, e: '🎠', type: 'logic', domain: 'Logic', desc: 'The toughest groups yet — only the sharpest minds spot these.', done: false },
];

// Zigzag node positions as fractions of (pathWidth, PATH_HEIGHT)
export const POS = [
  { x: 0.55, y: 0.025 }, { x: 0.22, y: 0.075 }, { x: 0.55, y: 0.128 }, { x: 0.22, y: 0.18 },
  { x: 0.58, y: 0.233 }, { x: 0.22, y: 0.285 }, { x: 0.55, y: 0.338 }, { x: 0.22, y: 0.39 },
  { x: 0.58, y: 0.443 }, { x: 0.22, y: 0.495 }, { x: 0.55, y: 0.548 }, { x: 0.22, y: 0.60 },
  { x: 0.58, y: 0.653 }, { x: 0.22, y: 0.705 }, { x: 0.55, y: 0.758 },
];
