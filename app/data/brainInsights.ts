import { Level } from './levels';

export const BRAIN_INSIGHTS: Record<Level['type'], string[]> = {
  memory: [
    "Your mental notepad gets stronger every time you train. Sharper memory means remembering names, directions, and details without struggling.",
    "Regular memory training helps you think more clearly and reason through new problems faster.",
    "That was a solid workout for your memory. Train consistently and you'll notice the difference in everyday moments.",
    "A strong memory is one of the most useful skills you can build — it shows up in everything you do.",
  ],
  logic: [
    "Spotting what doesn't belong is a core thinking skill — it trains your mind to categorise, compare, and decide faster.",
    "Exercises like this train the part of your mind that weighs options and makes sharper judgements.",
    "People who regularly practise logic puzzles show stronger decision-making and problem-solving in everyday life.",
    "Every odd-one-out round builds the same mental muscle you use when reading a situation, spotting a risk, or making a quick call.",
  ],
  speed: [
    "Your reaction speed is a use-it-or-lose-it skill. Regular speed training keeps your mind sharp and your responses quick.",
    "The faster your mind works, the better you handle decisions, surprises, and fast-moving situations.",
    "Keeping your reactions sharp has real-world payoffs — from driving to catching a glass before it falls.",
    "Your mind just fired at full speed. Keep training and those quick reactions become your new normal.",
  ],
  pattern: [
    "Pattern recognition is deeply linked to problem-solving, planning ahead, and reading social situations.",
    "The same mental skill you just used helps you read people, follow conversations, and anticipate what comes next.",
    "Spotting patterns trains the part of your mind that plans ahead, stays focused, and makes good calls.",
    "The sharper your pattern sense, the better you get at solving problems you've never seen before.",
  ],
};

export function pickInsight(type: Level['type']): string {
  const pool = BRAIN_INSIGHTS[type];
  return pool[Math.floor(Math.random() * pool.length)];
}
