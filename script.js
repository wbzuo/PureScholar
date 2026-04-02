const PREF_KEYS = {
    language: "pref-lang",
    theme: "pref-theme",
    siteStyle: "pref-site-style"
};

function readPreference(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writePreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Ignore storage failures so the UI still works in restricted contexts.
    }
}

function applyLanguage(language) {
    const nextLanguage = language === "zh" ? "zh" : "en";
    const isZh = nextLanguage === "zh";
    const langToggle = document.getElementById("lang-toggle");

    document.body.classList.toggle("zh-active", isZh);
    document.documentElement.lang = isZh ? "zh-CN" : "en";

    if (langToggle) {
        langToggle.setAttribute("aria-pressed", String(isZh));
        langToggle.setAttribute(
            "aria-label",
            isZh ? "Switch interface language to English" : "Switch interface language to Chinese"
        );
    }
}

function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const themeIcon = document.getElementById("theme-icon");
    const themeToggle = document.getElementById("theme-toggle");

    document.documentElement.setAttribute("data-theme", nextTheme);

    if (themeIcon) {
        themeIcon.innerText = nextTheme === "dark" ? "Dark" : "Light";
    }

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
        themeToggle.setAttribute(
            "aria-label",
            nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
    }
}

function applySiteStyle(style) {
    const styleButtons = Array.from(document.querySelectorAll("[data-style-value]"));
    const validStyles = styleButtons.map((button) => button.dataset.styleValue);
    const defaultStyle = document.documentElement.dataset.defaultStyle || validStyles[0] || "academic";
    const nextStyle = validStyles.includes(style) ? style : defaultStyle;

    document.documentElement.setAttribute("data-site-style", nextStyle);

    styleButtons.forEach((button) => {
        const isActive = button.dataset.styleValue === nextStyle;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function initializePreferenceControls() {
    const langToggle = document.getElementById("lang-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const styleButtons = Array.from(document.querySelectorAll("[data-style-value]"));

    if (langToggle) {
        langToggle.addEventListener("click", () => {
            const nextLanguage = document.body.classList.contains("zh-active") ? "en" : "zh";
            writePreference(PREF_KEYS.language, nextLanguage);
            applyLanguage(nextLanguage);
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            writePreference(PREF_KEYS.theme, nextTheme);
            applyTheme(nextTheme);
        });
    }

    styleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextStyle = button.dataset.styleValue;
            writePreference(PREF_KEYS.siteStyle, nextStyle);
            applySiteStyle(nextStyle);
        });
    });
}

function initializeTabs() {
    const tabSystem = document.querySelector("[data-tab-system]");
    if (!tabSystem) {
        return;
    }

    const buttons = Array.from(tabSystem.querySelectorAll("[data-tab-trigger]"));
    const panels = Array.from(tabSystem.querySelectorAll("[data-tab-panel]"));
    if (!buttons.length || !panels.length) {
        return;
    }

    const validTabIds = new Set(buttons.map((button) => button.dataset.tabTrigger));

    const activateTab = (tabId, syncHash = false) => {
        if (!validTabIds.has(tabId)) {
            return;
        }

        buttons.forEach((button) => {
            const isActive = button.dataset.tabTrigger === tabId;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
            const isActive = panel.id === tabId;
            panel.hidden = !isActive;
            panel.classList.toggle("is-active", isActive);
        });

        if (syncHash) {
            history.replaceState(null, "", `#${tabId}`);
        }
    };

    const tabFromHash = window.location.hash.replace("#", "");
    activateTab(validTabIds.has(tabFromHash) ? tabFromHash : buttons[0].dataset.tabTrigger);

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            activateTab(button.dataset.tabTrigger, true);
        });
    });

    document.querySelectorAll("[data-open-tab]").forEach((link) => {
        link.addEventListener("click", () => {
            const target = link.dataset.openTab;
            if (validTabIds.has(target)) {
                activateTab(target);
            }
        });
    });

    window.addEventListener("hashchange", () => {
        const tabId = window.location.hash.replace("#", "");
        if (validTabIds.has(tabId)) {
            activateTab(tabId);
            const panel = document.getElementById(tabId);
            if (panel) {
                panel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    });
}

function initializeFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const buttons = Array.from(scope.querySelectorAll("[data-filter-value]"));
        const items = Array.from(scope.querySelectorAll("[data-filter-item]"));

        if (!buttons.length || !items.length) {
            return;
        }

        const applyFilter = (filterValue) => {
            buttons.forEach((button) => {
                const isActive = button.dataset.filterValue === filterValue;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            items.forEach((item) => {
                const tags = (item.dataset.tags || "").split(/\s+/).filter(Boolean);
                const isVisible = filterValue === "all" || tags.includes(filterValue);
                item.hidden = !isVisible;
            });
        };

        applyFilter("all");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                applyFilter(button.dataset.filterValue);
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedLanguage = readPreference(PREF_KEYS.language) || "en";
    const savedTheme = readPreference(PREF_KEYS.theme) || (prefersDark ? "dark" : "light");
    const savedSiteStyle = readPreference(PREF_KEYS.siteStyle) || document.documentElement.dataset.defaultStyle || "academic";

    initializePreferenceControls();
    applyLanguage(savedLanguage);
    applyTheme(savedTheme);
    applySiteStyle(savedSiteStyle);
    initializeTabs();
    initializeFilters();
});
