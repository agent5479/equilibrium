export function assetUrl(src: string | undefined): string {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/equilibrium")) return src;
  if (src.startsWith("/assets")) return `/equilibrium${src}`;
  if (src.startsWith("/")) return `/equilibrium${src}`;
  return src;
}

/** Path for Next.js Link (basePath is applied automatically). */
export function routePath(href: string): string {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  let path = href.startsWith("/") ? href : `/${href}`;
  if (path.startsWith("/equilibrium")) {
    path = path.slice("/equilibrium".length) || "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

/** Absolute public URL path for static HTML (outside Next.js Link). */
export function publicPath(href: string): string {
  const route = routePath(href);
  if (route.startsWith("http") || route.startsWith("mailto:") || route.startsWith("tel:")) {
    return route;
  }
  return `/equilibrium${route === "/" ? "/" : route}`;
}

export function pathToSlug(pagePath: string): string {
  if (pagePath === "/") return "home";
  return pagePath.replace(/^\/|\/$/g, "").replace(/\//g, "__");
}

export function slugToPath(slug: string): string {
  if (slug === "home") return "/";
  return `/${slug.replace(/__/g, "/")}/`;
}
