import { expect, test } from "vitest";
import { LatexConverter } from "../parser";

test("All-in-one equation tests", () => {
    const testString = "2Pi\\cdot \\frac{r^3}{\\sqrt[8]{6{,}561}}";
    console.log(testString.split(/([\\+\-" "\^])/));
    console.log(LatexConverter.parse(testString));
});
