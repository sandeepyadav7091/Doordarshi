export function startVisibilityPolling(task, intervalMs) {
  if (typeof window === "undefined") {
    task();
    return () => {};
  }

  let disposed = false;

  const runIfVisible = () => {
    if (disposed) {
      return;
    }

    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    task();
  };

  runIfVisible();

  const intervalId = window.setInterval(runIfVisible, intervalMs);

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      task();
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    disposed = true;
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
