"use client";

import dynamic from "next/dynamic";

const RobotViewerTest = dynamic(() => import("./RobotViewerTest"), {
  ssr: false,
  loading: () => <p className="p-6 text-sm text-[var(--color-muted)]">Loading viewer…</p>,
});

export default function RobotViewerTestLoader() {
  return <RobotViewerTest />;
}
