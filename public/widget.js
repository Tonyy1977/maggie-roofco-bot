(function () {
  // Avatar iframe (small one)
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "0px";
  avatarIframe.style.right = "0px";
  avatarIframe.style.width = "100px";
  avatarIframe.style.height = "100px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646"; // one layer below chat
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.style.background = "transparent";
  avatarIframe.style.pointerEvents = "auto";
  avatarIframe.setAttribute("allowtransparency", "true");
  avatarIframe.setAttribute("frameborder", "0");

  // Chatbox iframe (large one)
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
  chatIframe.style.background = "transparent";
  chatIframe.style.pointerEvents = "auto";
  chatIframe.style.display = "none"; // start hidden
  chatIframe.setAttribute("allowtransparency", "true");
  chatIframe.setAttribute("frameborder", "0");

  // Append both to page
  document.body.appendChild(avatarIframe);
  document.body.appendChild(chatIframe);

  // Expose control to chatbot app inside iframe
  window.toggleMicahChat = function (open = true) {
    if (open) {
      avatarIframe.style.display = "none";
      chatIframe.style.display = "block";
    } else {
      avatarIframe.style.display = "block";
      chatIframe.style.display = "none";
    }
  };
})();
