import { expect, test } from "vitest";
import { latexParser } from "latex-parser";
import {
    convertToString,
    FuckedToken,
    needsMultiplication,
    parseEntireCalculation
} from "../converter";


test("basic multiplication detection with numbers", () => {
    let tokens: FuckedToken[] = latexParser.parse("4+2").value as FuckedToken[];
    expect(needsMultiplication(tokens[0], undefined, "")).toBe(false);

    tokens = latexParser.parse("8-16.5").value as FuckedToken[];
    expect(needsMultiplication(tokens[0], undefined, "")).toBe(false);

    tokens = latexParser.parse("8\\pi").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(true);
});

test("basic multiplication detection with division", () => {
    let tokens: FuckedToken[] = latexParser.parse("\\frac{4}{8}\\pi").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(true);
    tokens = latexParser.parse("\\frac{4}{8}+8").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
    tokens = latexParser.parse("\\frac{4}{8}-8").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
});

test("multiplication detection with two functions", () => {
    let tokens = latexParser.parse("\\sin (50)\\sin(20)").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
    expect(needsMultiplication(tokens[2], tokens[1], "")).toBe(true);
    tokens = latexParser.parse("\\sin (50)+\\sin(20)").value as FuckedToken[];
    expect(needsMultiplication(tokens[2], tokens[1], "")).toBe(false);
});

test("simple division", () => {
    expect(parseEntireCalculation("\\frac{4}{8}")).toBe("(4/8)");
});

test("nested division", () => {
    expect(parseEntireCalculation("\\frac{\\frac{4}{8}}{\\frac{4}{8}}")).toBe("((4/8)/(4/8))");
    expect(parseEntireCalculation("\\frac{\\frac{4}{8}}{\\frac{4}{\\frac{4}{8}}}")).toBe(
        "((4/8)/(4/(4/8)))"
    );
});

test("division with multiplication", () => {
    expect(parseEntireCalculation("\\frac{4}{8}\\pi")).toBe("(4/8)*pi");
});

test("division with inner functions", () => {
    expect(parseEntireCalculation("\\frac{\\frac{2}{8}}{Pi\\cdot8}")).toBe("((2/8)/pi*8)");
});

test("simple multiplication", () => {
    expect(parseEntireCalculation("8\\cdot8")).toBe("8*8");
    expect(parseEntireCalculation("-8\\cdot8")).toBe("-8*8");
});

test("multiplication with functions on one side", () => {
    expect(parseEntireCalculation("52\\sin(52)")).toBe("52*sin(52)");
    expect(parseEntireCalculation("(52\\cdot52)\\sin(52)")).toBe("(52*52)*sin(52)");
    expect(parseEntireCalculation("\\frac{52}{52}\\sin(52)")).toBe("(52/52)*sin(52)");
});

test("multiplication with functions on both sides", () => {
    expect(
        parseEntireCalculation("\\sin \\left(50\\right)\\sin \\left(20\\right)").replaceAll(" ", "")
    ).toBe("sin(50)*sin(20)");
});

test("exponents", () => {
    expect(parseEntireCalculation("2^2")).toBe("2^2");
    expect(parseEntireCalculation("2^{2.5}")).toBe("2^2.5");
    expect(parseEntireCalculation("2^{\\frac{2.5}{8}}")).toBe("2^(2.5/8)");
});

test("sqrt", () => {
    expect(parseEntireCalculation("\\sqrt{25}")).toBe("√(25;2)");
    expect(parseEntireCalculation("\\sqrt[3]{100}")).toBe("√(100;3)");
    expect(parseEntireCalculation("8\\sqrt{8}")).toBe("8*√(8;2)");
    expect(parseEntireCalculation("\\sqrt{2}^2")).toBe("√(2;2)^2");
});


// more advanced factorials arent supported yet, aka like (5-2)!
test("simple factorial", () => {
    expect(parseEntireCalculation("5!")).toBe("5*4*3*2*1");
    expect(parseEntireCalculation("8!")).toBe("8*7*6*5*4*3*2*1");
})