"use client";

import { useSearchParams } from "next/navigation";
import Videos from "../../pages/Videos";
import { Suspense } from "react";

function VideosContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <Videos id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideosContent />
    </Suspense>
  );
}