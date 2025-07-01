(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "80px";
  iframe.style.right = "20px";
  iframe.style.width = "350px";
  iframe.style.height = "500px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "auto"; // 🟢 allow interaction
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";

  // Optional transparency patch
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

  // 🟡 Optional: enable drag-to-move (for dev)
  iframe.style.cursor = "move";
  let isDragging = false, offsetX = 0, offsetY = 0;

  iframe.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - iframe.getBoundingClientRect().left;
    offsetY = e.clientY - iframe.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      iframe.style.left = `${e.clientX - offsetX}px`;
      iframe.style.top = `${e.clientY - offsetY}px`;
      iframe.style.right = "auto";
      iframe.style.bottom = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
})();
