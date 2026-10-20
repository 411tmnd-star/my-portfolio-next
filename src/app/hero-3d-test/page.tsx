import type { Metadata } from "next";
import RobotViewerTestLoader from "@/components/hero/RobotViewerTestLoader";

/* Viewer test for the Blender export (Humanoid-Robot QA-003 close-out).
   Not part of the site: noindex, not linked, not in the sitemap. */
export const metadata: Metadata = {
  title: "Hero 3D viewer test",
  robots: { index: false, follow: false },
};

export default function Hero3dTestPage() {
  return <RobotViewerTestLoader />;
}
