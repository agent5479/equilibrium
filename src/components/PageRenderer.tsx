import type { ContentBlock } from "@/lib/types";
import { publicPath, routePath } from "@/lib/paths";
import OptimizedImage from "@/components/OptimizedImage";
import Link from "next/link";

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const level = block.level || 2;
      return (
        <div className="content-block">
          {level === 1 && <h1>{block.text}</h1>}
          {level === 2 && <h2>{block.text}</h2>}
          {level === 3 && <h3>{block.text}</h3>}
          {level === 4 && <h4>{block.text}</h4>}
          {level === 5 && <h5>{block.text}</h5>}
          {level === 6 && <h6>{block.text}</h6>}
        </div>
      );
    }
    case "paragraph":
      return (
        <div
          className="content-block"
          dangerouslySetInnerHTML={{ __html: rewriteLinks(block.html || "") }}
        />
      );
    case "html":
      return (
        <div
          className="content-block"
          dangerouslySetInnerHTML={{ __html: rewriteLinks(block.html || "") }}
        />
      );
    case "image":
      return (
        <div className="content-block">
          <OptimizedImage src={block.src || ""} alt={block.alt || ""} />
          {block.caption && <p className="image-caption">{block.caption}</p>}
        </div>
      );
    case "list":
      if (!block.items?.length) return null;
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <div className="content-block">
          <ListTag>
            {block.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: rewriteLinks(item) }} />
            ))}
          </ListTag>
        </div>
      );
    case "button":
      return (
        <div className="content-block">
          <Link href={routePath(block.href || "/contact/")} className="btn-primary">
            {block.text}
          </Link>
        </div>
      );
    case "columns":
      return (
        <div className="flex-columns">
          {block.columns?.map((col, i) => (
            <div key={i} className="flex-column">
              {col.map((b, j) => (
                <Block key={j} block={b} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function rewriteLinks(html: string): string {
  return html
    .replace(/src="\/assets\//g, 'src="/equilibrium/assets/')
    .replace(/href="\/(?!equilibrium)([^"]*)"/g, (_, p) => `href="${publicPath(`/${p}`)}"`);
}

function isSidebarBlock(block: ContentBlock): boolean {
  if (block.type === "heading" && block.text) {
    const t = block.text.toLowerCase();
    if (t.includes("browse") || t.includes("archives")) return true;
  }
  if (block.type === "list" && block.items) {
    const sidebarItems = ["Welcome", "Patricia's Story", "Touch for Health", "Yoga", "Gallery"];
    if (block.items.some((item) => sidebarItems.some((s) => item.includes(s)))) {
      return true;
    }
  }
  return false;
}

export default function PageRenderer({
  blocks,
  filterSidebar = false,
}: {
  blocks: ContentBlock[];
  filterSidebar?: boolean;
}) {
  const filtered = filterSidebar
    ? blocks.filter((b) => !isSidebarBlock(b))
    : blocks;

  return (
    <div className="content-section">
      {filtered.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
