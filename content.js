"use strict";
function findParenthesisContent(input, open, close) {
    let openParenthesis = 0;
    let outputs = [];
    let currentOutput = "";
    for (let char of input) {
        if (char === open) {
            openParenthesis++;
        }
        else if (char === close) {
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
function needsMultiplication(previous, current, next) {
    console.log(`${previous},${current},${next}`);
    if (current === "(" || next === "(" || current === ")" || next === ")")
        return false;
    if (/[*+-]/.test(current) || (/[*+-]/.test(next)))
        return false;
    if (["sin", "cos", "tan"].includes(previous) || ["sin", "cos", "tan"].includes(current) || ["sin", "cos", "tan"].includes(next))
        return false;
    return true;
}
function parseLatexTokenIntoString(token) {
    token = token.trim().trimEnd();
    const innerInputs = findParenthesisContent(token, "{", "}") || [];
    const functionArgs = findParenthesisContent(token, "[", "]") || [];
    const innerTokens = [];
    for (const input of innerInputs) {
        innerTokens.push(parseLatexTokenIntoString(input));
    }
    if (/^[0-9\+\-]*$/.test(token)) {
        return token;
    }
    if (/^[0-9]*\{,\}[0-9]*$/.test(token)) {
        return token.replace("{,}", ",");
    }
    if (token === "\\cdot") {
        return "*";
    }
    if (token === "\\sin") {
        return "sin";
    }
    if (token === "\\cos") {
        return "cos";
    }
    if (token === "\\left(") {
        return "(";
    }
    if (token === "\\right)") {
        return ")";
    }
    if (token.startsWith("\\sqrt")) {
        return `√(${innerTokens[0]}${functionArgs.length >= 1 ? ";" + functionArgs[0] : ""})`;
    }
    if (token.startsWith("\\frac")) {
        return `${innerTokens[0]}/${innerTokens[1]}`;
    }
    return token;
}
function needsParenthesis(previous, current, next) {
    if (current === "cos" || current === "sin") {
        return "(";
    }
    if (previous === "cos" || previous === "sin") {
        return ")";
    }
}
addEventListener("paste", e => {
    if (!e.clipboardData) {
        return;
    }
    let text = e.clipboardData.getData("text");
    const mathInput = document.getElementsByTagName("input")[0];
    mathInput.focus();
    const splitItems = text.split(/([\\+\-" "\^])/);
    let output = [];
    for (let i = 0; i < splitItems.length; i++) {
        if (i % 2 == 0 && splitItems[i].length >= 1) {
            output.push(parseLatexTokenIntoString(splitItems[i - 1] + splitItems[i]));
        }
    }
    output = output.filter(i => i !== undefined);
    console.log(`Output tokens: [${output.join(';;')}]`);
    let outputString = "";
    let previousToken = undefined;
    for (let i = 0; i < output.length - 1; i++) {
        const nextToken = output[i + 1];
        const currentToken = output[i];
        outputString += currentToken;
        if (needsMultiplication(previousToken || "", currentToken, nextToken)) {
            outputString += "*";
        }
        const parens = needsParenthesis(previousToken || "", currentToken, nextToken);
        outputString += parens || "";
        previousToken = currentToken;
    }
    document.execCommand("insertText", false, outputString + output[output.length - 1]);
    e.preventDefault();
});
