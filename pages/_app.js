import "../src/App.css";  // 👈 global CSS here only

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
