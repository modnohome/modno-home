// Workaround for a Next.js 16 static-export bug on Windows
// (https://github.com/vercel/next.js/issues/92339): route segment payloads land in
// nested folders (`__next.A/B/C.txt`), while the browser requests the flat name
// (`__next.A.B.C.txt`), so prefetches 404. Moves them to the flat names.
// On Linux builds there are no such folders and this does nothing.
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve("out");

function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesIn(full) : [full];
  });
}

function flatten(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);

    if (entry.name.startsWith("__next.")) {
      for (const file of filesIn(full)) {
        const rest = path.relative(full, file).split(path.sep).join(".");
        fs.renameSync(file, path.join(dir, `${entry.name}.${rest}`));
      }
      fs.rmSync(full, { recursive: true });
    } else if (entry.name !== "_next") {
      flatten(full);
    }
  }
}

flatten(OUT_DIR);
