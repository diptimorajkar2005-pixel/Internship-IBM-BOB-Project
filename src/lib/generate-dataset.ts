import { DEPARTMENTS, SECTIONS } from "@/lib/constants";
import { enrichStudent } from "@/lib/formulas";
import type { StudentRecord } from "@/lib/types";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Rohan", "Meera", "Vihaan",
  "Priya", "Kabir", "Sneha", "Advait", "Nisha", "Rahul", "Pooja", "Karan", "Anika", "Dev",
  "Isha", "Nikhil", "Riya", "Siddharth", "Tanvi", "Ayaan", "Neha", "Harsh", "Sara", "Vikram",
  "Anjali", "Manav", "Kriti", "Yash", "Shreya", "Aryan", "Pari", "Dhruv", "Ira", "Kunal",
  "Myra", "Rohan", "Zara", "Aditya", "Sana", "Varun", "Kiara", "Mohit", "Aisha", "Ritika",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Reddy", "Iyer", "Khan", "Gupta", "Nair", "Singh", "Das", "Mehta",
  "Joshi", "Kapoor", "Banerjee", "Rao", "Chatterjee", "Malhotra", "Pillai", "Desai", "Verma", "Bose",
  "Agarwal", "Menon", "Chopra", "Kulkarni", "Shetty", "Bhat", "Ghosh", "Saxena", "Naidu", "Trivedi",
];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomNormal(rng: () => number, mean: number, stdDev: number): number {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stdDev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function generateStudentDataset(count = 520, seed = 42): StudentRecord[] {
  const rng = mulberry32(seed);
  const records: StudentRecord[] = [];

  for (let i = 0; i < count; i += 1) {
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const semester = (i % 8) + 1;
    const section = SECTIONS[Math.floor(rng() * SECTIONS.length)];
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];

    let studyHours = clamp(randomNormal(rng, 16.5, 8.2), 0, 50);
    let attendance = clamp(randomNormal(rng, 81, 13.5), 0, 100);
    let previousCgpa = clamp(randomNormal(rng, 7.15, 1.35), 0, 10);

    if (rng() < 0.08) studyHours = clamp(rng() * 6, 0, 50);
    if (rng() < 0.07) attendance = clamp(40 + rng() * 20, 0, 100);
    if (rng() < 0.05) previousCgpa = clamp(3 + rng() * 2.2, 0, 10);

    const ability =
      0.34 * (studyHours / 50) +
      0.28 * (attendance / 100) +
      0.26 * (previousCgpa / 10) +
      0.12 * rng();

    let meanScore = 36 + ability * 58;
    if (rng() < 0.12) {
      meanScore += (rng() - 0.5) * 36;
    }

    const assignmentScore = clamp(meanScore + randomNormal(rng, 5, 7.5), 0, 100);
    const quizScore = clamp(meanScore + randomNormal(rng, 1.5, 8.5), 0, 100);
    const midtermScore = clamp(meanScore + randomNormal(rng, -1.5, 8), 0, 100);
    const finalScore = clamp(meanScore + randomNormal(rng, -0.8, 9), 0, 100);

    records.push(
      enrichStudent({
        studentId: `STU${1001 + i}`,
        studentName: `${firstName} ${lastName}`,
        department,
        semester,
        section,
        attendancePercentage: round(attendance),
        studyHoursPerWeek: round(studyHours),
        assignmentScore: round(assignmentScore),
        quizScore: round(quizScore),
        midtermScore: round(midtermScore),
        finalScore: round(finalScore),
        previousCgpa: round(previousCgpa),
      }),
    );
  }

  return records;
}
