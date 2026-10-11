
(function () {
  "use strict";

  const KEY = "mlpwAchievementsV1";

  const pages = [
    "index.html",
    "blog.html",
    "articles.html",
    "about.html",
    "links.html",
    "guestbook.html",
    "achievements.html"
  ];

  const info = {
    first: {
      icon: "🌸",
      name: "First Visit",
      description: "Welcome to My Little Pink World! ♡"
    },
    articles: {
      icon: "📚",
      name: "Article Explorer",
      description: "You explored the articles! ♡"
    },
    explorer: {
      icon: "🗺️",
      name: "Little Explorer",
      description: "You visited three different pages! ♡"
    }
  };

  // Load the achievement stylesheet.
  if (!document.querySelector("[data-achievement-styles]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("achievements.css", document.baseURI).href;
    link.dataset.achievementStyles = "true";
    document.head.appendChild(link);
  }

  // Create the popup.
  let popup = document.getElementById("achievementPopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "achievementPopup";
    popup.className = "achievement-popup";
    popup.hidden = true;
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");

    popup.innerHTML = `
      <div class="achievement-popup-card">
        <div aria-hidden="true">✧･ﾟ: *✧･ﾟ:* ♡ *:･ﾟ✧*:･ﾟ✧</div>
        <div id="achievementPopupIcon" class="achievement-popup-icon"></div>
        <h2 id="achievementPopupTitle">Achievement unlocked!</h2>
        <p id="achievementPopupName"></p>
        <p id="achievementPopupDescription"></p>
        <button id="achievementPopupClose" type="button">
          yay, thank you! ♡
        </button>
      </div>
    `;

    document.body.appendChild(popup);
  }

  const icon = document.getElementById("achievementPopupIcon");
  const name = document.getElementById("achievementPopupName");
  const description = document.getElementById("achievementPopupDescription");
  const closeButton = document.getElementById("achievementPopupClose");

  if (!icon || !name || !description || !closeButton) {
    console.error("Achievement popup elements are missing.");
    return;
  }

  // Read saved achievements.
  function readData() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");

      const savedPages = Array.isArray(saved.pages)
        ? [...new Set(saved.pages.filter(page => pages.includes(page)))]
        : [];

      return {
        firstVisit: saved.firstVisit === true,
        articleExplorer: saved.articleExplorer === true,
        explorer: saved.explorer === true || savedPages.length >= 3,
        pages: savedPages
      };
    } catch (error) {
      console.error("Could not read achievements:", error);

      return {
        firstVisit: false,
        articleExplorer: false,
        explorer: false,
        pages: []
      };
    }
  }

  let data = readData();

  function saveData() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Could not save achievements:", error);
      return false;
    }
  }

  // Update the badge cards and progress.
  function render() {
    const badges = [
      ["first", data.firstVisit],
      ["articles", data.articleExplorer],
      ["explorer", data.explorer || data.pages.length >= 3]
    ];

    let collected = 0;

    badges.forEach(([id, earned]) => {
      const card = document.getElementById("card-" + id);
      const status = document.getElementById("status-" + id);

      if (earned) collected++;

      if (card) {
        card.classList.toggle("locked", !earned);
      }

      if (status) {
        status.textContent = earned ? "✓ Collected ♡" : "🔒 Locked";
      }
    });

    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const progressTrack = document.getElementById("progressTrack");
    const progressMessage = document.getElementById("progressMessage");

    if (progressText) {
      progressText.textContent = collected + " of 3 badges collected";
    }

    if (progressFill) {
      progressFill.style.width = (collected / 3 * 100) + "%";
    }

    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(collected));
    }

    if (progressMessage) {
      progressMessage.textContent = collected === 3
        ? "All badges collected! You're a pink world star ♡"
        : "Keep exploring to collect more little badges ♡";
    }
  }

  // Queue popups so they appear one at a time.
  let queue = [];
  let popupOpen = false;

  function showNext() {
    if (popupOpen) return;

    if (queue.length === 0) {
      popup.hidden = true;
      return;
    }

    const badge = info[queue.shift()];

    if (!badge) {
      showNext();
      return;
    }

    icon.textContent = badge.icon;
    name.textContent = badge.name;
    description.textContent = badge.description;

    popup.hidden = false;
    popupOpen = true;
  }

  function closePopup() {
    if (!popupOpen) return;

    popup.hidden = true;
    popupOpen = false;
    showNext();
  }

  closeButton.addEventListener("click", closePopup);

  popup.addEventListener("click", function (event) {
    if (event.target === popup) closePopup();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePopup();
  });

  // Track the current page.
  const currentPage =
    location.pathname.split("/").filter(Boolean).pop() || "index.html";

  const newlyEarned = [];

  if (pages.includes(currentPage)) {
    if (!data.firstVisit) {
      data.firstVisit = true;
      newlyEarned.push("first");
    }

    if (currentPage === "articles.html" && !data.articleExplorer) {
      data.articleExplorer = true;
      newlyEarned.push("articles");
      data.articleExplorer = true;
    }

    const alreadyHadExplorer =
      data.explorer || data.pages.length >= 3;

    if (!data.pages.includes(currentPage)) {
      data.pages.push(currentPage);
    }

    if (!alreadyHadExplorer && data.pages.length >= 3) {
      data.explorer = true;
      newlyEarned.push("explorer");
    }
  }

  saveData();
  render();

  if (newlyEarned.length > 0) {
    queue.push(...newlyEarned);
    showNext();
  }

  // Reset all badges.
  const resetButton = document.getElementById("resetButton");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (!window.confirm("Reset all your little badges? ♡")) return;

      data = {
        firstVisit: false,
        articleExplorer: false,
        explorer: false,
        pages: []
      };

      queue = [];
      popupOpen = false;
      popup.hidden = true;

      if (saveData()) {
        render();

        const message = document.getElementById("resetMessage");

        if (message) {
          message.textContent =
            "Badges reset! Visit pages to earn them again ♡";
        }
      } else {
        const message = document.getElementById("resetMessage");

        if (message) {
          message.textContent =
            "Could not save the reset. Please check browser settings.";
        }
      }
    });
  }
})();
