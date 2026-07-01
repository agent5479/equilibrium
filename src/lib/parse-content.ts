import type { ContentBlock } from "@/lib/types";

export interface ContentSection {
  heading?: string;
  headingLevel?: number;
  blocks: ContentBlock[];
  image?: string;
  imageAlt?: string;
}

export interface Testimonial {
  quote: string;
  attribution?: string;
  category?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function parseSections(blocks: ContentBlock[]): ContentSection[] {
  const sections: ContentSection[] = [];
  let current: ContentSection = { blocks: [] };

  for (const block of blocks) {
    if (block.type === "heading" && block.text) {
      if (current.heading || current.blocks.length > 0) {
        sections.push(current);
      }
      current = {
        heading: block.text,
        headingLevel: block.level || 2,
        blocks: [],
      };
    } else if (block.type === "image" && block.src) {
      current.image = block.src;
      current.imageAlt = block.alt || "";
    } else {
      current.blocks.push(block);
    }
  }

  if (current.heading || current.blocks.length > 0) {
    sections.push(current);
  }

  if (sections.length === 0 && blocks.length > 0) {
    return [{ blocks }];
  }

  return sections;
}

export function parseTestimonials(blocks: ContentBlock[]): Testimonial[] {
  const testimonials: Testimonial[] = [];
  let currentQuote: string[] = [];

  const flush = (attribution?: string) => {
    const quote = currentQuote.join("\n\n").trim();
    if (quote) {
      testimonials.push({
        quote: quote.replace(/^[""]|[""]$/g, "").trim(),
        attribution,
        category: inferCategory(quote),
      });
    }
    currentQuote = [];
  };

  for (const block of blocks) {
    if (block.type !== "paragraph" || !block.html) continue;
    const text = stripHtml(block.html);
    if (!text) continue;

    const isAttribution =
      text.length < 80 &&
      (text.match(/^[A-Z]{1,3},/i) ||
        text.match(/^\w+,\s/));

    const startsQuote = /^["""]/.test(text);

    if (startsQuote && currentQuote.length === 0) {
      currentQuote.push(text);
    } else if (isAttribution && currentQuote.length > 0) {
      flush(text);
    } else if (currentQuote.length > 0 && text.length < 100 && !text.includes(".")) {
      flush(text);
    } else if (startsQuote) {
      flush();
      currentQuote.push(text);
    } else {
      currentQuote.push(text);
    }
  }

  flush();
  return testimonials;
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("yoga")) return "Yoga";
  if (lower.includes("kinesiology") || lower.includes("touch for health") || lower.includes("muscle")) return "Kinesiology";
  if (lower.includes("nutrition") || lower.includes("migraine") || lower.includes("cholesterol") || lower.includes("food")) return "Nutrition";
  return "General";
}

export function blocksWithoutHeadings(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type !== "heading");
}
