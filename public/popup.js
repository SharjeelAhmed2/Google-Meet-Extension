document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("start-meeting-btn");

  button.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://meet.google.com/new" });
  });
});
