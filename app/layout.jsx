import "../app/globals.css";
import ClientProtection from "../components/ClientProtection";
import Layout from "../components/Layout";
import { AppProvider } from "../context/AppContext";

export const metadata = {
  title: {
    default: "Doordarshi Samachar",
    template: "%s | Doordarshi Samachar",
  },
  description: "Latest breaking news, updates, and headlines",
  keywords: ["news", "breaking news", "india news"],
  metadataBase: new URL("https://doordarshisamachar.in"),
  icons: {
    icon: "https://doordarshisamachar.in/logo.png",
    shortcut: "https://doordarshisamachar.in/logo.png",
  },

  openGraph: {
    title: "Doordarshi Samachar",
    description: "Latest breaking news",
    url: "https://doordarshisamachar.in",
    siteName: "Doordarshi Samachar",
    // images: [
    //   {
    //     url: "https://doordarshisamachar.in/logo.png",
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          <Layout>
            <ClientProtection/>
            {children}
          </Layout>
        </AppProvider>
      </body>
    </html>
  );
}