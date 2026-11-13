import { parseEntireCalculation } from "./converter";
import { addLatexicusIndicator, showNotification } from "./ui";

if (window) {
    showNotification("Loaded Latexicus", 3000);
    addLatexicusIndicator();
    addEventListener("paste", async e => {
        if (!e.clipboardData) {
            return;
        }
        let text = e.clipboardData.getData("text").replaceAll(" ", "");

        if (!text.includes("\\")) {
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

        const convertedText = parseEntireCalculation(text, {
            stripLetters: shouldRemoveCharacters || false
        });
        const mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();

        document.execCommand("insertText", false, convertedText);

        if (/(sin|cos|tan)[0-9]+/.test(text)) {
            showNotification(
                "Detected sin/cos/tan without parenthesis. This will produce unexpected results",
                15000,
                "error"
            );
        } else {
            showNotification("Successfully converted!", 4000);
        }
    });
}
