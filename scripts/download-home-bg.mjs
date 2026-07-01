import fs from "fs/promises";
import path from "path";

const BASE = "https://www.equilibrium.kiwi.nz/wp-content/uploads";
const images = [
  `${BASE}/2014/07/shutterstock_125340167.jpg`,
  `${BASE}/2014/07/fruit_bg.jpg`,
  `${BASE}/2014/07/shutterstock_130781543.jpg`,
  `${BASE}/2018/10/tfh1.jpg`,
  `${BASE}/2018/10/tfh2.jpg`,
  `${BASE}/2018/10/tfh3.jpg`,
  `${BASE}/2018/10/tfh4.jpg`,
  `${BASE}/2018/10/yoga-l-2.jpg`,
  `${BASE}/2018/10/yoga-l-3.jpg`,
  `${BASE}/2018/10/yoga-l-4.jpg`,
  `${BASE}/2018/10/yoga-l-7.jpg`,
  `${BASE}/2018/10/yoga-l-8.jpg`,
  `${BASE}/2018/10/yoga-l-9.jpg`,
  `${BASE}/2018/10/yoga-l-10.jpg`,
  `${BASE}/2018/10/patricia-nutrition.jpg`,
  `${BASE}/2014/07/Ruby-Kraut-520x375.jpg`,
  `${BASE}/2016/03/nut-and-seed-cracker-710x375.jpg`,
  `${BASE}/2014/07/lunch-710x375.jpg`,
  `${BASE}/2014/07/Cabbage-patch-2-710x375.jpg`,
  `${BASE}/2014/07/Paleotakes5-chorizoquiche600x600_1-710x375.jpg`,
  `${BASE}/2014/07/Salad-with-berries-710x375.jpg`,
  `${BASE}/2016/04/Avocado-green-smoothie-620x375.jpg`,
];

const publicDir = path.join(process.cwd(), "public");

for (const url of images) {
  const rel = url.replace("https://www.equilibrium.kiwi.nz", "");
  const disk = path.join(publicDir, "assets", rel.replace(/^\//, ""));
  await fs.mkdir(path.dirname(disk), { recursive: true });
  try {
    await fs.access(disk);
    console.log("exists:", rel);
    continue;
  } catch {}
  const res = await fetch(url);
  if (!res.ok) {
    console.log("FAIL:", url, res.status);
    continue;
  }
  await fs.writeFile(disk, Buffer.from(await res.arrayBuffer()));
  console.log("saved:", rel);
}
