import { mkdir as _mkdir, copyFile as _copyFile, stat as _stat } from "fs";
import { join, basename } from "path";
import { promisify } from "util";

const mkdir = promisify(_mkdir);
const copyFile = promisify(_copyFile);
const stat = promisify(_stat);

async function ensureDir(
  dir: string,
  makeIfNotExists: boolean = true
): Promise<void> {
  try {
    await stat(dir);
  } catch (error: any) {
    if (makeIfNotExists && error.code === "ENOENT") {
      await mkdir(dir, { recursive: true });
    } else if (error.code === "ENOENT") {
      throw new Error(`Directory not found: ${dir}`);
    } else {
      throw error;
    }
  }
}

async function copyFilesToFavorites(files: string[]): Promise<void> {
  const mdlDirectory = join(process.cwd(), "public", "mdl");
  const favoritesDirectory = join(
    process.cwd(),
    "public",
    "mdl",
    "chr",
    "favorites"
  );

  try {
    await ensureDir(mdlDirectory, false);
  } catch {
    throw new Error(
      "The mdl folder was not found. Please copy mdl into the public directory."
    );
  }

  await ensureDir(favoritesDirectory);

  for (const file of files) {
    const fileName = basename(file);
    const destPath = join(favoritesDirectory, fileName);
    await copyFile(file, destPath);
    console.log(`Copied ${file} to ${destPath}`);
  }
}

const filesToCopy: string[] = [
  "public/mdl/chr/agl/agl.mdl",
  "public/mdl/chr/item/inu.mdl",
  "public/mdl/chr/lau/lau.mdl",
  "public/mdl/chr/item/org.mdl",
  "public/mdl/chr/wp/wp_csaw.mdl",
];

copyFilesToFavorites(filesToCopy)
  .then(() => console.log("All files copied successfully."))
  .catch((err) => console.error(err));
