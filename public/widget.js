(function () {
  // Avatar toggle iframe (small button)
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = "https://ddt-chatbot-gy6g.vercel.app/toggle";
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "20px";
  avatarIframe.style.right = "20px";
  avatarIframe.style.width = "64px";
  avatarIframe.style.height = "60px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "1000003";
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.style.backgroundColor = "transparent";
  avatarIframe.style.pointerEvents = "auto";
  avatarIframe.style.display = "block";
  avatarIframe.setAttribute("allowtransparency", "true");
  avatarIframe.setAttribute("frameborder", "0");

  // Chatbox iframe (expanded view)
  const chatIframe = document.createElement("iframe");
  chatIframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "98px"; // distance from bottom to float above avatar
  chatIframe.style.right = "20px";
  chatIframe.style.width = "300px";
  chatIframe.style.height = "407px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "1000002";
  chatIframe.style.borderRadius = "18px";
  chatIframe.style.backgroundColor = "transparent";
  chatIframe.style.pointerEvents = "auto";
  chatIframe.style.display = "none";
  chatIframe.setAttribute("allowtransparency", "true");
  chatIframe.setAttribute("frameborder", "0");

  // Append both iframes
  document.body.appendChild(avatarIframe);
  document.body.appendChild(chatIframe);

  // Toggle logic
  window.toggleMicahChat = function (open = true) {
    avatarIframe.style.display = open ? "none" : "block";
    chatIframe.style.display = open ? "block" : "none";
  };
})();
