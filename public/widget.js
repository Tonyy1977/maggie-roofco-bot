(function () {
  const CHAT_URL = "https://ddt-chatbot-gy6g.vercel.app";

  // --- Avatar Toggle iframe ---
  const avatarIframe = document.createElement("iframe");
  avatarIframe.src = `${CHAT_URL}/?mode=toggle`;
  avatarIframe.style.position = "fixed";
  avatarIframe.style.bottom = "20px";
  avatarIframe.style.right = "20px";
  avatarIframe.style.width = "64px";
  avatarIframe.style.height = "64px";
  avatarIframe.style.border = "none";
  avatarIframe.style.zIndex = "2147483646";
  avatarIframe.style.background = "transparent";
  avatarIframe.style.pointerEvents = "auto";
  avatarIframe.style.borderRadius = "50%";
  avatarIframe.allowTransparency = "true";
  avatarIframe.setAttribute("frameborder", "0");
  avatarIframe.setAttribute("scrolling", "no");
  avatarIframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
  avatarIframe.setAttribute("referrerpolicy", "no-referrer");
  document.body.appendChild(avatarIframe);

  // --- Chat Box iframe ---
  const chatIframe = document.createElement("iframe");
  chatIframe.src = `${CHAT_URL}/?mode=chat`;
  chatIframe.style.position = "fixed";
  chatIframe.style.bottom = "0";
  chatIframe.style.right = "0";
  chatIframe.style.width = "350px";
  chatIframe.style.height = "500px";
  chatIframe.style.border = "none";
  chatIframe.style.zIndex = "2147483647";
  chatIframe.style.borderRadius = "20px";
  chatIframe.style.display = "none";
  chatIframe.style.background = "#fff";
  chatIframe.style.overflow = "hidden";
  chatIframe.style.isolation = "isolate";
  chatIframe.allowTransparency = "true";
  chatIframe.setAttribute("frameborder", "0");
  chatIframe.setAttribute("scrolling", "no");
  chatIframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
  chatIframe.setAttribute("referrerpolicy", "no-referrer");
  document.body.appendChild(chatIframe);

  // --- Function: Resize Chat for Mobile/Desktop ---
  function resizeChat() {
    if (window.innerWidth <= 768) {
      chatIframe.style.width = "100vw";
      chatIframe.style.height = "100vh";
      chatIframe.style.borderRadius = "0";
      chatIframe.style.top = "0";
      chatIframe.style.left = "0";
    } else {
      chatIframe.style.width = "350px";   // smaller desktop size
      chatIframe.style.height = "500px";
      chatIframe.style.borderRadius = "20px";
      chatIframe.style.bottom = "0";
      chatIframe.style.right = "0";
      chatIframe.style.left = "auto";
      chatIframe.style.top = "auto";
    }
  }

  resizeChat();
  window.addEventListener("resize", resizeChat);

  // --- Listener: toggle and close logic ---
  window.addEventListener("message", (event) => {
    if (event.data === "toggle-chat") {
      const isOpen = chatIframe.style.display === "block";
      if (isOpen) {
        chatIframe.style.display = "none";
        avatarIframe.style.display = "block";
        document.body.style.overflow = "auto"; // unlock scroll
      } else {
        chatIframe.style.display = "block";
        avatarIframe.style.display = "none"; // hide avatar while chat open
        resizeChat();
        document.body.style.overflow = "hidden"; // lock background scroll
      }
    }

    if (event.data === "close-chat") {
      chatIframe.style.display = "none";
      avatarIframe.style.display = "block";
      document.body.style.overflow = "auto";
    }
  });
})();
