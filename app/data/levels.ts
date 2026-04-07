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
  // ── World 1 · Forest ──────────────────────────────────────────────────────
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

  // ── World 2 · Ocean ───────────────────────────────────────────────────────
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

  // ── World 3 · Desert ──────────────────────────────────────────────────────
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

  // ── World 4 · Mountain ────────────────────────────────────────────────────
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

  // ── World 5 · Space ───────────────────────────────────────────────────────
  { id: 41, e: '🎆', type: 'pattern', domain: 'Pattern', desc: 'Firework patterns — each burst follows a hidden rule.', done: false },
  { id: 42, e: '🗺️', type: 'memory',  domain: 'Memory',  desc: "Explorer's map — pair the landmarks of the world.", done: false },
  { id: 43, e: '🌋', type: 'logic',   domain: 'Logic',   desc: 'Geological oddities — rock, lava, crystal... and one liar.', done: false },
  { id: 44, e: '🎸', type: 'speed',   domain: 'Speed',   desc: 'Rock and roll reflexes — the tempo never lets up.', done: false },
  { id: 45, e: '🎻', type: 'pattern', domain: 'Pattern', desc: 'Classical sequences — elegant but demanding patterns.', done: false },
  { id: 46, e: '🐬', type: 'memory',  domain: 'Memory',  desc: 'Dolphin bay — the biggest board yet. Every pair matters.', done: false },
  { id: 47, e: '🧬', type: 'logic',   domain: 'Logic',   desc: "Life and science — which element doesn't belong in the lab?", done: false },
  { id: 48, e: '💨', type: 'speed',   domain: 'Speed',   desc: 'Wind speed — the fastest grid in the game. Can you keep up?', done: false },
  { id: 49, e: '🌠', type: 'pattern', domain: 'Pattern', desc: 'The final pattern — predict the sequence of a grand challenge.', done: false },
  { id: 50, e: '🏆', type: 'memory',  domain: 'Memory',  desc: 'BOSS: 9 pairs — the ultimate test of memory. Prove your mind!', done: false, boss: true },

  // ── World 6 · Deep Ocean ──────────────────────────────────────────────────
  { id: 51, e: '🐠', type: 'memory',  domain: 'Memory',  desc: 'Tropical fish dart between coral — pair every species before they vanish.', done: false },
  { id: 52, e: '🦈', type: 'logic',   domain: 'Logic',   desc: "Ocean predators, fish, and one creature that doesn't belong in these depths.", done: false },
  { id: 53, e: '🌊', type: 'speed',   domain: 'Speed',   desc: 'Surf the symbol surge — 30 seconds of deep-sea reflexes.', done: false },
  { id: 54, e: '🐚', type: 'pattern', domain: 'Pattern', desc: 'Spiral shells follow a hidden rule — what comes next in the tide?', done: false },
  { id: 55, e: '🐙', type: 'memory',  domain: 'Memory',  desc: 'Eight arms, endless hiding spots — track every pair in the deep.', done: false },
  { id: 56, e: '🦞', type: 'logic',   domain: 'Logic',   desc: "Crabs, lobsters, shrimp — one sneaked in from the wrong ocean.", done: false },
  { id: 57, e: '🐟', type: 'speed',   domain: 'Speed',   desc: 'Fast as a shoal — symbols flash like a school of fish. Keep up!', done: false },
  { id: 58, e: '🪸', type: 'memory',  domain: 'Memory',  desc: 'The reef is vast — pair every creature before the current takes them.', done: false },
  { id: 59, e: '🌀', type: 'pattern', domain: 'Pattern', desc: 'The tide shifts in a pattern — predict where the next wave breaks.', done: false },
  { id: 60, e: '🐋', type: 'memory',  domain: 'Memory',  desc: 'BOSS: The deep calls — the biggest ocean memory challenge yet!', done: false, boss: true },

  // ── World 7 · Volcanic ────────────────────────────────────────────────────
  { id: 61, e: '🔥', type: 'logic',   domain: 'Logic',   desc: "Flames, lava, ash — and one element that doesn't burn with the rest.", done: false },
  { id: 62, e: '💥', type: 'speed',   domain: 'Speed',   desc: 'Volcanic reflexes — symbols burst fast as a lava flow.', done: false },
  { id: 63, e: '🌋', type: 'pattern', domain: 'Pattern', desc: 'Lava flows follow physics — can you predict the next surge?', done: false },
  { id: 64, e: '🪨', type: 'memory',  domain: 'Memory',  desc: 'Layers of rock hide pairs — excavate every match from the strata.', done: false },
  { id: 65, e: '⚗️', type: 'logic',   domain: 'Logic',   desc: "Elements and compounds — which one doesn't react with the others?", done: false },
  { id: 66, e: '⚡', type: 'speed',   domain: 'Speed',   desc: 'Charged and fast — the most electric Speed Match yet.', done: false },
  { id: 67, e: '🌡️', type: 'memory',  domain: 'Memory',  desc: 'Hot, hotter, hottest — pair every volcanic instrument under pressure.', done: false },
  { id: 68, e: '🔥', type: 'pattern', domain: 'Pattern', desc: 'The flames pulse in a pattern — name what ignites next.', done: false },
  { id: 69, e: '💎', type: 'logic',   domain: 'Logic',   desc: "Diamonds, rubies, emeralds — one gemstone is an imposter.", done: false },
  { id: 70, e: '🏔️', type: 'speed',   domain: 'Speed',   desc: 'BOSS: Race to the summit — the most intense Speed Match in the volcano.', done: false, boss: true },

  // ── World 8 · Arctic ──────────────────────────────────────────────────────
  { id: 71, e: '❄️', type: 'pattern', domain: 'Pattern', desc: 'No two snowflakes are alike — but this sequence has a hidden rule.', done: false },
  { id: 72, e: '🐧', type: 'memory',  domain: 'Memory',  desc: 'Waddling pairs — match every penguin before the ice shifts.', done: false },
  { id: 73, e: '🦭', type: 'logic',   domain: 'Logic',   desc: "Walrus, seal, polar bear — one animal doesn't belong on this ice.", done: false },
  { id: 74, e: '🏔️', type: 'speed',   domain: 'Speed',   desc: 'White-out conditions — symbols blur in the cold. Stay sharp!', done: false },
  { id: 75, e: '🌨️', type: 'pattern', domain: 'Pattern', desc: 'Ice crystals grow in patterns — predict the next formation.', done: false },
  { id: 76, e: '🐻‍❄️', type: 'memory', domain: 'Memory',  desc: 'Arctic creatures hide in the snow — pair every one before it drifts.', done: false },
  { id: 77, e: '🔭', type: 'logic',   domain: 'Logic',   desc: "Stars, planets, constellations — which object doesn't belong in this sky?", done: false },
  { id: 78, e: '⛄', type: 'speed',   domain: 'Speed',   desc: 'Faster than a blizzard — 30 seconds of icy-sharp reflexes.', done: false },
  { id: 79, e: '🌌', type: 'memory',  domain: 'Memory',  desc: 'Northern lights flash pairs across the sky — catch every one!', done: false },
  { id: 80, e: '🧊', type: 'pattern', domain: 'Pattern', desc: 'BOSS: The coldest, hardest pattern yet — crack the frozen sequence.', done: false, boss: true },

  // ── World 9 · Ancient Ruins ───────────────────────────────────────────────
  { id: 81, e: '🏛️', type: 'logic',   domain: 'Logic',   desc: "Artefacts, tools, and rituals — one item doesn't belong in this temple.", done: false },
  { id: 82, e: '🗿', type: 'speed',   domain: 'Speed',   desc: 'Ancient symbols carved in stone — match them fast before they fade.', done: false },
  { id: 83, e: '📜', type: 'pattern', domain: 'Pattern', desc: 'Ancient scribes left a pattern — can you complete the final line?', done: false },
  { id: 84, e: '⚱️', type: 'memory',  domain: 'Memory',  desc: 'Buried treasures from the past — uncover every pair in the ruins.', done: false },
  { id: 85, e: '🔱', type: 'logic',   domain: 'Logic',   desc: "Gods, monsters, heroes — one figure doesn't belong in this myth.", done: false },
  { id: 86, e: '⚔️', type: 'speed',   domain: 'Speed',   desc: "Battle speed — match the weapons of ancient warriors under pressure.", done: false },
  { id: 87, e: '🌀', type: 'pattern', domain: 'Pattern', desc: 'The labyrinth follows a rule — find the pattern before you are lost.', done: false },
  { id: 88, e: '🏺', type: 'memory',  domain: 'Memory',  desc: 'The deepest vault yet — pair every artefact from the ancient world.', done: false },
  { id: 89, e: '🌿', type: 'logic',   domain: 'Logic',   desc: "Plants, roots, potions — one ingredient doesn't belong in this remedy.", done: false },
  { id: 90, e: '👁️', type: 'logic',   domain: 'Logic',   desc: "BOSS: The ancient guardian's riddles — the ultimate test of logic.", done: false, boss: true },

  // ── World 10 · Cosmic Finale ──────────────────────────────────────────────
  { id: 91,  e: '🪐', type: 'pattern', domain: 'Pattern', desc: 'Planets orbit in sequence — what comes next in this solar system?', done: false },
  { id: 92,  e: '🌠', type: 'speed',   domain: 'Speed',   desc: 'Meteors streak across the sky — match them before they burn out.', done: false },
  { id: 93,  e: '🛸', type: 'logic',   domain: 'Logic',   desc: "Spacecraft, stars, galaxies — one object doesn't belong in deep space.", done: false },
  { id: 94,  e: '🌌', type: 'memory',  domain: 'Memory',  desc: 'Stars cluster in pairs — map every constellation before they shift.', done: false },
  { id: 95,  e: '✨', type: 'pattern', domain: 'Pattern', desc: 'A star is born — predict the sequence of its blazing life cycle.', done: false },
  { id: 96,  e: '⚡', type: 'speed',   domain: 'Speed',   desc: 'Faster than light — the most intense Speed Match in the universe.', done: false },
  { id: 97,  e: '🔭', type: 'logic',   domain: 'Logic',   desc: "Nebulae, black holes, quasars — only a true astronomer spots the odd one out.", done: false },
  { id: 98,  e: '🚀', type: 'memory',  domain: 'Memory',  desc: 'The launch sequence is complex — pair every component before blast-off.', done: false },
  { id: 99,  e: '🌟', type: 'pattern', domain: 'Pattern', desc: 'The universe speaks in patterns — decode the last sequence of your journey.', done: false },
  { id: 100, e: '🏆', type: 'memory',  domain: 'Memory',  desc: 'ULTIMATE FINAL BOSS: 9 pairs, maximum difficulty — the ultimate test of your mind across the cosmos!', done: false, boss: true },

  // ── Bonus ─────────────────────────────────────────────────────────────────
  { id: 101, e: '🍀', type: 'pattern', domain: 'Pattern', desc: "You found the bonus level — good luck isn't luck at all. It's a sharp mind.", done: false },
];

// Node positions as fractions of (MAP_WIDTH=16000, MAP_HEIGHT=600).
// x is the left→right progression axis (0→1).
// y traces the actual visual road baked into each world background image.
// y=0 is top, y=1 is bottom. Safe band: ~0.32–0.72.
export const POS = [
  // ── World 1 · Forest ──────────────────────────────────────────────────────
  // Dirt path enters centre-left, dips lower through the forest floor,
  // then arcs upward through the tree canopy gap toward the right.
  { x: 0.010, y: 0.25 }, // L1  — path enters, slightly below centre
  { x: 0.020, y: 0.48 }, // L2  — dips into forest floor
  { x: 0.030, y: 0.67 }, // L3  — lowest point, dense undergrowth
  { x: 0.040, y: 0.57 }, // L4
  { x: 0.049, y: 0.77 }, // L5  — path begins rising
  { x: 0.059, y: 0.53 }, // L6  — centre, clearing
  { x: 0.070, y: 0.50 }, // L7  — trail climbs
  { x: 0.079, y: 0.37 }, // L8  — upper canopy level
  { x: 0.089, y: 0.50 }, // L9  — slight descent to boss
  { x: 0.099, y: 0.50 }, // L10 boss — hilltop clearing

  // ── World 2 · Ocean ───────────────────────────────────────────────────────
  // Sandy beach strip runs almost flat; gentle coastal undulation.
  { x: 0.107, y: 0.63 }, // L11 — beach entry, centre
  { x: 0.118, y: 0.53 }, // L12
  { x: 0.127, y: 0.75 }, // L13 — slight dip toward shoreline
  { x: 0.137, y: 0.76 }, // L14
  { x: 0.147, y: 0.70 }, // L15 — centre again
  { x: 0.157, y: 0.47 }, // L16
  { x: 0.167, y: 0.75 }, // L17 — rises toward dune ridge
  { x: 0.177, y: 0.67 }, // L18
  { x: 0.188, y: 0.60 }, // L19
  { x: 0.199, y: 0.48 }, // L20 boss — pier end, flat

  // ── World 3 · Desert ──────────────────────────────────────────────────────
  // Big S-curve winding road: enters low, rises dramatically to midpoint,
  // then descends back down toward the far dunes.
  { x: 0.204, y: 0.40 }, // L21 — enters low, sandy valley
  { x: 0.215, y: 0.48 }, // L22 — deepest point
  { x: 0.225, y: 0.50 }, // L23 — road climbs out of valley
  { x: 0.235, y: 0.52 }, // L24
  { x: 0.245, y: 0.45 }, // L25 — midpoint, rising fast
  { x: 0.255, y: 0.58 }, // L26 — peak of S-curve
  { x: 0.265, y: 0.72 }, // L27 — starts descending
  { x: 0.275, y: 0.70 }, // L28
  { x: 0.285, y: 0.66 }, // L29 — back down toward dunes
  { x: 0.299, y: 0.69 }, // L30 boss — plateau lookout

  // ── World 4 · Mountain ────────────────────────────────────────────────────
  // Trail winds through the mountain: gradual descent into valley,
  // then steady climb back up toward the summit.
  { x: 0.305, y: 0.63 }, // L31 — trail start, upper foothills
  { x: 0.312, y: 0.50 }, // L32
  { x: 0.324, y: 0.52 }, // L33 — valley floor
  { x: 0.333, y: 0.65 }, // L34 — lowest, narrow gorge
  { x: 0.343, y: 0.66 }, // L35
  { x: 0.353, y: 0.60 }, // L36 — centre, bridge
  { x: 0.363, y: 0.51 }, // L37 — trail climbs
  { x: 0.373, y: 0.45 }, // L38 — rocky switchback
  { x: 0.382, y: 0.48 }, // L39 — short descent before summit
  { x: 0.395, y: 0.58 }, // L40 boss — mountain peak

  // ── World 5 · Space ───────────────────────────────────────────────────────
  // Clear glowing S-curve: path starts at the bottom of the star field,
  // sweeps up through the nebula, then curves back down.
  { x: 0.404, y: 0.60 }, // L41 — low orbit entry
  { x: 0.412, y: 0.65 }, // L42 — deepest point of arc
  { x: 0.422, y: 0.58 }, // L43
  { x: 0.431, y: 0.42 }, // L44 — path crosses midplane
  { x: 0.441, y: 0.37 }, // L45 — rising through nebula
  { x: 0.451, y: 0.55 }, // L46 — highest point, deep space
  { x: 0.461, y: 0.70 }, // L47 — begins descent
  { x: 0.472, y: 0.55 }, // L48
  { x: 0.483, y: 0.35 }, // L49 — curving back down
  { x: 0.495, y: 0.38 }, // L50 boss — re-entry point

  // ── World 6 · Deep Ocean ──────────────────────────────────────────────────
  // Snaking bioluminescent path: starts near the top, dips to centre-low,
  // then rises again — inverse of World 5.
  { x: 0.504, y: 0.49 }, // L51 — near surface, upper path
  { x: 0.513, y: 0.62 }, // L52
  { x: 0.522, y: 0.52 }, // L53 — descending into the deep
  { x: 0.531, y: 0.45 }, // L54
  { x: 0.540, y: 0.42 }, // L55 — deepest trench
  { x: 0.549, y: 0.55 }, // L56
  { x: 0.559, y: 0.52 }, // L57 — rising again
  { x: 0.569, y: 0.55 }, // L58
  { x: 0.578, y: 0.63 }, // L59 — back near surface
  { x: 0.588, y: 0.48 }, // L60 boss — abyssal platform

  // ── World 7 · Volcanic ────────────────────────────────────────────────────
  // Stone S-curve: path skirts the lava fields at the bottom,
  // climbs over the volcanic ridge, then drops toward the caldera.
  { x: 0.598, y: 0.40 }, // L61 — lava field base
  { x: 0.608, y: 0.68 }, // L62 — hottest point, lowest path
  { x: 0.618, y: 0.63 }, // L63 — climbing out
  { x: 0.627, y: 0.54 }, // L64
  { x: 0.637, y: 0.44 }, // L65 — over the ridge
  { x: 0.647, y: 0.38 }, // L66 — summit view
  { x: 0.657, y: 0.42 }, // L67 — descending toward caldera
  { x: 0.667, y: 0.50 }, // L68
  { x: 0.676, y: 0.28 }, // L69 — caldera rim
  { x: 0.686, y: 0.62 }, // L70 boss — crater edge

  // ── World 8 · Arctic ──────────────────────────────────────────────────────
  // Icy path almost straight across; subtle undulation like frozen tundra.
  { x: 0.696, y: 0.65 }, // L71
  { x: 0.706, y: 0.49 }, // L72
  { x: 0.716, y: 0.46 }, // L73 — slight rise over ice ridge
  { x: 0.725, y: 0.44 }, // L74
  { x: 0.735, y: 0.47 }, // L75
  { x: 0.745, y: 0.51 }, // L76 — centre
  { x: 0.755, y: 0.54 }, // L77
  { x: 0.765, y: 0.52 }, // L78
  { x: 0.775, y: 0.49 }, // L79
  { x: 0.784, y: 0.50 }, // L80 boss — frozen plateau

  // ── World 9 · Ancient Ruins ───────────────────────────────────────────────
  // Circular stone plaza path: gentle oval arc through the ruins,
  // bowing slightly above and below centre.
  { x: 0.794, y: 0.50 }, // L81 — ruins entrance
  { x: 0.806, y: 0.88 }, // L82
  { x: 0.814, y: 0.70 }, // L83 — outer arc, lower
  { x: 0.824, y: 0.50 }, // L84
  { x: 0.833, y: 0.39 }, // L85 — centre altar
  { x: 0.843, y: 0.40 }, // L86
  { x: 0.853, y: 0.58 }, // L87 — upper arc
  { x: 0.863, y: 0.65 }, // L88
  { x: 0.873, y: 0.50 }, // L89 — completes the arc
  { x: 0.882, y: 0.30 }, // L90 boss — throne room

  // ── World 10 · Cosmic Finale ──────────────────────────────────────────────
  // Galactic band runs through centre; path pulses above and below
  // like the rhythm of the cosmos.
  { x: 0.894, y: 0.60 }, // L91
  { x: 0.902, y: 0.50 }, // L92
  { x: 0.912, y: 0.51 }, // L93 — drifts upward
  { x: 0.922, y: 0.46 }, // L94
  { x: 0.931, y: 0.50 }, // L95 — galactic centre
  { x: 0.941, y: 0.54 }, // L96
  { x: 0.951, y: 0.57 }, // L97 — drifts downward
  { x: 0.961, y: 0.54 }, // L98
  { x: 0.971, y: 0.52 }, // L99 — converges to centre
  { x: 0.982, y: 0.48 }, // L100 FINAL BOSS — the cosmic nexus
  { x: 0.995, y: 0.50 }, // L101 Bonus 🍀
];
