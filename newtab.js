document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["notes", "sessions"], (data) => {
    document.querySelector('[data-testid="widget-notes"]').textContent =
      data.notes || "No notes saved.";

    const sessions = data.sessions || {};
    const names = Object.keys(sessions);

    document.querySelector('[data-testid="widget-sessions"]').innerHTML =
      names.length
        ? names.map(name => `<div>${name}</div>`).join("")
        : "No sessions saved.";
  });
});