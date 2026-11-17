import { localizeAll } from "./localization";

const SETTING_IDS = [
    "remove-characters",
    "hide-green-dot",
    "equals-strategy",
    "lang-select",
    "hide-error-prompt",
    "always-convert",
    "b-tools"
];

const DEFAULT_VALUES: { [key: string]: string } = {
    "equals-strategy": "left",
    "lang-select": "en"
};

async function initializeSettings() {
    for (const settingId of SETTING_IDS) {
        const targetElement: HTMLInputElement | null = document.getElementById(
            settingId
        ) as HTMLInputElement | null;
        if (!targetElement) {
            console.warn(`Failed to get element ${settingId}`);
            continue;
        }

        let settingsValue: any = (await browser.storage.sync.get([settingId]))[settingId];
        if (settingsValue === undefined) {
            settingsValue = DEFAULT_VALUES[settingId] || false;
            const settings: { [k: string]: any } = {};
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
            const settings: { [k: string]: any } = {};
            const element = document.getElementById(settingId) as HTMLInputElement | null;
            if (!element) {
                console.warn("Failed to get change element");
                return;
            }
            settings[settingId] = element.value === "on" ? element.checked : element.value;
            await browser.storage.sync.set(settings);
        });
    }

    updateEqualsStratVisualisation();
}

function updateEqualsStratVisualisation() {
    let equalsStratResult = "";
    switch ((document.getElementById("equals-strategy")! as HTMLInputElement).value) {
        case "left":
            equalsStratResult = "120*2*3";
            break;
        case "right":
            equalsStratResult = "240*2";
            break;
        case "longer":
            equalsStratResult = "120*2*3";
            break;
    }

    document.getElementById("processed-result")!.innerText = equalsStratResult;
}

document
    .getElementById("equals-strategy")!
    .addEventListener("change", _ => updateEqualsStratVisualisation());

const currentLanguageElement: HTMLInputElement = document.getElementById(
    "lang-select"
) as HTMLInputElement;

currentLanguageElement.addEventListener("change", async _ => await localizeAll());

initializeSettings().then(_ => {
    localizeAll();
});
