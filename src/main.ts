import { latexParser } from "latex-parser";
import { parseEntireCalculation, FuckedToken } from "./converter";

console.log("Loaded latexicus!");
if (window) {
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
    });
}
