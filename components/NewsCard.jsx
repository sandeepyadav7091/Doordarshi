"use client";

import Link from "next/link";
import { categoryColors } from "../constants/translations";
import { useAppContext } from "../context/AppContext";

export default function NewsCard({
  id,
  category,
  title,
  desc,
  time,
  tag,
  img,
  variant = "secondary",
  readMore,
}) {
  const { dark } = useAppContext();
  const card = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const muted = dark ? "text-gray-400" : "text-gray-500";

  if (variant === "featured") {
    return (
      <Link href={`/article.html?id=${id}`} className={`rounded-2xl overflow-hidden border shadow-sm cursor-pointer group ${card} block`}>
        <div className="relative overflow-hidden aspect-video">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                {tag}
              </span>
              <span className="text-white/80 text-xs">{time}</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-snug drop-shadow">{title}</h2>
          </div>
        </div>

        <div className="p-5">
          <p className={`text-sm leading-relaxed ${muted}`}>{desc}</p>
          <div className="flex items-center justify-between mt-4">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[category] || "bg-gray-100 text-gray-600"}`}>
              {category}
            </span>
            <button className="text-red-600 text-sm font-semibold hover:underline">{readMore} →</button>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link
        href={`/article.html?id=${id}`}
        className={`rounded-xl border overflow-hidden cursor-pointer group flex gap-3 p-3 shadow-sm hover:shadow-md transition-all ${card}`}
      >
        <img
          src={img}
          alt={title}
          className="w-20 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <span className={`text-xs font-semibold ${categoryColors[category] ? categoryColors[category].split(" ")[1] : "text-gray-500"}`}>
              {category}
            </span>
            <p className="text-sm font-semibold leading-snug mt-0.5 line-clamp-2">{title}</p>
          </div>
          <span className={`text-xs ${muted}`}>{time}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/article.html?id=${id}`}
      className={`rounded-xl border overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all ${card} block`}
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{tag}</span>
      </div>

      <div className="p-4">
        <span className={`text-xs font-semibold ${categoryColors[category] ? categoryColors[category].split(" ")[1] : "text-gray-500"}`}>
          {category}
        </span>
        <h4 className="font-bold text-sm leading-snug mt-1 mb-2 line-clamp-2">{title}</h4>
        <p className={`text-xs leading-relaxed line-clamp-2 ${muted}`}>{desc}</p>
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs ${muted}`}>{time}</span>
          <button className="text-red-600 text-xs font-semibold hover:underline">{readMore} →</button>
        </div>
      </div>
    </Link>
  );
}