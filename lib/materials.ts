import fs from "node:fs/promises";
import path from "node:path";

export const MATERIALS_ROOT = path.join(process.cwd(), "NEET 2026 Material");

export interface MaterialFile {
  name: string;
  relativePath: string;
  sizeBytes: number;
}

export interface MaterialCategory {
  category: string;
  files: MaterialFile[];
}

async function walkFiles(dir: string, baseDir: string): Promise<MaterialFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: MaterialFile[] = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolute, baseDir)));
      continue;
    }
    if (!entry.isFile()) continue;
    const stat = await fs.stat(absolute);
    files.push({
      name: entry.name,
      relativePath: path.relative(baseDir, absolute).replace(/\\/g, "/"),
      sizeBytes: stat.size,
    });
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMaterialsIndex(): Promise<MaterialCategory[]> {
  try {
    const topLevel = await fs.readdir(MATERIALS_ROOT, { withFileTypes: true });
    const categories: MaterialCategory[] = [];

    for (const entry of topLevel) {
      if (!entry.isDirectory()) continue;
      const categoryPath = path.join(MATERIALS_ROOT, entry.name);
      const files = await walkFiles(categoryPath, MATERIALS_ROOT);
      categories.push({ category: entry.name, files });
    }

    return categories.sort((a, b) => a.category.localeCompare(b.category));
  } catch {
    return [];
  }
}

export function resolveMaterialPath(relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) return null;
  const absolutePath = path.join(MATERIALS_ROOT, normalized);
  const normalizedRoot = path.resolve(MATERIALS_ROOT);
  const normalizedAbsolute = path.resolve(absolutePath);
  if (!normalizedAbsolute.startsWith(normalizedRoot)) return null;
  return normalizedAbsolute;
}
