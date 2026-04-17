document.addEventListener("DOMContentLoaded", init);

function init() {
  loadBlockedSites();

  document
    .querySelector('[data-testid="add-block-btn"]')
    .addEventListener("click", addBlockedSite);

  document
    .querySelector('[data-testid="export-data-btn"]')
    .addEventListener("click", exportData);
}

function addBlockedSite() {
  const input = document.querySelector(
    '[data-testid="block-hostname-input"]'
  );

  const host = input.value.trim();
  if (!host) return;

  chrome.storage.sync.get(["blockedSites"], (data) => {
    const blockedSites = data.blockedSites || [];

    if (!blockedSites.includes(host)) {
      blockedSites.push(host);
    }

    chrome.storage.sync.set({ blockedSites }, () => {
      input.value = "";
      loadBlockedSites();
    });
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get(["blockedSites"], (data) => {
    const list = document.querySelector(
      '[data-testid="blocked-sites-list"]'
    );

    const blockedSites = data.blockedSites || [];

    if (!blockedSites.length) {
      list.innerHTML = "No blocked sites added.";
      return;
    }

    list.innerHTML = blockedSites
      .map(site => `<div class="item">${site}</div>`)
      .join("");
  });
}

function exportData() {
  chrome.storage.local.get(["sessions", "notes"], (localData) => {
    chrome.storage.sync.get(["blockedSites"], (syncData) => {
      const finalData = {
        sessions: localData.sessions || {},
        notes: localData.notes || "",
        blockedSites: syncData.blockedSites || []
      };

      const blob = new Blob(
        [JSON.stringify(finalData, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: "productivity_suite_export.json",
        saveAs: true
      });
    });
  });
}