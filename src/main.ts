import { latexParser } from "latex-parser";
import { convertToString, FuckedToken } from "./converter";

console.log("Loaded latexicus!");
if (window) {
    addEventListener("paste", e => {
        if (!e.clipboardData) {
            return;
        }
        let text = e.clipboardData.getData("text");

        let out = "";
        let lastToken = undefined;
        for (const token of latexParser.parse(
            text
                .replaceAll("{,}", ".")
                .replaceAll("°", "")
                .replaceAll("\\left", "")
                .replaceAll("\\right", "")
                .replaceAll("Pi", "\\Pi")
                .replaceAll("pi", "\\pi")
                .split("=")[0]
        ).value!) {
            out += convertToString(token as FuckedToken, lastToken as FuckedToken);
            lastToken = token;
        }

        const mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();

        document.execCommand("insertText", false, out);
        e.preventDefault();
    });
}
