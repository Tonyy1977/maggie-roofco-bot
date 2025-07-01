(function () {
  const avatarBtn = document.createElement("div");
  avatarBtn.className = "avatar-toggle";
  avatarBtn.style.position = "fixed";
  avatarBtn.style.bottom = "20px";
  avatarBtn.style.right = "20px";
  avatarBtn.style.zIndex = "2147483646"; // one under iframe
  avatarBtn.style.cursor = "pointer";

  const avatarImg = document.createElement("img");
  avatarImg.src = "https://i.postimg.cc/280hGJcN/1.jpg"; // your avatar
  avatarImg.style.width = "60px";
  avatarImg.style.aspectRatio = "1 / 1";
  avatarImg.style.objectFit = "cover";
  avatarImg.style.borderRadius = "50%";

  avatarBtn.appendChild(avatarImg);
  document.body.appendChild(avatarBtn);

  let iframe = null;
  let isOpen = false;

  window.toggleMicahChat = function () {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = "https://ddt-chatbot-gy6g.vercel.app/";
      iframe.style.position = "fixed";
      iframe.style.bottom = "20px";
      iframe.style.right = "20px";
      iframe.style.width = "440px";
      iframe.style.height = "660px";
      iframe.style.border = "none";
      iframe.style.zIndex = "2147483647";
      iframe.style.borderRadius = "20px";
      iframe.style.background = "none";
      iframe.style.backgroundColor = "transparent";
      iframe.style.pointerEvents = "auto";
      iframe.style.overflow = "hidden";
      iframe.style.transform = "scale(1)";
      iframe.style.zoom = "1";
      iframe.setAttribute("allowtransparency", "true");
      iframe.setAttribute("frameborder", "0");

      iframe.onload = () => {
        try {
          const doc = iframe.contentWindow.document;
          if (doc?.body) {
            doc.body.style.background = "transparent";
            doc.documentElement.style.background = "transparent";
          }
        } catch (e) {
          console.warn("Iframe transparency error:", e);
        }
      };

      document.body.appendChild(iframe);
      isOpen = true;
    } else {
      if (isOpen) {
        iframe.style.display = "none";
        iframe.style.pointerEvents = "none";
      } else {
        iframe.style.display = "block";
        iframe.style.pointerEvents = "auto";
      }
      isOpen = !isOpen;
    }
  };

  avatarBtn.addEventListener("click", () => {
    window.toggleMicahChat();
  });
})();
