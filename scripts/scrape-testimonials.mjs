import * as cheerio from "cheerio";
import fs from "fs";

const html = await fetch("https://www.equilibrium.kiwi.nz/testimonials/").then((r) => r.text());
const $ = cheerio.load(html);

const items = [];

$(".avia-testimonial").each((_, el) => {
  const quote = $(el)
    .find(".avia-testimonial-markup-entry-content, .avia-testimonial-content")
    .first()
    .html()
    ?.trim()
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const name =
    $(el).find(".avia-testimonial-name strong, .avia-testimonial-name").first().text().trim() ||
    $(el).find("[itemprop='name']").text().trim();

  const category =
    $(el).find(".avia-testimonial-subtitle").text().trim() ||
    $(el).find(".avia-testimonial-company").text().trim() ||
    "";

  items.push({ quote, name, category });
});

fs.writeFileSync("content/testimonials.json", JSON.stringify(items, null, 2));
console.log(`Wrote ${items.length} testimonials`);
