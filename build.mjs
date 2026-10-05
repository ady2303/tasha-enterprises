// Builds the live site into _site/.
// Collects every product file in content/products plus content/settings.json
// into one data/shop.json that the shop page reads. No packages needed: run `node build.mjs`.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const OUT = "_site";
const settings = JSON.parse(readFileSync("content/settings.json", "utf8"));
const sectionIds = new Set((settings.sections || []).map((s) => s.id));

const products = [];
const problems = [];
for (const file of readdirSync("content/products").filter((f) => f.endsWith(".json")).sort()) {
  const id = basename(file, ".json");
  let p;
  try { p = JSON.parse(readFileSync(join("content/products", file), "utf8")); }
  catch (e) { problems.push(`${file}: not valid JSON (${e.message})`); continue; }
  if (!p.name || typeof p.name !== "string") { problems.push(`${file}: missing name`); continue; }
  if (!sectionIds.has(p.section)) { problems.push(`${file}: unknown section "${p.section}"`); continue; }
  const price = Number(p.price);
  if (!Number.isFinite(price) || price < 0) { problems.push(`${file}: price is not a number`); continue; }
  products.push({
    id,
    name: p.name.trim(),
    section: p.section,
    price,
    pack: p.pack || "",
    available: p.available !== false,
    position: Number.isFinite(Number(p.position)) ? Number(p.position) : 999,
    note: p.note || "",
    story: p.story || "",
    uses: Array.isArray(p.uses) ? p.uses.filter(Boolean) : [],
    keep: p.keep || "",
    why: p.why || "",
    photo: (p.photo || "").replace(/^\//, ""),
    colour: /^#[0-9a-f]{6}$/i.test(p.colour || "") ? p.colour : "",
  });
}
products.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));

const sections = (settings.sections || []).map((s) => ({ ...s, note_image: (s.note_image || "").replace(/^\//, "") }));
const shop = {
  whatsapp_number: String(settings.whatsapp_number || "").replace(/\D/g, ""),
  whatsapp_display: settings.whatsapp_display || "",
  instagram: (settings.instagram || "").replace(/^@/, ""),
  sections,
  products,
  built: new Date().toISOString(),
};

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(join(OUT, "data"), { recursive: true });
for (const item of ["index.html", "css", "js", "images", "admin"]) cpSync(item, join(OUT, item), { recursive: true });
writeFileSync(join(OUT, "data", "shop.json"), JSON.stringify(shop));

console.log(`Built ${products.length} products in ${sections.length} sections.`);
if (problems.length) console.warn("Skipped (fix these in the admin):\n  " + problems.join("\n  "));
