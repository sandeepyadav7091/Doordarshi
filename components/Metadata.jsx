export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);

  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags,

    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      // images: [article.images],
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.images],
    },
  };
}