import { expect, expectTypeOf, it, test } from "vitest";
import { latexParser } from "latex-parser";
import {
    convertToString,
    FuckedToken,
    needsMultiplication,
    parseEntireCalculation
} from "../converter";

test("basic multiplication detection with numbers", async () => {
    let tokens: FuckedToken[] = latexParser.parse("4+2").value as FuckedToken[];
    expect(needsMultiplication(tokens[0], undefined, "")).toBe(false);

    tokens = latexParser.parse("8-16.5").value as FuckedToken[];
    expect(needsMultiplication(tokens[0], undefined, "")).toBe(false);

    tokens = latexParser.parse("8\\pi").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(true);
});

test("basic multiplication detection with division", async () => {
    let tokens: FuckedToken[] = latexParser.parse("\\frac{4}{8}\\pi").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(true);
    tokens = latexParser.parse("\\frac{4}{8}+8").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
    tokens = latexParser.parse("\\frac{4}{8}-8").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
});

test("multiplication detection with two functions", async () => {
    let tokens = latexParser.parse("\\sin (50)\\sin(20)").value as FuckedToken[];
    expect(needsMultiplication(tokens[1], tokens[0], "")).toBe(false);
    expect(needsMultiplication(tokens[2], tokens[1], "")).toBe(true);
    tokens = latexParser.parse("\\sin (50)+\\sin(20)").value as FuckedToken[];
    expect(needsMultiplication(tokens[2], tokens[1], "")).toBe(false);
});

test("simple division", async () => {
    expect(await parseEntireCalculation("\\frac{4}{8}")).toBe("(4/8)");
});

test("nested division", async () => {
    expect(await parseEntireCalculation("\\frac{\\frac{4}{8}}{\\frac{4}{8}}")).toBe(
        "(((4/8))/((4/8)))"
    );
    expect(await parseEntireCalculation("\\frac{\\frac{4}{8}}{\\frac{4}{\\frac{4}{8}}}")).toBe(
        "(((4/8))/((4/((4/8)))))"
    );

    expect(await parseEntireCalculation("\\frac{1}{5\\cdot \\frac{1}{1{,}5}}")).toBe(
        "(1/(5*(1/1.5)))"
    );

    expect(await parseEntireCalculation("\\frac{1}{1\\cdot \\frac{1}{8Pi}}")).toBe(
        "(1/(1*(1/(8*pi))))"
    );
});

test("division with multiplication", async () => {
    expect(await parseEntireCalculation("\\frac{4}{8}\\pi")).toBe("(4/8)*pi");
});

test("division with inner functions", async () => {
    expect(await parseEntireCalculation("\\frac{\\frac{2}{8}}{Pi\\cdot8}")).toBe(
        "(((2/8))/(pi*8))"
    );
});

test("simple multiplication", async () => {
    expect(await parseEntireCalculation("8\\cdot8")).toBe("8*8");
    expect(await parseEntireCalculation("-8\\cdot8")).toBe("-8*8");
    expect(await parseEntireCalculation("-8\\cdot-8")).toBe("-8*-8");
});

test("multiplication with functions on one side", async () => {
    expect(await parseEntireCalculation("52\\sin(52)")).toBe("52*sin(52)");
    expect(await parseEntireCalculation("(52\\cdot52)\\sin(52)")).toBe("(52*52)*sin(52)");
    expect(await parseEntireCalculation("\\frac{52}{52}\\sin(52)")).toBe("(52/52)*sin(52)");
    expect(
        await parseEntireCalculation("\\sin \\left(50\\right)\\cdot \\cos \\left(20\\right)")
    ).toBe("sin(50)*cos(20)");
    expect(
        await parseEntireCalculation("\\sin \\left(50\\right)\\cdot \\cos \\left(20\\right)")
    ).toBe("sin(50)*cos(20)");

    expect(
        await parseEntireCalculation(
            "5+\\left(\\sin \\left(50\\right)\\cdot \\cos \\left(20\\right)\\right)"
        )
    ).toBe("5+(sin(50)*cos(20))");
});

test("multiplication with functions on both sides", async () => {
    expect(
        (await parseEntireCalculation("\\sin \\left(50\\right)\\sin \\left(20\\right)")).replaceAll(
            " ",
            ""
        )
    ).toBe("sin(50)*sin(20)");
});

test("exponents", async () => {
    // expect(await parseEntireCalculation("2^2")).toBe("2^2");
    // expect(await parseEntireCalculation("2^{2.5}")).toBe("2^2.5");
    // expect(await parseEntireCalculation("2^{\\frac{2.5}{8}}")).toBe("2^(2.5/8)");
    expect(await parseEntireCalculation("8^{12}+8")).toBe("8^12+8");
});

test("basic sqrt", async () => {
    expect(await parseEntireCalculation("\\sqrt{25}")).toBe("√(25;2)");
    expect(await parseEntireCalculation("\\sqrt[3]{100}")).toBe("√(100;3)");
    expect(await parseEntireCalculation("8\\sqrt{8}")).toBe("8*√(8;2)");
    expect(await parseEntireCalculation("\\sqrt{2}^2")).toBe("√(2;2)^2");
});

test("sqrt with nested values", async () => {
    expect(await parseEntireCalculation("\\sqrt{\\frac{100}{4}}")).toBe("√((100/4);2)");
    expect(await parseEntireCalculation("\\sqrt{\\frac{100\\cdot8}{4}}")).toBe("√(((100*8)/4);2)");
    expect(await parseEntireCalculation("\\sqrt{2{,}5\\cdot10}")).toBe("√(2.5*10;2)");
    expect(await parseEntireCalculation("\\sqrt{8}\\cdot5")).toBe("√(8;2)*5");
    expect(await parseEntireCalculation("\\sqrt{\\frac{100}{4}}\\cdot8")).toBe("√((100/4);2)*8");
});

// more advanced factorials arent supported yet, aka like (5-2)!
test("simple factorial", async () => {
    expect(await parseEntireCalculation("5!", { allowBSectionTools: true })).toBe("(5*4*3*2*1)");
    expect(await parseEntireCalculation("8!", { allowBSectionTools: true })).toBe(
        "(8*7*6*5*4*3*2*1)"
    );
});

test("test stripping letters", async () => {
    expect(await parseEntireCalculation("5N\\cdot8kg", { stripLetters: true })).toBe("5*8");
    expect(await parseEntireCalculation("5\\cdot8kg", { stripLetters: true })).toBe("5*8");
    expect(await parseEntireCalculation("5Pi", { stripLetters: true })).toBe("5*pi");
    expect(await parseEntireCalculation("5N\\cdot8kg^2", { stripLetters: true })).toBe("5*8^2");
    expect(await parseEntireCalculation("0{,}005kg", { stripLetters: true })).toBe("0.005");
});

test("logarithms", async () => {
    expect(await parseEntireCalculation("\\log 20")).toBe("log(20)");
    expect(await parseEntireCalculation("\\ln 20")).toBe("ln(20)");
});

test.each([["sin"], ["cos"], ["tan"], ["arcsin"], ["arccos"], ["arctan"]])(
    "functions that require parenthesis $0",
    async mathFunc => {
        expect(await parseEntireCalculation(`\\${mathFunc}(50)`)).toBe(`${mathFunc}(50)`);
        expect(await parseEntireCalculation(`\\${mathFunc}(50)`, { stripLetters: true })).toBe(
            `${mathFunc}(50)`
        );
        expect(await parseEntireCalculation(`\\${mathFunc} 50`)).toBe(`${mathFunc}(50)`);
        expect(await parseEntireCalculation(`\\${mathFunc}(50\\cdot2)`)).toBe(`${mathFunc}(50*2)`);
        expect(await parseEntireCalculation(`\\${mathFunc}(50)\\cdot2`)).toBe(`${mathFunc}(50)*2`);
        expect(await parseEntireCalculation(`\\${mathFunc} 50\\cdot8`)).toBe(`${mathFunc}(50)*8`);
        expect(await parseEntireCalculation(`\\${mathFunc}(\\frac{50}{2})`)).toBe(
            `${mathFunc}((50/2))`
        );
        expect(await parseEntireCalculation(`\\${mathFunc}(\\frac{50}{\\frac{2}{2}})`)).toBe(
            `${mathFunc}((50/((2/2))))`
        );
        expect(await parseEntireCalculation(`\\${mathFunc} \\frac{50}{\\frac{2}{2}}`)).toBe(
            `${mathFunc}(50/((2/2)))`
        );
        expect(await parseEntireCalculation(`\\${mathFunc} 20\\cdot 8`)).toBe(`${mathFunc}(20)*8`);
    }
);

test("advanced factorial", async () => {
    expect(await parseEntireCalculation("(5-2)!")).toBe("(5-2)!");
    expect(await parseEntireCalculation("(5-2)!", { allowBSectionTools: true })).toBe("(3*2*1)");
    expect(await parseEntireCalculation("(8-2)!", { allowBSectionTools: true })).toBe(
        "(6*5*4*3*2*1)"
    );
    expect(await parseEntireCalculation("(10/2)!", { allowBSectionTools: true })).toBe(
        "(5*4*3*2*1)"
    );
    expect(await parseEntireCalculation("5!(4-2)", { allowBSectionTools: true })).toBe(
        "(5*4*3*2*1)*(4-2)"
    );
    expect(await parseEntireCalculation("5!*(4-2)", { allowBSectionTools: true })).toBe(
        "(5*4*3*2*1)*(4-2)"
    );
    expect(await parseEntireCalculation("5!5!", { allowBSectionTools: true })).toBe(
        "(5*4*3*2*1)*(5*4*3*2*1)"
    );
    expect(await parseEntireCalculation("3!(5-3)!", { allowBSectionTools: true })).toBe(
        "(3*2*1)*(2*1)"
    );
});

test("binoms", async () => {
    expect(await parseEntireCalculation("\\binom{5}{3}", { allowBSectionTools: false })).toBe("");
    expect(await parseEntireCalculation("\\binom{5}{3}", { allowBSectionTools: true })).toBe(
        "(((5*4*3*2*1))/((3*2*1)*(2*1)))"
    );

    expect(await parseEntireCalculation("\\binom{5}{3}\\cdot8", { allowBSectionTools: true })).toBe(
        "(((5*4*3*2*1))/((3*2*1)*(2*1)))*8"
    );
});
