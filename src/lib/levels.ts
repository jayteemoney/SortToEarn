/**
 * Ball Sort Puzzle Level Data
 * Each level is represented as an array of tubes
 * Each tube contains balls represented by color numbers (0 = empty)
 * Difficulty increases with more colors and tubes
 */

export interface Level {
  id: number;
  tubes: number[][];
  difficulty: 1 | 2 | 3 | 4 | 5;
  optimalMoves: number;
}

// Color palette (1-12 different colors)
export const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B739", // Orange
  "#52B788", // Green
  "#EE6C4D", // Coral
  "#C77DFF", // Lavender
];

function generateLevel(
  id: number,
  numColors: number,
  tubesPerColor: number = 1,
  emptyTubes: number = 2
): Level {
  const tubes: number[][] = [];
  const balls: number[] = [];

  // Create balls (4 of each color)
  for (let color = 1; color <= numColors; color++) {
    for (let i = 0; i < 4; i++) {
      balls.push(color);
    }
  }

  // Shuffle balls
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }

  // Fill tubes
  const totalTubes = numColors + emptyTubes;
  for (let i = 0; i < totalTubes; i++) {
    tubes.push([]);
  }

  let ballIndex = 0;
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < 4; j++) {
      tubes[i].push(balls[ballIndex++]);
    }
  }

  // Calculate difficulty
  let difficulty: 1 | 2 | 3 | 4 | 5;
  if (numColors <= 3) difficulty = 1;
  else if (numColors <= 5) difficulty = 2;
  else if (numColors <= 7) difficulty = 3;
  else if (numColors <= 9) difficulty = 4;
  else difficulty = 5;

  return {
    id,
    tubes,
    difficulty,
    optimalMoves: numColors + 5,
  };
}

// Generate 200+ levels with progressive difficulty
export const LEVELS: Level[] = [
  // Levels 1-20: Easy (3-4 colors)
  ...Array.from({ length: 20 }, (_, i) => {
    const colors = 3 + Math.floor(i / 10);
    return generateLevel(i + 1, colors, 1, 2);
  }),

  // Levels 21-50: Easy-Medium (4-5 colors)
  ...Array.from({ length: 30 }, (_, i) => {
    const colors = 4 + Math.floor(i / 15);
    return generateLevel(i + 21, colors, 1, 2);
  }),

  // Levels 51-100: Medium (5-7 colors)
  ...Array.from({ length: 50 }, (_, i) => {
    const colors = 5 + Math.floor(i / 20);
    return generateLevel(i + 51, colors, 1, 2);
  }),

  // Levels 101-150: Medium-Hard (7-9 colors)
  ...Array.from({ length: 50 }, (_, i) => {
    const colors = 7 + Math.floor(i / 25);
    return generateLevel(i + 101, colors, 1, 2);
  }),

  // Levels 151-200: Hard (9-11 colors)
  ...Array.from({ length: 50 }, (_, i) => {
    const colors = 9 + Math.floor(i / 30);
    return generateLevel(i + 151, colors, 1, 2);
  }),

  // Levels 201-220: Expert (11-12 colors)
  ...Array.from({ length: 20 }, (_, i) => {
    const colors = 11 + Math.floor(i / 15);
    return generateLevel(i + 201, colors, 1, 3);
  }),
];

// Daily challenge - deterministic based on day
export function getDailyChallengeLevel(): Level {
  const today = Math.floor(Date.now() / 86400000);
  const levelIndex = today % LEVELS.length;
  return {
    ...LEVELS[levelIndex],
    id: 999, // Special ID for daily challenge
  };
}

// Get level by ID
export function getLevel(id: number): Level | undefined {
  if (id === 999) return getDailyChallengeLevel();
  return LEVELS.find((level) => level.id === id);
}

// Check if level is complete (all tubes are either empty or single color)
export function isLevelComplete(tubes: number[][]): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue; // Empty tube is OK
    if (tube.length !== 4) return false; // Must have 4 balls
    const firstColor = tube[0];
    if (!tube.every((ball) => ball === firstColor)) return false; // Must be same color
  }
  return true;
}

// Check if move is valid
export function isValidMove(
  tubes: number[][],
  fromIndex: number,
  toIndex: number
): boolean {
  if (fromIndex === toIndex) return false;
  if (fromIndex < 0 || fromIndex >= tubes.length) return false;
  if (toIndex < 0 || toIndex >= tubes.length) return false;

  const fromTube = tubes[fromIndex];
  const toTube = tubes[toIndex];

  if (fromTube.length === 0) return false; // Can't pour from empty tube
  if (toTube.length >= 4) return false; // Can't pour into full tube

  if (toTube.length === 0) return true; // Can pour into empty tube

  const fromColor = fromTube[fromTube.length - 1];
  const toColor = toTube[toTube.length - 1];

  return fromColor === toColor; // Can only pour same color
}

// Perform move
export function performMove(
  tubes: number[][],
  fromIndex: number,
  toIndex: number
): number[][] | null {
  if (!isValidMove(tubes, fromIndex, toIndex)) return null;

  const newTubes = tubes.map((tube) => [...tube]);
  const fromTube = newTubes[fromIndex];
  const toTube = newTubes[toIndex];
  const ballColor = fromTube[fromTube.length - 1];

  // Move all consecutive balls of the same color
  while (
    fromTube.length > 0 &&
    fromTube[fromTube.length - 1] === ballColor &&
    toTube.length < 4
  ) {
    toTube.push(fromTube.pop()!);
  }

  return newTubes;
}

export default LEVELS;
