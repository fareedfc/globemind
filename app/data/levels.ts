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
  // ── World 1 ───────────────────────────────────────────────────────────────
  { id: 1,  e: '🌸', type: 'memory',  domain: 'Memory',  desc: 'Flip cards, find the matching pairs. Your memory journey begins!', done: true, stars: 3 },
  { id: 2,  e: '🔤', type: 'logic',   domain: 'Logic',   desc: "Which one doesn't belong? Spot the odd one out from four options.", done: true, stars: 3 },
  { id: 3,  e: '🌊', type: 'memory',  domain: 'Memory',  desc: 'More pairs, bigger board — your memory is warming up.', done: true, stars: 2 },
  { id: 4,  e: '⚡', type: 'speed',   domain: 'Speed',   desc: 'A symbol flashes — tap its match fast! Build combos for bonus points.', done: false, curr: true },
  { id: 5,  e: '🔮', type: 'pattern', domain: 'Pattern', desc: 'Watch the sequence light up. What comes next? Trust your instincts.', done: false },
  { id: 6,  e: '🎯', type: 'logic',   domain: 'Logic',   desc: "Trickier groups, sneakier odd ones out. Think before you tap!", done: false },
  { id: 7,  e: '🌺', type: 'memory',  domain: 'Memory',  desc: 'More cards, more challenge — hold the whole board in your mind.', done: false },
  { id: 8,  e: '🚀', type: 'speed',   domain: 'Speed',   desc: 'Faster rounds, tighter timer. How quick is your brain today?', done: false },
  { id: 9,  e: '🧩', type: 'pattern', domain: 'Pattern', desc: 'Longer sequences, trickier rules. The patterns get sneakier!', done: false },
  { id: 10, e: '🏆', type: 'memory',  domain: 'Memory',  desc: "Boss level! Biggest board yet — show what you've got.", done: false, boss: true },

  // ── World 2 ───────────────────────────────────────────────────────────────
  { id: 11, e: '🌙', type: 'logic',   domain: 'Logic',   desc: 'Seven rounds of odd one out — can you go clean?', done: false },
  { id: 12, e: '💫', type: 'speed',   domain: 'Speed',   desc: 'Speed Match with similar-looking symbols. Stay sharp!', done: false },
  { id: 13, e: '🦋', type: 'pattern', domain: 'Pattern', desc: 'Trickier sequences — can you spot the hidden rule?', done: false },
  { id: 14, e: '🌴', type: 'memory',  domain: 'Memory',  desc: 'Symbols rotate between flips — memory and focus combined.', done: false },
  { id: 15, e: '🎠', type: 'logic',   domain: 'Logic',   desc: 'The toughest groups yet — only the sharpest minds spot these.', done: false },
  { id: 16, e: '⚡', type: 'speed',   domain: 'Speed',   desc: 'Targets change faster — keep your combo alive!', done: false },
  { id: 17, e: '🎪', type: 'pattern', domain: 'Pattern', desc: 'Carnival sequences — spot the rule amid the spectacle.', done: false },
  { id: 18, e: '🦁', type: 'memory',  domain: 'Memory',  desc: 'Jungle pairs — every animal face hides a match.', done: false },
  { id: 19, e: '🔬', type: 'logic',   domain: 'Logic',   desc: "Science lab — one item doesn't belong in the experiment.", done: false },
  { id: 20, e: '🏅', type: 'speed',   domain: 'Speed',   desc: 'BOSS: 30 seconds of pure reflex — hit your personal best!', done: false, boss: true },

  // ── World 3 ───────────────────────────────────────────────────────────────
  { id: 21, e: '🌈', type: 'pattern', domain: 'Pattern', desc: 'Rainbow rules — colour and shape shift together.', done: false },
  { id: 22, e: '🐙', type: 'memory',  domain: 'Memory',  desc: 'Ocean depths — pair the creatures of the deep blue.', done: false },
  { id: 23, e: '🧲', type: 'logic',   domain: 'Logic',   desc: 'Opposites and pairs — which one breaks the magnetic rule?', done: false },
  { id: 24, e: '🎭', type: 'speed',   domain: 'Speed',   desc: 'The grid fills faster. Chase the match across 30 wild seconds.', done: false },
  { id: 25, e: '🌏', type: 'pattern', domain: 'Pattern', desc: 'World patterns — global sequences hide a clever rule.', done: false },
  { id: 26, e: '🐯', type: 'memory',  domain: 'Memory',  desc: 'Wild cat pairs — stalk every match on the board.', done: false },
  { id: 27, e: '💡', type: 'logic',   domain: 'Logic',   desc: "Bright ideas — inventions, tools, and one that doesn't spark.", done: false },
  { id: 28, e: '🌪️', type: 'speed',   domain: 'Speed',   desc: 'Tornado tap — symbols blur faster than ever before.', done: false },
  { id: 29, e: '✨', type: 'pattern', domain: 'Pattern', desc: 'Starlight sequences — the pattern shifts before your eyes.', done: false },
  { id: 30, e: '👑', type: 'memory',  domain: 'Memory',  desc: 'BOSS: 8 pairs — the royal challenge of recall!', done: false, boss: true },

  // ── World 4 ───────────────────────────────────────────────────────────────
  { id: 31, e: '🌻', type: 'logic',   domain: 'Logic',   desc: 'Garden groups — flowers, fruits, and one sneaky intruder.', done: false },
  { id: 32, e: '🎵', type: 'speed',   domain: 'Speed',   desc: 'Musical speed — hit every note-match before the timer fades.', done: false },
  { id: 33, e: '🦚', type: 'pattern', domain: 'Pattern', desc: 'Peacock patterns — beautiful sequences with hidden rules.', done: false },
  { id: 34, e: '🏖️', type: 'memory',  domain: 'Memory',  desc: 'Beach day — match the seaside treasures across the board.', done: false },
  { id: 35, e: '🔑', type: 'logic',   domain: 'Logic',   desc: "Lock and key — which item doesn't open anything?", done: false },
  { id: 36, e: '🎯', type: 'speed',   domain: 'Speed',   desc: 'Precision speed — similar-looking symbols, only one is right.', done: false },
  { id: 37, e: '🌌', type: 'pattern', domain: 'Pattern', desc: 'Galaxy sequences — cosmic patterns across the universe.', done: false },
  { id: 38, e: '🐺', type: 'memory',  domain: 'Memory',  desc: 'Wolf pack — track every pair through the dark forest.', done: false },
  { id: 39, e: '🦓', type: 'logic',   domain: 'Logic',   desc: 'Safari oddities — which animal breaks the savanna rule?', done: false },
  { id: 40, e: '🌟', type: 'speed',   domain: 'Speed',   desc: 'BOSS: The fastest 30 seconds yet — pure reflex supremacy!', done: false, boss: true },

  // ── World 5 ───────────────────────────────────────────────────────────────
  { id: 41, e: '🎆', type: 'pattern', domain: 'Pattern', desc: 'Firework patterns — each burst follows a hidden rule.', done: false },
  { id: 42, e: '🗺️', type: 'memory',  domain: 'Memory',  desc: "Explorer's map — pair the landmarks of the world.", done: false },
  { id: 43, e: '🌋', type: 'logic',   domain: 'Logic',   desc: 'Geological oddities — rock, lava, crystal... and one liar.', done: false },
  { id: 44, e: '🎸', type: 'speed',   domain: 'Speed',   desc: 'Rock and roll reflexes — the tempo never lets up.', done: false },
  { id: 45, e: '🎻', type: 'pattern', domain: 'Pattern', desc: 'Classical sequences — elegant but demanding patterns.', done: false },
  { id: 46, e: '🐬', type: 'memory',  domain: 'Memory',  desc: 'Dolphin bay — the biggest board yet. Every pair matters.', done: false },
  { id: 47, e: '🧬', type: 'logic',   domain: 'Logic',   desc: "Life and science — which element doesn't belong in the lab?", done: false },
  { id: 48, e: '💨', type: 'speed',   domain: 'Speed',   desc: 'Wind speed — the fastest grid in the game. Can you keep up?', done: false },
  { id: 49, e: '🌠', type: 'pattern', domain: 'Pattern', desc: 'The final pattern — predict the sequence of a grand challenge.', done: false },
  { id: 50, e: '🏆', type: 'memory',  domain: 'Memory',  desc: 'FINAL BOSS: 9 pairs — the ultimate test of memory. Prove your mind!', done: false, boss: true },
];

// Winding map node positions as fractions of (pathWidth, PATH_HEIGHT = 6000)
// Path sweeps right then left per world, creating an organic winding map feel.
// x: 0.18 (far left) – 0.82 (far right); y increases top→bottom
export const POS = [
  // World 1 · Forest (L1–L10) — sweep right then arc back left
  { x: 0.50, y: 0.012 }, // L1  start centre
  { x: 0.65, y: 0.030 }, // L2
  { x: 0.78, y: 0.050 }, // L3  far right
  { x: 0.76, y: 0.068 }, // L4
  { x: 0.62, y: 0.085 }, // L5  peak, turn left
  { x: 0.45, y: 0.100 }, // L6
  { x: 0.28, y: 0.117 }, // L7  far left
  { x: 0.20, y: 0.135 }, // L8
  { x: 0.28, y: 0.155 }, // L9  corner, turn right
  { x: 0.50, y: 0.175 }, // L10 boss · centre

  // World 2 · Ocean (L11–L20) — sweep right then arc back left
  { x: 0.68, y: 0.195 }, // L11
  { x: 0.80, y: 0.213 }, // L12 far right
  { x: 0.78, y: 0.232 }, // L13
  { x: 0.63, y: 0.248 }, // L14
  { x: 0.48, y: 0.263 }, // L15 centre
  { x: 0.32, y: 0.278 }, // L16
  { x: 0.20, y: 0.295 }, // L17 far left
  { x: 0.22, y: 0.313 }, // L18
  { x: 0.40, y: 0.330 }, // L19
  { x: 0.56, y: 0.348 }, // L20 boss

  // World 3 · Desert (L21–L30) — wider sweep
  { x: 0.72, y: 0.368 }, // L21
  { x: 0.82, y: 0.385 }, // L22 far right
  { x: 0.78, y: 0.403 }, // L23
  { x: 0.62, y: 0.418 }, // L24
  { x: 0.46, y: 0.433 }, // L25 centre
  { x: 0.30, y: 0.450 }, // L26
  { x: 0.18, y: 0.467 }, // L27 far left
  { x: 0.20, y: 0.485 }, // L28
  { x: 0.38, y: 0.503 }, // L29
  { x: 0.54, y: 0.520 }, // L30 boss

  // World 4 · Mountain (L31–L40)
  { x: 0.70, y: 0.540 }, // L31
  { x: 0.81, y: 0.557 }, // L32 far right
  { x: 0.79, y: 0.575 }, // L33
  { x: 0.64, y: 0.590 }, // L34
  { x: 0.48, y: 0.605 }, // L35 centre
  { x: 0.32, y: 0.622 }, // L36
  { x: 0.20, y: 0.638 }, // L37 far left
  { x: 0.22, y: 0.657 }, // L38
  { x: 0.40, y: 0.675 }, // L39
  { x: 0.57, y: 0.692 }, // L40 boss

  // World 5 · Space (L41–L50)
  { x: 0.72, y: 0.710 }, // L41
  { x: 0.82, y: 0.727 }, // L42 far right
  { x: 0.79, y: 0.745 }, // L43
  { x: 0.64, y: 0.762 }, // L44
  { x: 0.48, y: 0.778 }, // L45 centre
  { x: 0.31, y: 0.795 }, // L46
  { x: 0.20, y: 0.812 }, // L47 far left
  { x: 0.24, y: 0.832 }, // L48
  { x: 0.45, y: 0.850 }, // L49
  { x: 0.50, y: 0.868 }, // L50 final boss
];
