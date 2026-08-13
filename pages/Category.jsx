"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import NewsCard from "../components/NewsCard";
import SkeletonCard from "../components/SkeletonCard";
import { POLLING_INTERVALS } from "../constants/polling";
import { TRANSLATIONS } from "../constants/translations";
import { useAppContext } from "../context/AppContext";
import { formatTimeAgo } from "../utils/relativeTime";
import { startVisibilityPolling } from "../utils/visibilityPolling";

const API_BASE_URL = "https://erp.doordarshisamachar.in";

const API_SLUG_MAP = {
  news: "news",
  business: "business",
  entertainment: "entertainment",
  sports: "sports",
  finance: "finance",
  market: "market",
  health: "health",
  photoGallery: "photo-gallery",
  movie: "movie",
  television: "television",
  buzz: "buzz",
  national: "national",
  international: "international",
  trendings: "trendings",
  topStories: "top-stories",
  breakingNews: "breaking-news",
};

export default function CategoryPage({ category }) {
  const { dark, lang, search, fetchPostsByCategory, fetchPostsByState } = useAppContext();
  const [apiPosts, setApiPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[lang];
  const searchParams = useSearchParams();

  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const categoryMap = {
    news: ["News", "समाचार"],
    business: ["Business", "व्यापार"],
    entertainment: ["Entertainment", "मनोरंजन"],
    sports: ["Sports", "खेल"],
    finance: ["Finance", "मनोरंजन"],
    market: ["Market", "बाज़ार"],
    health: ["Health", "स्वास्थ्य"],
    photoGallery: ["Photo Gallery", "फोटो गैलरी"],
    movie: ["Movie", "चलचित्र"],
    television: ["Television", "टेलीविजन"],
    buzz: ["Buzz", "चर्चा"],
    national: ["National", "राष्ट्रीय"],
    international: ["International", "अंतरराष्ट्रीय"],
    trendings: ["Trendings", "ट्रेंडिंग"],
    topStories: ["Top Stories", "शीर्ष कहानियाँ"],
    breakingNews: ["Breaking News", "आज की ताजा खबर"]
  };

  const validCategories = categoryMap[category] || [];
  const apiSlug = API_SLUG_MAP[category] || category;
  const stateSlug = (searchParams.get("state") || "").trim().toLowerCase();
  const isStateFilteredNews = category === "news" && Boolean(stateSlug);

  const humanizeStateSlug = (slug) =>
    slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      const posts = isStateFilteredNews
        ? await fetchPostsByState(stateSlug)
        : await fetchPostsByCategory(apiSlug);

      if (!isMounted) {
        return;
      }

      setApiPosts(Array.isArray(posts) ? posts : []);
      setIsLoading(false);
    };

    const stopPolling = startVisibilityPolling(loadPosts, POLLING_INTERVALS.categoryNewsMs);

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [apiSlug, fetchPostsByCategory, fetchPostsByState, isStateFilteredNews, stateSlug]);

  const apiFiltered = useMemo(() => {
    return apiPosts
      .map((post) => {
        const imagePath = post?.PR_THUMBNAIL || "";
        const imageUrl = imagePath.startsWith("http")
          ? imagePath
          : `${API_BASE_URL}${imagePath}`;

        const postCategory = post?.PR_CATEGORY?.PR_NAME || validCategories[0] || category;

        return {
          id: post?.PR_SLUG,
          slug: post?.PR_SLUG,
          category: postCategory,
          title: post?.PR_HEADING || "",
          desc: post?.PR_SUB_HEADING || post?.PR_CONTENT || "",
          time: formatTimeAgo(post?.PR_CREATED_AT, lang),
          tag: postCategory,
          img: imageUrl,
        };
      }).filter((post) => post.id)
      .filter((post) => {
        const searchTerm = search.toLowerCase();
        const title = post.title.toLowerCase();
        const categoryName = post.category.toLowerCase();
        const desc = post.desc.toLowerCase();

        if (search === "") {
          return true;
        }

        return (
          title.includes(searchTerm) ||
          categoryName.includes(searchTerm) ||
          desc.includes(searchTerm)
        );
      });
  }, [apiPosts, category, lang, search, t.justNow, validCategories]);

  const filtered = apiFiltered;

  const stateDisplayName =
    apiPosts.find((post) => post?.PR_STATE)?.PR_STATE ||
    (isStateFilteredNews ? humanizeStateSlug(stateSlug) : "");

  const categoryName = isStateFilteredNews
    ? `${validCategories[lang === "en" ? 0 : 1] || category} - ${stateDisplayName}`
    : validCategories[lang === "en" ? 0 : 1] || category;

  const postsContent = isLoading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} dark={dark} />
      ))}
    </div>
  ) : filtered.length === 0 ? (
    <div className={`text-center py-20 ${muted}`}>
      <p className="text-4xl mb-4">📰</p>
      <p className="text-lg font-semibold">
        {search
          ? `No results found`
          : isStateFilteredNews
            ? `No news available for ${stateDisplayName}`
            : `No news available in ${categoryName} category`}
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map((h) => (
        <NewsCard key={h.id} {...h} variant="secondary" readMore={t.readMore} />
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-black">{categoryName}</h1>
        </div>
        <p className={`text-sm ${muted}`}>
          {t.latestNews} {lang === "en" ? "in" : ""} {categoryName}
        </p>
      </div>

      {postsContent}
    </div>
  );
}