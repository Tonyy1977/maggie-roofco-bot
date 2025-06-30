(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "440px";     // ← wider
  iframe.style.height = "660px";    // ← taller
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
  iframe.style.background = "white";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";
  document.body.appendChild(iframe);
})();
