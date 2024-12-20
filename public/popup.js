document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");
  let meetingLink = "";

  const renderInitialScreen = () => {
    contentDiv.innerHTML = `
     <div class="section">
      <p class="instruction-text">Click below to copy a URL that you can send to your customer to join this Meeting Room.</p>
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
      <p class="instruction-text">Click below to copy a URL that you can send to your customer to join this Meeting Room.</p>
      <button id="copy-link-btn">Copy Customer Link</button>
      
      <p class="instruction-text">Alternatively, you can invite someone by sending them an SMS with the invite link.</p>
      <div class="phone-input-container">
        <input 
          type="text" 
          id="phone-number" 
          placeholder="Enter phone number (with country code)"
          class="phone-input"
        />
      </div>
      <button id="invite-customer-btn">Invite Customer</button>
      
      <p class="instruction-text">Join your current Talkative Meeting Room. This will open in a new window.</p>
      <button id="join-meeting-btn">Join Meeting Room</button>
      
      <p style="margin-top: 16px;">
            <a href="#" class="link-text" id="start-new">Click here</a> to go back and start a new Meeting Room.
      </p>
    </div>
  `;


       // Add event listener for the "start new" link
       document.getElementById("start-new").addEventListener("click", (e) => {
        e.preventDefault(); // Prevent the default anchor behavior
        renderInitialScreen();
    });

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

    document.getElementById("invite-customer-btn").addEventListener("click", () => {
      const phoneNumber = document.getElementById("phone-number").value.trim();
      if (!phoneNumber) {
        alert("Please enter a phone number");
        return;
      }
      
      if (!meetingLink) {
        alert("No meeting link available!");
        return;
      }
  
      // Here you would add your application's SMS sending logic
      // For example:
      sendSMSInvite(phoneNumber, meetingLink);
    });
      

    document.getElementById("join-meeting-btn").addEventListener("click", () => {
      if (meetingLink) {
        chrome.tabs.create({ url: meetingLink, active: true });
      } else {
        alert("No meeting link available!");
      }
    });
  };

  // Function to handle sending SMS (you'll need to implement this based on your application)
  const sendSMSInvite = async (phoneNumber, link) => {
    const inviteButton = document.getElementById('invite-customer-btn');
    const originalButtonText = inviteButton.textContent;
    inviteButton.textContent = 'Sending...';
    inviteButton.disabled = true;
  
    try {
      console.log('Attempting to send SMS to:', phoneNumber); // Debug log
  
      const response = await fetch('http://localhost:3000/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: `You've been invited to join a meeting. Click here to join: ${link}`
        })
      });
  
      console.log('Response received:', response.status); // Debug log
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData); // Debug log
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success data:', data); // Debug log
      alert('Invitation sent successfully!');
  
    } catch (error) {
      console.error('Detailed error:', error); // More detailed error logging
      alert(`Failed to send invitation: ${error.message}`);
  
    } finally {
      inviteButton.textContent = originalButtonText;
      inviteButton.disabled = false;
    }
  };
  renderInitialScreen();
});