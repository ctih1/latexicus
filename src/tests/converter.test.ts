import { expect, test } from "vitest";
import { latexParser } from "latex-parser";
import { convertToString } from "../converter";

// test("Separation of parts", () => {
//     expect(LatexConverter.parseParenthesisContent("\\frac{2}{4}", "{", "}")).toStrictEqual([
//         "2",
//         "4"
//     ]);
//     expect(
//         LatexConverter.parseParenthesisContent("\\frac{\\frac{2}{8}}{Pi\\cdot8}", "{", "}")
//     ).toStrictEqual(["\\frac{2}{8}", "Pi\\cdot8"]);
// });

// test("Is complete token", () => {
//     expect(LatexConverter.isTokenComplete("\\unknown")).toBe(false);
//     expect(LatexConverter.isTokenComplete("\\fra")).toBe(false);
//     expect(LatexConverter.isTokenComplete("\\frac")).toBe(false);
//     expect(LatexConverter.isTokenComplete("\\frac{8}")).toBe(false);
//     expect(LatexConverter.isTokenComplete("\\frac{8}{4}")).toBe(true);
//     expect(LatexConverter.isTokenComplete("\\frac{\\frac{8}{4}}{4}")).toBe(true);

//     expect(LatexConverter.isTokenComplete("2Pi", "\\")).toBe(true);
//     expect(LatexConverter.isTokenComplete("2P", "i")).toBe(false);
// });

// test("All-in-one equation tests", () => {
//     const testString = "2Pi\\cdot \\frac{r^3}{\\sqrt[8]{6{,}561}}";
//     console.log(LatexConverter.parse(testString));
//     console.log(LatexConverter.parseParenthesisContent("\\frac{\\frac{2}{4}}{2}", "{", "}"));
// });

test("test", () => {
    let out = "";
    let lastToken = undefined;
    for (const token of latexParser.parse(
        "\\sqrt{\\frac{52^2}{\\frac{24}{18}Pi}}\\sin(15)-2"
            .replaceAll("{,}", ".")
            .replaceAll("°", "")
            .replaceAll("\\left", "")
            .replaceAll("\\right", "")
            .replaceAll("Pi", "\\Pi")
            .replaceAll("pi", "\\pi")
    ).value!) {
        out += convertToString(token, lastToken, out);
        lastToken = token;
    }
    console.log();
    console.log(out);
});
