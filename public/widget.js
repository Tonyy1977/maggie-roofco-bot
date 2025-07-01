(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "60px";   // Start as small as avatar
  iframe.style.height = "60px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "50%";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "auto";
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";
  iframe.style.transition = "all 0.3s ease-in-out";

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

  // Toggle function for expansion and shrink
  window.toggleMicahChat = function (open = true) {
    if (open) {
      iframe.style.width = "330px";
      iframe.style.height = "520px";
      iframe.style.borderRadius = "20px";
    } else {
      iframe.style.width = "60px";
      iframe.style.height = "60px";
      iframe.style.borderRadius = "50%";
    }
  };
})();
