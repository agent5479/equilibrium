import * as cheerio from "cheerio";
import type { ContentBlock } from "./types";
import { BASE_URL } from "./config";
import { stripSiteUrl } from "./utils";

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function parseElement($: cheerio.CheerioAPI, el: cheerio.Element): ContentBlock[] {
  const tag = el.tagName?.toLowerCase();
  if (!tag) return [];

  if (/^h[1-6]$/.test(tag)) {
    const text = cleanText($(el).text());
    if (!text) return [];
    return [{ type: "heading", level: parseInt(tag[1], 10), text }];
  }

  if (tag === "p") {
    const html = $(el).html()?.trim();
    if (!html) return [];
    return [{ type: "paragraph", html }];
  }

  if (tag === "ul" || tag === "ol") {
    const items = $(el)
      .children("li")
      .map((_, li) => cleanText($(li).text()))
      .get()
      .filter(Boolean);
    if (!items.length) return [];
    return [{ type: "list", ordered: tag === "ol", items }];
  }

  if (tag === "img") {
    const src = $(el).attr("src") || "";
    const alt = $(el).attr("alt") || "";
    if (!src) return [];
    return [{ type: "image", src, alt }];
  }

  if (tag === "a" && $(el).hasClass("avia-button")) {
    const text = cleanText($(el).text());
    const href = $(el).attr("href") || "#";
    if (!text) return [];
    return [{ type: "button", text, href: stripSiteUrl(href) }];
  }

  if (tag === "div" || tag === "section" || tag === "article") {
    const blocks: ContentBlock[] = [];
    $(el)
      .children()
      .each((_, child) => {
        blocks.push(...parseElement($, child));
      });
    return blocks;
  }

  const innerHtml = $(el).html()?.trim();
  if (innerHtml && ["blockquote", "figure", "figcaption", "table"].includes(tag)) {
    return [{ type: "html", html: $.html(el) || innerHtml }];
  }

  return [];
}

function findMainContent($: cheerio.CheerioAPI): cheerio.Cheerio<cheerio.Element> {
  const selectors = [
    ".entry-content-wrapper",
    ".entry-content",
    ".template-page",
    ".cooked-recipe-info",
    "main .container",
    "main",
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) return el;
  }
  return $("body");
}

export function parsePageHtml(
  html: string,
  pageUrl: string
): {
  title: string;
  metaDescription: string;
  blocks: ContentBlock[];
  ogImage?: string;
} {
  const $ = cheerio.load(html);
  const title =
    cleanText($('meta[property="og:title"]').attr("content") || "") ||
    cleanText($("title").text().replace(/\s*[\u2013\-|].*$/, "")) ||
    "Equilibrium";

  const metaDescription =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const ogImage = $('meta[property="og:image"]').attr("content");

  const main = findMainContent($);
  main.find("script, style, noscript, .comment-entry, #respond").remove();

  const blocks: ContentBlock[] = [];

  // Avia layout sections
  main.find(".avia-section, .av-layout-tab-inner").each((_, section) => {
    const sectionBlocks: ContentBlock[] = [];
    $(section)
      .find(".av_textblock_section, .avia_textblock, .av-special-heading, .av-image-caption-overlay, .avia-button-wrap")
      .each((__, block) => {
        if ($(block).hasClass("av-special-heading")) {
          const text = cleanText($(block).find("h1,h2,h3,h4,h5,h6").first().text() || $(block).text());
          if (text) sectionBlocks.push({ type: "heading", level: 2, text });
        } else if ($(block).hasClass("avia-button-wrap")) {
          const btn = $(block).find("a").first();
          const text = cleanText(btn.text());
          const href = btn.attr("href") || "#";
          if (text) sectionBlocks.push({ type: "button", text, href: stripSiteUrl(href) });
        } else {
          $(block)
            .find("h1,h2,h3,h4,h5,h6,p,ul,ol,img")
            .each((___, el) => {
              sectionBlocks.push(...parseElement($, el));
            });
          if (!$(block).find("h1,h2,h3,h4,h5,h6,p,ul,ol,img").length) {
            const pHtml = $(block).html()?.trim();
            if (pHtml && cleanText($(block).text())) {
              sectionBlocks.push({ type: "paragraph", html: pHtml });
            }
          }
        }
      });

    // Flex columns
    const flexColumns = $(section).find(".flex_column").toArray();
    if (flexColumns.length > 1) {
      const columns: ContentBlock[][] = flexColumns.map((col) => {
        const colBlocks: ContentBlock[] = [];
        $(col)
          .children()
          .each((__, child) => {
            colBlocks.push(...parseElement($, child));
          });
        if (!colBlocks.length) {
          const html = $(col).html()?.trim();
          if (html) colBlocks.push({ type: "html", html });
        }
        return colBlocks;
      });
      if (columns.some((c) => c.length)) {
        blocks.push({ type: "columns", columns });
      }
    } else if (sectionBlocks.length) {
      blocks.push(...sectionBlocks);
    }
  });

  if (!blocks.length) {
    main.children().each((_, child) => {
      blocks.push(...parseElement($, child));
    });
  }

  if (!blocks.length) {
    const fallbackHtml = main.html()?.trim();
    if (fallbackHtml) {
      blocks.push({ type: "html", html: fallbackHtml });
    }
  }

  // Rewrite internal links in blocks
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "html") {
      block.html = block.html.replace(
        new RegExp(BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ""
      );
    }
    if (block.type === "button" && block.href.startsWith(BASE_URL)) {
      block.href = stripSiteUrl(block.href);
    }
    if (block.type === "columns") {
      for (const col of block.columns) {
        for (const b of col) {
          if ((b.type === "paragraph" || b.type === "html") && "html" in b) {
            b.html = b.html.replace(
              new RegExp(BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              ""
            );
          }
        }
      }
    }
  }

  return { title, metaDescription, blocks, ogImage };
}
