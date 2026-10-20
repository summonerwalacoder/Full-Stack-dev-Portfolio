export type Difficulty = "beginner" | "intermediate" | "advanced" | "recruiter" | "secret";

export type ChallengeType = "predict" | "debug" | "choose" | "complete" | "edge";

export interface ProjectLink {
  id: string;
  href: string;
}

export interface Challenge {
  id: string;
  difficulty: Difficulty;
  type: ChallengeType;
  titleKey: string;
  promptKey: string;
  code: string;
  language: string;
  /** choice questions */
  options?: { key: string; textKey: string }[];
  /** the accepted answer key for choice questions, or accepted strings for short answers */
  answer: string | string[];
  /** short-answer placeholder key */
  placeholderKey?: string;
  hint1Key: string;
  hint2Key: string;
  solutionKey: string;
  points: number;
  timeTargetSec?: number;
  project?: ProjectLink;
}

const CROP_REPO =
  "https://github.com/summonerwalacoder/smart-crop-advisory-system";
const DHRUVA_REPO =
  "https://github.com/summonerwalacoder/Dhruva-AI-powered-polar-mission-control-system";
const VARUN_REPO =
  "https://github.com/summonerwalacoder/Varun-X-AI-integrated-spatio-temporal-extreme-weather-intelligence-disaster-response-system";
const TYPING_REPO = "https://github.com/summonerwalacoder/Typing-master";

export const CHALLENGES: Challenge[] = [
  {
    id: "beg-add",
    difficulty: "beginner",
    type: "choose",
    titleKey: "hmb.c1.title",
    promptKey: "hmb.c1.prompt",
    language: "javascript",
    code: `function addNumbers(a, b) {
  return a - b;
}

console.log(addNumbers(5, 3));`,
    options: [
      { key: "A", textKey: "hmb.c1.oA" },
      { key: "B", textKey: "hmb.c1.oB" },
      { key: "C", textKey: "hmb.c1.oC" },
      { key: "D", textKey: "hmb.c1.oD" },
    ],
    answer: "B",
    hint1Key: "hmb.c1.h1",
    hint2Key: "hmb.c1.h2",
    solutionKey: "hmb.c1.sol",
    points: 100,
    timeTargetSec: 45,
  },
  {
    id: "beg-predict",
    difficulty: "beginner",
    type: "predict",
    titleKey: "hmb.c2.title",
    promptKey: "hmb.c2.prompt",
    language: "javascript",
    code: `let x = 2;
const result = x++ + ++x;
console.log(result);
console.log(x);`,
    answer: ["6,4", "6 4", "6 and 4"],
    placeholderKey: "hmb.answerPlaceholder",
    hint1Key: "hmb.c2.h1",
    hint2Key: "hmb.c2.h2",
    solutionKey: "hmb.c2.sol",
    points: 100,
    timeTargetSec: 60,
  },
  {
    id: "beg-cond",
    difficulty: "beginner",
    type: "debug",
    titleKey: "hmb.c3.title",
    promptKey: "hmb.c3.prompt",
    language: "javascript",
    code: `function isPositive(n) {
  if (n = 0) {
    return false;
  }
  return true;
}`,
    options: [
      { key: "A", textKey: "hmb.c3.oA" },
      { key: "B", textKey: "hmb.c3.oB" },
      { key: "C", textKey: "hmb.c3.oC" },
      { key: "D", textKey: "hmb.c3.oD" },
    ],
    answer: "C",
    hint1Key: "hmb.c3.h1",
    hint2Key: "hmb.c3.h2",
    solutionKey: "hmb.c3.sol",
    points: 100,
    timeTargetSec: 60,
  },
  {
    id: "int-map",
    difficulty: "intermediate",
    type: "predict",
    titleKey: "hmb.c4.title",
    promptKey: "hmb.c4.prompt",
    language: "javascript",
    code: `const nums = [1, 2, 3, 4];
const out = nums
  .filter(n => n % 2 === 0)
  .map(n => n * n);
console.log(out);`,
    answer: ["4,16", "4 16", "[4,16]", "[4, 16]", "4 and 16"],
    placeholderKey: "hmb.answerPlaceholder",
    hint1Key: "hmb.c4.h1",
    hint2Key: "hmb.c4.h2",
    solutionKey: "hmb.c4.sol",
    points: 100,
    timeTargetSec: 90,
    project: { id: "smart-crop", href: CROP_REPO },
  },
  {
    id: "int-scope",
    difficulty: "intermediate",
    type: "choose",
    titleKey: "hmb.c5.title",
    promptKey: "hmb.c5.prompt",
    language: "javascript",
    code: `function make() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}
make();`,
    options: [
      { key: "A", textKey: "hmb.c5.oA" },
      { key: "B", textKey: "hmb.c5.oB" },
      { key: "C", textKey: "hmb.c5.oC" },
      { key: "D", textKey: "hmb.c5.oD" },
    ],
    answer: "B",
    hint1Key: "hmb.c5.h1",
    hint2Key: "hmb.c5.h2",
    solutionKey: "hmb.c5.sol",
    points: 100,
    timeTargetSec: 120,
  },
  {
    id: "int-reduce",
    difficulty: "intermediate",
    type: "complete",
    titleKey: "hmb.c6.title",
    promptKey: "hmb.c6.prompt",
    language: "javascript",
    code: `function sum(nums) {
  return nums.reduce((acc, n) => ____, 0);
}`,
    answer: ["acc+n", "acc + n", "n+acc", "n + acc"],
    placeholderKey: "hmb.completePlaceholder",
    hint1Key: "hmb.c6.h1",
    hint2Key: "hmb.c6.h2",
    solutionKey: "hmb.c6.sol",
    points: 100,
    timeTargetSec: 120,
    project: { id: "smart-crop", href: CROP_REPO },
  },
  {
    id: "int-bug",
    difficulty: "intermediate",
    type: "debug",
    titleKey: "hmb.c7.title",
    promptKey: "hmb.c7.prompt",
    language: "javascript",
    code: `function firstEven(nums) {
  for (let i = 0; i <= nums.length; i++) {
    if (nums[i] % 2 === 0) return nums[i];
  }
  return null;
}`,
    options: [
      { key: "A", textKey: "hmb.c7.oA" },
      { key: "B", textKey: "hmb.c7.oB" },
      { key: "C", textKey: "hmb.c7.oC" },
      { key: "D", textKey: "hmb.c7.oD" },
    ],
    answer: "A",
    hint1Key: "hmb.c7.h1",
    hint2Key: "hmb.c7.h2",
    solutionKey: "hmb.c7.sol",
    points: 100,
    timeTargetSec: 150,
  },
  {
    id: "adv-closure",
    difficulty: "advanced",
    type: "predict",
    titleKey: "hmb.c8.title",
    promptKey: "hmb.c8.prompt",
    language: "javascript",
    code: `function counter() {
  let n = 0;
  return {
    inc: () => ++n,
    value: () => n,
  };
}
const c1 = counter();
const c2 = counter();
c1.inc(); c1.inc(); c2.inc();
console.log(c1.value(), c2.value());`,
    answer: ["2,1", "2 1", "2 and 1"],
    placeholderKey: "hmb.answerPlaceholder",
    hint1Key: "hmb.c8.h1",
    hint2Key: "hmb.c8.h2",
    solutionKey: "hmb.c8.sol",
    points: 100,
    timeTargetSec: 180,
    project: { id: "dhruva", href: DHRUVA_REPO },
  },
  {
    id: "adv-async",
    difficulty: "advanced",
    type: "choose",
    titleKey: "hmb.c9.title",
    promptKey: "hmb.c9.prompt",
    language: "javascript",
    code: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");`,
    options: [
      { key: "A", textKey: "hmb.c9.oA" },
      { key: "B", textKey: "hmb.c9.oB" },
      { key: "C", textKey: "hmb.c9.oC" },
      { key: "D", textKey: "hmb.c9.oD" },
    ],
    answer: "C",
    hint1Key: "hmb.c9.h1",
    hint2Key: "hmb.c9.h2",
    solutionKey: "hmb.c9.sol",
    points: 100,
    timeTargetSec: 180,
    project: { id: "varun-x", href: VARUN_REPO },
  },
  {
    id: "adv-edge",
    difficulty: "advanced",
    type: "edge",
    titleKey: "hmb.c10.title",
    promptKey: "hmb.c10.prompt",
    language: "javascript",
    code: `function average(nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}

console.log(average([2, 4, 6]));`,
    options: [
      { key: "A", textKey: "hmb.c10.oA" },
      { key: "B", textKey: "hmb.c10.oB" },
      { key: "C", textKey: "hmb.c10.oC" },
      { key: "D", textKey: "hmb.c10.oD" },
    ],
    answer: "B",
    hint1Key: "hmb.c10.h1",
    hint2Key: "hmb.c10.h2",
    solutionKey: "hmb.c10.sol",
    points: 100,
    timeTargetSec: 240,
    project: { id: "smart-crop", href: CROP_REPO },
  },
  {
    id: "recruiter-main",
    difficulty: "recruiter",
    type: "choose",
    titleKey: "hmb.r1.title",
    promptKey: "hmb.r1.prompt",
    language: "javascript",
    code: `const data = [1, 2, 3, 4, 5];
const result = data
  .filter(n => n > 2)
  .reduce((a, b) => a + b, 0);
console.log(result);`,
    options: [
      { key: "A", textKey: "hmb.r1.oA" },
      { key: "B", textKey: "hmb.r1.oB" },
      { key: "C", textKey: "hmb.r1.oC" },
      { key: "D", textKey: "hmb.r1.oD" },
    ],
    answer: "C",
    hint1Key: "hmb.r1.h1",
    hint2Key: "hmb.r1.h2",
    solutionKey: "hmb.r1.sol",
    points: 100,
    timeTargetSec: 30,
    project: { id: "smart-crop", href: CROP_REPO },
  },
  {
    id: "secret-boss",
    difficulty: "secret",
    type: "choose",
    titleKey: "hmb.s1.title",
    promptKey: "hmb.s1.prompt",
    language: "javascript",
    code: `function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}`,
    options: [
      { key: "A", textKey: "hmb.s1.oA" },
      { key: "B", textKey: "hmb.s1.oB" },
      { key: "C", textKey: "hmb.s1.oC" },
      { key: "D", textKey: "hmb.s1.oD" },
    ],
    answer: "B",
    hint1Key: "hmb.s1.h1",
    hint2Key: "hmb.s1.h2",
    solutionKey: "hmb.s1.sol",
    points: 200,
    timeTargetSec: 180,
    project: { id: "varun-x", href: VARUN_REPO },
  },
  {
    id: "beg-edge-text",
    difficulty: "beginner",
    type: "complete",
    titleKey: "hmb.c11.title",
    promptKey: "hmb.c11.prompt",
    language: "javascript",
    code: `function greet(name) {
  return "Hello, " + ____;
}

greet("Sumit");`,
    answer: ["name", "name+", "name +"],
    placeholderKey: "hmb.completePlaceholder",
    hint1Key: "hmb.c11.h1",
    hint2Key: "hmb.c11.h2",
    solutionKey: "hmb.c11.sol",
    points: 100,
    timeTargetSec: 45,
    project: { id: "typing-master", href: TYPING_REPO },
  },
];

export const MISSIONS: Record<
  Difficulty,
  { ids: string[]; timed: boolean }
> = {
  beginner: { ids: ["beg-add", "beg-predict", "beg-cond", "beg-edge-text"], timed: true },
  intermediate: { ids: ["int-map", "int-scope", "int-reduce", "int-bug"], timed: true },
  advanced: { ids: ["adv-closure", "adv-async", "adv-edge"], timed: true },
  recruiter: { ids: ["recruiter-main"], timed: true },
  secret: { ids: ["secret-boss"], timed: false },
};

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getMission(difficulty: Difficulty): Challenge[] {
  return MISSIONS[difficulty].ids
    .map((id) => getChallenge(id))
    .filter((c): c is Challenge => Boolean(c));
}
