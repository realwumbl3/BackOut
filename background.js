const AUTO_SWITCH_KEY = "autoSwitchToOpenedTab";

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action !== "closeTab") return;
    const tabId = sender.tab && sender.tab.id;
    if (tabId == null) return;
    chrome.tabs.remove(tabId, function () {
        if (chrome.runtime.lastError) {
            console.warn("BackOut:", chrome.runtime.lastError.message);
        }
    });
});

chrome.tabs.onCreated.addListener(function (tab) {
    if (tab == null || tab.id == null) return;
    if (tab.active) return;
    if (tab.openerTabId == null) return;

    chrome.storage.sync.get(AUTO_SWITCH_KEY, function (data) {
        if (!data[AUTO_SWITCH_KEY]) return;
        chrome.tabs.update(tab.id, { active: true }, function () {
            if (chrome.runtime.lastError) return;
            if (tab.windowId != null) {
                chrome.windows.update(tab.windowId, { focused: true });
            }
        });
    });
});