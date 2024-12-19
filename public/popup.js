// document.addEventListener("DOMContentLoaded", () => {
//   const button = document.getElementById("start-meeting-btn");

//   button.addEventListener("click", () => {
//     chrome.tabs.create({ url: "https://meet.google.com/new" });
//   });
// });


document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");

  // Function to render the initial screen
  const renderInitialScreen = () => {
    contentDiv.innerHTML = `
      <div class="section">
        <p>Welcome to the Google Meet Extension!</p>
        <button id="new-meeting-btn">New Meeting</button>
      </div>
    `;

    // Add click event listener to the "New Meeting" button
    document.getElementById("new-meeting-btn").addEventListener("click", renderSecondScreen);
  };

  // Function to render the second screen
  const renderSecondScreen = () => {
    contentDiv.innerHTML = `
      <div class="section">
        <p>Section 1: This is the first text block.</p>
        <button id="section-1-btn">Button 1</button>
      </div>
      <div class="section">
        <p>Section 2: This is the second text block.</p>
        <button id="section-2-btn">Button 2</button>
      </div>
    `;

    // Add functionality to buttons (currently do nothing)
    document.getElementById("section-1-btn").addEventListener("click", () => {
      console.log("Button 1 clicked!");
    });
    document.getElementById("section-2-btn").addEventListener("click", () => {
      console.log("Button 2 clicked!");
    });
  };

  // Render the initial screen when the popup loads
  renderInitialScreen();
});
