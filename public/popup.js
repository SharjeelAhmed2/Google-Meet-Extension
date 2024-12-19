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
      contentDiv.innerHTML = `
        <div class="section">
          <p>Creating meeting...</p>
        </div>
      `;
      createMeeting();
    });
  };

  const createMeeting = () => {
    let attempts = 0;
    const maxAttempts = 3; // Number of retry attempts

    const attemptCreateMeeting = () => {
      chrome.tabs.create({ url: "https://meet.google.com/new", active: false }, (newTab) => {
        let urlCheckInterval;
        let timeoutId;
        
        const cleanup = () => {
          if (urlCheckInterval) clearInterval(urlCheckInterval);
          if (timeoutId) clearTimeout(timeoutId);
          chrome.tabs.remove(newTab.id);
        };

        const checkForFinalUrl = (tabId) => {
          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
              cleanup();
              handleError();
              return;
            }

            const currentUrl = tab.url;
            if (currentUrl.match(/meet\.google\.com\/[a-zA-Z0-9-]{3,}-[a-zA-Z0-9-]{3,}-[a-zA-Z0-9-]{3,}$/)) {
              cleanup();
              meetingLink = currentUrl;
              renderSecondScreen();
            }
          });
        };

        const handleError = () => {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Attempt ${attempts} failed, retrying...`);
            attemptCreateMeeting();
          } else {
            contentDiv.innerHTML = `
              <div class="section">
                <p>Failed to generate meeting link.</p>
                <button id="retry-btn">Try Again</button>
              </div>
            `;
            document.getElementById("retry-btn").addEventListener("click", () => {
              attempts = 0;
              createMeeting();
            });
          }
        };

        urlCheckInterval = setInterval(() => {
          checkForFinalUrl(newTab.id);
        }, 1000); // Increased interval to 1 second

        timeoutId = setTimeout(() => {
          cleanup();
          handleError();
        }, 30000); // Increased timeout to 30 seconds
      });
    };

    attemptCreateMeeting();
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