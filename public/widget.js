(function () {
  const CHAT_URL = "https://ddt-chatbot-gy6g.vercel.app";

  // Small Avatar Toggle iframe
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = `${CHAT_URL}/?mode=toggle`;
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "20px";
  avatarIframe.style.right = "20px";
  avatarIframe.style.width = "320px";
  avatarIframe.style.height = "100px";
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
  chatIframe.style.bottom = "80px";
  chatIframe.style.right = "50px";
  chatIframe.style.width = "400px";
  chatIframe.style.height = "500px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.display = "none";
  chatIframe.style.background = "transparent";
  chatIframe.allowTransparency = "true";
  chatIframe.setAttribute("frameborder", "0");
  document.body.appendChild(chatIframe);

  // Message listener: toggle and close logic
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      const isOpen = chatIframe.style.display === "block";
      chatIframe.style.display = isOpen ? "none" : "block";
      avatarIframe.style.display = isOpen ? "block" : "none"; // 👈 hide toggle if chat open
    }

    if (event.data === "close-chat") {
      chatIframe.style.display = "none";
      avatarIframe.style.display = "block"; // 👈 show toggle again
    }
  });
})();
