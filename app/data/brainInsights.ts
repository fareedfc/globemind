import { Level } from './levels';

export const BRAIN_INSIGHTS: Record<Level['type'], string[]> = {
  memory: [
    "Working memory is the brain's sticky notepad — training it helps you remember names, directions, and details in daily life.",
    "Research shows working memory training can increase fluid intelligence — the ability to reason through novel problems.",
    "Your hippocampus fired hard just now. Regular memory training strengthens the neural pathways that encode new information.",
    "Working memory capacity is a stronger predictor of academic and professional success than raw IQ.",
  ],
  logic: [
    "Spotting what doesn't belong is a core thinking skill — it trains your brain to categorise, compare, and decide faster.",
    "Reasoning exercises like this one activate the prefrontal cortex, the part of your brain that weighs options and makes judgements.",
    "People who regularly practise logic puzzles show stronger decision-making and problem-solving in everyday life.",
    "Every odd-one-out round builds the same mental muscle you use when reading a situation, spotting a risk, or making a quick call.",
  ],
  speed: [
    "Processing speed is one of the first mental abilities to slow with age. Speed Match training keeps your brain reacting faster in real life.",
    "Faster processing speed correlates with better decision-making, driving safety, and reaction to unexpected events.",
    "Studies show processing speed training can reduce crash risk in older drivers by up to 50%.",
    "Your brain just fired at high speed. Consistent speed training strengthens the myelin sheaths that conduct neural signals.",
  ],
  pattern: [
    "Pattern recognition is deeply linked to problem-solving, planning ahead, and reading social situations.",
    "The same mental system you just used lets you read facial expressions, follow narratives, and anticipate outcomes.",
    "Pattern recognition training activates the prefrontal cortex — the region responsible for executive function and judgment.",
    "Fluid intelligence — your ability to solve new problems — is directly tied to pattern recognition ability.",
  ],
};

export function pickInsight(type: Level['type']): string {
  const pool = BRAIN_INSIGHTS[type];
  return pool[Math.floor(Math.random() * pool.length)];
}
