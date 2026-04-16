document.addEventListener("DOMContentLoaded", init);

function init() {
  document
    .querySelector('[data-testid="save-session-btn"]')
    .addEventListener("click", saveSession);

  document
    .querySelector('[data-testid="save-notes-btn"]')
    .addEventListener("click", saveNotes);

  document
    .querySelector('[data-testid="open-options-btn"]')
    .addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });

  loadData();
}

async function saveSession() {
  const name = prompt("Enter session name:");
  if (!name) return;

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const urls = tabs.map(tab => tab.url).filter(Boolean);

  chrome.storage.local.get(["sessions"], (data) => {
    const sessions = data.sessions || {};
    sessions[name] = urls;

    chrome.storage.local.set({ sessions }, loadData);
  });
}

function saveNotes() {
  const notes = document.querySelector(
    '[data-testid="notes-textarea"]'
  ).value;

  chrome.storage.local.set({ notes });
}

function loadData() {
  chrome.storage.local.get(["notes", "sessions"], (data) => {
    document.querySelector(
      '[data-testid="notes-textarea"]'
    ).value = data.notes || "";

    renderSessions(data.sessions || {});
  });
}

function renderSessions(sessions) {
  const list = document.querySelector(
    '[data-testid="sessions-list"]'
  );

  list.innerHTML = "<h3>Saved Sessions</h3>";

  for (const name in sessions) {
    const wrapper = document.createElement("div");
    wrapper.className = "session-item";

    const title = document.createElement("div");
    title.textContent = name;

    const btn = document.createElement("button");
    btn.textContent = "Restore";
    btn.setAttribute(
      "data-testid",
      "restore-session-" + name
    );

    btn.addEventListener("click", () => {
      restoreSession(name);
    });

    wrapper.appendChild(title);
    wrapper.appendChild(btn);
    list.appendChild(wrapper);
  }
}

function restoreSession(name) {
  chrome.storage.local.get(["sessions"], (data) => {
    const urls = data.sessions?.[name];
    if (!urls || !urls.length) return;

    chrome.windows.create({}, (win) => {
      urls.forEach((url) => {
        chrome.tabs.create({
          windowId: win.id,
          url: url
        });
      });
    });
  });
}