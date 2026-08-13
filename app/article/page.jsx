"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Article from "../../pages/Article";

function ArticleContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  return <Article id={id} />;
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div>Loading article...</div>}>
      <ArticleContent />
    </Suspense>
  );
}
