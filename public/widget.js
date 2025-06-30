(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "380px";           // ✅ updated
  iframe.style.height = "520px";          // ✅ updated
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.borderRadius = "16px";
  iframe.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
  document.body.appendChild(iframe);
})();
