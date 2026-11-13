const settingIds = ["remove-characters", "hide-green-dot", "equals-strategy"];

const defaultValues = {
    "equals-strategy": "left"
};

async function initialize() {
    for (const settingId of settingIds) {
        var targetElement = document.getElementById(settingId);
        if (!targetElement) {
            console.warn(`Failed to get element ${settingId}`);
            continue;
        }

        let settingsValue = (await browser.storage.sync.get([settingId]))[settingId];
        if (settingsValue === undefined) {
            settingsValue = defaultValues[settingId] || false;
            const settings = {};
            settings[settingId] = settingsValue;
            await browser.storage.sync.set(settings);
        }
        if (settingsValue === true) {
            targetElement.checked = true;
        } else if (settingsValue === false) {
            targetElement.checked = false;
        } else {
            targetElement.value = settingsValue;
        }

        targetElement.addEventListener("change", async _ => {
            const settings = {};
            const element = document.getElementById(settingId);
            settings[settingId] = element.value === "on" ? element.checked : element.value;
            await browser.storage.sync.set(settings);
        });
    }
}

function updateEqualsStratVisualisation() {
    let equalsStratResult = "";
    switch (document.getElementById("equals-strategy").value) {
        case "left":
            equalsStratResult = "120*2";
            break;
        case "right":
            equalsStratResult = "240";
            break;
        case "longer":
            equalsStratResult = "120*2";
            break;
    }

    document.getElementById("processed-result").innerText = equalsStratResult;
}

updateEqualsStratVisualisation();
document
    .getElementById("equals-strategy")
    .addEventListener("change", _ => updateEqualsStratVisualisation());

initialize();
