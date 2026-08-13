"use client";

import { Suspense } from "react";
import CategoryPage from "../../pages/Category";

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-gray-500">Loading...</div>}>
      <CategoryPage category="finance" />
    </Suspense>
  );
}