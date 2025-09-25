// pages/_app.js
import "../src/App.css";  // ✅ load global CSS

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
