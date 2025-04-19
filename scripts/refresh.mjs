const fs = require("fs").promises;
const path = require("path");

const SOURCE_DIR = "/tmp/scrapper";
const TARGET_DIR = path.join(__dirname, "..", "public", "data");

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function copyFiles() {
  try {
    // Ensure target directory exists
    await ensureDirectoryExists(TARGET_DIR);

    // Read all files from source directory
    const files = await fs.readdir(SOURCE_DIR);

    console.log(`Found ${files.length} files to copy`);

    // Copy each file
    for (const file of files) {
      const sourcePath = path.join(SOURCE_DIR, file);
      const targetPath = path.join(TARGET_DIR, file);

      try {
        const stats = await fs.stat(sourcePath);
        if (stats.isFile()) {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`Successfully copied: ${file}`);
        }
      } catch (err) {
        console.error(`Error copying file ${file}:`, err.message);
      }
    }

    console.log("File update completed successfully!");
  } catch (err) {
    console.error("Error during file update:", err.message);
    process.exit(1);
  }
}

// Run the script
copyFiles();
