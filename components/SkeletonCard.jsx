export default function SkeletonCard({ dark }) {
  const bg = dark ? "bg-gray-900" : "bg-white";
  const skeleton = dark ? "bg-gray-800" : "bg-gray-200";

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${bg} ${dark ? "border-gray-800" : "border-gray-200"}`}>
      {/* Image skeleton */}
      <div className={`w-full aspect-video ${skeleton} animate-pulse`} />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge skeleton */}
        <div className={`h-6 w-16 ${skeleton} rounded animate-pulse`} />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className={`h-4 w-full ${skeleton} rounded animate-pulse`} />
          <div className={`h-4 w-5/6 ${skeleton} rounded animate-pulse`} />
        </div>

        {/* Date skeleton */}
        <div className={`h-3 w-24 ${skeleton} rounded animate-pulse`} />
      </div>
    </div>
  );
}
