import { parseEntireCalculation, FuckedToken } from "./converter";
import { addLatexicusIndicator, showNotification } from "./ui";

if (window) {
    showNotification("Loaded Latexicus", 3000);
    addLatexicusIndicator();
    addEventListener("paste", e => {
        if (!e.clipboardData) {
            return;
        }
        let text = e.clipboardData.getData("text").replaceAll(" ", "");

        if(!text.includes("\\")) {
            return;
        }

        const convertedText = parseEntireCalculation(text);
        const mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();

        document.execCommand("insertText", false, convertedText);
        e.preventDefault();

        if(/(sin|cos|tan)[0-9]+/.test(text)) {
            showNotification("Detected sin/cos/tan without parenthesis. This will produce unexpected results", 15000, "error")
        } else {
            showNotification("Successfully converted!", 4000);
        }
    });
}
