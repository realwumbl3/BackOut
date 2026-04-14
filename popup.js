const STORAGE_KEY = "autoSwitchToOpenedTab";

const checkbox = document.getElementById("autoSwitch");

chrome.storage.sync.get(STORAGE_KEY, function (data) {
    checkbox.checked = Boolean(data[STORAGE_KEY]);
});

checkbox.addEventListener("change", function () {
    chrome.storage.sync.set({ [STORAGE_KEY]: checkbox.checked });
});
