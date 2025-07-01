(function () {
  // Create a wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "80px";
  wrapper.style.right = "20px";
  wrapper.style.width = "350px";
  wrapper.style.height = "500px";
  wrapper.style.zIndex = "2147483647";
  wrapper.style.borderRadius = "20px";
  wrapper.style.cursor = "move";

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "transparent";
  iframe.style.backgroundColor = "transparent";
  iframe.style.pointerEvents = "auto";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");

  // Append iframe to wrapper
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  // Drag logic
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

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

  // Optional transparent patch
  iframe.onload = () => {
    try {
      const doc = iframe.contentWindow.document;
      if (doc?.body) {
        doc.body.style.background = "transparent";
        doc.documentElement.style.background = "transparent";
      }
    } catch (e) {
      console.warn("Could not access iframe:", e);
    }
  };
})();
