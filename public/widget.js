(function () {
  const CHAT_URL = "https://ddt-chatbot-gy6g.vercel.app";
  const isMobile = window.innerWidth <= 768;

  // Small Avatar Toggle iframe
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = `${CHAT_URL}/?mode=toggle`;
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "20px";
  avatarIframe.style.right = "20px";
  avatarIframe.style.width = "320px";
  avatarIframe.style.height = "150px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646";
  avatarIframe.style.background = "transparent";
  avatarIframe.style.pointerEvents = "auto";
  avatarIframe.allowTransparency = "true";
  avatarIframe.setAttribute("frameborder", "0");
  document.body.appendChild(avatarIframe);

  // Chat Box iframe (hidden by default)
  const chatIframe = document.createElement("iframe");
  chatIframe.src = `${CHAT_URL}/?mode=chat`;
  chatIframe.style.position = "fixed";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = isMobile ? "0" : "20px";
  chatIframe.style.display = "none";
  chatIframe.style.background = "transparent";
  chatIframe.allowTransparency = "true";
  chatIframe.setAttribute("frameborder", "0");
  document.body.appendChild(chatIframe);

  // Set default position
  if (isMobile) {
    chatIframe.style.top = "0px";
    chatIframe.style.left = "0px";
    chatIframe.style.width = "100vw";
    chatIframe.style.height = "100vh";
  } else {
    chatIframe.style.bottom = "80px";
    chatIframe.style.right = "0px";
    chatIframe.style.width = "400px";
    chatIframe.style.height = "800px";
  }

  // Toggle/close logic
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      const isOpen = chatIframe.style.display === "block";
      chatIframe.style.display = isOpen ? "none" : "block";
      avatarIframe.style.display = isOpen ? "block" : "none";
    }

    if (event.data === "close-chat") {
      chatIframe.style.display = "none";
      avatarIframe.style.display = "block";
    }
  });
})();
