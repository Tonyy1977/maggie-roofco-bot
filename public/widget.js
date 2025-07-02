(function () {
  const CHAT_URL = "https://ddt-chatbot-gy6g.vercel.app";

  // Create avatar iframe
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = `${CHAT_URL}/?mode=toggle`;
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "20px";
  avatarIframe.style.right = "20px";
  avatarIframe.style.width = "64px";
  avatarIframe.style.height = "60px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646";
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.style.background = "transparent";
  avatarIframe.allowTransparency = "true";
  avatarIframe.setAttribute("frameborder", "0");
  document.body.appendChild(avatarIframe);

  // Create chat box iframe (hidden by default)
  const chatIframe = document.createElement("iframe");
  chatIframe.src = `${CHAT_URL}/?mode=chat`;
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "100px";
  chatIframe.style.right = "20px";
  chatIframe.style.width = "330px";
  chatIframe.style.height = "520px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.display = "none";
  chatIframe.setAttribute("frameborder", "0");
  document.body.appendChild(chatIframe);

  // 🔄 Listen for toggle or close messages
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      const isVisible = chatIframe.style.display === "block";
      chatIframe.style.display = isVisible ? "none" : "block";
    }

    if (event.data === "close-chat") {
      chatIframe.style.display = "none";
    }
  });
})();
