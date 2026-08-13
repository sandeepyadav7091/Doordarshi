"use client";

import { Facebook, Instagram, Moon, Search, Sun, Twitter, WholeWord, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AD_POSITIONS } from "../constants/ads";
import { POLLING_INTERVALS } from "../constants/polling";
import { TRANSLATIONS } from "../constants/translations";
import { useAppContext } from "../context/AppContext";
import { startVisibilityPolling } from "../utils/visibilityPolling";

const API_BASE_URL = "https://erp.doordarshisamachar.in";

export default function Layout({ children }) {
  const { dark, setDark, lang, setLang, search, setSearch, navCategories, fetchBreakingNews, fetchLiveNews, fetchAds } = useAppContext();
  const [showLive, setShowLive] = useState(false);
  const [time, setTime] = useState(null); // FIX: null se start, server/client mismatch avoid karne ke liye
  const [mounted, setMounted] = useState(false); // FIX: naya flag - client mount hone ke baad hi true hoga
  const [breakingNews, setBreakingNews] = useState(null);
  const [liveNews, setLiveNews] = useState(null);
  const [imageAds, setImageAds] = useState([]);
  const pathname = usePathname();

  const t = TRANSLATIONS[lang];

  const getYoutubeVideoId = (url) => {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace("www.", "");

      if (host === "youtu.be") {
        return parsed.pathname.split("/").filter(Boolean)[0] || null;
      }

      if (host.endsWith("youtube.com")) {
        const v = parsed.searchParams.get("v");
        if (v) return v;

        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts[0] === "shorts" && parts[1]) return parts[1];
        if (parts[0] === "live" && parts[1]) return parts[1];
        if (parts[0] === "embed" && parts[1]) return parts[1];
      }

      return null;
    } catch {
      return null;
    }
  };

  const liveVideoId = getYoutubeVideoId(liveNews?.PR_VIDEO_LINK);
  const liveEmbedUrl = liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0`
    : "";

  useEffect(() => {
    let cancelled = false;

    const loadBreakingNews = async () => {
      const news = await fetchBreakingNews();
      if (!cancelled) {
        setBreakingNews(news);
      }
    };

    const stopPolling = startVisibilityPolling(loadBreakingNews, POLLING_INTERVALS.breakingNewsMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchBreakingNews]);

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

  useEffect(() => {
    let cancelled = false;

    const loadHeaderAd = async () => {
      const imageRows = await fetchAds("image");

      if (cancelled) {
        return;
      }

      setImageAds(Array.isArray(imageRows) ? imageRows : []);
    };

    const stopPolling = startVisibilityPolling(loadHeaderAd, POLLING_INTERVALS.adsMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchAds]);

  // FIX: mounted flag set karo aur time sirf client par set/update karo
  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const bg = dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const nav = dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200";
  const subNav = dark ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const accent = "text-red-600";

  const categoryItems = navCategories.map((item) => ({
    ...item,
    label: lang === "hi" ? item.labels.hi : item.labels.en,
  }));

  const getCurrentCategoryIndex = () => {
    const index = categoryItems.findIndex((item) => item.route === pathname);
    return index === -1 ? 0 : index;
  };

  const layoutAd =
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.header) || null;

  const headerAdLinkUrl = layoutAd?.PR_AD_URL || "#";
  const headerAdTitle = layoutAd?.PR_TITLE || "Advertisement";

  const getAdImageUrl = (ad) => {
    const imagePath = ad?.PR_BANNER_URL || "";
    if (!imagePath) return "";
    return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  const renderAdMedia = (ad, className) => {
    if (!ad) return null;

    const imageUrl = getAdImageUrl(ad);
    if (!imageUrl) return null;

    return (
      <img src={imageUrl} alt={headerAdTitle} className={className} />
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}>
      <div className={`border-b px-4 py-1.5 flex items-center justify-between text-xs ${subNav} ${muted}`}>
        <div className="flex items-center gap-4">
          {/* FIX: mounted check + suppressHydrationWarning added */}
          <span suppressHydrationWarning>
            {mounted
              ? time.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </span>
          <span className="hidden sm:block text-red-600 font-semibold" suppressHydrationWarning>
            {mounted ? time.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN") : ""}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/people/Doordarshi-Samachar/61571247462236"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <Facebook size={14} />
            </a>
            <a
              href="https://www.instagram.com/doordarshisamachar"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://x.com/DDarshiSamachar"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <Twitter size={14} />
            </a>
            <a
              href="https://www.youtube.com/@doordarshisamachar"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <Youtube size={14} />
            </a>
          </div>

          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-current font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
          >
            <WholeWord className="w-4 h-4"/> {t.language}
          </button>

          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-current font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
          >
            {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>} {dark ? t.lightMode : t.darkMode}
          </button>
        </div>
      </div>

      <header className={`border-b px-4 py-3 flex items-center justify-between ${nav}`}>
        <Link href="/">
          <div>
            <Image width={800} height={800} alt="main-logo" src="/logo.png" className="w-72 h-20 object-cover" loading="eager"/>
          </div>
        </Link>

        <div className="flex-1 min-w-0 mx-4 hidden lg:flex">
          {layoutAd ? (
            <a
              href={headerAdLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-20 rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-md ${dark ? "border-gray-800" : "border-gray-200"}`}
            >
              {renderAdMedia(layoutAd, "w-full h-full object-cover object-center")}
            </a>
          ) : null}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-8 pr-4 py-2 text-sm rounded-lg border outline-none transition-all w-52 focus:w-64 ${dark
                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
            />
            <span className={`absolute left-2.5 top-2.5 text-sm ${muted}`}><Search className="w-4 h-4"/></span>
          </div>

          <button
            onClick={() => setShowLive(!showLive)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {t.live}
          </button>
        </div>
      </header>

      <nav className={`border-b px-4 ${subNav}`}>
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {categoryItems.map((item, i) => (
            <Link
              key={item.slug}
              href={item.route}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${getCurrentCategoryIndex() === i
                ? "border-red-600 text-red-600"
                : `border-transparent ${muted} hover:text-red-500`
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-3 overflow-hidden">
        <span className="font-black text-xs uppercase tracking-widest shrink-0 bg-white text-red-600 px-2 py-0.5 rounded">
          {t.breakingNews}
        </span>
        <div className="flex-1 overflow-hidden relative h-5 flex items-center justify-between">
          {breakingNews?.PR_SLUG ? (
            <Link
              href={`/article.html?id=${breakingNews?.PR_SLUG}`}
              className="text-sm font-medium hover:underline flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {breakingNews?.PR_HEADING}
            </Link>
          ) : (
            <div className="absolute left-0 top-0 text-sm font-medium">
              {lang === "en" ? "No breaking update right now" : "फिलहाल कोई ब्रेकिंग अपडेट नहीं"}
            </div>
          )}
        </div>
      </div>

      {showLive && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLive(false)}
        >
          <div
            className={`rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl ${card} border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-red-600">
                  {t.live} — {liveNews ? liveNews?.PR_TITLE : t.liveLabel}
                </span>
              </div>
              <button onClick={() => setShowLive(false)} className={`text-xl ${muted} hover:text-red-600`}>
                ✕
              </button>
            </div>

            {liveEmbedUrl ? (
              <iframe
                width="100%"
                height="600"
                src={liveEmbedUrl}
                title={liveNews?.PR_TITLE}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-3xl">📺</span>
                </div>
                <p className="text-white font-semibold">{t.liveLabel}</p>
                <p className={`text-sm ${muted}`}>{t.liveDesc}</p>
                <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-red-600 rounded-full text-white text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {t.live} — 24/7
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className={`border-t-4 mt-10 border-red-600 ${nav}`}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">

            <div>
              <Link href="/">
                <div>
                  <Image width={800} height={800} alt="main-logo" src="/logo.png" className="w-96 h-20 object-cover object-left"/>
                </div>
              </Link>

              <p className={`text-xs leading-5 ${muted} pl-10 pt-4`}>
                {t.footerDesc}
              </p>
            </div>

            {/* Categories */}
            <div className="pl-8">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accent}`}>
                {t.footerCategories}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {categoryItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.route}
                    className={`transition hover:underline ${muted}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="pl-8">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accent}`}>
                {t.quickLinks}
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/top-stories" className={`transition hover:underline ${muted}`}>{t.watchLive}</Link>
                <Link href="/news" className={`transition hover:underline ${muted}`}>{t.latestNews}</Link>
                <Link href="/trendings" className={`transition hover:underline ${muted}`}>{t.trending}</Link>
                {/* <a href="/contact" className={`transition hover:underline ${muted}`}>{t.contact}</a>
                <a href="/about" className={`transition hover:underline ${muted}`}>{t.about}</a> */}
              </div>
            </div>

            {/* Contact / Social */}
            <div className="md:flex justify-center md:justify-start items-start px-8 md:px-0 flex-col">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accent}`}>
                {t.connectWithUs}
              </h3>

              <div className={`space-y-2 text-sm ${muted}`}>
                <p>{t.newsroom}</p>
                <p>{t.email}</p>
                <p>{t.phone}</p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://www.facebook.com/people/Doordarshi-Samachar/61571247462236"
                  aria-label="Facebook"
                  className="h-9 w-9 rounded-full border flex items-center justify-center border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.instagram.com/doordarshisamachar"
                  aria-label="Instagram"
                  className="h-9 w-9 rounded-full border flex items-center justify-center border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://x.com/DDarshiSamachar"
                  aria-label="Twitter"
                  className="h-9 w-9 rounded-full border flex items-center justify-center border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`border-t mt-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs ${muted}`}>
            <p>{t.footer}</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <p>Developed by <span className="text-red-600 font-bold">Reospark Technology Pvt Ltd.</span> </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}