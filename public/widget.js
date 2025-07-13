(function () {
  const CHAT_URL = "https://ddt-chatbot-gy6g.vercel.app";
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  let avatarIframe = null;

if (!isMobile) {
  avatarIframe = document.createElement("iframe");
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
}

  // Desktop Chat iframe
  const chatIframe = document.createElement("iframe");
  chatIframe.src = `${CHAT_URL}/?mode=chat`;
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "80px";
  chatIframe.style.right = "0px";
  chatIframe.style.width = "400px";
  chatIframe.style.height = "800px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.display = "none";
  chatIframe.style.background = "transparent";
  chatIframe.allowTransparency = "true";
  chatIframe.setAttribute("frameborder", "0");
  document.body.appendChild(chatIframe);

  // ✅ NEW: Mobile Fullscreen Chat iframe
  const mobileChatIframe = document.createElement("iframe");
  mobileChatIframe.src = `${CHAT_URL}/?mode=chat&fullscreen=true`;
  mobileChatIframe.style.position = "fixed";
  mobileChatIframe.style.top = "0";
  mobileChatIframe.style.left = "0";
  mobileChatIframe.style.width = "100vw";
  mobileChatIframe.style.height = "100vh";
  mobileChatIframe.style.border = "none";
  mobileChatIframe.style.zIndex = "2147483647";
  mobileChatIframe.style.display = "none";
  mobileChatIframe.style.background = "white";
  mobileChatIframe.allowTransparency = "true";
  mobileChatIframe.setAttribute("frameborder", "0");
  document.body.appendChild(mobileChatIframe);

  // Message listener: toggle and close logic
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      const targetIframe = isMobile ? mobileChatIframe : chatIframe;
      if (isMobile) {
  const isOpen = mobileChatIframe.style.display === "block";
  mobileChatIframe.style.display = isOpen ? "none" : "block";
  avatarIframe.style.display = isOpen ? "block" : "none";
} else {
  const isOpen = chatIframe.style.display === "block";
  chatIframe.style.display = isOpen ? "none" : "block";
  avatarIframe.style.display = isOpen ? "block" : "none";
}
    }
    if (event.data === "close-chat") {
      chatIframe.style.display = "none";
      mobileChatIframe.style.display = "none";
      avatarIframe.style.display = "block";
    }

    if (event.data === "openFullChat") {
      const targetIframe = isMobile ? mobileChatIframe : chatIframe;
      targetIframe.style.display = "block";
      avatarIframe.style.display = "none";
    }
  });
})();
