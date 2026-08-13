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
      images: [
      {
        url: "https://akm-img-a-in.tosshub.com/aajtak/images/story/202608/6a7d53dcbe5f5-cab-booking-tip-rules-131919136-16x9.jpg?size=948:533",
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