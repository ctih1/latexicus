import { latexParser } from "latex-parser";
import { parseEntireCalculation, FuckedToken } from "./converter";
import { addLatexicusIndicator, showNotification } from "./ui";

if (window) {
    showNotification("Loaded Latexicus", 3000);
    addLatexicusIndicator();
    addEventListener("paste", e => {
        if (!e.clipboardData) {
            return;
        }
        let text = e.clipboardData.getData("text");

        const convertedText = parseEntireCalculation(text);
        const mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();

        document.execCommand("insertText", false, convertedText);
        e.preventDefault();
        showNotification("Successfully converted!", 4000);
    });
}
