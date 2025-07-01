(function () {
  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "20px";
  wrapper.style.right = "20px";
  wrapper.style.width = "64px";  // Start small
  wrapper.style.height = "64px";
  wrapper.style.zIndex = "2147483647";
  wrapper.style.borderRadius = "50%";
  wrapper.style.cursor = "pointer";
  wrapper.style.transition = "all 0.3s ease";
  wrapper.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.borderRadius = "50%";
  iframe.style.background = "transparent";
  iframe.style.backgroundColor = "transparent";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.style.pointerEvents = "auto";
  iframe.style.transition = "all 0.3s ease";

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  let isOpen = false;

  // Toggle chat size and appearance
  function toggleMicahChat(open = !isOpen) {
    isOpen = open;

    if (isOpen) {
      wrapper.style.width = "440px";           // 👈 bigger expanded size
      wrapper.style.height = "660px";
      wrapper.style.borderRadius = "20px";
      iframe.style.borderRadius = "20px";
    } else {
      wrapper.style.width = "64px";
      wrapper.style.height = "64px";
      wrapper.style.borderRadius = "50%";
      iframe.style.borderRadius = "50%";
    }
  }

  // Allow toggle on avatar click
  wrapper.addEventListener("click", () => toggleMicahChat());

  // Patch iframe transparency
  iframe.onload = () => {
    try {
      const doc = iframe.contentWindow.document;
      if (doc?.body) {
        doc.body.style.background = "transparent";
        doc.documentElement.style.background = "transparent";
      }
    } catch (e) {
      console.warn("Iframe transparency patch failed:", e);
    }
  };

  // Drag logic
  let isDragging = false, offsetX = 0, offsetY = 0;

  wrapper.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - wrapper.getBoundingClientRect().left;
    offsetY = e.clientY - wrapper.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      wrapper.style.left = `${e.clientX - offsetX}px`;
      wrapper.style.top = `${e.clientY - offsetY}px`;
      wrapper.style.right = "auto";
      wrapper.style.bottom = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Expose toggle function globally (optional)
  window.toggleMicahChat = toggleMicahChat;
})();
