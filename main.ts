// One Emoji, One Smile — entry writer (program/v1, Node 22, stdlib only).
// Writes the single warmest emoji to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback /output/entry.txt), then reads it back and verifies the bytes match.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Heart hands: a stranger's warmest gesture. Two hands forming a heart
// say "I send you warmth" at first glance, in every language, with no
// words needed. It is kind and gently playful, universal across ages and
// backgrounds, clearly picked for the moment rather than the first smiley
// that comes to mind, and platonic — gratitude, not intimacy, sarcasm or
// flirtation — so it reads right coming from someone unknown.
const ENTRY = "🫶";

// The gate allows 1 to 8 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 8;

function isEmojiCodePoint(cp: number): boolean {
  return (
    (cp >= 0x1f000 && cp <= 0x1faff) || // emoticons, symbols, pictographs
    (cp >= 0x2600 && cp <= 0x27bf) || // misc symbols and dingbats
    (cp >= 0x2b00 && cp <= 0x2bff) || // misc symbols and arrows
    cp === 0x2764 || // heavy black heart
    cp === 0x2728 // sparkles
  );
}

function main(): void {
  const chars = [...ENTRY];
  if (chars.length < MIN_CHARS || chars.length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${chars.length}`,
    );
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // Nothing else: no leading or trailing white space, no newline.
  if (ENTRY !== ENTRY.trim()) {
    throw new Error("entry must be exactly one emoji with nothing else around it");
  }

  // Exactly one emoji and nothing else: one code point, and it must be
  // an emoji code point (no letters, digits, punctuation or spaces).
  if (chars.length !== 1) {
    throw new Error(
      `entry must be exactly one emoji, got ${chars.length} characters`,
    );
  }
  const cp = ENTRY.codePointAt(0) as number;
  if (!isEmojiCodePoint(cp)) {
    throw new Error(
      `entry must be a single emoji, got U+${cp.toString(16).toUpperCase()}`,
    );
  }
  console.log(`entry: ${ENTRY}`);
  console.log(
    `entry length: ${chars.length} character, ${Buffer.byteLength(ENTRY, "utf8")} bytes`,
  );

  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");

  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== ENTRY) {
    throw new Error(`verification failed: ${outPath} does not match the entry`);
  }
  console.log(`wrote ${outPath} (${chars.length} character, verified)`);
}

main();
