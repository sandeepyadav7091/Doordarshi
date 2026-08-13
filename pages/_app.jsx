import "../app/globals.css";
import Layout from "../components/Layout";
import { AppProvider } from "../context/AppContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  );
}
