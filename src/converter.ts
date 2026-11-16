import { latexParser } from "latex-parser";
import { showNotification } from "./ui";
import { t } from "./localization";

interface FuckedArg {
    type: string;
    latex: { text?: string; latex?: string; arguments?: FuckedArg[]; type: string }[];
}

const funcsWithParenthesis = ["sin", "cos", "tan", "arcsin", "arccos", "arctan", "log", "ln"];

export interface Options {
    stripLetters?: boolean;
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
    console.log(
        `|${"----".repeat(tokenTree.length)}+ ${current.name || current.text}=${current.type} (prev: ${last?.name || last?.text}=${last?.type});${tokenTree.map(a => a.name || a.text).join("->")}`
    );
    if (!last) {
        console.debug("Last token not set, denying *");
        return false;
    }
    if (currentOutput.trimEnd().endsWith("*") || currentOutput.trimEnd().endsWith("(")) {
        console.debug("Current output already has * or ends with (");
        return false;
    }

    const targetCurrentText = current.name || current.text!;
    const targetPrevText = last.name || last.text!;
    if (targetCurrentText.endsWith(")")) {
        console.debug("Current target endswith )");
        return false;
    }
    if (targetPrevText.endsWith("(")) return false;

    if (last.name === "frac" && tokenTree.at(-1)?.name === "frac") {
        console.debug("Inside fraction, denying *");
        return false;
    }

    if (last.type === "TeXRaw") {
        if (last.text!.endsWith("+") || last.text!.endsWith("-") || last.text!.endsWith("^"))
            return false;

        console.log("allowing comma texraw");
        if (!!Number(last.text)) return true;
        if (current.type === "TeXComm") return true;
    } else if (last.type === "TeXComm") {
        if (last.name === "cdot") return false;
        if (current.type === "TeXComm") {
            if (funcsWithParenthesis.includes(last.name!)) return false;
            if (tokenTree.at(-1)?.name === "sqrt") return false;
            if (last.name === "frac" && current.name === "frac") return false;
            console.log("allowing comma texcomm");

            return true;
        }
    }

    return false;
}

export async function convertToString(
    token: FuckedToken,
    previousToken: FuckedToken | undefined,
    tokenTree: FuckedToken[] = [],
    options: Options = {}
): Promise<[string, FuckedToken]> {
    // console.log(
    //     `|${"----".repeat(tokenTree.length)}+ ${token.name || token.text}=${token.type} (prev: ${previousToken?.name || previousToken?.text}=${previousToken?.type});${tokenTree.map(a => a.name || a.text).join("->")}`
    // );
    let output = "";

    // console.log(JSON.stringify({ nested: nested, ...token }, undefined, 2));

    if (token.type === "TeXRaw") {
        const stripLettersRegex = /([0-9]+)[A-Za-z]+(.*)/;
        if (options.stripLetters && stripLettersRegex.test(token.text!)) {
            const result = stripLettersRegex.exec(token.text!)!;
            token.text = result[1] + result[2];
        }

        if (
            previousToken &&
            funcsWithParenthesis.includes(previousToken.name || "") &&
            !token.text!.startsWith("(")
        ) {
            token.text = "(" + token.text + ")";
        }

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
                    let lastToken = undefined;

                    for (let j = 0; j < arg.latex.length; j++) {
                        const [value, parsedToken] = await convertToString(
                            arg.latex[j] as FuckedToken,
                            lastToken || token,
                            [...tokenTree, token],
                            options
                        );
                        tempResult += value;
                        lastToken = parsedToken;
                    }
                    if (/[\*\-\+\/]/.test(tempResult)) {
                        tempResult = `(${tempResult})`;
                    }
                    result[i] = tempResult;
                }

                output += `(${result[0]}/${result[1]})`;

                break;
            }
            case "sqrt": {
                let nthRoot = "2";
                let value = "";
                let lastToken = undefined;

                for (const arg of token.arguments) {
                    if (arg.type === "OptArg") {
                        nthRoot = arg.latex[0].text!;
                    } else {
                        for (const secondArg of arg.latex) {
                            const [parsedValue, parsedToken] = await convertToString(
                                secondArg as FuckedToken,
                                lastToken || token,
                                [...tokenTree, token],
                                options
                            );
                            lastToken = parsedToken;
                            value += parsedValue;
                        }
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
            case "arctan":
            case "log":
            case "ln": {
                output += token.name;
                break;
            }

            default: {
                showNotification(
                    await t("notification_unrecogn_token", { token: token.name! }),
                    8000,
                    "error"
                );
                break;
            }
        }
    }

    if (needsMultiplication(token, previousToken, output, tokenTree)) {
        output = "*" + output;
    }

    return [output, token];
}

export async function parseEntireCalculation(calc: string, options: Options = {}): Promise<string> {
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
        const [val, parsedToken] = await convertToString(
            token as FuckedToken,
            lastToken,
            undefined,
            options
        );
        lastToken = parsedToken;
        output += val;
        lastToken = token as FuckedToken;
    }

    return output;
}
