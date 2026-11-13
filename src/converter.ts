import { latexParser } from "latex-parser";
import { showNotification } from "./ui";

interface FuckedArg {
    type: string;
    latex: { text?: string; latex?: string; arguments?: FuckedArg[]; type: string }[];
}

export interface FuckedToken {
    type: string;
    arguments: FuckedArg[];
    name?: string;
    text?: string;
}

export function needsMultiplication(
    current: FuckedToken,
    last: FuckedToken | undefined,
    currentOutput: string,
    tokenTree: FuckedToken[] = []
): boolean {
    // console.log(
    //     `Comma: ${last?.name || last?.text}=${last?.type}|${current.name || current.text}=${current.type};${currentOutput}`
    // );
    if (!last) return false;
    if (currentOutput.trimEnd().endsWith("*") || currentOutput.trimEnd().endsWith("(")) {
        return false;
    }

    const targetCurrentText = current.name || current.text!;
    const targetPrevText = last.name || last.text!;
    if (targetCurrentText.endsWith(")")) return false;
    if (targetPrevText.endsWith("(")) return false;

    if (tokenTree.at(-1)?.name === "frac") {
        return false;
    }
    if (last.type === "TeXComm") {
        if (last.name === "cdot") return false;
    }
    if (last.type === "TeXRaw") {
        if (last.text!.endsWith("+") || last.text!.endsWith("-") || last.text!.endsWith("^"))
            return false;
        console.log("allowign comma");
        if (!!Number(last.text)) return true;
        if (current.type === "TeXComm") return true;
    } else if (last.type === "TeXComm") {
        if (current.type === "TeXComm") {
            if (last.name === "frac" && current.name === "frac") return false;
            console.log("allowign comma");

            return true;
        }
    }

    return false;
}

export function convertToString(
    token: FuckedToken,
    previousToken: FuckedToken | undefined,
    nested: number = 0,
    tokenTree: FuckedToken[] = []
): string {
    console.log(
        `|${"----".repeat(nested)}+ ${token.name || token.text} (prev: ${previousToken?.name || previousToken?.text}=${previousToken?.type});${tokenTree.map(a => a.name || a.text).join("->")}`
    );
    let output = "";

    // console.log(JSON.stringify({ nested: nested, ...token }, undefined, 2));

    if (token.type === "TeXRaw") {
        const value = Number(token.text!.replace("!", ""));
        if (token.text?.endsWith("!") && !isNaN(value)) {
            for (let i = value; i > 0; i--) {
                output += i + "*";
            }
            output = output.slice(0, output.length - 1);
        } else {
            output += token.text;
        }
    } else if (token.type === "TeXComm") {
        switch (token.name) {
            case "cdot": {
                output += "*";
                break;
            }
            case "frac": {
                let result: (string | undefined)[] = [undefined, undefined];

                for (let i = 0; i < token.arguments.length; i++) {
                    const arg = token.arguments[i];
                    let tempResult = "";

                    for (let j = 0; j < arg.latex.length; j++) {
                        tempResult += convertToString(
                            arg.latex[j] as FuckedToken,
                            token,
                            nested + 1,
                            [...tokenTree, token]
                        );
                    }
                    result[i] = tempResult;
                }

                output += `(${result[0]}/${result[1]})`;

                break;
            }
            case "sqrt": {
                let nthRoot = "2";
                let value = undefined;

                for (const arg of token.arguments) {
                    if (arg.type === "OptArg") {
                        nthRoot = arg.latex[0].text!;
                    } else {
                        value = convertToString(arg.latex[0] as FuckedToken, token, nested + 1, [
                            ...tokenTree,
                            token
                        ]);
                    }
                }

                output += `√(${value};${nthRoot})`;
                break;
            }
            case "pi":
            case "Pi": {
                output += "pi";
                break;
            }

            case "sin":
            case "cos":
            case "tan":
            case "arcsin":
            case "arccos":
            case "arctan": {
                output += token.name;
                break;
            }

            default: {
                showNotification(`Unrecognized token "${token.name}"`, 8000, "error");
                break;
            }
        }
    }

    if (needsMultiplication(token, previousToken, output, tokenTree)) {
        output = "*" + output;
    }

    return output;
}

export function parseEntireCalculation(calc: string): string {
    let lastToken: FuckedToken | undefined = undefined;
    let output = "";
    for (const token of latexParser
        .parse(
            calc
                .replaceAll("{,}", ".")
                .replaceAll("°", "")
                .replaceAll("\\left", "")
                .replaceAll("\\right", "")
                .replaceAll("\\pi", "pi")
                .replaceAll("\\Pi", "Pi")
                .replaceAll("Pi", "\\Pi")
                .replaceAll("pi", "\\pi")
                .replaceAll(" ", "")
        )
        .value!.flat(Infinity)) {
        output += convertToString(token as FuckedToken, lastToken);
        lastToken = token as FuckedToken;
    }

    return output;
}
