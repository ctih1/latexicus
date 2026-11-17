import { parseEntireCalculation } from "./converter";
import { addLatexicusIndicator, showNotification } from "./ui";

import { t } from "./localization";

if (window) {
    (async () => {
        showNotification(await t("notification_loaded"), 3000);
        addLatexicusIndicator();
        addEventListener("paste", async e => {
            document.getElementById("report-section")!.style.display = "none";

            if (!e.clipboardData) {
                return;
            }
            
            
            let text = e.clipboardData.getData("text").replaceAll(" ", "");

            if (!text.includes("\\") && !(await browser.storage.sync.get("always-convert"))["always-convert"]) {
                return;
            }

            e.preventDefault();

            const shouldRemoveCharacters: boolean | undefined = (
                await browser.storage.sync.get(["remove-characters"])
            )["remove-characters"] as boolean | undefined;

            const equalsSplitStrat: string | undefined = (
                await browser.storage.sync.get(["equals-strategy"])
            )["equals-strategy"] as string | undefined;

            if (text.includes("=")) {
                const parts = text.split("=", 2);
                console.log(parts);
                if (equalsSplitStrat === "left") {
                    text = parts[0];
                }
                if (equalsSplitStrat === "right") {
                    text = parts[1];
                }
                if (equalsSplitStrat === "longer") {
                    text = parts[0].length > parts[1].length ? parts[0] : parts[1];
                }
            }

            const convertedText = await parseEntireCalculation(text, {
                stripLetters: shouldRemoveCharacters || false
            });
            const mathInput = document.getElementsByTagName("input")[0];
            mathInput.focus();

            document.execCommand("insertText", false, convertedText);

            document.body.dataset.latexicusInput = text;
            document.body.dataset.latexicusOutput = convertedText;

            setTimeout(() => {
                document.getElementById("report-section")!.style.display = "flex";
            }, 250);

            if (/(sin|cos|tan)[0-9]+/.test(text) && false) {
                showNotification(await t("notification_sincos_error"), 15000, "error");
            } else {
                showNotification(await t("notification_converted"), 4000);
            }
        });
    })();
}
