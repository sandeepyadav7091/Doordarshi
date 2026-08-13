"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context/AppContext";

function getEmbedUrl(url) {
    try {
        const parsed = new URL(url);
        let videoId = parsed.searchParams.get("v");

        if (!videoId) {
            const parts = parsed.pathname.split("/");
            videoId = parts[parts.length - 1];
        }

        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    } catch {
        return "";
    }
}

export default function VideoPlayer({ video, onClose, closeHref = "/videos" }) {
    const router = useRouter();
    const { dark } = useAppContext();
    const muted = dark ? "text-gray-400" : "text-gray-500";
    const safeVideo = video || { title: "Video", url: "", description: "" };

    const embedUrl = getEmbedUrl(safeVideo.url);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                if (onClose) {
                    onClose();
                    return;
                }

                router.push(closeHref);
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [closeHref, onClose, router]);

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }

        router.push(closeHref);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-6 md:p-10"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={safeVideo.title}
        >
            <div
                className="mx-auto h-full w-full max-w-5xl overflow-hidden rounded-xl border border-gray-800 bg-black shadow-2xl flex flex-col"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 bg-black text-white border-b border-gray-800">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-red-500 hover:underline"
                    >
                        ← Back
                    </button>
                    <h1 className="text-sm font-semibold truncate max-w-[70%]">{safeVideo.title}</h1>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-xl leading-none text-gray-300 hover:text-white"
                        aria-label="Close video"
                    >
                        ×
                    </button>
                </div>

                <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="absolute inset-0 h-full w-full"
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                            title={safeVideo.title}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                            Invalid video URL
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black text-white border-t border-gray-800">
                    <p className="font-semibold">{safeVideo.title}</p>
                    {safeVideo.description && (
                        <p className={`text-sm mt-2 ${muted}`}>{safeVideo.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}