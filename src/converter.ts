export interface FuckedArg {
    type: string;
    latex: { text?: string; latex?: string; arguments?: FuckedArg[]; type: string }[];
}

export interface FuckedToken {
    type: string;
    arguments: FuckedArg[];
    name?: string;
    text?: string;
}

export function convertToString(
    token: FuckedToken,
    previousToken: FuckedToken | undefined,
    nested: number = 0
) {
    console.log(
        `|${"----".repeat(nested)}+ ${token.name || token.text} (prev: ${previousToken?.name || previousToken?.text}=${previousToken?.type})`
    );
    let output = "";

    let handledLatexIndices = 0;

    // console.log(JSON.stringify({ nested: nested, ...token }, undefined, 2));

    // @ts-ignore
    if (token.type === "TeXRaw") {
        // @ts-ignore
        output += token.text;
    }
    // @ts-ignore
    else if (token.type === "TeXComm") {
        // @ts-ignore
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
                    // @ts-ignore

                    for (let j = 0; j < arg.latex.length; j++) {
                        tempResult += convertToString(
                            arg.latex[j] as FuckedToken,
                            token,
                            nested + 1
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
                        value = convertToString(arg.latex[0] as FuckedToken, token, nested + 1);
                    }
                }

                handledLatexIndices++;

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
        }
    }

    if (
        previousToken && !output.trimEnd().endsWith("*") &&
        ((previousToken.type === "TeXRaw" && !!Number(previousToken.text)) ||
            (previousToken.type === "TeXComm" && token.type === "TeXComm"))
    ) {
        console.log(
            `Comma: ${previousToken.name || previousToken.text}=${previousToken.type}|${token.name || token.text}=${token.type};${output}`
        );
        output = "*" + output;
    }

    return output;
}
