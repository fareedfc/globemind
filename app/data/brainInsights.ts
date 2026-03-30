import { Level } from './levels';

export const BRAIN_INSIGHTS: Record<Level['type'], string[]> = {
  memory: [
    "Working memory is the brain's sticky notepad — training it helps you remember names, directions, and details in daily life.",
    "Research shows working memory training can increase fluid intelligence — the ability to reason through novel problems.",
    "Your hippocampus fired hard just now. Regular memory training strengthens the neural pathways that encode new information.",
    "Working memory capacity is a stronger predictor of academic and professional success than raw IQ.",
  ],
  word: [
    "Verbal fluency — the ability to quickly retrieve words — is a key marker of cognitive health and slows mental aging significantly.",
    "Word retrieval exercises activate the left temporal lobe, one of the regions most affected by cognitive decline.",
    "A rich, active vocabulary is one of the strongest predictors of cognitive resilience into old age.",
    "Word games engage your semantic memory network — the same system that stores language, concepts, and general knowledge.",
  ],
  speed: [
    "Processing speed is one of the first cognitive abilities to slow with age. Speed Match training keeps your brain reacting faster in real life.",
    "Faster processing speed correlates with better decision-making, driving safety, and reaction to unexpected events.",
    "Studies show processing speed training can reduce crash risk in older drivers by up to 50%.",
    "Your brain just fired at high speed. Consistent speed training strengthens the myelin sheaths that conduct neural signals.",
  ],
  pattern: [
    "Pattern recognition is deeply linked to problem-solving, planning ahead, and reading social situations.",
    "The same cognitive system you just used lets you read facial expressions, follow narratives, and anticipate outcomes.",
    "Pattern recognition training activates the prefrontal cortex — the region responsible for executive function and judgment.",
    "Fluid intelligence — your ability to solve new problems — is directly tied to pattern recognition ability.",
  ],
};

export function pickInsight(type: Level['type']): string {
  const pool = BRAIN_INSIGHTS[type];
  return pool[Math.floor(Math.random() * pool.length)];
}
