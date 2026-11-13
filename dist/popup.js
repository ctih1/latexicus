const settingIds = ["remove-characters"];

async function initialize() {
    for (const settingId of settingIds) {
        var targetElement = document.getElementById(settingId);
        if (!targetElement) {
            console.warn(`Failed to get element ${settingId}`);
            continue;
        }

        const settingsValue = (await browser.storage.sync.get([settingId]))[settingId];
        if (settingsValue === true) {
            targetElement.checked = true;
        } else if (settingsValue === false) {
            targetElement.checked = false;
        } else {
            targetElement.value = settingsValue;
        }

        targetElement.addEventListener("click", async _ => {
            const settings = {};
            settings[settingId] = document.getElementById(settingId).checked;
            await browser.storage.sync.set(settings);
        });
    }
}

initialize();
