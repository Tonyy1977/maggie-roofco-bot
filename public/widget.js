(function () {
  let isOpen = false;

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "60px"; // Avatar size
  iframe.style.height = "60px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "50%"; // Circular when minimized
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "auto";
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";
  iframe.style.transition = "all 0.3s ease";

  // Background patch
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

  // Toggle open/close on click
  iframe.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      iframe.style.width = "440px";
      iframe.style.height = "660px";
      iframe.style.borderRadius = "20px";
    } else {
      iframe.style.width = "60px";
      iframe.style.height = "60px";
      iframe.style.borderRadius = "50%";
    }
  });

  document.body.appendChild(iframe);
})();
