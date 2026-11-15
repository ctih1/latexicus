import en from "./localization/en.json";
import fi from "./localization/fi.json";

const LOCALES: { [key: string]: Map<string, string> } = {
    en: new Map(Object.entries(en)),
    fi: new Map(Object.entries(fi))
};

export async function t(
    key: string,
    vars: { [key: string]: string } = {},
    language: string | undefined = undefined
): Promise<string> {
    const lang: string =
        language || ((await browser.storage.sync.get("lang-select"))["lang-select"] as string);

    const languageKeys = LOCALES[lang];

    let value = languageKeys.get(key) || key;

    const varKeys = new Map(Object.entries(vars));
    for (const key of Array.from(varKeys.keys())) {
        value = value.replaceAll(`{${key as string}}`, varKeys.get(key as string) as string);
    }
    return value;
}

export async function localizeAll() {
    const lang: string = (await browser.storage.sync.get("lang-select"))["lang-select"] as string;

    const languageKeys = LOCALES[lang];

    // the for loop for some reason wouldnt work with for(const [k,v] of languageKeys(.entries())) so using this.
    for (const key of Array.from(languageKeys.keys())) {
        const targetElement = document.getElementById(key);
        if (!targetElement) {
            continue;
        }
        targetElement.innerHTML = await t(key, undefined, lang)!;
    }
}
