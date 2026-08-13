"use client";

import Head from "next/head";

import { Search, Share } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ArticleSkeleton from "../components/ArticleSkeleton";
import { AD_POSITIONS } from "../constants/ads";
import { TRANSLATIONS, categoryColors } from "../constants/translations";
import { useAppContext } from "../context/AppContext";
import { formatTimeAgo } from "../utils/relativeTime";

export async function generateMetadata({ params }) {
  const article = posts.find(a => a.slug === params.slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.desc,
    openGraph: {
      title: article.title,
      description: article.desc,
      url: `https://doordarshisamachar.in/article/${params.slug}`,
      images: [
        {
          url: article.img,
        },
      ],
    },
  };
}

const API_BASE_URL = "https://erp.doordarshisamachar.in";

export default function Article({ id: propId } = {}) {
  const params = useParams();
  const id = propId || params?.id || "";
  const { dark, lang, fetchPostBySlug, fetchPostsByCategory, fetchAds } = useAppContext();
  const [apiPost, setApiPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [imageAds, setImageAds] = useState([]);
  const [videoAds, setVideoAds] = useState([]);
  const t = TRANSLATIONS[lang];

  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  useEffect(() => {
    const loadApiPost = async () => {
      if (!id) {
        setApiPost(null);
        setIsLoading(false);
        return;
      }

      const post = await fetchPostBySlug(id);
      setApiPost(post);
      setIsLoading(false);
    };

    loadApiPost();
  }, [id, fetchPostBySlug]);

useEffect(() => {
  if (apiPost && apiPost?.PR_CATEGORY?.PR_SLUG) {
    const loadRelatedPosts = async () => {
      const posts = await fetchPostsByCategory(apiPost.PR_CATEGORY.PR_SLUG);
      if (Array.isArray(posts) && posts.length > 0) {
        const mapped = posts
          .filter((post) => post?.PR_SLUG && post?.PR_ID !== apiPost?.PR_ID)
          .slice(0, 5)
          .map((post) => {
            const imagePath = post?.PR_THUMBNAIL || "";
            return {
              id: post?.PR_SLUG,
              title: post?.PR_HEADING || "",
              time: formatTimeAgo(post?.PR_CREATED_AT, lang),
              img: imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`,
            };
          });
        setRelatedPosts(mapped);
      }
    };
    loadRelatedPosts();
  }
}, [apiPost, fetchPostsByCategory, lang]);

useEffect(() => {
  const loadAds = async () => {
    const [imageRows, videoRows] = await Promise.all([
      fetchAds("image"),
      fetchAds("video"),
    ]);

    setImageAds(Array.isArray(imageRows) ? imageRows : []);
    setVideoAds(Array.isArray(videoRows) ? videoRows : []);
  };

  loadAds();
}, [fetchAds]);

  // Get article from API post
  let article = null;
  if (apiPost) {
    const imagePath = apiPost?.PR_THUMBNAIL || "";
    const imageUrl = imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE_URL}${imagePath}`;
    const dateStr = formatTimeAgo(apiPost?.PR_CREATED_AT, lang);

    article = {
      id: apiPost.PR_ID,
      slug: apiPost.PR_SLUG,
      category: apiPost?.PR_CATEGORY?.PR_NAME || "News",
      title: apiPost.PR_HEADING || "",
      desc: apiPost.PR_SUB_HEADING || "",
      content: apiPost.PR_CONTENT || "",
      time: dateStr,
      tag: apiPost?.PR_CATEGORY?.PR_NAME || "News",
      img: imageUrl,
    };
  }

  if (isLoading) {
    return <ArticleSkeleton dark={dark} card={card} />;
  }

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center max-w-md">
          {/* Icon Container */}
          <div className="mb-6 flex justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${dark ? "bg-gray-900" : "bg-white"} border-2 border-red-600`}>
              <span className="text-5xl"><Search className="w-4 h-4"/></span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-black mb-2">
            {lang === "en" ? "Article Not Found" : "लेख नहीं मिला"}
          </h1>

          {/* Subtitle */}
          <p className={`text-lg mb-6 ${muted}`}>
            {lang === "en"
              ? "We couldn't find the article you're looking for. It may have been removed or the link might be incorrect."
              : "हम आपके द्वारा खोजा जा रहा लेख नहीं पा सके। यह हटाया गया हो सकता है या लिंक गलत हो सकता है।"}
          </p>

          {/* Search Suggestions */}
          <div className={`mb-8 p-4 rounded-lg ${dark ? "bg-gray-900" : "bg-white"} border ${dark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-sm font-semibold mb-3 ${muted}`}>
              {lang === "en" ? "What you can do:" : "आप क्या कर सकते हैं:"}
            </p>
            <ul className={`text-sm space-y-2 text-left ${muted}`}>
              <li>• {lang === "en" ? "Check the URL for typos" : "URL की जांच करें"}</li>
              <li>• {lang === "en" ? "Browse our latest news" : "हमारी नवीनतम खबरें देखें"}</li>
              <li>• {lang === "en" ? "Use the search function" : "खोज फ़ंक्शन का उपयोग करें"}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/" 
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              {lang === "en" ? "← Back to Home" : "← होम पर वापस जाएं"}
            </Link>
            <button 
              onClick={() => window.history.back()}
              className={`px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all ${dark ? "hover:bg-gray-900" : ""}`}
            >
              {lang === "en" ? "Go Back" : "पीछे जाएं"}
            </button>
          </div>

          {/* Info Box */}
          <div className={`mt-8 p-4 rounded-lg ${dark ? "bg-gray-900/50" : "bg-red-50"} border ${dark ? "border-gray-800" : "border-red-200"}`}>
            <p className={`text-xs ${dark ? "text-gray-400" : "text-red-700"}`}>
              {lang === "en"
                ? "Error Code: 404 • Page Not Found"
                : "त्रुटि कोड: 404 • पृष्ठ नहीं मिला"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const relatedArticles = article?.category
    ? relatedPosts
    : [];

const fullContent = article?.content?.replace(
  /src="\/(.*?)"/g,
  `src="${API_BASE_URL}/$1"`
);

  const getAdImageUrl = (ad) => {
    const imagePath = ad?.PR_BANNER_URL || "";
    if (!imagePath) {
      return "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80";
    }
    return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  const getAdLinkUrl = (ad) => ad?.PR_AD_URL || "#";

  const getAdTitle = (ad) => ad?.PR_TITLE || "Premium Brand Promotion";

  const isVideoAd = (ad) => ad?.PR_BANNER_TYPE === "video";

  const renderAdMedia = (ad, className) => {
    if (!ad) return null;

    if (isVideoAd(ad)) {
      const videoPath = ad?.PR_BANNER_URL || "";
      const videoUrl = videoPath.startsWith("http") ? videoPath : `${API_BASE_URL}${videoPath}`;

      return (
        <a
          href={getAdLinkUrl(ad)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <video
            src={videoUrl}
            className={className}
            autoPlay
            muted
            loop
            playsInline
          />
        </a>
      );
    }

    return (
      <a
        href={getAdLinkUrl(ad)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        <img
          src={getAdImageUrl(ad)}
          alt={getAdTitle(ad)}
          className={className}
          loading="lazy"
        />
      </a>
    );
  };

  const sidebarAd =
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.rightSidebar) ||
    videoAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.rightSidebar) ||
    null;

  const bottomAd =
    videoAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.bottom) ||
    imageAds.find((item) => Number(item?.PR_POSITION) === AD_POSITIONS.bottom) ||
    null;

  // const handleShare = async () => {
  //   const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/article.html?id=${article.slug}`;
  //   const shareData = {
  //     image: article.img,
  //     title: article.title,
  //     text: article.desc,
  //     url: shareUrl,
  //   };

  //   try {
  //     if (navigator.share) {
  //       await navigator.share(shareData);
  //     } else {
  //       // Fallback: copy to clipboard
  //       await navigator.clipboard.writeText(shareUrl);
  //       alert(lang === "en" ? "Link copied to clipboard!" : "लिंक क्लिपबोर्ड में कॉपी हो गया!");
  //     }
  //   } catch (error) {
  //     console.error("Share error:", error);
  //   }
  // };

//   const handleShare = async () => {
//   const shareUrl =
//     `https://doordarshisamachar.in/article.html?id=${encodeURIComponent(
//       article.slug
//     )}`;

//   try {
//     const response = await fetch(article.img);
//     const blob = await response.blob();

//     const file = new File(
//       [blob],
//       "article-thumbnail.jpg",
//       {
//         type: blob.type || "image/jpeg",
//       }
//     );

//     const shareData = {
//       title: article.title,
//       text: `${article.title}\n\n${article.desc}`,
//       url: shareUrl,
//       files: [file],
//     };

//     if (navigator.canShare && navigator.canShare({ files: [file] })) {
//       await navigator.share(shareData);
//     } else {
//       await navigator.share({
//         title: article.title,
//         text: `${article.title}\n\n${article.desc}`,
//         url: shareUrl,
//       });
//     }
//   } catch (error) {
//     if (error.name !== "AbortError") {
//       console.error("Share error:", error);
//     }
//   }
// };

const handleShare = async () => {
  // const shareUrl = `${window.location.origin}/article.html?id=${article.slug}`;
  const shareUrl = `https://doordarshisamachar.in/article.html?id=${encodeURIComponent(article.slug)}`;
  const shareData = {
    title: article.title,
    text: `${article.title}\n\n${article.desc}`,
    url: shareUrl,
    img: article.img
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareUrl);

      alert(
        lang === "en"
          ? "Link copied to clipboard!"
          : "लिंक क्लिपबोर्ड में कॉपी हो गया!"
      );
    }
  } catch (error) {
    console.error("Share error:", error);
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Head>
      <meta property="og:title" content={article?.title || ""} />
      <meta property="og:description" content={article?.desc || ""} />
      <meta property="og:image" content={article?.img || ""} />
      <meta
        property="og:url"
        content={typeof window !== "undefined" ? window.location.href : ""}
      />
      <meta property="og:type" content="article" />
    </Head>
      <Link href="/" className="text-red-600 hover:underline text-sm mb-4 inline-block">
        ← {lang === "en" ? "Back to Home" : "होम पर वापस जाएं"}
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <article className="lg:col-span-2">

          <div className={`rounded-2xl overflow-hidden border shadow-sm ${card}`}>
            <div className="relative overflow-hidden aspect-video">
              <img src={article.img} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                    {article.tag}
                  </span>
                  <span className="text-white/80 text-xs">{article.time}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[article.category] || "bg-gray-100 text-gray-600"}`}>
                  {article.category}
                </span>
                <span className={`text-xs ${muted}`}>{article.time}</span>
              </div>

              <h1 className="text-3xl font-black leading-tight mb-4">{article.title}</h1>

             {fullContent ? (
  <div
  className={`prose prose-lg max-w-none leading-relaxed ${muted}
  [&_img]:rounded-xl
  [&_img]:my-4
  [&_img]:w-full
  [&_img]:h-auto`}
  dangerouslySetInnerHTML={{ __html: fullContent }}
/>
) : (
                <div className={`p-4 rounded-lg ${dark ? "bg-gray-900" : "bg-gray-100"} border ${dark ? "border-gray-800" : "border-gray-200"}`}>
                  <p className={`text-sm ${muted}`}>
                    {lang === "en"
                      ? "Full article content is not available. Please try again later or contact our support team."
                      : "पूर्ण लेख सामग्री उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें या हमारी सहायता टीम से संपर्क करें।"}
                  </p>
                </div>
              )}

              <div className={`mt-8 pt-6 border-t ${dark ? "border-gray-800" : "border-gray-200"}`}>
                <div className="flex items-center gap-4">
                  <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-current hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer">
                    <span><Share className="w-4 h-4"/></span>
                    <span className="text-sm font-semibold">{lang === "en" ? "Share" : "शेयर"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>


        <aside className="space-y-6">
          {sidebarAd && (
            <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                Advertisement
              </div>
              <div className="p-4">
                <div className="rounded-lg overflow-hidden bg-gray-200 aspect-auto flex items-center justify-center">
                  {renderAdMedia(sidebarAd, "w-full h-full object-cover")}
                </div>
                <div className="mt-3">
                  {/* <p className="text-sm font-bold leading-snug">{getAdTitle(sidebarAd)}</p> */}
                  <p className={`text-xs mt-1 ${muted}`}>
                    Reach millions with your story. Promote your product, campaign, or event here.
                  </p>
                  <a
                    href={getAdLinkUrl(sidebarAd)}
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
          <div className="space-y-6">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                      {lang === "en" ? "Related Articles" : "संबंधित लेख"}
                    </div>
                {relatedPosts.length > 0 && (
                  <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                    {/* <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                      {lang === "en" ? "Related Articles" : "संबंधित लेख"}
                    </div> */}
                    <div className="p-4 space-y-3">
                      {relatedPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/article.html?id=${post.id}`}
                          className={`rounded-lg border overflow-hidden cursor-pointer group flex gap-3 p-3 shadow-sm hover:shadow-md transition-all ${card}`}
                        >
                          <img
                            src={post.img}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="flex flex-col justify-between min-w-0">
                            <p className="text-xs font-semibold leading-snug line-clamp-2">{post.title}</p>
                            <span className={`text-xs ${muted}`}>{post.time}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {bottomAd && (
                  <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-center bg-red-600 text-white">
                      Advertisement
                    </div>
                    <div className="p-4">
                      <div className="rounded-lg overflow-hidden bg-gray-200 aspect-auto flex items-center justify-center">
                        {renderAdMedia(bottomAd, "w-full h-full object-cover")}
                      </div>
                      <div className="mt-3">
                        <a
                          href={getAdLinkUrl(bottomAd)}
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
        </aside>
      </div>
    </div>
  );
}