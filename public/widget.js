(function () {
  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  iframe.style.position = "fixed";
  iframe.style.bottom = "90px"; // leave space for toggle
  iframe.style.right = "20px";
  iframe.style.width = "440px";
  iframe.style.height = "660px";
  iframe.style.border = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.borderRadius = "20px";
  iframe.style.background = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.style.pointerEvents = "none"; // start disabled
  iframe.style.overflow = "hidden";
  iframe.style.transform = "scale(1)";
  iframe.style.zoom = "1";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");

  // Apply transparent background to iframe content
  iframe.onload = () => {
    try {
      const doc = iframe.contentWindow.document;
      if (doc?.body) {
        doc.body.style.background = "transparent";
        doc.documentElement.style.background = "transparent";
      }
    } catch (e) {
      console.warn("Could not access iframe content:", e);
    }
  };

  // Append iframe to page
  document.body.appendChild(iframe);

  // Create the floating avatar toggle button
  const toggleBtn = document.createElement("div");
  toggleBtn.style.position = "fixed";
  toggleBtn.style.bottom = "20px";
  toggleBtn.style.right = "20px";
  toggleBtn.style.zIndex = "2147483648"; // higher than iframe
  toggleBtn.style.cursor = "pointer";

  const img = document.createElement("img");
  img.src = "https://i.postimg.cc/280hGJcN/1.jpg"; // Micah avatar
  img.alt = "Micah Toggle";
  img.style.width = "60px";
  img.style.height = "60px";
  img.style.borderRadius = "50%";
  img.style.objectFit = "cover";
  img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

  toggleBtn.appendChild(img);
  document.body.appendChild(toggleBtn);

  // Add toggle functionality
  let isOpen = false;
  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    iframe.style.pointerEvents = isOpen ? "auto" : "none";
    iframe.style.display = isOpen ? "block" : "none";
  };

  // Optional: iframe starts hidden
  iframe.style.display = "none";
})();
