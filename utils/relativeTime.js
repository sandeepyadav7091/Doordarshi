const UNITS = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000],
];

export function formatTimeAgo(value, lang = "en") {
  if (!value) {
    return lang === "hi" ? "अभी" : "just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return lang === "hi" ? "अभी" : "just now";
  }

  const locale = lang === "hi" ? "hi-IN" : "en-US";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffMs = date.getTime() - Date.now();

  if (Math.abs(diffMs) < 45000) {
    return lang === "hi" ? "अभी" : "just now";
  }

  for (const [unit, ms] of UNITS) {
    if (Math.abs(diffMs) >= ms || unit === "second") {
      const delta = Math.round(diffMs / ms);

      if (lang !== "hi") {
        const absDelta = Math.abs(delta);
        const label = absDelta === 1 ? unit : `${unit}s`;
        return delta < 0 ? `${absDelta}${label} ago` : `${absDelta}${label} from now`;
      }

      return rtf.format(delta, unit);
    }
  }

  return lang === "hi" ? "अभी" : "just now";
}
