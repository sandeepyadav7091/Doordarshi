"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import NewsCard from "../components/NewsCard";
import SkeletonCard from "../components/SkeletonCard";
import { useAppContext } from "../context/AppContext";
import { TRANSLATIONS } from "../constants/translations";
import { POLLING_INTERVALS } from "../constants/polling";
import { AD_POSITIONS } from "../constants/ads";
import { startVisibilityPolling } from "../utils/visibilityPolling";
import { formatTimeAgo } from "../utils/relativeTime";

const API_BASE_URL = "https://erp.doordarshisamachar.in";

const EXCLUDED_HOME_SECTIONS = new Set(["home", "videos", "photo-gallery"]);

const API_SLUG_MAP = {
  news: "news",
  business: "business",
  entertainment: "entertainment",
  sports: "sports",
  finance: "finance",
  market: "market",
  health: "health",
  movie: "movie",
  television: "television",
  national: "national",
  international: "international",
  trendings: "trendings",
  buzz: "buzz",
  "top-stories": "top-stories",
};

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function toStateSlug(stateName) {
  return String(stateName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getYoutubeVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function mapPost(post, lang, fallbackCategory) {
  const imagePath = post?.PR_THUMBNAIL || "";
  const slug = post?.PR_SLUG;
  const categoryName = post?.PR_CATEGORY?.PR_NAME || fallbackCategory;

  return {
    id: slug,
    category: categoryName,
    title: post?.PR_HEADING || "",
    desc: post?.PR_SUB_HEADING || "",
    tag: categoryName || "News",
    time: formatTimeAgo(post?.PR_CREATED_AT, lang),
    img: imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`,
  };
}

export default function Home() {
  const { dark, lang, search, navCategories, fetchPostsByCategory, fetchPostsByState, fetchAds, fetchLiveNews } = useAppContext();
  const t = TRANSLATIONS[lang];
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categoryPosts, setCategoryPosts] = useState({});
  const [statePosts, setStatePosts] = useState([]);
  const [imageAds, setImageAds] = useState([]);
  const [videoAds, setVideoAds] = useState([]);
  const [liveNews, setLiveNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const categoriesToShow = useMemo(() => {
    const base = navCategories.filter((item) => !EXCLUDED_HOME_SECTIONS.has(item.slug));
    return base.slice(0, 10);
  }, [navCategories]);

  const selectedStateSlug = (searchParams.get("state") || "").trim().toLowerCase();

  const humanizeStateSlug = (slug) =>
    slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  useEffect(() => {
    let isMounted = true;

    const loadCategoryPosts = async () => {
      if (selectedStateSlug) {
        const posts = await fetchPostsByState(selectedStateSlug);
        const mapped = (Array.isArray(posts) ? posts : [])
          .map((post) => mapPost(post, lang, post?.PR_STATE || "State News"))
          .filter((post) => post.id)
          .slice(0, 30);

        if (!isMounted) {
          return;
        }

        setStatePosts(mapped);
        setCategoryPosts({});
        setIsLoading(false);
        return;
      }

      const rows = await Promise.all(
        categoriesToShow.map(async (category) => {
          const apiSlug = API_SLUG_MAP[category.slug] || category.slug;
          const posts = await fetchPostsByCategory(apiSlug);
          const mapped = (Array.isArray(posts) ? posts : [])
            .map((post) => mapPost(post, lang, category.labels.en))
            .filter((post) => post.id)
            .slice(0, 6);

          return [category.slug, mapped];
        })
      );

      if (!isMounted) {
        return;
      }

      setStatePosts([]);
      setCategoryPosts(Object.fromEntries(rows));
      setIsLoading(false);
    };

    const stopPolling = startVisibilityPolling(loadCategoryPosts, POLLING_INTERVALS.homeNewsMs);

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [categoriesToShow, fetchPostsByCategory, fetchPostsByState, lang, selectedStateSlug]);

  useEffect(() => {
    let cancelled = false;

    const loadAds = async () => {
      const [imageRows, videoRows] = await Promise.all([
        fetchAds("image"),
        fetchAds("video"),
      ]);

      if (!cancelled) {
        setImageAds(Array.isArray(imageRows) ? imageRows : []);
        setVideoAds(Array.isArray(videoRows) ? videoRows : []);
      }
    };

    const stopPolling = startVisibilityPolling(loadAds, POLLING_INTERVALS.adsMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchAds]);

  useEffect(() => {
    let cancelled = false;

    const loadLiveNews = async () => {
      const news = await fetchLiveNews();
      if (!cancelled) {
        setLiveNews(news);
      }
    };

    const stopPolling = startVisibilityPolling(loadLiveNews, POLLING_INTERVALS.liveNewsMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchLiveNews]);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (selectedStateSlug) {
      const matched = statePosts.filter((post) => {
        if (!query) {
          return true;
        }

        return (
          post.title.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.desc.toLowerCase().includes(query)
        );
      });

      const stateName = statePosts[0]?.category || humanizeStateSlug(selectedStateSlug);

      return [
        {
          category: {
            slug: "state-results",
            route: "/",
            labels: {
              en: `${stateName} News`,
              hi: `${stateName} समाचार`,
            },
          },
          posts: matched,
        },
      ].filter((section) => section.posts.length > 0);
    }

    return categoriesToShow
      .map((category) => {
        const posts = categoryPosts[category.slug] || [];
        const matched = posts.filter((post) => {
          if (!query) {
            return true;
          }

          return (
            post.title.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query) ||
            post.desc.toLowerCase().includes(query)
          );
        });

        return {
          category,
          posts: matched.slice(0, 5),
        };
      })
      .filter((section) => section.posts.length > 0);
  }, [categoriesToShow, categoryPosts, humanizeStateSlug, search, selectedStateSlug, statePosts]);

  const liveVideoId = getYoutubeVideoId(liveNews?.PR_VIDEO_LINK);
  const liveEmbedUrl = liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${liveVideoId}`
    : "";

  const leftSidebarAd =
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.leftSidebar) ||
    videoAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.leftSidebar) ||
    null;

  const rightSidebarAd =
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.rightSidebar) ||
    videoAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.rightSidebar) ||
    null;

  const bottomAd =
    videoAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.bottom) ||
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.bottom) ||
    null;

  const midSectionImageAd =
    imageAds.find((item) => Number(item?.PR_POSITION) === 4) ||
    null;

  const getAdImageUrl = (ad) => {
    const imagePath = ad?.PR_BANNER_URL || "";
    if (!imagePath) {
      return "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80";
    }
    return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  const getAdLinkUrl = (ad) => ad?.PR_AD_URL || "#";
  const getAdTitle = (ad) => ad?.PR_TITLE || "Premium Brand Promotion";
  const isVideoAd = (ad) => ad?.PR_BANNER_TYPE === "video";

  const renderAdMedia = (ad, className) => {
    if (isVideoAd(ad)) {
      const videoPath = ad?.PR_BANNER_URL || "";
      const videoUrl = videoPath.startsWith("http") ? videoPath : `${API_BASE_URL}${videoPath}`;

      return (
        <a href={getAdLinkUrl(ad)} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <video src={videoUrl} className={className} autoPlay muted loop playsInline />
        </a>
      );
    }

    return (
      <a href={getAdLinkUrl(ad)} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        <img src={getAdImageUrl(ad)} alt={getAdTitle(ad)} className={className} loading="lazy"/>
      </a>
    );
  };

  return (
    <div className="max-w-8xl mx-auto px-4 py-6">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-6">
          <aside className={`rounded-xl border p-4 ${card}`}>
            <div className="h-5 w-36 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="h-8 bg-gray-300 rounded animate-pulse" />
              ))}
            </div>
          </aside>

          <main className="space-y-8">
            {Array.from({ length: 4 }).map((_, block) => (
              <div key={block}>
                <div className="h-5 w-48 bg-gray-300 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((__, idx) => (
                    <SkeletonCard key={`${block}-${idx}`} dark={dark} />
                  ))}
                </div>
              </div>
            ))}
          </main>

          <aside className="space-y-6">
            <SkeletonCard dark={dark} />
            <SkeletonCard dark={dark} />
          </aside>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className={`text-center py-20 ${muted} space-y-4`}>
          <p className="text-lg font-semibold">No results found {search}</p>
          <Link
                href="/"
                className="mb-3 inline-flex w-full max-w-2xs items-center justify-center rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white"
              >
                Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-6">
          <aside className="space-y-4 h-fit lg:sticky lg:top-4">
            {leftSidebarAd && (
              <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                  Advertisement
                </div>
                <div className="p-4">
                  <div className="rounded-lg overflow-hidden bg-gray-200 aspect-auto flex items-center justify-center">
                    {renderAdMedia(leftSidebarAd, "w-full h-56 object-cover object-center")}
                  </div>
                  <div className="mt-3">
                    <a
                      href={getAdLinkUrl(leftSidebarAd)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-all inline-flex items-center justify-center"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className={`rounded-xl border p-4 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-red-600 rounded-full" />
              <h3 className="font-bold text-sm uppercase tracking-wider">India States</h3>
            </div>
            {selectedStateSlug && (
              <Link
                href="/"
                className="mb-3 inline-flex w-full items-center justify-center rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white"
              >
                Back to Home
              </Link>
            )}
            <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1">
              {INDIA_STATES.map((state) => (
                (() => {
                  const stateSlug = toStateSlug(state);
                  const isActive = pathname === "/" && selectedStateSlug === stateSlug;

                  return (
                    <Link
                      key={state}
                      href={`/?state=${encodeURIComponent(stateSlug)}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all ${isActive
                        ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                        : dark
                          ? "border-gray-800 hover:border-red-600 hover:bg-gray-800"
                          : "border-gray-200 hover:border-red-200 hover:bg-red-50"
                        } ${dark && isActive ? "bg-red-950/30 text-red-300" : ""}`}
                    >
                      {state}
                    </Link>
                  );
                })()
              ))}
            </div>
            </div>
          </aside>

          <main className="space-y-8 min-w-0">
            {filteredSections.map(({ category, posts }) => (
              <div key={category.slug} className="space-y-8">
                <section className={`rounded-xl border p-4 ${card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1 h-5 bg-red-600 rounded-full" />
                      <h2 className="font-bold text-sm uppercase tracking-wider truncate">
                        {lang === "hi" ? category.labels.hi : category.labels.en}
                      </h2>
                    </div>
                    <Link href={category.route} className="text-red-600 text-xs font-semibold hover:underline">
                      View all -&gt;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {posts.map((post) => (
                      <NewsCard key={post.id} {...post} variant="secondary" readMore={t.readMore} />
                    ))}
                  </div>
                </section>

                {category.slug === "news" && midSectionImageAd && (
                  <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                      Advertisement
                    </div>
                    <div className="p-4">
                      <div className="rounded-lg overflow-hidden bg-gray-200 h-84 flex items-center justify-center">
                        {renderAdMedia(midSectionImageAd, "w-full h-full md:object-cover object-fill")}
                      </div>
                      <div className="mt-3">
                        <a
                          href={getAdLinkUrl(midSectionImageAd)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-all inline-flex items-center justify-center"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {bottomAd && (
              <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                  Advertisement
                </div>
                <div className="p-4">
                  <div className="rounded-lg overflow-hidden bg-gray-200 h-72 md:h-96 flex items-center justify-center">
                    {renderAdMedia(bottomAd, "w-full h-full md:object-cover object-fill object-center")}
                  </div>
                  <div className="mt-3">
                    <a
                      href={getAdLinkUrl(bottomAd)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full h-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-all inline-flex items-center justify-center"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-6 h-fit lg:sticky lg:top-4">
            <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
              <div className="flex items-center justify-between px-3 py-2 bg-red-600 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.live}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ON AIR
                </span>
              </div>
              <div className="p-3">
                <div className="rounded-lg overflow-hidden border border-gray-200/20 bg-black aspect-video">
                  {liveEmbedUrl ? (
                    <iframe
                      src={liveEmbedUrl}
                      title={liveNews?.PR_TITLE || t.liveLabel}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4 text-center bg-gray-900">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">TV</span>
                      </div>
                      <p className="text-white font-semibold">{t.liveLabel}</p>
                      <p className={`text-sm ${muted}`}>{t.liveDesc}</p>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm font-bold leading-snug">{liveNews?.PR_TITLE || t.liveLabel}</p>
              </div>
            </div>

            {rightSidebarAd && (
              <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                  Advertisement
                </div>
                <div className="p-4">
                  <div className="rounded-lg overflow-hidden bg-gray-200 aspect-auto flex items-center justify-center">
                    {renderAdMedia(rightSidebarAd, "w-full h-full object-cover")}
                  </div>
                  <div className="mt-3">
                    <a
                      href={getAdLinkUrl(rightSidebarAd)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-all inline-flex items-center justify-center"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
