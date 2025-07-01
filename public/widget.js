(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "0px";
  iframe.style.right = "0px";
  iframe.style.width = "100px"; // 👈 initial size (chat-toggle size)
  iframe.style.height = "100px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.style.transition = "all 0.3s ease";
  iframe.style.overflow = "hidden";
  iframe.style.pointerEvents = "none"; // disabled at start
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");

  // Force transparent iframe contents
  iframe.onload = () => {
    try {
      const doc = iframe.contentWindow.document;
      if (doc?.body) {
        doc.body.style.background = "transparent";
        doc.documentElement.style.background = "transparent";
      }
    } catch (e) {
      console.warn("Iframe patch error:", e);
    }
  };

  document.body.appendChild(iframe);

  // ✅ Toggle function (call this from your React code)
  window.toggleMicahChat = function (open = true) {
    if (open) {
      iframe.style.width = "330px";
      iframe.style.height = "520px";
      iframe.style.pointerEvents = "auto";
    } else {
      iframe.style.width = "100px";
      iframe.style.height = "100px";
      iframe.style.pointerEvents = "none";
    }
  };
})();
