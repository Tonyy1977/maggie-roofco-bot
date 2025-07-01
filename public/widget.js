(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "80px";              // 🟡 adjust to be just above toggle button
  iframe.style.right = "20px";
  iframe.style.width = "350px";              // 🟡 match your chat box width
  iframe.style.height = "500px";             // 🟡 match your chat wrapper height
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "none";       // 🔴 disabled by default
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";

  // Transparency fix if needed
  iframe.onload = () => {
    try {
      const doc = iframe.contentWindow.document;
      if (doc?.body) {
        doc.body.style.background = "transparent";
        doc.documentElement.style.background = "transparent";
      }
    } catch (e) {
      console.warn("Could not access iframe for transparency patch:", e);
    }
  };

  document.body.appendChild(iframe);

  // 👇 Toggler from outside
  window.toggleMicahChat = function (open = true) {
    iframe.style.pointerEvents = open ? "auto" : "none";
  };
})();
