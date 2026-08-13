export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);

  return {
    // title: article.title,
    // description: article.summary,
    // keywords: article.tags,

    openGraph: {
      // title: article.title,
      // description: article.summary,
      type: "article",
      images: [article.images],
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.images],
    },
  };
}