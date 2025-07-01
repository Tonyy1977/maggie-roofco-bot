(function () {
  // Create avatar iframe (always visible)
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = "https://ddt-chatbot-gy6g.vercel.app/?view=toggle";
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "0px";
  avatarIframe.style.right = "0px";
  avatarIframe.style.width = "60px";
  avatarIframe.style.height = "60px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646"; // slightly under chat box
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.style.background = "none";
  avatarIframe.style.backgroundColor = "transparent";
  avatarIframe.setAttribute("allowtransparency", "true");
  avatarIframe.setAttribute("frameborder", "0");
  avatarIframe.style.pointerEvents = "auto";
  avatarIframe.style.overflow = "hidden";
  avatarIframe.style.transform = "scale(1)";
  avatarIframe.style.zoom = "1";

  // Create chatbox iframe (initially hidden)
  const chatIframe = document.createElement("iframe");
  chatIframe.src = "https://ddt-chatbot-gy6g.vercel.app/?view=chat";
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "0px";
  chatIframe.style.right = "0px";
  chatIframe.style.width = "330px";
  chatIframe.style.height = "520px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.background = "none";
  chatIframe.style.backgroundColor = "transparent";
  chatIframe.setAttribute("allowtransparency", "true");
  chatIframe.setAttribute("frameborder", "0");
  chatIframe.style.pointerEvents = "auto";
  chatIframe.style.overflow = "hidden";
  chatIframe.style.transform = "scale(1)";
  chatIframe.style.zoom = "1";
  chatIframe.style.display = "none"; // ⛔ start hidden

  // Append both iframes to DOM
  document.body.appendChild(avatarIframe);
  document.body.appendChild(chatIframe);

  // Set global toggle method
  window.toggleMicahChat = function (open = true) {
    chatIframe.style.display = open ? "block" : "none";
  };

  // Auto patch transparency
  const patchTransparent = (iframe) => {
    iframe.onload = () => {
      try {
        const doc = iframe.contentWindow.document;
        if (doc?.body) {
          doc.body.style.background = "transparent";
          doc.documentElement.style.background = "transparent";
        }
      } catch (e) {
        console.warn("Transparency patch failed:", e);
      }
    };
  };

  patchTransparent(avatarIframe);
  patchTransparent(chatIframe);
})();
