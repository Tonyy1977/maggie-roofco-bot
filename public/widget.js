(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";

  // Shrunk size (chat-toggle size)
  iframe.style.position = "fixed";
  iframe.style.bottom = "0px";
  iframe.style.right = "0px";
  iframe.style.width = "100px";
  iframe.style.height = "100px";
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

  // Safety patch for late iframe background
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

  // Add toggle function to expand/shrink iframe
  window.toggleMicahChat = function (open = true) {
    if (open) {
      iframe.style.width = "330px";
      iframe.style.height = "520px";
      iframe.style.bottom = "0px";
      iframe.style.right = "0px";
      iframe.style.borderRadius = "20px";
    } else {
      iframe.style.width = "100px";
      iframe.style.height = "100px";
      iframe.style.bottom = "0px";
      iframe.style.right = "0px";
      iframe.style.borderRadius = "50%";
    }
  };
})();
