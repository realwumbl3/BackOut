const INITIAL_URL = window.location.href;
const DELAY = 300;

function sessionIndex() {
    try {
        const nav = window.navigation;
        if (nav && nav.currentEntry) return nav.currentEntry.index;
    } catch (_) {}
    return undefined;
}

function firstSessionUrl() {
    try {
        const nav = window.navigation;
        const entries = nav && typeof nav.entries === "function" ? nav.entries() : null;
        if (entries && entries.length && entries[0] && entries[0].url) return entries[0].url;
    } catch (_) {}
    return null;
}

function urlsMatch(a, b) {
    if (a == null || b == null) return false;
    try {
        return new URL(a).href === new URL(b).href;
    } catch (_) {
        return a === b;
    }
}

/** Close only if back had no effect and we're on the tab's first history entry (new-tab page). */
function scheduleCloseIfBackHadNoEffect(urlBefore, idxBefore) {
    setTimeout(function () {
        const urlAfter = window.location.href;
        if (!urlsMatch(urlAfter, urlBefore)) return;

        const idxAfter = sessionIndex();
        if (idxBefore !== undefined && idxAfter !== undefined && idxAfter !== idxBefore) return;
        if (idxBefore !== undefined && idxBefore !== 0) return;
        if (idxAfter !== undefined && idxAfter !== 0) return;

        const first = firstSessionUrl();
        if (first) {
            if (!urlsMatch(urlAfter, first)) return;
        } else if (!urlsMatch(urlAfter, INITIAL_URL)) {
            return;
        }

        chrome.runtime.sendMessage({ action: "closeTab" });
    }, DELAY);
}

// Listen for back button events (Backspace, Alt+Left Arrow)
function isEditableTarget(el) {
    if (!el || el === document.body) return false;
    const tag = el.tagName && el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return isEditableTarget(el.parentElement);
}

window.addEventListener('keydown', function (event) {
    if (event.key === "Backspace" && isEditableTarget(event.target)) return;
    if (event.key === 'Backspace' || (event.altKey && event.key === 'ArrowLeft')) {
        scheduleCloseIfBackHadNoEffect(window.location.href, sessionIndex());
    }
});

// Listen for mouse back button events
window.addEventListener('mousedown', function (event) {
    // Browser "back" mouse button (often button 3; some devices differ).
    if (event.button === 3) {
        scheduleCloseIfBackHadNoEffect(window.location.href, sessionIndex());
    }
});

