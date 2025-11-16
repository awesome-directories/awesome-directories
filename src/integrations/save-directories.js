import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAllDirectories } from "../lib/data/directories.js";
import log from "../lib/logger.js";

async function saveDirectoriesToPath(dataDir) {
  var directories = await getAllDirectories();

  await mkdir(dataDir, { recursive: true });

  var filePath = join(dataDir, "directories.json");
  await writeFile(filePath, JSON.stringify(directories));

  log.info(`Saved ${directories.length} directories to ${filePath}`);
}

export function saveDirectoriesIntegration() {
  return {
    name: "save-directories",
    hooks: {
      "astro:server:setup": async function handleServerSetup() {
        var dataDir = join(process.cwd(), "public", "data");
        await saveDirectoriesToPath(dataDir);
      },
      "astro:build:done": async function handleBuildDone({ dir }) {
        var dataDir = join(dir.pathname, "data");
        await saveDirectoriesToPath(dataDir);
      },
    },
  };
}
