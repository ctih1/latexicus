export class LatexConverter {
    static parseParenthesisContent(
        input: string,
        open: "{" | "[",
        close: "}" | "]"
    ): string[] | undefined {
        let openParenthesis = 0;
        let outputs = [];
        let currentOutput = "";
        for (let char of input) {
            if (char === open) {
                openParenthesis++;
            } else if (char === close) {
                openParenthesis--;
            }
            if (openParenthesis >= 1) {
                currentOutput += char;
            }

            if (openParenthesis === 0 && currentOutput) {
                outputs.push(currentOutput.slice(1));
                currentOutput = "";
            }
        }

        if (openParenthesis !== 0) {
            return undefined;
        }

        return outputs;
    }

    static needsMultiplicationSymbol(previous: string, current: string, next: string): boolean {
        console.log(`${previous},${current},${next}`);

        if (current === "(" || next === "(" || current === ")" || next === ")") return false;
        if (/[*+-]/.test(current) || /[*+-]/.test(next)) return false;
        if (
            ["sin", "cos", "tan"].includes(previous) ||
            ["sin", "cos", "tan"].includes(current) ||
            ["sin", "cos", "tan"].includes(next)
        )
            return false;
        return true;
    }

    static needsParenthesis(previous: string, current: string): "(" | ")" | undefined {
        if (current === "cos" || current === "sin") {
            return "(";
        }
        if (previous === "cos" || previous === "sin") {
            return ")";
        }
    }

    static parseLatexTokenIntoString(token: string): string | undefined {
        token = token.trim().trimEnd();

        const innerContent: string[] = this.parseParenthesisContent(token, "{", "}") || []; // for nested stuff, like \frac{\frac{2}{4}}{8}
        const functionArgs: string[] = this.parseParenthesisContent(token, "[", "]") || []; // such as the [3] in \sqrt[3]{2}, which would be 2^3
        const innerTokens: string[] = [];

        for (const input of innerContent) {
            const parsedToken = this.parseLatexTokenIntoString(input);
            if (!parsedToken) {
                console.error(`Could not parse inner token ${parsedToken}`);
                return undefined;
            }

            innerTokens.push(parsedToken);
        }

        let result = undefined;

        if (/^[0-9\+\-]*$/.test(token)) result = token;
        if (/^[0-9]*\{,\}[0-9]*$/.test(token)) result = token.replace("{,}", ",");

        if (token === "\\cdot") result = "*";
        if (token === "\\sin") result = "sin";
        if (token === "\\cos") result = "cos";
        if (token === "\\left(") result = "(";
        if (token === "\\right)") result = ")";

        if (token.startsWith("\\frac")) {
            result = `${innerTokens[0]}/${innerTokens[1]}`;
        }

        if (token.startsWith("\\sqrt")) {
            result = `√(${innerTokens[0]}${functionArgs.length >= 1 ? ";" + functionArgs[0] : ""})`;
        }

        if (!result) {
            console.error(`Could not parse token "${token}".`);
            return undefined;
        }

        console.debug(`Parsed ${token}->${result}`);

        return result;
    }

    static parse(text: string): string | undefined {
        const splitItems: string[] = text.split(/([\\+\-" "\^])/);

        let outputTokens: string[] = [];

        for (let i = 0; i < splitItems.length; i++) {
            if (i % 2 == 0 && splitItems[i].length >= 1) {
                const token = LatexConverter.parseLatexTokenIntoString(
                    (splitItems[i - 1] || "") + splitItems[i]
                );

                if (!token) {
                    console.warn(`Failed to parse part "${splitItems[i - 1] + splitItems[i]}"`);
                    return;
                }
                outputTokens.push(token);
            }
        }

        outputTokens = outputTokens.filter(i => i !== undefined);

        console.debug(`Output tokens: [${outputTokens.join(";")}]`);

        let outputString = "";
        let previousToken = undefined;

        for (let i = 0; i < outputTokens.length - 1; i++) {
            const nextToken = outputTokens[i + 1];
            const currentToken = outputTokens[i];
            outputString += currentToken;

            if (
                LatexConverter.needsMultiplicationSymbol(
                    previousToken || "",
                    currentToken,
                    nextToken
                )
            ) {
                outputString += "*";
            }
            const parens = LatexConverter.needsParenthesis(previousToken || "", currentToken);
            outputString += parens || "";
            previousToken = currentToken;
        }

        outputString += outputTokens.at(-1);

        return outputString;
    }
}
