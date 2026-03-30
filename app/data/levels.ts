export interface Level {
  id: number;
  e: string;
  type: 'memory' | 'word' | 'speed' | 'pattern';
  domain: string;
  desc: string;
  done: boolean;
  curr?: boolean;
  boss?: boolean;
  stars?: number;
}

export const LEVELS: Level[] = [
  { id: 1, e: '🌸', type: 'memory', domain: 'Working Memory', desc: 'Flip cards, find the matching pairs. Your memory journey begins!', done: true, stars: 3 },
  { id: 2, e: '🔤', type: 'word', domain: 'Verbal Fluency', desc: 'Build words from the letter tiles. Find as many as you can!', done: true, stars: 3 },
  { id: 3, e: '🌊', type: 'memory', domain: 'Working Memory', desc: 'More pairs, bigger board — your memory is warming up.', done: true, stars: 2 },
  { id: 4, e: '⚡', type: 'speed', domain: 'Processing Speed', desc: 'A symbol flashes — tap its match fast! Build combos for bonus points.', done: false, curr: true },
  { id: 5, e: '🔮', type: 'pattern', domain: 'Pattern Recognition', desc: 'Watch the sequence light up. What comes next? Trust your instincts.', done: false },
  { id: 6, e: '🎯', type: 'word', domain: 'Verbal Fluency', desc: 'Bigger letter set, longer words. Go for the high scores!', done: false },
  { id: 7, e: '🌺', type: 'memory', domain: 'Working Memory', desc: 'More cards, more challenge — hold the whole board in your mind.', done: false },
  { id: 8, e: '🚀', type: 'speed', domain: 'Processing Speed', desc: 'Faster rounds, tighter timer. How quick is your brain today?', done: false },
  { id: 9, e: '🧩', type: 'pattern', domain: 'Pattern Recognition', desc: 'Longer sequences, trickier rules. The patterns get sneakier!', done: false },
  { id: 10, e: '🏆', type: 'memory', domain: 'Working Memory', desc: "Boss level! Biggest board yet — show what you've got.", done: false, boss: true },
  { id: 11, e: '🌙', type: 'word', domain: 'Verbal Fluency', desc: 'Night market letters — how many words hide in the tiles?', done: false },
  { id: 12, e: '💫', type: 'speed', domain: 'Processing Speed', desc: 'Speed Match with similar-looking symbols. Stay sharp!', done: false },
  { id: 13, e: '🦋', type: 'pattern', domain: 'Pattern Recognition', desc: 'Trickier sequences — can you spot the hidden rule?', done: false },
  { id: 14, e: '🌴', type: 'memory', domain: 'Working Memory', desc: 'Symbols rotate between flips — memory and focus combined.', done: false },
  { id: 15, e: '🎠', type: 'word', domain: 'Verbal Fluency', desc: 'Rare letters, rare words — big points for big vocabulary.', done: false },
];

// Zigzag node positions as fractions of (pathWidth, PATH_HEIGHT)
export const POS = [
  { x: 0.55, y: 0.025 }, { x: 0.22, y: 0.075 }, { x: 0.55, y: 0.128 }, { x: 0.22, y: 0.18 },
  { x: 0.58, y: 0.233 }, { x: 0.22, y: 0.285 }, { x: 0.55, y: 0.338 }, { x: 0.22, y: 0.39 },
  { x: 0.58, y: 0.443 }, { x: 0.22, y: 0.495 }, { x: 0.55, y: 0.548 }, { x: 0.22, y: 0.60 },
  { x: 0.58, y: 0.653 }, { x: 0.22, y: 0.705 }, { x: 0.55, y: 0.758 },
];
