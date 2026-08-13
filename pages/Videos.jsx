"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { TRANSLATIONS } from "../constants/translations";
import VideoPlayer from "./VideoPlayer";

function getPreviewEmbedUrl(url) {
    try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");

        if (!videoId) {
            const parts = parsed.pathname.split("/").filter(Boolean);
            if (parts[0] === "shorts" && parts[1]) {
                videoId = parts[1];
            } else {
                videoId = parts[parts.length - 1];
            }
        }

        if (!videoId) {
            return "";
        }

        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`;
    } catch {
        return "";
    }
}

function extractYouTubeId(url) {
    try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");

        if (!videoId) {
            const parts = parsed.pathname.split("/").filter(Boolean);
            if (parts[0] === "shorts" && parts[1]) {
                videoId = parts[1];
            } else {
                videoId = parts[parts.length - 1];
            }
        }

        return videoId || "";
    } catch {
        return "";
    }
}

function formatVideoDateTime(value, lang) {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Videos({ id }) {
    const { dark, lang, search } = useAppContext();
    const t = TRANSLATIONS[lang];

    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [hoveredVideoId, setHoveredVideoId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const hoverTimeoutRef = useRef(null);

    const muted = dark ? "text-gray-400" : "text-gray-500";
    const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("https://erp.doordarshisamachar.in/apis/video-post-list-web", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: {
                            PR_IS_RECENT: false,
                        },
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.MESSAGE || "Failed to load videos");
                }

                const videos = Array.isArray(data.DATA) ? data.DATA.map((item) => ({
                    id: item?.PR_ID,
                    title: item?.PR_TITLE || "",
                    description: item?.PR_DESCRIPTION || "",
                    category: item?.PR_CATEGORY?.PR_NAME || "",
                    url: item?.PR_VIDEO_LINK || "",
                    thumbnail: item?.PR_VIDEO_LINK ? `https://img.youtube.com/vi/${extractYouTubeId(item.PR_VIDEO_LINK)}/hqdefault.jpg` : "",
                    publishedAt: item?.PR_CREATED_AT || "",
                })) : [];

                setVideos(videos);
                
                // Auto-select video if id is provided
                if (id) {
                    const selected = videos.find((v) => String(v.id) === String(id));
                    if (selected) {
                        setSelectedVideo(selected);
                    }
                }
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();

        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, [id]);

    const handlePreviewStart = (videoId) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredVideoId(videoId);
        }, 1000);
    };

    const handlePreviewStop = (videoId) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        setHoveredVideoId((current) => (current === videoId ? null : current));
    };

    const filteredVideos = videos.filter((video) => {
        const q = search.toLowerCase();
        return (
            search === "" ||
            video.title?.toLowerCase().includes(q) ||
            video.category?.toLowerCase().includes(q) ||
            video.description?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-black mb-6">{lang === "en" ? "Videos" : "वीडियो"}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className={`rounded-xl border overflow-hidden animate-pulse ${card}`}>
                            <div className="aspect-video bg-gray-300" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-300 rounded w-3/4" />
                                <div className="h-3 bg-gray-300 rounded w-full" />
                                <div className="h-3 bg-gray-300 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`max-w-7xl mx-auto px-4 py-20 text-center ${muted}`}>
                <p className="text-4xl mb-4">📹</p>
                <p className="text-lg font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1 h-8 bg-red-600 rounded-full" />
                    <h1 className="text-3xl font-black">{lang === "en" ? "Videos" : "वीडियो"}</h1>
                </div>
                <p className={`text-sm ${muted}`}>
                    {lang === "en" ? "Latest video stories and reports" : "ताज़ा वीडियो रिपोर्ट और समाचार"}
                </p>
            </div>

            {filteredVideos.length === 0 ? (
                <div className={`text-center py-20 ${muted}`}>
                    <p className="text-4xl mb-4">🎥</p>
                    <p className="text-lg font-semibold">
                        {search
                            ? `No videos found for "${search}"`
                            : lang === "en"
                                ? "No videos available"
                                : "कोई वीडियो उपलब्ध नहीं है"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredVideos.map((video) => (
                        <button
                            key={video.id}
                            type="button"
                            onClick={() => setSelectedVideo(video)}
                            onMouseEnter={() => handlePreviewStart(video.id)}
                            onMouseLeave={() => handlePreviewStop(video.id)}
                            onFocus={() => handlePreviewStart(video.id)}
                            onBlur={() => handlePreviewStop(video.id)}
                            className={`rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group block text-left w-full ${card}`}
                        >
                            <div className="relative overflow-hidden aspect-video">
                                {hoveredVideoId === video.id && getPreviewEmbedUrl(video.url) ? (
                                    <iframe
                                        src={getPreviewEmbedUrl(video.url)}
                                        title={`${video.title} preview`}
                                        className="absolute inset-0 h-full w-full pointer-events-none"
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        loading="lazy"
                                    />
                                ) : (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                                {video.category && (
                                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                        {video.category}
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-base leading-snug line-clamp-2">{video.title}</h3>
                                {video.description && (
                                    <p className={`text-sm mt-2 line-clamp-2 ${muted}`}>{video.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`text-xs ${muted}`}>
                                        {formatVideoDateTime(video.publishedAt, lang)}
                                    </span>
                                    <span className="text-red-600 text-sm font-semibold hover:underline">
                                        {t.watchNow} →
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedVideo && (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}