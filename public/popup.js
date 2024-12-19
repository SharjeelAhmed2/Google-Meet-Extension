document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");
  let meetingLink = "";

  const renderInitialScreen = () => {
    contentDiv.innerHTML = `
      <div class="section">
        <p>Welcome to the Google Meet Extension!</p>
        <button id="new-meeting-btn">New Meeting</button>
      </div>
    `;

    document.getElementById("new-meeting-btn").addEventListener("click", () => {
      // Show loading state
      contentDiv.innerHTML = `
        <div class="section">
          <p>Creating meeting...</p>
        </div>
      `;
      createMeeting();
    });
  };

  const createMeeting = () => {
    // Create a background tab
    chrome.tabs.create({ url: "https://meet.google.com/new", active: false }, (newTab) => {
      let urlCheckInterval;
      
      const checkForFinalUrl = (tabId) => {
        chrome.tabs.get(tabId, (tab) => {
          const currentUrl = tab.url;
          if (currentUrl.match(/meet\.google\.com\/[a-zA-Z0-9-]{3,}-[a-zA-Z0-9-]{3,}-[a-zA-Z0-9-]{3,}$/)) {
            clearInterval(urlCheckInterval);
            meetingLink = currentUrl;
            chrome.tabs.remove(tabId); // Remove the background tab
            renderSecondScreen();
          }
        });
      };

      urlCheckInterval = setInterval(() => {
        checkForFinalUrl(newTab.id);
      }, 500);

      setTimeout(() => {
        if (urlCheckInterval) {
          clearInterval(urlCheckInterval);
          chrome.tabs.remove(newTab.id);
          alert("Failed to generate meeting link. Please try again.");
          renderInitialScreen();
        }
      }, 10000);
    });
  };

  const renderSecondScreen = () => {
    contentDiv.innerHTML = `
      <div class="section">
        <p>Meeting created successfully!</p>
        <button id="copy-link-btn">Copy Link</button>
        <button id="join-meeting-btn">Join Meeting</button>
      </div>
    `;

    document.getElementById("copy-link-btn").addEventListener("click", () => {
      if (meetingLink) {
        navigator.clipboard.writeText(meetingLink).then(() => {
          alert(`Meeting link copied: ${meetingLink}`);
        }).catch((err) => {
          console.error("Failed to copy link:", err);
        });
      } else {
        alert("No meeting link available!");
      }
    });

    document.getElementById("join-meeting-btn").addEventListener("click", () => {
      if (meetingLink) {
        chrome.tabs.create({ url: meetingLink, active: true });
      } else {
        alert("No meeting link available!");
      }
    });
  };

  renderInitialScreen();
});