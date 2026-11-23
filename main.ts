// One Emoji, One Smile — entry writer (program/v1, Node 22, stdlib only).
//
// The whole entry is a single emoji, chosen for the judge's brief:
//   🫶  heart hands — two hands shaping a heart.
//
// Why this one, against the brief's five weights:
//   * Warm at first glance: it is a gesture of sending warmth, readable
//     in a split second with no context and no words.
//   * Not a default: it is not a yellow smiley face, so it reads as
//     picked for the moment instead of the first face that comes to mind.
//   * Universal: a hand gesture needs no language and no in-joke, and it
//     lands the same way for any age or background.
//   * Right for a stranger: it is platonic gratitude, not intimacy,
//     flirtation or sarcasm, so nothing about it reads oddly from someone
//     unknown.
//   * Considered and set aside: a smiling face with hearts (🥰) is
//     warmer-looking at a glance, but it is a default-style smiley and
//     can read as romantic affection from a stranger; a hugging face (🤗)
//     can feel over-familiar from someone unknown; a plain heart (💛) is
//     warm but generic and carries no smile. Heart hands wins the balance.
//
// The program writes the emoji to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback /output/entry.txt), then reads the file back and compares
// the bytes, so a bad write can never slip through silently.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The pick: heart hands, U+1FAF6.
const PICK = "🫶";

// The gate: 1 to 8 characters, and not only white space.
const GATE_LO = 1;
const GATE_HI = 8;

// One pictographic code point, on its own, is what "exactly one emoji"
// means here. Unicode's Extended_Pictographic property covers the
// pictographs a stranger would read as an emoji, heart hands included.
const SINGLE_PICTOGRAPH = /^\p{Extended_Pictographic}$/u;

function fail(reason: string): never {
  throw new Error(`entry rejected: ${reason}`);
}

// Every rule the gate implies, checked in order from the cheapest
// observation to the most specific one.
function checkPick(): void {
  const units = [...PICK];

  if (PICK.trim().length === 0) {
    fail("it is only white space");
  }
  if (PICK !== PICK.trim()) {
    fail("it has white space around it; the file must hold the emoji alone");
  }
  if (units.length < GATE_LO || units.length > GATE_HI) {
    fail(
      `it is ${units.length} characters, outside the gate of ${GATE_LO} to ${GATE_HI}`,
    );
  }
  if (units.length !== 1) {
    fail(`it is ${units.length} characters, not exactly one emoji`);
  }
  if (!SINGLE_PICTOGRAPH.test(PICK)) {
    const point = PICK.codePointAt(0) as number;
    // Name the rejected character in the message: if a future pick ever
    // fails here, the log alone should say exactly what was turned down,
    // with no need to re-run anything to find out.
    fail(
      `the character ${JSON.stringify(PICK)} (U+${point.toString(16).toUpperCase()}) is not a pictographic emoji code point`,
    );
  }
}

function run(): void {
  checkPick();

  const bytes = Buffer.byteLength(PICK, "utf8");
  console.log(`entry: ${PICK}`);
  console.log(`entry size: 1 character, ${bytes} bytes`);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "entry.txt");
  writeFileSync(outFile, PICK, "utf8");

  // Read the bytes back and compare byte for byte, not just as text.
  const written = readFileSync(outFile);
  if (!written.equals(Buffer.from(PICK, "utf8"))) {
    fail(`what came back from ${outFile} does not match the entry`);
  }
  console.log(`wrote ${outFile} (1 character, ${bytes} bytes, verified)`);
}

run();
