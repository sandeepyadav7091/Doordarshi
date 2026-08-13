"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AppContext = createContext(undefined);

const DEFAULT_NAV_CATEGORIES = [
  { slug: "home", route: "/", labels: { en: "Home", hi: "होम" }, icon: "" },
  { slug: "news", route: "/news", labels: { en: "News", hi: "समाचार" }, icon: "" },
  { slug: "business", route: "/business", labels: { en: "Business", hi: "व्यापार" }, icon: "" },
  { slug: "entertainment", route: "/entertainment", labels: { en: "Entertainment", hi: "मनोरंजन" }, icon: "" },
  { slug: "sports", route: "/sports", labels: { en: "Sports", hi: "खेल" }, icon: "" },
  { slug: "finance", route: "/finance", labels: { en: "Finance", hi: "वित्त" }, icon: "" },
  { slug: "market", route: "/market", labels: { en: "Market", hi: "बाज़ार" }, icon: "" },
  { slug: "health", route: "/health", labels: { en: "Health", hi: "स्वास्थ्य" }, icon: "" },
  { slug: "videos", route: "/videos", labels: { en: "Videos", hi: "वीडियो" }, icon: "" },
  { slug: "photo-gallery", route: "/photo-gallery", labels: { en: "Photo Gallery", hi: "फोटो गैलरी" }, icon: "" },
  { slug: "movie", route: "/movie", labels: { en: "Movie", hi: "चलचित्र" }, icon: "" },
  { slug: "television", route: "/television", labels: { en: "Television", hi: "टेलीविजन" }, icon: "" },
  { slug: "national", route: "/national", labels: { en: "National", hi: "राष्ट्रीय" }, icon: "" },
  { slug: "international", route: "/international", labels: { en: "International", hi: "अंतरराष्ट्रीय" }, icon: "" },
  { slug: "trendings", route: "/trendings", labels: { en: "Trendings", hi: "ट्रेंडिंग" }, icon: "" },
  { slug: "buzz", route: "/buzz", labels: { en: "Buzz", hi: "चर्चा" }, icon: "" },
];

export function AppProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [search, setSearch] = useState("");
  const [navCategories, setNavCategories] = useState(DEFAULT_NAV_CATEGORIES);

  const fetchCategories = async () => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/portfolio-detail", {});
      const categories = response?.data?.DATA?.PR_CATEGORIES;

      if (!Array.isArray(categories)) {
        return;
      }

      const categoryBySlug = new Map(
        categories.map((item) => [String(item?.PR_SLUG || "").toLowerCase(), item])
      );

      setNavCategories((currentCategories) =>
        currentCategories.map((category) => {
          if (category.slug === "home") {
            return category;
          }

          const apiCategory = categoryBySlug.get(category.slug);

          if (!apiCategory) {
            return category;
          }

          return {
            ...category,
            labels: {
              ...category.labels,
              en: apiCategory.PR_NAME || category.labels.en,
            },
            icon: apiCategory.PR_ICON || category.icon,
          };
        })
      );
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchPostsByCategory = useCallback(async (slug) => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/post-list-category-wise", {
        CBT_REQUEST_DATA: {
          PR_SLUG: slug,
          PR_IS_RECENT: false
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return [];
      }
      
      return Array.isArray(response?.data?.DATA) ? response.data.DATA : [];
    } catch (error) {
      console.error("Failed to fetch category posts", error);
      return [];
    }
  }, []);

  const fetchPostsByState = useCallback(async (slug) => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/state-list", {
        CBT_REQUEST_DATA: {
          PR_SLUG: slug,
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return [];
      }

      return Array.isArray(response?.data?.DATA) ? response.data.DATA : [];
    } catch (error) {
      console.error("Failed to fetch state posts", error);
      return [];
    }
  }, []);

  const fetchPostBySlug = useCallback(async (slug) => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/post-view", {
        CBT_REQUEST_DATA: {
          PR_SLUG: slug,
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return null;
      }

      return response?.data?.DATA || null;
    } catch (error) {
      console.error("Failed to fetch post details", error);
      return null;
    }
  }, []);

  const fetchBreakingNews = useCallback(async () => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/post-breaking-news", {
        CBT_REQUEST_DATA: {
          PR_NEWS_TYPE: "breaking-news",
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return null;
      }

      return response?.data?.DATA || null;
    } catch (error) {
      console.error("Failed to fetch breaking news", error);
      return null;
    }
  }, []);

  const fetchLiveNews = useCallback(async () => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/post-breaking-news", {
        CBT_REQUEST_DATA: {
          PR_NEWS_TYPE: "live-news",
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return null;
      }

      return response?.data?.DATA || null;
    } catch (error) {
      console.error("Failed to fetch live news", error);
      return null;
    }
  }, []);

  const fetchAds = useCallback(async (bannerType = "image") => {
    try {
      const response = await axios.post("https://erp.doordarshisamachar.in/apis/ads", {
        CBT_REQUEST_DATA: {
          PR_BANNER_TYPE: bannerType,
        },
      });

      if (response?.data?.STATUS !== "SUCCESS") {
        return [];
      }

      const rows = Array.isArray(response?.data?.DATA) ? response.data.DATA : [];

      return rows.sort((a, b) => {
        const pa = Number(a?.PR_PRIORITY ?? 9999);
        const pb = Number(b?.PR_PRIORITY ?? 9999);
        return pa - pb;
      });
    } catch (error) {
      console.error("Failed to fetch ads", error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const value = {
    dark,
    setDark,
    lang,
    setLang,
    fetchPostsByCategory,
    fetchPostsByState,
    fetchPostBySlug,
    fetchBreakingNews,
    fetchLiveNews,
    fetchAds,
    search,
    setSearch,
    navCategories,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}