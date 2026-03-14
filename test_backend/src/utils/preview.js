import fs from "fs";
import readline from "readline";

export async function readFirstLines(filePath, maxLines = 10) {
  const lines = [];
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    lines.push(line);
    if (lines.length >= maxLines) break;
  }
  rl.close();
  stream.destroy();
  return lines;
}
