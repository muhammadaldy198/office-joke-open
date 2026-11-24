// Make the AI Judge Laugh: the Office Joke Open.
// One line of office comedy: a shared document was edited at
// 2 a.m. by someone unknown, and the only witness — the version
// history — has itself been put on leave, like an employee under
// investigation. The joke treats the audit trail as a person:
// it knows who did it, and that is exactly why it cannot talk.
//
//   Someone edited the shared doc at 2 a.m. The version history
//   knows who. The version history is now on leave.
//
// The turn lands on the last three words: the witness is silenced.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE =
  "Someone edited the shared doc at 2 a.m. The version history " +
  "knows who. The version history is now on leave.";

// The gate counts characters: one line, 1 to 200, not whitespace-only.
// Count code points (not UTF-16 units) so the check matches the gate,
// and refuse any invisible or control character rather than shipping
// a line the judge cannot read as written.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 200) {
  throw new Error("office joke must be 1 to 200 characters");
}
// Control characters are code points below U+0020 plus DEL; the
// invisible set is NBSP, zero-width space/joiners, and line/paragraph
// separators. Check code points, not UTF-16 units or string order.
const forbidden = (c: string) => {
  const cp = c.codePointAt(0) ?? 0;
  return (
    cp < 0x20 ||
    cp === 0x7f ||
    [0xa0, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2028, 0x2029, 0xfeff].includes(cp)
  );
};
if (chars.some(forbidden)) {
  throw new Error("office joke contains a forbidden character");
}
if (LINE.trim() !== LINE) {
  throw new Error("office joke must not start or end with whitespace");
}
// One line means one line: no newline may hide inside the text.
if (LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("office joke must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", LINE, "utf8");

// The file itself (never the /output directory) must be readable
// by every user: the grader collects outputs as another user.
chmodSync("/output/entry.txt", 0o644);

// Read the file back and confirm it is byte-for-byte the line: a
// silent write error or a stray newline must fail loudly here,
// never reach the judge as a different text.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== LINE) {
  throw new Error("entry.txt does not match the office joke");
}
