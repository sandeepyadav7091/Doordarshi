"use client";

import { useEffect } from "react";

export default function ClientProtection() {
  useEffect(() => {
    const disableActions = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        ["c", "x", "u", "s", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableActions);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", disableActions);
    document.addEventListener("cut", disableActions);
    document.addEventListener("selectstart", disableActions);

    return () => {
      document.removeEventListener("contextmenu", disableActions);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", disableActions);
      document.removeEventListener("cut", disableActions);
      document.removeEventListener("selectstart", disableActions);
    };
  }, []);

  return null;
}