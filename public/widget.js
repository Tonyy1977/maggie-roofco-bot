(function () {
  // Avatar iframe (toggle button)
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = "https://ddt-chatbot-gy6g.vercel.app/toggle";
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "0px";
  avatarIframe.style.right = "0px";
  avatarIframe.style.width = "100px";
  avatarIframe.style.height = "100px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646";
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.style.background = "transparent";
  avatarIframe.setAttribute("allowtransparency", "true");
  avatarIframe.setAttribute("frameborder", "0");

  // Chat iframe (starts hidden)
  const chatIframe = document.createElement("iframe");
  chatIframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "0px";
  chatIframe.style.right = "0px";
  chatIframe.style.width = "330px";
  chatIframe.style.height = "520px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
  chatIframe.style.display = "none";
  chatIframe.setAttribute("allowtransparency", "true");
  chatIframe.setAttribute("frameborder", "0");

  document.body.appendChild(avatarIframe);
  document.body.appendChild(chatIframe);

  // Listen for toggle message
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      chatIframe.style.display =
        chatIframe.style.display === "none" ? "block" : "none";
    }
  });
})();
