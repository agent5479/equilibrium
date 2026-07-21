import AdminPanel from "@/components/admin/AdminPanel";
import { SITE_NAME } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: `Admin – ${SITE_NAME}` },
  description: "Client list and email for Equilibrium Kinesiology & Nutrition.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminPage() {
  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Client admin</h1>
        </div>
      </div>
      <div className="container content-section">
        <AdminPanel />
      </div>
    </>
  );
}
