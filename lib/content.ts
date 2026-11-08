import fs from "node:fs";
import path from "node:path";
import { toSlug } from "./toSlug";

export const SITE_URL = "https://modnohome.ru";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
}

export function getSettings() {
  return readJson("settings.json");
}

/** Active sofas from content/sofas; `slug` comes from the title, like the site's links. */
export function getSofas(): any[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, "sofas"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson(path.join("sofas", file)))
    .filter((sofa) => sofa.isActive !== false)
    .map((sofa) => ({ ...sofa, slug: toSlug(sofa.title) }));
}

/** Sofas that have their own page; a sofa without `folderName` is only a catalog card. */
export function getSofaPages() {
  return getSofas().filter((sofa) => sofa.folderName);
}

/** Home content with `sofasSection.selectedSofas` (slugs) resolved to sofa objects. */
export function getHome() {
  const home = readJson("home.json");
  const sofas = getSofas();
  const selectedSofas = (home.sofasSection?.selectedSofas || [])
    .map((slug: string) => sofas.find((sofa) => sofa.slug === slug))
    .filter(Boolean);

  return { ...home, sofasSection: { ...home.sofasSection, selectedSofas } };
}
