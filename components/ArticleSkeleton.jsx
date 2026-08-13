export default function ArticleSkeleton({ dark, card }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className={`h-4 w-32 mb-4 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2">
          <div className={`rounded-2xl overflow-hidden border shadow-sm ${card}`}>
            <div className={`aspect-video ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-6 w-20 rounded-full ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-28 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              </div>
              <div className={`h-10 w-11/12 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className="space-y-3">
                <div className={`h-4 w-full rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-full rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-5/6 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-full rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-4/6 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              </div>
              <div className={`h-10 w-28 rounded-lg ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
            <div className={`h-6 w-full ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            <div className="p-4 space-y-3">
              <div className={`rounded-lg aspect-video ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className={`h-4 w-3/4 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className={`h-3 w-full rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className={`h-8 w-full rounded-lg ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>
          </div>

          <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
            <div className={`h-6 w-full ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={`rounded-lg border p-3 flex gap-3 ${dark ? "border-gray-800" : "border-gray-200"}`}>
                  <div className={`w-16 h-16 rounded-lg shrink-0 ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-3 w-full rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                    <div className={`h-3 w-4/5 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                    <div className={`h-3 w-1/3 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
