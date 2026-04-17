chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToNotes",
    title: "Add page to notes",
    contexts: ["page"]
  });
});

/* Context menu click */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToNotes") {
    chrome.storage.local.get(["notes"], (data) => {
      let notes = data.notes || "";

      notes += `\n${tab.title} - ${tab.url}`;

      chrome.storage.local.set({ notes });
    });
  }
});

/* Website blocker */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  chrome.storage.sync.get(["blockedSites"], (data) => {
    const blockedSites = data.blockedSites || [];

    for (let site of blockedSites) {
      if (tab.url.includes(site)) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("blocked.html")
        });
        break;
      }
    }
  });
});

/* Keyboard shortcuts */
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-session") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const urls = tabs.map(tab => tab.url).filter(Boolean);

      chrome.storage.local.get(["sessions"], (data) => {
        const sessions = data.sessions || {};
        sessions["Quick Save"] = urls;

        chrome.storage.local.set({ sessions });
      });
    });
  }
});