import type { PageData } from "@/lib/types";
import { parseSections } from "@/lib/parse-content";
import AlternatingSections from "@/components/AlternatingSections";

export default function StoryPage({ page }: { page: PageData }) {
  const sections = parseSections(page.blocks);
  return <AlternatingSections sections={sections} pageSlug="patricias-story" />;
}
