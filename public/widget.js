(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "0px";
  iframe.style.right = "0px";
  iframe.style.width = "100px";         // 🔹 collapsed size
  iframe.style.height = "100px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "auto";
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.transition = "all 0.3s ease"; // 🔹 smooth resize
  iframe.style.zoom = "1";

  let isOpen = false;

  // Optional: Ensure iframe inside stays transparent
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

  // 🔁 Toggle open/close on click
  iframe.addEventListener("click", (e) => {
    // prevent link inside iframe from triggering toggle
    if (e.target !== iframe) return;

    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.width = "330px";
      iframe.style.height = "520px";
    } else {
      iframe.style.width = "100px";
      iframe.style.height = "100px";
    }
  });

  document.body.appendChild(iframe);
})();
