/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/latex-parser/main.js"
/*!*******************************************!*\
  !*** ./node_modules/latex-parser/main.js ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./ts-compiled/Utils */ "./node_modules/latex-parser/ts-compiled/Utils.js"));
__export(__webpack_require__(/*! ./ts-compiled/Text/LaTeX/Base/Syntax */ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Syntax.js"));
__export(__webpack_require__(/*! ./ts-compiled/Text/LaTeX/Base/Parser */ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Parser.js"));
//# sourceMappingURL=main.js.map

/***/ },

/***/ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Parser.js"
/*!*************************************************************************!*\
  !*** ./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Parser.js ***!
  \*************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var parsimmon_1 = __webpack_require__(/*! parsimmon */ "./node_modules/parsimmon/build/parsimmon.umd.min.js");
var Syntax_1 = __webpack_require__(/*! ./Syntax */ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Syntax.js");
var Syntax_2 = __webpack_require__(/*! ./Syntax */ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Syntax.js");
var Utils_1 = __webpack_require__(/*! ../../../Utils */ "./node_modules/latex-parser/ts-compiled/Utils.js");
var parsimmon_2 = __webpack_require__(/*! parsimmon */ "./node_modules/parsimmon/build/parsimmon.umd.min.js");
exports.defaultParserConf = {
    verbatimEnvironments: ["verbatim"]
};
exports.takeTill = function (predicate) { return parsimmon_1.takeWhile(function (c) { return !predicate(c); }); };
var takeTillNewline = parsimmon_1.regexp(/[^\n]*/);
var maybeNewline = parsimmon_1.regexp(/\n?/);
var whitespace = parsimmon_1.regexp(/\s*/m);
var commentSymbol = parsimmon_1.string("%");
function unsafeUnion(xs, ys) {
    var xn = xs.length;
    var yn = ys.length;
    if (xn === 0) {
        return ys;
    }
    else if (yn === 0) {
        return xs;
    }
    var obj = {};
    for (var i = 0; i < xn; i++) {
        obj[xs[i]] = true;
    }
    for (var j = 0; j < yn; j++) {
        obj[ys[j]] = true;
    }
    var keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    keys.sort();
    return keys;
}
function mergeReplies(result, last) {
    if (!last) {
        return result;
    }
    if (result.furthest > last.furthest) {
        return result;
    }
    var expected = (result.furthest === last.furthest)
        ? unsafeUnion(result.expected, last.expected)
        : last.expected;
    return {
        status: result.status,
        index: result.index,
        value: result.value,
        furthest: last.furthest,
        expected: expected
    };
}
function manyTillAndMap(manyOf, till, map, initial) {
    return parsimmon_1.Parser(function (input, i) {
        var accum = initial;
        var j = 0;
        var result = undefined;
        while (i < input.length) {
            var endCodonFound = till._(input, i);
            if (endCodonFound.status) {
                i = Utils_1.mustBeNumber(endCodonFound.index);
                break;
            }
            var bigParse = manyOf._(input, i);
            if (isNotOk(bigParse))
                return bigParse;
            result = Utils_1.mustNotBeUndefined(mergeReplies(bigParse, result));
            if (isNotOk(result)) {
                return result;
            }
            j++;
            var value = Utils_1.mustNotBeUndefined(result.value);
            accum = map(accum, value);
            i = Utils_1.mustBeNumber(result.index);
        }
        var result2 = parsimmon_1.makeSuccess(i, accum);
        return mustBeOk(mergeReplies(result2, result));
    });
}
function manyTill(manyOf, till) {
    return manyTillAndMap(manyOf, till, function (a, el) { return a.concat([el]); }, []);
}
function token(parser) {
    return parser.skip(whitespace);
}
function word(str) {
    return parsimmon_1.string(str).thru(token);
}
var lbrace = "{";
var rbrace = "}";
var lbracket = "[";
var rbracket = "]";
var comma = ",";
var colon = ":";
var openingBracket = parsimmon_1.string(lbracket);
var closingBracket = parsimmon_1.string(rbracket);
var isClosingbracket = function (str) { return str === (rbracket); };
exports.notTextDefault = {
    "$": true,
    "%": true,
    "\\": true,
    "{": true,
    "]": true,
    "}": true
};
exports.notTextMathMode = {
    "^": true,
    "_": true,
    "$": true,
    "%": true,
    "\\": true,
    "{": true,
    "]": true,
    "}": true
};
exports.notTextMathModeAndNotClosingBracket = {
    "^": true,
    "_": true,
    "$": true,
    "%": true,
    "\\": true,
    "{": true,
    "}": true
};
exports.notTextDefaultAndNotClosingBracket = {
    "$": true,
    "%": true,
    "\\": true,
    "{": true,
    "}": true
};
function takeAtLeastOneTill(till) {
    return parsimmon_1.Parser(function (str, i) {
        var firstChar = str.charAt(i);
        if (i >= str.length || till(firstChar)) {
            return parsimmon_2.makeFailure(i, "text character");
        }
        else {
            var strz = [firstChar];
            i++;
            var char = str.charAt(i);
            while (!till(char) && i < str.length) {
                strz.push(char);
                i++;
                char = str.charAt(i);
            }
            return parsimmon_1.makeSuccess(i, strz.join(""));
        }
    });
}
function textParser(notText) {
    return takeAtLeastOneTill(isNotText(notText))
        .map(function (match) { return Syntax_2.newTeXRaw(match); });
}
exports.textParser = textParser;
var text = textParser(exports.notTextDefault);
var text2 = textParser(exports.notTextDefaultAndNotClosingBracket);
var spaces = parsimmon_1.regexp(/ */)
    .map(Syntax_2.newTeXRaw);
exports.comment = commentSymbol
    .then(takeTillNewline)
    .skip(maybeNewline)
    .map(Syntax_1.newTeXComment);
exports.specialCharsDefault = {
    "'": true,
    "(": true,
    ")": true,
    ",": true,
    ".": true,
    "-": true,
    '"': true,
    "!": true,
    "^": true,
    "$": true,
    "&": true,
    "#": true,
    "{": true,
    "}": true,
    "%": true,
    "~": true,
    "|": true,
    "/": true,
    ":": true,
    ";": true,
    "=": true,
    "[": true,
    "]": true,
    "\\": true,
    "`": true,
    " ": true
};
function isSpecialCharacter(char, specialChars) {
    var chars = specialChars === undefined ? exports.specialCharsDefault : specialChars;
    return chars.hasOwnProperty(char);
}
exports.isSpecialCharacter = isSpecialCharacter;
function isNotText(notText) {
    return function (char) { return notText.hasOwnProperty(char); };
}
exports.isNotText = isNotText;
exports.mathSymbol = parsimmon_1.string("$");
exports.commandSymbol = parsimmon_1.string("\\");
function latexBlockParser(mode, sub, sup) {
    if (sub === void 0) { sub = "_"; }
    if (sup === void 0) { sup = "^"; }
    switch (mode) {
        case "Math":
            return exports.latexBlockParserMathMode(sub, sup);
        default:
            return exports.latexBlockParserTextMode;
    }
}
exports.latexBlockParser = latexBlockParser;
exports.latexBlockParserTextMode = parsimmon_1.lazy(function () { return parsimmon_1.alt(parsimmon_1.alt(textParser(exports.notTextDefault), exports.dolMath, exports.comment, textParser(exports.notTextDefaultAndNotClosingBracket), exports.environment, command("Paragraph"))); });
exports.latexBlockParserMathMode = function (sub, sup) {
    return parsimmon_1.lazy(function () { return parsimmon_1.alt(parsimmon_1.alt(shiftedScript("Math", sub, sup), textParser(exports.notTextMathMode), exports.dolMath, exports.comment, textParser(exports.notTextMathModeAndNotClosingBracket), exports.environment, command("Math"))); });
};
exports.latexParser = exports.latexBlockParserTextMode.many();
var anonym = parsimmon_1.string(lbrace)
    .then(exports.latexBlockParserTextMode.many())
    .skip(parsimmon_1.string(rbrace));
exports.env = parsimmon_1.Parser(function (input, i) {
    var beginFound = parsimmon_1.string("\\begin")
        .then(parsimmon_1.string(lbrace))
        .then(spaces)
        .then(parsimmon_1.regexp(/[a-zA-Z]+/))
        .skip(spaces)
        .skip(parsimmon_1.string(rbrace))
        ._(input, i);
    if (isNotOk(beginFound))
        return beginFound;
    i = Utils_1.mustBeNumber(beginFound.index);
    var envName = beginFound.value;
    return manyTill(exports.latexBlockParserTextMode, parsimmon_1.string("\\end")
        .then(parsimmon_1.string(lbrace))
        .then(spaces)
        .then(parsimmon_1.string(envName))
        .then(spaces)
        .then(parsimmon_1.string(rbrace))).map(function (latex) { return Syntax_1.newTeXEnv(envName, latex); })._(input, i);
});
exports.environment = parsimmon_1.alt(anonym, exports.env);
exports.specialChar = parsimmon_1.test(isSpecialCharacter);
function isUppercaseAlph(c) {
    return c >= "A" && c <= "Z";
}
function isLowercaseAlph(c) {
    return c >= "a" && c <= "z";
}
exports.endCmd = function (c) { return !isLowercaseAlph(c) && !isUppercaseAlph(c); };
var openingBrace = parsimmon_1.string("{");
var closingBrace = parsimmon_1.string("}");
var isClosingBrace = function (str) { return str === ("}"); };
function fixArg(mode) {
    return openingBrace
        .then(manyTill(latexBlockParser(mode, "_"), closingBrace)).map(Syntax_1.newFixArg);
}
exports.fixArg = fixArg;
function optArg(mode) {
    return openingBracket
        .then(manyTill(latexBlockParser(mode), closingBracket))
        .map(Syntax_1.newOptArg);
}
exports.optArg = optArg;
function cmdArg(mode) {
    return parsimmon_1.alt(fixArg(mode), optArg(mode));
}
exports.cmdArg = cmdArg;
function cmdArgs(mode) {
    return parsimmon_1.alt(parsimmon_1.string("{}").map(function () { return []; }), cmdArg(mode).map(function (s) { return s; }).atLeast(0)).map(function (e) { return e; });
}
exports.cmdArgs = cmdArgs;
function command(mode) {
    return parsimmon_1.seqMap(exports.commandSymbol, parsimmon_1.alt(exports.specialChar, exports.takeTill(exports.endCmd)), cmdArgs(mode), function (ignored, name, argz) {
        return argz !== undefined ? Syntax_1.newTeXComm.apply(void 0, [name].concat(argz)) : Syntax_1.newTeXComm(name);
    }).map(function (res) {
        return res;
    });
}
exports.command = command;
exports.subOrSuperscriptSymbolParser = function (subscriptSymbol, superscriptSymbol) {
    return parsimmon_1.alt(parsimmon_1.string(subscriptSymbol), parsimmon_1.string(superscriptSymbol)).map(function (parsedStr) { return (parsedStr === subscriptSymbol ? Syntax_1.SubOrSuperSymbol.SUB : Syntax_1.SubOrSuperSymbol.SUP); });
};
function shiftedScript(mode, sub, sup) {
    return parsimmon_1.seqMap(exports.subOrSuperscriptSymbolParser(sub, sup), cmdArgs(mode), function (symbol, argz) {
        return Syntax_1.newSubOrSuperScript(symbol, symbol === Syntax_1.SubOrSuperSymbol.SUB ? sub : sup, argz);
    }).map(function (res) {
        return res;
    });
}
exports.shiftedScript = shiftedScript;
exports.dolMath = math();
function math(mathType, sMath, eMath) {
    if (mathType === void 0) { mathType = "Dollar"; }
    if (sMath === void 0) { sMath = "$"; }
    if (eMath === void 0) { eMath = "$"; }
    return parsimmon_1.string(sMath)
        .then(latexBlockParser("Math", "_")
        .many()
        .map(function (str) { return Syntax_1.newTeXMath(mathType, sMath, eMath, str); }))
        .skip(parsimmon_1.string(eMath));
}
function isOk(parse) {
    return parse !== undefined && parse.status === true;
}
exports.isOk = isOk;
function isNotOk(parse) {
    return parse !== undefined && parse.status === false;
}
exports.isNotOk = isNotOk;
function mustBeOk(parse) {
    if (!isOk(parse))
        throw new Error("Expected parse to be success: " + JSON.stringify(parse));
    return parse;
}
exports.mustBeOk = mustBeOk;
//# sourceMappingURL=Parser.js.map

/***/ },

/***/ "./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Syntax.js"
/*!*************************************************************************!*\
  !*** ./node_modules/latex-parser/ts-compiled/Text/LaTeX/Base/Syntax.js ***!
  \*************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Utils_1 = __webpack_require__(/*! ../../../Utils */ "./node_modules/latex-parser/ts-compiled/Utils.js");
var CategoryCode_1 = __webpack_require__(/*! ../../TeX/CategoryCode */ "./node_modules/latex-parser/ts-compiled/Text/TeX/CategoryCode.js");
function isMeasure(x) {
    return isBuiltInMeasure(x) || isCustomMeasure(x);
}
exports.isMeasure = isMeasure;
exports.measureTypes = {
    "pt": true,
    "mm": true,
    "cm": true,
    "in": true,
    "ex": true,
    "em": true,
};
function isMeasureType(x) {
    return exports.measureTypes.hasOwnProperty(x);
}
exports.isMeasureType = isMeasureType;
function isBuiltInMeasure(x) {
    return isMeasureType(x.type) && Utils_1.isNumber(x.value);
}
exports.isBuiltInMeasure = isBuiltInMeasure;
function isCustomMeasure(x) {
    return isLaTeXBlock(x.expression);
}
exports.isCustomMeasure = isCustomMeasure;
exports.mathTypes = {
    Parentheses: "Parentheses",
    Square: "Square",
    Dollar: "Dollar"
};
function isMathType(x) {
    if (x === undefined)
        return false;
    else
        switch (x) {
            case "Parentheses":
            case "Square":
            case "Dollar":
                return true;
            default:
                return false;
        }
}
exports.isMathType = isMathType;
function isNameHaving(x, name) {
    return x !== undefined && (name === undefined
        ? typeof x.name === "string"
        : name === x.name);
}
exports.isNameHaving = isNameHaving;
function isTextHaving(x) {
    return x !== undefined && typeof x.text === "string";
}
exports.isTextHaving = isTextHaving;
function isLaTeXHaving(x) {
    return x !== undefined && Utils_1.isArray(x.latex);
}
exports.isLaTeXHaving = isLaTeXHaving;
function isArgumentHaving(x) {
    return x.arguments instanceof Array;
}
exports.isArgumentHaving = isArgumentHaving;
exports.typeTeXSeq = "TeXSeq";
exports.typeTeXEnv = "TeXEnv";
exports.typeTeXBraces = "TeXBraces";
exports.typeTeXComment = "TeXComment";
exports.typeTeXRaw = "TeXRaw";
exports.typeTeXComm = "TeXComm";
exports.typeTeXCommS = "TeXCommS";
var SubOrSuperSymbol;
(function (SubOrSuperSymbol) {
    SubOrSuperSymbol[SubOrSuperSymbol["SUP"] = 0] = "SUP";
    SubOrSuperSymbol[SubOrSuperSymbol["SUB"] = 1] = "SUB";
})(SubOrSuperSymbol = exports.SubOrSuperSymbol || (exports.SubOrSuperSymbol = {}));
function isSubOrSuperSymbol(x) {
    return x === SubOrSuperSymbol.SUP || x === SubOrSuperSymbol.SUB;
}
exports.isSubOrSuperSymbol = isSubOrSuperSymbol;
exports.fromStringLaTeX = function (x) { return newTeXRaw(exports.protectString(x)); };
exports.protectString = function (s) {
    var newString = [];
    for (var i = 0; i < s.length; i++)
        newString.push(protectChar(s.charAt(i)));
    return newString.join();
};
function protectChar(c) {
    switch (c) {
        case "#":
            return "\\#";
        case "$":
            return "\\$";
        case "%":
            return "\\%";
        case "^":
            return "\\^{}";
        case "&":
            return "\\&";
        case "{":
            return "\\{";
        case "}":
            return "\\}";
        case "~":
            return "\\~{}";
        case "\\":
            return "\\textbackslash{}";
        case "_":
            return "\\_{}";
        default:
            return c;
    }
}
exports.protectChar = protectChar;
function isTypeHaving(x) {
    var anyOfTypes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        anyOfTypes[_i - 1] = arguments[_i];
    }
    return anyOfTypes.length === 0 ? typeof x.type === "string" : anyOfTypes.some(function (type) { return x.type === type; });
}
exports.isTypeHaving = isTypeHaving;
function isLaTeXBlock(x) {
    return isLaTeXRaw(x) || isLaTeXNoRaw(x);
}
exports.isLaTeXBlock = isLaTeXBlock;
function isLaTeXNoRaw(x) {
    return isTeXEmpty(x)
        || isTeXChar(x)
        || isTeXComm(x)
        || isTeXEnv(x)
        || isTeXMath(x)
        || isTeXLineBreak(x)
        || isTeXBraces(x)
        || isTeXComment(x);
}
exports.isLaTeXNoRaw = isLaTeXNoRaw;
function isLaTeXRaw(x) {
    return isTeXEmpty(x)
        || isTeXRaw(x)
        || isTeXComm(x)
        || isTeXEnv(x)
        || isTeXMath(x)
        || isTeXLineBreak(x)
        || isTeXBraces(x)
        || isTeXComment(x);
}
exports.isLaTeXRaw = isLaTeXRaw;
function isTeXRaw(x) {
    return x !== undefined
        && x.type !== undefined
        && isTextHaving(x) && isTypeHaving(x, exports.typeTeXRaw);
}
exports.isTeXRaw = isTeXRaw;
function isTeXChar(x) {
    return x !== undefined
        && typeof x.string === "string"
        && typeof x.category === "number";
}
exports.isTeXChar = isTeXChar;
function isTeXComm(x) {
    return isNameHaving(x)
        && isArgumentHaving(x)
        && isTypeHaving(x, exports.typeTeXComm, exports.typeTeXCommS);
}
exports.isTeXComm = isTeXComm;
function isTeXCommS(x) {
    return isTeXComm(x) && x.arguments.length === 0;
}
exports.isTeXCommS = isTeXCommS;
function isTeXEnv(x, name) {
    return isTypeHaving(x, exports.typeTeXEnv);
}
exports.isTeXEnv = isTeXEnv;
function isTeXMath(x) {
    return isLaTeXHaving(x) && isTypeHaving(x) && isMathType(x.type);
}
exports.isTeXMath = isTeXMath;
function isTeXLineBreak(x) {
    return x !== undefined && typeof x.noNewPage === "boolean" && (x.measure === undefined || isMeasure(x.measure));
}
exports.isTeXLineBreak = isTeXLineBreak;
function isSubOrSuperScript(x) {
    return isSubOrSuperSymbol(x.type);
}
exports.isSubOrSuperScript = isSubOrSuperScript;
function isTeXBraces(x) {
    return isLaTeXHaving(x) && isTypeHaving(x, exports.typeTeXBraces);
}
exports.isTeXBraces = isTeXBraces;
function isFixArg(x) {
    return isTypeHaving(x, "FixArg");
}
exports.isFixArg = isFixArg;
function isOptArg(x) {
    return isTypeHaving(x, "OptArg");
}
exports.isOptArg = isOptArg;
function isTeXComment(x) {
    return isTextHaving(x) && isTypeHaving(x, exports.typeTeXComment);
}
exports.isTeXComment = isTeXComment;
function isTeXEmpty(e) {
    return e !== undefined && Object.keys(e).length === 0;
}
exports.isTeXEmpty = isTeXEmpty;
function newFixArg(l) {
    return { type: "FixArg", latex: l };
}
exports.newFixArg = newFixArg;
function newOptArg(l) {
    return l.length === 1 ? { type: "OptArg", latex: l } : { type: "MOptArg", latex: l };
}
exports.newOptArg = newOptArg;
function newSymArg(l) {
    return { type: "SymArg", latex: [l] };
}
exports.newSymArg = newSymArg;
function newParArg(l) {
    return { type: "ParArg", latex: [l] };
}
exports.newParArg = newParArg;
function newMOptArg(l) {
    return { type: "MOptArg", latex: l };
}
exports.newMOptArg = newMOptArg;
function newMSymArg(l) {
    return { type: "MSymArg", latex: l };
}
exports.newMSymArg = newMSymArg;
function newMParArg(l) {
    return { type: "MParArg", latex: l };
}
exports.newMParArg = newMParArg;
function newCommandS(name) {
    return {
        name: name,
        arguments: [],
        type: exports.typeTeXCommS
    };
}
exports.newCommandS = newCommandS;
function newTeXRaw(text) {
    return {
        text: text,
        type: exports.typeTeXRaw,
        characterCategories: CategoryCode_1.convertToTeXCharsDefault(text)
    };
}
exports.newTeXRaw = newTeXRaw;
function newTeXMath(type, startSymbol, endSymbol, latex) {
    return {
        latex: latex,
        type: type,
        startSymbol: startSymbol,
        endSymbol: endSymbol
    };
}
exports.newTeXMath = newTeXMath;
function newTeXBraces(latex) {
    return {
        latex: [latex],
        type: exports.typeTeXBraces
    };
}
exports.newTeXBraces = newTeXBraces;
exports.newTeXMathDol = function (latex) {
    return newTeXMath("Dollar", "$", "$", latex);
};
function newTeXComment(text) {
    return {
        text: text,
        type: exports.typeTeXComment
    };
}
exports.newTeXComment = newTeXComment;
function newTeXComm(name) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return {
        name: name,
        arguments: args,
        type: exports.typeTeXComm
    };
}
exports.newTeXComm = newTeXComm;
function newSubOrSuperScript(type, symbol, args) {
    return {
        type: type,
        symbol: symbol,
        arguments: args
    };
}
exports.newSubOrSuperScript = newSubOrSuperScript;
function newTeXEnv(name, latex) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return {
        name: name,
        latex: latex,
        arguments: args,
        type: exports.typeTeXEnv
    };
}
exports.newTeXEnv = newTeXEnv;
function stringifyLaTeX(tex) {
    var arr = [];
    (stringifyLaTeXInner(tex, arr));
    return arr.join("");
}
exports.stringifyLaTeX = stringifyLaTeX;
function stringifyLaTeXInner(tex, soFar) {
    if (isTeXComm(tex)) {
        soFar.push("\\", tex.name);
        tex.arguments.forEach(function (l) { return stringifyLaTeXInner(l, soFar); });
    }
    else if (isTeXEnv(tex))
        throw new Error("not supported yet");
    else if (isTeXMath(tex)) {
        soFar.push(tex.startSymbol);
        tex.latex.forEach(function (t) { return stringifyLaTeXInner(t, soFar); });
        soFar.push(tex.endSymbol);
    }
    else if (isTeXLineBreak(tex))
        soFar.push("\n");
    else if (isSubOrSuperScript(tex)) {
        soFar.push(tex.symbol);
        if (tex.arguments)
            tex.arguments.forEach(function (arg) { return (stringifyLaTeXInner(arg, soFar)); });
    }
    else if (isTeXBraces(tex)) {
        soFar.push("{");
        tex.latex.forEach(function (t) { return stringifyLaTeXInner(t, soFar); });
        soFar.push("}");
    }
    else if (isTeXComment(tex)) {
        soFar.push("%" + tex.text + "\n");
    }
    else if (isTeXRaw(tex))
        soFar.push(tex.text);
    else if (isTeXChar(tex))
        throw new Error("not supported yet");
    else if (isFixArg(tex)) {
        soFar.push("{");
        tex.latex.forEach(function (t) { return stringifyLaTeXInner(t, soFar); });
        soFar.push("}");
    }
    else if (isOptArg(tex)) {
        soFar.push("[");
        tex.latex.forEach(function (t) { return stringifyLaTeXInner(t, soFar); });
        soFar.push("]");
    }
    else
        throw new Error("Did not recognize " + JSON.stringify(tex));
}
//# sourceMappingURL=Syntax.js.map

/***/ },

/***/ "./node_modules/latex-parser/ts-compiled/Text/TeX/CategoryCode.js"
/*!************************************************************************!*\
  !*** ./node_modules/latex-parser/ts-compiled/Text/TeX/CategoryCode.js ***!
  \************************************************************************/
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultCategories = function (char) {
    switch (char) {
        case "\\":
            return 0;
        case "{":
            return 1;
        case "}":
            return 2;
        case "$":
            return 3;
        case "&":
            return 4;
        case "\r":
            return 5;
        case "#":
            return 6;
        case "^":
            return 7;
        case "_":
            return 8;
        case "\0":
            return 9;
        case " ":
            return 10;
        case "~":
            return 13;
        case "%":
            return 14;
        case "\d":
            return 15;
        default:
            return 11;
    }
};
function convertToTeXCharsDefault(str) {
    return convertToTeXChars(exports.defaultCategories, str);
}
exports.convertToTeXCharsDefault = convertToTeXCharsDefault;
function convertToTeXChars(categoryMap, str) {
    var chars = [];
    for (var i = 0; i < str.length; i++) {
        var charAt = str.charAt(i);
        chars.push({
            string: charAt,
            category: categoryMap(charAt)
        });
    }
    return chars;
}
exports.convertToTeXChars = convertToTeXChars;
//# sourceMappingURL=CategoryCode.js.map

/***/ },

/***/ "./node_modules/latex-parser/ts-compiled/Utils.js"
/*!********************************************************!*\
  !*** ./node_modules/latex-parser/ts-compiled/Utils.js ***!
  \********************************************************/
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function updateProperties(target, values, opt_keys, opt_attributes) {
    if (opt_attributes === void 0) { opt_attributes = {
        writable: true,
        enumerable: true,
        configurable: true
    }; }
    if (!(target instanceof Object))
        throw new TypeError('"target" isn\'t an Object instance');
    if (values === undefined)
        return;
    if (!(values instanceof Object))
        throw new TypeError('"properties" isn\'t an Object instance');
    if (opt_attributes === undefined) {
        opt_attributes = { writable: true, enumerable: true, configurable: true };
    }
    else if (!(opt_attributes instanceof Object)) {
        throw new TypeError('"attributes" isn\'t an Object instance');
    }
    if (opt_keys === undefined) {
        for (var key in values) {
            if (values[key] !== undefined) {
                Object.defineProperty(target, key, Object.create(opt_attributes, { value: { value: values[key] } }));
            }
        }
    }
    else if (opt_keys instanceof Array) {
        opt_keys.forEach(function (key) {
            if (values[key] !== undefined) {
                Object.defineProperty(target, key, Object.create(opt_attributes, { value: { value: values[key] } }));
            }
        });
    }
    else if (opt_keys instanceof Object) {
        for (var targetKey in opt_keys) {
            var key = opt_keys[targetKey];
            if (values[key] !== undefined)
                Object.defineProperty(target, targetKey, Object.create(opt_attributes, { value: { value: values[key] } }));
        }
    }
    else {
        throw new TypeError('"keys" isn\'t an Object instance');
    }
}
exports.updateProperties = updateProperties;
function testProperties(target, values, opt_keys, opt_skipUndefined) {
    if (opt_skipUndefined === void 0) { opt_skipUndefined = true; }
    if (!(target instanceof Object))
        throw new TypeError('"target" isn\'t an Object instance');
    if (values === undefined)
        return true;
    if (!(values instanceof Object))
        throw new TypeError('"properties" isn\'t an Object instance');
    if (opt_skipUndefined === undefined)
        opt_skipUndefined = true;
    if (opt_keys === undefined) {
        for (var key in values) {
            if (target[key] !== values[key]
                && !(values[key] === undefined && opt_skipUndefined))
                return false;
        }
    }
    else if (opt_keys instanceof Array) {
        return opt_keys.every(function (key) {
            return target[key] === values[key] || (values[key] === undefined && opt_skipUndefined);
        });
    }
    else if (opt_keys instanceof Object) {
        for (var targetKey in opt_keys) {
            var key = opt_keys[targetKey];
            if (target[targetKey] !== values[key] && !(values[key] === undefined && opt_skipUndefined))
                return false;
        }
    }
    else {
        throw new TypeError('"keys" isn\'t an Object instance');
    }
    return true;
}
exports.testProperties = testProperties;
exports.mustBeNumber = function (a, msg) {
    if (!(isNumber(a)))
        throw new TypeError(msg ? msg : "Expected number");
    return a;
};
function isNumber(x) {
    return typeof x === "number";
}
exports.isNumber = isNumber;
function isString(x) {
    return typeof x === "string";
}
exports.isString = isString;
function mustNotBeUndefined(x, msg) {
    if (!x)
        throw new Error(msg);
    return x;
}
exports.mustNotBeUndefined = mustNotBeUndefined;
function mustBeObject(o, msg) {
    if (!(o instanceof Object))
        throw new TypeError(msg ? msg : "Expected Object");
    return o;
}
exports.mustBeObject = mustBeObject;
function mustBeString(o, msg) {
    if (typeof o !== "string")
        throw new TypeError(msg ? msg : "Expected string");
    return o;
}
exports.mustBeString = mustBeString;
function mustBeArray(a, msg) {
    if (!(isArray(a)))
        throw new TypeError(msg ? msg : "Expected Array");
    return a;
}
exports.mustBeArray = mustBeArray;
function isArray(x) {
    return !!x && x.constructor === Array;
}
exports.isArray = isArray;
exports.mconcat = function (mappend) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return args.reduceRight(mappend);
};
exports.snd = function (pair) { return pair[1]; };
function concatMap(arr, f) {
    return [].concat.apply([], arr.map(f));
}
exports.concatMap = concatMap;
//# sourceMappingURL=Utils.js.map

/***/ },

/***/ "./node_modules/parsimmon/build/parsimmon.umd.min.js"
/*!***********************************************************!*\
  !*** ./node_modules/parsimmon/build/parsimmon.umd.min.js ***!
  \***********************************************************/
(module) {

!function(n,t){ true?module.exports=t():0}("undefined"!=typeof self?self:this,function(){return function(n){var t={};function r(e){if(t[e])return t[e].exports;var u=t[e]={i:e,l:!1,exports:{}};return n[e].call(u.exports,u,u.exports,r),u.l=!0,u.exports}return r.m=n,r.c=t,r.d=function(n,t,e){r.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:e})},r.r=function(n){Object.defineProperty(n,"__esModule",{value:!0})},r.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return r.d(t,"a",t),t},r.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},r.p="",r(r.s=0)}([function(n,t,r){"use strict";function e(n){if(!(this instanceof e))return new e(n);this._=n}var u=e.prototype;function o(n,t){for(var r=0;r<n;r++)t(r)}function i(n,t,r){return function(n,t){o(t.length,function(r){n(t[r],r,t)})}(function(r,e,u){t=n(t,r,e,u)},r),t}function a(n,t){return i(function(t,r,e,u){return t.concat([n(r,e,u)])},[],t)}function f(n,t){var r={v:0,buf:t};return o(n,function(){var n;r={v:r.v<<1|(n=r.buf,n[0]>>7),buf:function(n){var t=i(function(n,t,r,e){return n.concat(r===e.length-1?Buffer.from([t,0]).readUInt16BE(0):e.readUInt16BE(r))},[],n);return Buffer.from(a(function(n){return(n<<1&65535)>>8},t))}(r.buf)}}),r}function c(){return"undefined"!=typeof Buffer}function s(){if(!c())throw new Error("Buffer global does not exist; please use webpack if you need to parse Buffers in the browser.")}function l(n){s();var t=i(function(n,t){return n+t},0,n);if(t%8!=0)throw new Error("The bits ["+n.join(", ")+"] add up to "+t+" which is not an even number of bytes; the total should be divisible by 8");var r,u=t/8,o=(r=function(n){return n>48},i(function(n,t){return n||(r(t)?t:n)},null,n));if(o)throw new Error(o+" bit range requested exceeds 48 bit (6 byte) Number max.");return new e(function(t,r){var e=u+r;return e>t.length?x(r,u.toString()+" bytes"):b(e,i(function(n,t){var r=f(t,n.buf);return{coll:n.coll.concat(r.v),buf:r.buf}},{coll:[],buf:t.slice(r,e)},n).coll)})}function h(n,t){return new e(function(r,e){return s(),e+t>r.length?x(e,t+" bytes for "+n):b(e+t,r.slice(e,e+t))})}function p(n,t){if("number"!=typeof(r=t)||Math.floor(r)!==r||t<0||t>6)throw new Error(n+" requires integer length in range [0, 6].");var r}function d(n){return p("uintBE",n),h("uintBE("+n+")",n).map(function(t){return t.readUIntBE(0,n)})}function v(n){return p("uintLE",n),h("uintLE("+n+")",n).map(function(t){return t.readUIntLE(0,n)})}function g(n){return p("intBE",n),h("intBE("+n+")",n).map(function(t){return t.readIntBE(0,n)})}function m(n){return p("intLE",n),h("intLE("+n+")",n).map(function(t){return t.readIntLE(0,n)})}function y(n){return n instanceof e}function E(n){return"[object Array]"==={}.toString.call(n)}function w(n){return c()&&Buffer.isBuffer(n)}function b(n,t){return{status:!0,index:n,value:t,furthest:-1,expected:[]}}function x(n,t){return E(t)||(t=[t]),{status:!1,index:-1,value:null,furthest:n,expected:t}}function B(n,t){if(!t)return n;if(n.furthest>t.furthest)return n;var r=n.furthest===t.furthest?function(n,t){if(function(){if(void 0!==e._supportsSet)return e._supportsSet;var n="undefined"!=typeof Set;return e._supportsSet=n,n}()&&Array.from){for(var r=new Set(n),u=0;u<t.length;u++)r.add(t[u]);var o=Array.from(r);return o.sort(),o}for(var i={},a=0;a<n.length;a++)i[n[a]]=!0;for(var f=0;f<t.length;f++)i[t[f]]=!0;var c=[];for(var s in i)({}).hasOwnProperty.call(i,s)&&c.push(s);return c.sort(),c}(n.expected,t.expected):t.expected;return{status:n.status,index:n.index,value:n.value,furthest:t.furthest,expected:r}}var j={};function S(n,t){if(w(n))return{offset:t,line:-1,column:-1};n in j||(j[n]={});for(var r=j[n],e=0,u=0,o=0,i=t;i>=0;){if(i in r){e=r[i].line,0===o&&(o=r[i].lineStart);break}("\n"===n.charAt(i)||"\r"===n.charAt(i)&&"\n"!==n.charAt(i+1))&&(u++,0===o&&(o=i+1)),i--}var a=e+u,f=t-o;return r[t]={line:a,lineStart:o},{offset:t,line:a+1,column:f+1}}function _(n){if(!y(n))throw new Error("not a parser: "+n)}function L(n,t){return"string"==typeof n?n.charAt(t):n[t]}function O(n){if("number"!=typeof n)throw new Error("not a number: "+n)}function k(n){if("function"!=typeof n)throw new Error("not a function: "+n)}function P(n){if("string"!=typeof n)throw new Error("not a string: "+n)}var q=2,A=3,I=8,F=5*I,M=4*I,z="  ";function R(n,t){return new Array(t+1).join(n)}function U(n,t,r){var e=t-n.length;return e<=0?n:R(r,e)+n}function W(n,t,r,e){return{from:n-t>0?n-t:0,to:n+r>e?e:n+r}}function D(n,t){var r,e,u,o,f,c=t.index,s=c.offset,l=1;if(s===n.length)return"Got the end of the input";if(w(n)){var h=s-s%I,p=s-h,d=W(h,F,M+I,n.length),v=a(function(n){return a(function(n){return U(n.toString(16),2,"0")},n)},function(n,t){var r=n.length,e=[],u=0;if(r<=t)return[n.slice()];for(var o=0;o<r;o++)e[u]||e.push([]),e[u].push(n[o]),(o+1)%t==0&&u++;return e}(n.slice(d.from,d.to).toJSON().data,I));o=function(n){return 0===n.from&&1===n.to?{from:n.from,to:n.to}:{from:n.from/I,to:Math.floor(n.to/I)}}(d),e=h/I,r=3*p,p>=4&&(r+=1),l=2,u=a(function(n){return n.length<=4?n.join(" "):n.slice(0,4).join(" ")+"  "+n.slice(4).join(" ")},v),(f=(8*(o.to>0?o.to-1:o.to)).toString(16).length)<2&&(f=2)}else{var g=n.split(/\r\n|[\n\r\u2028\u2029]/);r=c.column-1,e=c.line-1,o=W(e,q,A,g.length),u=g.slice(o.from,o.to),f=o.to.toString().length}var m=e-o.from;return w(n)&&(f=(8*(o.to>0?o.to-1:o.to)).toString(16).length)<2&&(f=2),i(function(t,e,u){var i,a=u===m,c=a?"> ":z;return i=w(n)?U((8*(o.from+u)).toString(16),f,"0"):U((o.from+u+1).toString(),f," "),[].concat(t,[c+i+" | "+e],a?[z+R(" ",f)+" | "+U("",r," ")+R("^",l)]:[])},[],u).join("\n")}function N(n,t){return["\n","-- PARSING FAILED "+R("-",50),"\n\n",D(n,t),"\n\n",(r=t.expected,1===r.length?"Expected:\n\n"+r[0]:"Expected one of the following: \n\n"+r.join(", ")),"\n"].join("");// removed by dead control flow
 var r; }function G(n){return void 0!==n.flags?n.flags:[n.global?"g":"",n.ignoreCase?"i":"",n.multiline?"m":"",n.unicode?"u":"",n.sticky?"y":""].join("")}function C(){for(var n=[].slice.call(arguments),t=n.length,r=0;r<t;r+=1)_(n[r]);return e(function(r,e){for(var u,o=new Array(t),i=0;i<t;i+=1){if(!(u=B(n[i]._(r,e),u)).status)return u;o[i]=u.value,e=u.index}return B(b(e,o),u)})}function J(){var n=[].slice.call(arguments);if(0===n.length)throw new Error("seqMap needs at least one argument");var t=n.pop();return k(t),C.apply(null,n).map(function(n){return t.apply(null,n)})}function T(){var n=[].slice.call(arguments),t=n.length;if(0===t)return Y("zero alternates");for(var r=0;r<t;r+=1)_(n[r]);return e(function(t,r){for(var e,u=0;u<n.length;u+=1)if((e=B(n[u]._(t,r),e)).status)return e;return e})}function V(n,t){return H(n,t).or(X([]))}function H(n,t){return _(n),_(t),J(n,t.then(n).many(),function(n,t){return[n].concat(t)})}function K(n){P(n);var t="'"+n+"'";return e(function(r,e){var u=e+n.length,o=r.slice(e,u);return o===n?b(u,o):x(e,t)})}function Q(n,t){!function(n){if(!(n instanceof RegExp))throw new Error("not a regexp: "+n);for(var t=G(n),r=0;r<t.length;r++){var e=t.charAt(r);if("i"!==e&&"m"!==e&&"u"!==e&&"s"!==e)throw new Error('unsupported regexp flag "'+e+'": '+n)}}(n),arguments.length>=2?O(t):t=0;var r=function(n){return RegExp("^(?:"+n.source+")",G(n))}(n),u=""+n;return e(function(n,e){var o=r.exec(n.slice(e));if(o){if(0<=t&&t<=o.length){var i=o[0],a=o[t];return b(e+i.length,a)}return x(e,"valid match group (0 to "+o.length+") in "+u)}return x(e,u)})}function X(n){return e(function(t,r){return b(r,n)})}function Y(n){return e(function(t,r){return x(r,n)})}function Z(n){if(y(n))return e(function(t,r){var e=n._(t,r);return e.index=r,e.value="",e});if("string"==typeof n)return Z(K(n));if(n instanceof RegExp)return Z(Q(n));throw new Error("not a string, regexp, or parser: "+n)}function $(n){return _(n),e(function(t,r){var e=n._(t,r),u=t.slice(r,e.index);return e.status?x(r,'not "'+u+'"'):b(r,null)})}function nn(n){return k(n),e(function(t,r){var e=L(t,r);return r<t.length&&n(e)?b(r+1,e):x(r,"a character/byte matching "+n)})}function tn(n,t){arguments.length<2&&(t=n,n=void 0);var r=e(function(n,e){return r._=t()._,r._(n,e)});return n?r.desc(n):r}function rn(){return Y("fantasy-land/empty")}u.parse=function(n){if("string"!=typeof n&&!w(n))throw new Error(".parse must be called with a string or Buffer as its argument");var t,r=this.skip(an)._(n,0);return t=r.status?{status:!0,value:r.value}:{status:!1,index:S(n,r.furthest),expected:r.expected},delete j[n],t},u.tryParse=function(n){var t=this.parse(n);if(t.status)return t.value;var r=N(n,t),e=new Error(r);throw e.type="ParsimmonError",e.result=t,e},u.assert=function(n,t){return this.chain(function(r){return n(r)?X(r):Y(t)})},u.or=function(n){return T(this,n)},u.trim=function(n){return this.wrap(n,n)},u.wrap=function(n,t){return J(n,this,t,function(n,t){return t})},u.thru=function(n){return n(this)},u.then=function(n){return _(n),C(this,n).map(function(n){return n[1]})},u.many=function(){var n=this;return e(function(t,r){for(var e=[],u=void 0;;){if(!(u=B(n._(t,r),u)).status)return B(b(r,e),u);if(r===u.index)throw new Error("infinite loop detected in .many() parser --- calling .many() on a parser which can accept zero characters is usually the cause");r=u.index,e.push(u.value)}})},u.tieWith=function(n){return P(n),this.map(function(t){if(function(n){if(!E(n))throw new Error("not an array: "+n)}(t),t.length){P(t[0]);for(var r=t[0],e=1;e<t.length;e++)P(t[e]),r+=n+t[e];return r}return""})},u.tie=function(){return this.tieWith("")},u.times=function(n,t){var r=this;return arguments.length<2&&(t=n),O(n),O(t),e(function(e,u){for(var o=[],i=void 0,a=void 0,f=0;f<n;f+=1){if(a=B(i=r._(e,u),a),!i.status)return a;u=i.index,o.push(i.value)}for(;f<t&&(a=B(i=r._(e,u),a),i.status);f+=1)u=i.index,o.push(i.value);return B(b(u,o),a)})},u.result=function(n){return this.map(function(){return n})},u.atMost=function(n){return this.times(0,n)},u.atLeast=function(n){return J(this.times(n),this.many(),function(n,t){return n.concat(t)})},u.map=function(n){k(n);var t=this;return e(function(r,e){var u=t._(r,e);return u.status?B(b(u.index,n(u.value)),u):u})},u.contramap=function(n){k(n);var t=this;return e(function(r,e){var u=t.parse(n(r.slice(e)));return u.status?b(e+r.length,u.value):u})},u.promap=function(n,t){return k(n),k(t),this.contramap(n).map(t)},u.skip=function(n){return C(this,n).map(function(n){return n[0]})},u.mark=function(){return J(en,this,en,function(n,t,r){return{start:n,value:t,end:r}})},u.node=function(n){return J(en,this,en,function(t,r,e){return{name:n,value:r,start:t,end:e}})},u.sepBy=function(n){return V(this,n)},u.sepBy1=function(n){return H(this,n)},u.lookahead=function(n){return this.skip(Z(n))},u.notFollowedBy=function(n){return this.skip($(n))},u.desc=function(n){E(n)||(n=[n]);var t=this;return e(function(r,e){var u=t._(r,e);return u.status||(u.expected=n),u})},u.fallback=function(n){return this.or(X(n))},u.ap=function(n){return J(n,this,function(n,t){return n(t)})},u.chain=function(n){var t=this;return e(function(r,e){var u=t._(r,e);return u.status?B(n(u.value)._(r,u.index),u):u})},u.concat=u.or,u.empty=rn,u.of=X,u["fantasy-land/ap"]=u.ap,u["fantasy-land/chain"]=u.chain,u["fantasy-land/concat"]=u.concat,u["fantasy-land/empty"]=u.empty,u["fantasy-land/of"]=u.of,u["fantasy-land/map"]=u.map;var en=e(function(n,t){return b(t,S(n,t))}),un=e(function(n,t){return t>=n.length?x(t,"any character/byte"):b(t+1,L(n,t))}),on=e(function(n,t){return b(n.length,n.slice(t))}),an=e(function(n,t){return t<n.length?x(t,"EOF"):b(t,null)}),fn=Q(/[0-9]/).desc("a digit"),cn=Q(/[0-9]*/).desc("optional digits"),sn=Q(/[a-z]/i).desc("a letter"),ln=Q(/[a-z]*/i).desc("optional letters"),hn=Q(/\s*/).desc("optional whitespace"),pn=Q(/\s+/).desc("whitespace"),dn=K("\r"),vn=K("\n"),gn=K("\r\n"),mn=T(gn,vn,dn).desc("newline"),yn=T(mn,an);e.all=on,e.alt=T,e.any=un,e.cr=dn,e.createLanguage=function(n){var t={};for(var r in n)({}).hasOwnProperty.call(n,r)&&function(r){t[r]=tn(function(){return n[r](t)})}(r);return t},e.crlf=gn,e.custom=function(n){return e(n(b,x))},e.digit=fn,e.digits=cn,e.empty=rn,e.end=yn,e.eof=an,e.fail=Y,e.formatError=N,e.index=en,e.isParser=y,e.lazy=tn,e.letter=sn,e.letters=ln,e.lf=vn,e.lookahead=Z,e.makeFailure=x,e.makeSuccess=b,e.newline=mn,e.noneOf=function(n){return nn(function(t){return n.indexOf(t)<0}).desc("none of '"+n+"'")},e.notFollowedBy=$,e.of=X,e.oneOf=function(n){for(var t=n.split(""),r=0;r<t.length;r++)t[r]="'"+t[r]+"'";return nn(function(t){return n.indexOf(t)>=0}).desc(t)},e.optWhitespace=hn,e.Parser=e,e.range=function(n,t){return nn(function(r){return n<=r&&r<=t}).desc(n+"-"+t)},e.regex=Q,e.regexp=Q,e.sepBy=V,e.sepBy1=H,e.seq=C,e.seqMap=J,e.seqObj=function(){for(var n,t={},r=0,u=(n=arguments,Array.prototype.slice.call(n)),o=u.length,i=0;i<o;i+=1){var a=u[i];if(!y(a)){if(E(a)&&2===a.length&&"string"==typeof a[0]&&y(a[1])){var f=a[0];if(Object.prototype.hasOwnProperty.call(t,f))throw new Error("seqObj: duplicate key "+f);t[f]=!0,r++;continue}throw new Error("seqObj arguments must be parsers or [string, parser] array pairs.")}}if(0===r)throw new Error("seqObj expects at least one named parser, found zero");return e(function(n,t){for(var r,e={},i=0;i<o;i+=1){var a,f;if(E(u[i])?(a=u[i][0],f=u[i][1]):(a=null,f=u[i]),!(r=B(f._(n,t),r)).status)return r;a&&(e[a]=r.value),t=r.index}return B(b(t,e),r)})},e.string=K,e.succeed=X,e.takeWhile=function(n){return k(n),e(function(t,r){for(var e=r;e<t.length&&n(L(t,e));)e++;return b(e,t.slice(r,e))})},e.test=nn,e.whitespace=pn,e["fantasy-land/empty"]=rn,e["fantasy-land/of"]=X,e.Binary={bitSeq:l,bitSeqObj:function(n){s();var t={},r=0,e=a(function(n){if(E(n)){var e=n;if(2!==e.length)throw new Error("["+e.join(", ")+"] should be length 2, got length "+e.length);if(P(e[0]),O(e[1]),Object.prototype.hasOwnProperty.call(t,e[0]))throw new Error("duplicate key in bitSeqObj: "+e[0]);return t[e[0]]=!0,r++,e}return O(n),[null,n]},n);if(r<1)throw new Error("bitSeqObj expects at least one named pair, got ["+n.join(", ")+"]");var u=a(function(n){return n[0]},e);return l(a(function(n){return n[1]},e)).map(function(n){return i(function(n,t){return null!==t[0]&&(n[t[0]]=t[1]),n},{},a(function(t,r){return[t,n[r]]},u))})},byte:function(n){if(s(),O(n),n>255)throw new Error("Value specified to byte constructor ("+n+"=0x"+n.toString(16)+") is larger in value than a single byte.");var t=(n>15?"0x":"0x0")+n.toString(16);return e(function(r,e){var u=L(r,e);return u===n?b(e+1,u):x(e,t)})},buffer:function(n){return h("buffer",n).map(function(n){return Buffer.from(n)})},encodedString:function(n,t){return h("string",t).map(function(t){return t.toString(n)})},uintBE:d,uint8BE:d(1),uint16BE:d(2),uint32BE:d(4),uintLE:v,uint8LE:v(1),uint16LE:v(2),uint32LE:v(4),intBE:g,int8BE:g(1),int16BE:g(2),int32BE:g(4),intLE:m,int8LE:m(1),int16LE:m(2),int32LE:m(4),floatBE:h("floatBE",4).map(function(n){return n.readFloatBE(0)}),floatLE:h("floatLE",4).map(function(n){return n.readFloatLE(0)}),doubleBE:h("doubleBE",8).map(function(n){return n.readDoubleBE(0)}),doubleLE:h("doubleLE",8).map(function(n){return n.readDoubleLE(0)})},n.exports=e}])});

/***/ },

/***/ "./src/converter.ts"
/*!**************************!*\
  !*** ./src/converter.ts ***!
  \**************************/
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertToString = convertToString;
function convertToString(token, previousToken, nested) {
    if (nested === void 0) { nested = 0; }
    console.log("|".concat("----".repeat(nested), "+ ").concat(token.name || token.text, " (prev: ").concat((previousToken === null || previousToken === void 0 ? void 0 : previousToken.name) || (previousToken === null || previousToken === void 0 ? void 0 : previousToken.text), "=").concat(previousToken === null || previousToken === void 0 ? void 0 : previousToken.type, ")"));
    var output = "";
    var handledLatexIndices = 0;
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
                var result = [undefined, undefined];
                for (var i = 0; i < token.arguments.length; i++) {
                    var arg = token.arguments[i];
                    var tempResult = "";
                    // @ts-ignore
                    for (var j = 0; j < arg.latex.length; j++) {
                        tempResult += convertToString(arg.latex[j], token, nested + 1);
                    }
                    result[i] = tempResult;
                }
                output += "(".concat(result[0], "/").concat(result[1], ")");
                break;
            }
            case "sqrt": {
                var nthRoot = "2";
                var value = undefined;
                for (var _i = 0, _a = token.arguments; _i < _a.length; _i++) {
                    var arg = _a[_i];
                    if (arg.type === "OptArg") {
                        nthRoot = arg.latex[0].text;
                    }
                    else {
                        value = convertToString(arg.latex[0], token, nested + 1);
                    }
                }
                handledLatexIndices++;
                output += "\u221A(".concat(value, ";").concat(nthRoot, ")");
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
    if (previousToken && !output.trimEnd().endsWith("*") &&
        ((previousToken.type === "TeXRaw" && !!Number(previousToken.text)) ||
            (previousToken.type === "TeXComm" && token.type === "TeXComm"))) {
        console.log("Comma: ".concat(previousToken.name || previousToken.text, "=").concat(previousToken.type, "|").concat(token.name || token.text, "=").concat(token.type, ";").concat(output));
        output = "*" + output;
    }
    return output;
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
let exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var latex_parser_1 = __webpack_require__(/*! latex-parser */ "./node_modules/latex-parser/main.js");
var converter_1 = __webpack_require__(/*! ./converter */ "./src/converter.ts");
console.log("Loaded latexicus!");
if (window) {
    addEventListener("paste", function (e) {
        if (!e.clipboardData) {
            return;
        }
        var text = e.clipboardData.getData("text");
        var out = "";
        var lastToken = undefined;
        for (var _i = 0, _a = latex_parser_1.latexParser.parse(text
            .replaceAll("{,}", ".")
            .replaceAll("°", "")
            .replaceAll("\\left", "")
            .replaceAll("\\right", "")
            .replaceAll("Pi", "\\Pi")
            .replaceAll("pi", "\\pi")
            .split("=")[0]).value; _i < _a.length; _i++) {
            var token = _a[_i];
            out += (0, converter_1.convertToString)(token, lastToken);
            lastToken = token;
        }
        var mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();
        document.execCommand("insertText", false, out);
        e.preventDefault();
    });
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsU0FBUyxFQUFFLEVBQUUsQ0FBQzthQUN6QixVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQzthQUN4QixVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQzthQUN4QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3JCLENBQUMsS0FBTSxFQVRZLGNBU1osRUFUWSxJQVNaLEVBQUUsQ0FBQztZQVROLElBQU0sS0FBSztZQVVaLEdBQUcsSUFBSSwrQkFBZSxFQUFDLEtBQW9CLEVBQUUsU0FBd0IsQ0FBQyxDQUFDO1lBQ3ZFLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbEIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYXRleGljdXMvLi9ub2RlX21vZHVsZXMvbGF0ZXgtcGFyc2VyL21haW4uanMiLCJ3ZWJwYWNrOi8vbGF0ZXhpY3VzLy4vbm9kZV9tb2R1bGVzL2xhdGV4LXBhcnNlci90cy1jb21waWxlZC9UZXh0L0xhVGVYL0Jhc2UvUGFyc2VyLmpzIiwid2VicGFjazovL2xhdGV4aWN1cy8uL25vZGVfbW9kdWxlcy9sYXRleC1wYXJzZXIvdHMtY29tcGlsZWQvVGV4dC9MYVRlWC9CYXNlL1N5bnRheC5qcyIsIndlYnBhY2s6Ly9sYXRleGljdXMvLi9ub2RlX21vZHVsZXMvbGF0ZXgtcGFyc2VyL3RzLWNvbXBpbGVkL1RleHQvVGVYL0NhdGVnb3J5Q29kZS5qcyIsIndlYnBhY2s6Ly9sYXRleGljdXMvLi9ub2RlX21vZHVsZXMvbGF0ZXgtcGFyc2VyL3RzLWNvbXBpbGVkL1V0aWxzLmpzIiwid2VicGFjazovL2xhdGV4aWN1cy8uL25vZGVfbW9kdWxlcy9wYXJzaW1tb24vYnVpbGQvcGFyc2ltbW9uLnVtZC5taW4uanMiLCJ3ZWJwYWNrOi8vbGF0ZXhpY3VzLy4vc3JjL2NvbnZlcnRlci50cyIsIndlYnBhY2s6Ly9sYXRleGljdXMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbGF0ZXhpY3VzLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3RzLWNvbXBpbGVkL1V0aWxzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vdHMtY29tcGlsZWQvVGV4dC9MYVRlWC9CYXNlL1N5bnRheFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3RzLWNvbXBpbGVkL1RleHQvTGFUZVgvQmFzZS9QYXJzZXJcIikpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBwYXJzaW1tb25fMSA9IHJlcXVpcmUoXCJwYXJzaW1tb25cIik7XHJcbnZhciBTeW50YXhfMSA9IHJlcXVpcmUoXCIuL1N5bnRheFwiKTtcclxudmFyIFN5bnRheF8yID0gcmVxdWlyZShcIi4vU3ludGF4XCIpO1xyXG52YXIgVXRpbHNfMSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9VdGlsc1wiKTtcclxudmFyIHBhcnNpbW1vbl8yID0gcmVxdWlyZShcInBhcnNpbW1vblwiKTtcclxuZXhwb3J0cy5kZWZhdWx0UGFyc2VyQ29uZiA9IHtcclxuICAgIHZlcmJhdGltRW52aXJvbm1lbnRzOiBbXCJ2ZXJiYXRpbVwiXVxyXG59O1xyXG5leHBvcnRzLnRha2VUaWxsID0gZnVuY3Rpb24gKHByZWRpY2F0ZSkgeyByZXR1cm4gcGFyc2ltbW9uXzEudGFrZVdoaWxlKGZ1bmN0aW9uIChjKSB7IHJldHVybiAhcHJlZGljYXRlKGMpOyB9KTsgfTtcclxudmFyIHRha2VUaWxsTmV3bGluZSA9IHBhcnNpbW1vbl8xLnJlZ2V4cCgvW15cXG5dKi8pO1xyXG52YXIgbWF5YmVOZXdsaW5lID0gcGFyc2ltbW9uXzEucmVnZXhwKC9cXG4/Lyk7XHJcbnZhciB3aGl0ZXNwYWNlID0gcGFyc2ltbW9uXzEucmVnZXhwKC9cXHMqL20pO1xyXG52YXIgY29tbWVudFN5bWJvbCA9IHBhcnNpbW1vbl8xLnN0cmluZyhcIiVcIik7XHJcbmZ1bmN0aW9uIHVuc2FmZVVuaW9uKHhzLCB5cykge1xyXG4gICAgdmFyIHhuID0geHMubGVuZ3RoO1xyXG4gICAgdmFyIHluID0geXMubGVuZ3RoO1xyXG4gICAgaWYgKHhuID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHlzO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoeW4gPT09IDApIHtcclxuICAgICAgICByZXR1cm4geHM7XHJcbiAgICB9XHJcbiAgICB2YXIgb2JqID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhuOyBpKyspIHtcclxuICAgICAgICBvYmpbeHNbaV1dID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgeW47IGorKykge1xyXG4gICAgICAgIG9ialt5c1tqXV0gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGtleXMgPSBbXTtcclxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xyXG4gICAgICAgICAgICBrZXlzLnB1c2goayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAga2V5cy5zb3J0KCk7XHJcbiAgICByZXR1cm4ga2V5cztcclxufVxyXG5mdW5jdGlvbiBtZXJnZVJlcGxpZXMocmVzdWx0LCBsYXN0KSB7XHJcbiAgICBpZiAoIWxhc3QpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgaWYgKHJlc3VsdC5mdXJ0aGVzdCA+IGxhc3QuZnVydGhlc3QpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgdmFyIGV4cGVjdGVkID0gKHJlc3VsdC5mdXJ0aGVzdCA9PT0gbGFzdC5mdXJ0aGVzdClcclxuICAgICAgICA/IHVuc2FmZVVuaW9uKHJlc3VsdC5leHBlY3RlZCwgbGFzdC5leHBlY3RlZClcclxuICAgICAgICA6IGxhc3QuZXhwZWN0ZWQ7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHN0YXR1czogcmVzdWx0LnN0YXR1cyxcclxuICAgICAgICBpbmRleDogcmVzdWx0LmluZGV4LFxyXG4gICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWUsXHJcbiAgICAgICAgZnVydGhlc3Q6IGxhc3QuZnVydGhlc3QsXHJcbiAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkXHJcbiAgICB9O1xyXG59XHJcbmZ1bmN0aW9uIG1hbnlUaWxsQW5kTWFwKG1hbnlPZiwgdGlsbCwgbWFwLCBpbml0aWFsKSB7XHJcbiAgICByZXR1cm4gcGFyc2ltbW9uXzEuUGFyc2VyKGZ1bmN0aW9uIChpbnB1dCwgaSkge1xyXG4gICAgICAgIHZhciBhY2N1bSA9IGluaXRpYWw7XHJcbiAgICAgICAgdmFyIGogPSAwO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgd2hpbGUgKGkgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIGVuZENvZG9uRm91bmQgPSB0aWxsLl8oaW5wdXQsIGkpO1xyXG4gICAgICAgICAgICBpZiAoZW5kQ29kb25Gb3VuZC5zdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgIGkgPSBVdGlsc18xLm11c3RCZU51bWJlcihlbmRDb2RvbkZvdW5kLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBiaWdQYXJzZSA9IG1hbnlPZi5fKGlucHV0LCBpKTtcclxuICAgICAgICAgICAgaWYgKGlzTm90T2soYmlnUGFyc2UpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJpZ1BhcnNlO1xyXG4gICAgICAgICAgICByZXN1bHQgPSBVdGlsc18xLm11c3ROb3RCZVVuZGVmaW5lZChtZXJnZVJlcGxpZXMoYmlnUGFyc2UsIHJlc3VsdCkpO1xyXG4gICAgICAgICAgICBpZiAoaXNOb3RPayhyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gVXRpbHNfMS5tdXN0Tm90QmVVbmRlZmluZWQocmVzdWx0LnZhbHVlKTtcclxuICAgICAgICAgICAgYWNjdW0gPSBtYXAoYWNjdW0sIHZhbHVlKTtcclxuICAgICAgICAgICAgaSA9IFV0aWxzXzEubXVzdEJlTnVtYmVyKHJlc3VsdC5pbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQyID0gcGFyc2ltbW9uXzEubWFrZVN1Y2Nlc3MoaSwgYWNjdW0pO1xyXG4gICAgICAgIHJldHVybiBtdXN0QmVPayhtZXJnZVJlcGxpZXMocmVzdWx0MiwgcmVzdWx0KSk7XHJcbiAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBtYW55VGlsbChtYW55T2YsIHRpbGwpIHtcclxuICAgIHJldHVybiBtYW55VGlsbEFuZE1hcChtYW55T2YsIHRpbGwsIGZ1bmN0aW9uIChhLCBlbCkgeyByZXR1cm4gYS5jb25jYXQoW2VsXSk7IH0sIFtdKTtcclxufVxyXG5mdW5jdGlvbiB0b2tlbihwYXJzZXIpIHtcclxuICAgIHJldHVybiBwYXJzZXIuc2tpcCh3aGl0ZXNwYWNlKTtcclxufVxyXG5mdW5jdGlvbiB3b3JkKHN0cikge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLnN0cmluZyhzdHIpLnRocnUodG9rZW4pO1xyXG59XHJcbnZhciBsYnJhY2UgPSBcIntcIjtcclxudmFyIHJicmFjZSA9IFwifVwiO1xyXG52YXIgbGJyYWNrZXQgPSBcIltcIjtcclxudmFyIHJicmFja2V0ID0gXCJdXCI7XHJcbnZhciBjb21tYSA9IFwiLFwiO1xyXG52YXIgY29sb24gPSBcIjpcIjtcclxudmFyIG9wZW5pbmdCcmFja2V0ID0gcGFyc2ltbW9uXzEuc3RyaW5nKGxicmFja2V0KTtcclxudmFyIGNsb3NpbmdCcmFja2V0ID0gcGFyc2ltbW9uXzEuc3RyaW5nKHJicmFja2V0KTtcclxudmFyIGlzQ2xvc2luZ2JyYWNrZXQgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBzdHIgPT09IChyYnJhY2tldCk7IH07XHJcbmV4cG9ydHMubm90VGV4dERlZmF1bHQgPSB7XHJcbiAgICBcIiRcIjogdHJ1ZSxcclxuICAgIFwiJVwiOiB0cnVlLFxyXG4gICAgXCJcXFxcXCI6IHRydWUsXHJcbiAgICBcIntcIjogdHJ1ZSxcclxuICAgIFwiXVwiOiB0cnVlLFxyXG4gICAgXCJ9XCI6IHRydWVcclxufTtcclxuZXhwb3J0cy5ub3RUZXh0TWF0aE1vZGUgPSB7XHJcbiAgICBcIl5cIjogdHJ1ZSxcclxuICAgIFwiX1wiOiB0cnVlLFxyXG4gICAgXCIkXCI6IHRydWUsXHJcbiAgICBcIiVcIjogdHJ1ZSxcclxuICAgIFwiXFxcXFwiOiB0cnVlLFxyXG4gICAgXCJ7XCI6IHRydWUsXHJcbiAgICBcIl1cIjogdHJ1ZSxcclxuICAgIFwifVwiOiB0cnVlXHJcbn07XHJcbmV4cG9ydHMubm90VGV4dE1hdGhNb2RlQW5kTm90Q2xvc2luZ0JyYWNrZXQgPSB7XHJcbiAgICBcIl5cIjogdHJ1ZSxcclxuICAgIFwiX1wiOiB0cnVlLFxyXG4gICAgXCIkXCI6IHRydWUsXHJcbiAgICBcIiVcIjogdHJ1ZSxcclxuICAgIFwiXFxcXFwiOiB0cnVlLFxyXG4gICAgXCJ7XCI6IHRydWUsXHJcbiAgICBcIn1cIjogdHJ1ZVxyXG59O1xyXG5leHBvcnRzLm5vdFRleHREZWZhdWx0QW5kTm90Q2xvc2luZ0JyYWNrZXQgPSB7XHJcbiAgICBcIiRcIjogdHJ1ZSxcclxuICAgIFwiJVwiOiB0cnVlLFxyXG4gICAgXCJcXFxcXCI6IHRydWUsXHJcbiAgICBcIntcIjogdHJ1ZSxcclxuICAgIFwifVwiOiB0cnVlXHJcbn07XHJcbmZ1bmN0aW9uIHRha2VBdExlYXN0T25lVGlsbCh0aWxsKSB7XHJcbiAgICByZXR1cm4gcGFyc2ltbW9uXzEuUGFyc2VyKGZ1bmN0aW9uIChzdHIsIGkpIHtcclxuICAgICAgICB2YXIgZmlyc3RDaGFyID0gc3RyLmNoYXJBdChpKTtcclxuICAgICAgICBpZiAoaSA+PSBzdHIubGVuZ3RoIHx8IHRpbGwoZmlyc3RDaGFyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2ltbW9uXzIubWFrZUZhaWx1cmUoaSwgXCJ0ZXh0IGNoYXJhY3RlclwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBzdHJ6ID0gW2ZpcnN0Q2hhcl07XHJcbiAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgdmFyIGNoYXIgPSBzdHIuY2hhckF0KGkpO1xyXG4gICAgICAgICAgICB3aGlsZSAoIXRpbGwoY2hhcikgJiYgaSA8IHN0ci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHN0cnoucHVzaChjaGFyKTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIGNoYXIgPSBzdHIuY2hhckF0KGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzaW1tb25fMS5tYWtlU3VjY2VzcyhpLCBzdHJ6LmpvaW4oXCJcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHRleHRQYXJzZXIobm90VGV4dCkge1xyXG4gICAgcmV0dXJuIHRha2VBdExlYXN0T25lVGlsbChpc05vdFRleHQobm90VGV4dCkpXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbiAobWF0Y2gpIHsgcmV0dXJuIFN5bnRheF8yLm5ld1RlWFJhdyhtYXRjaCk7IH0pO1xyXG59XHJcbmV4cG9ydHMudGV4dFBhcnNlciA9IHRleHRQYXJzZXI7XHJcbnZhciB0ZXh0ID0gdGV4dFBhcnNlcihleHBvcnRzLm5vdFRleHREZWZhdWx0KTtcclxudmFyIHRleHQyID0gdGV4dFBhcnNlcihleHBvcnRzLm5vdFRleHREZWZhdWx0QW5kTm90Q2xvc2luZ0JyYWNrZXQpO1xyXG52YXIgc3BhY2VzID0gcGFyc2ltbW9uXzEucmVnZXhwKC8gKi8pXHJcbiAgICAubWFwKFN5bnRheF8yLm5ld1RlWFJhdyk7XHJcbmV4cG9ydHMuY29tbWVudCA9IGNvbW1lbnRTeW1ib2xcclxuICAgIC50aGVuKHRha2VUaWxsTmV3bGluZSlcclxuICAgIC5za2lwKG1heWJlTmV3bGluZSlcclxuICAgIC5tYXAoU3ludGF4XzEubmV3VGVYQ29tbWVudCk7XHJcbmV4cG9ydHMuc3BlY2lhbENoYXJzRGVmYXVsdCA9IHtcclxuICAgIFwiJ1wiOiB0cnVlLFxyXG4gICAgXCIoXCI6IHRydWUsXHJcbiAgICBcIilcIjogdHJ1ZSxcclxuICAgIFwiLFwiOiB0cnVlLFxyXG4gICAgXCIuXCI6IHRydWUsXHJcbiAgICBcIi1cIjogdHJ1ZSxcclxuICAgICdcIic6IHRydWUsXHJcbiAgICBcIiFcIjogdHJ1ZSxcclxuICAgIFwiXlwiOiB0cnVlLFxyXG4gICAgXCIkXCI6IHRydWUsXHJcbiAgICBcIiZcIjogdHJ1ZSxcclxuICAgIFwiI1wiOiB0cnVlLFxyXG4gICAgXCJ7XCI6IHRydWUsXHJcbiAgICBcIn1cIjogdHJ1ZSxcclxuICAgIFwiJVwiOiB0cnVlLFxyXG4gICAgXCJ+XCI6IHRydWUsXHJcbiAgICBcInxcIjogdHJ1ZSxcclxuICAgIFwiL1wiOiB0cnVlLFxyXG4gICAgXCI6XCI6IHRydWUsXHJcbiAgICBcIjtcIjogdHJ1ZSxcclxuICAgIFwiPVwiOiB0cnVlLFxyXG4gICAgXCJbXCI6IHRydWUsXHJcbiAgICBcIl1cIjogdHJ1ZSxcclxuICAgIFwiXFxcXFwiOiB0cnVlLFxyXG4gICAgXCJgXCI6IHRydWUsXHJcbiAgICBcIiBcIjogdHJ1ZVxyXG59O1xyXG5mdW5jdGlvbiBpc1NwZWNpYWxDaGFyYWN0ZXIoY2hhciwgc3BlY2lhbENoYXJzKSB7XHJcbiAgICB2YXIgY2hhcnMgPSBzcGVjaWFsQ2hhcnMgPT09IHVuZGVmaW5lZCA/IGV4cG9ydHMuc3BlY2lhbENoYXJzRGVmYXVsdCA6IHNwZWNpYWxDaGFycztcclxuICAgIHJldHVybiBjaGFycy5oYXNPd25Qcm9wZXJ0eShjaGFyKTtcclxufVxyXG5leHBvcnRzLmlzU3BlY2lhbENoYXJhY3RlciA9IGlzU3BlY2lhbENoYXJhY3RlcjtcclxuZnVuY3Rpb24gaXNOb3RUZXh0KG5vdFRleHQpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoY2hhcikgeyByZXR1cm4gbm90VGV4dC5oYXNPd25Qcm9wZXJ0eShjaGFyKTsgfTtcclxufVxyXG5leHBvcnRzLmlzTm90VGV4dCA9IGlzTm90VGV4dDtcclxuZXhwb3J0cy5tYXRoU3ltYm9sID0gcGFyc2ltbW9uXzEuc3RyaW5nKFwiJFwiKTtcclxuZXhwb3J0cy5jb21tYW5kU3ltYm9sID0gcGFyc2ltbW9uXzEuc3RyaW5nKFwiXFxcXFwiKTtcclxuZnVuY3Rpb24gbGF0ZXhCbG9ja1BhcnNlcihtb2RlLCBzdWIsIHN1cCkge1xyXG4gICAgaWYgKHN1YiA9PT0gdm9pZCAwKSB7IHN1YiA9IFwiX1wiOyB9XHJcbiAgICBpZiAoc3VwID09PSB2b2lkIDApIHsgc3VwID0gXCJeXCI7IH1cclxuICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgIGNhc2UgXCJNYXRoXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBleHBvcnRzLmxhdGV4QmxvY2tQYXJzZXJNYXRoTW9kZShzdWIsIHN1cCk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMubGF0ZXhCbG9ja1BhcnNlclRleHRNb2RlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMubGF0ZXhCbG9ja1BhcnNlciA9IGxhdGV4QmxvY2tQYXJzZXI7XHJcbmV4cG9ydHMubGF0ZXhCbG9ja1BhcnNlclRleHRNb2RlID0gcGFyc2ltbW9uXzEubGF6eShmdW5jdGlvbiAoKSB7IHJldHVybiBwYXJzaW1tb25fMS5hbHQocGFyc2ltbW9uXzEuYWx0KHRleHRQYXJzZXIoZXhwb3J0cy5ub3RUZXh0RGVmYXVsdCksIGV4cG9ydHMuZG9sTWF0aCwgZXhwb3J0cy5jb21tZW50LCB0ZXh0UGFyc2VyKGV4cG9ydHMubm90VGV4dERlZmF1bHRBbmROb3RDbG9zaW5nQnJhY2tldCksIGV4cG9ydHMuZW52aXJvbm1lbnQsIGNvbW1hbmQoXCJQYXJhZ3JhcGhcIikpKTsgfSk7XHJcbmV4cG9ydHMubGF0ZXhCbG9ja1BhcnNlck1hdGhNb2RlID0gZnVuY3Rpb24gKHN1Yiwgc3VwKSB7XHJcbiAgICByZXR1cm4gcGFyc2ltbW9uXzEubGF6eShmdW5jdGlvbiAoKSB7IHJldHVybiBwYXJzaW1tb25fMS5hbHQocGFyc2ltbW9uXzEuYWx0KHNoaWZ0ZWRTY3JpcHQoXCJNYXRoXCIsIHN1Yiwgc3VwKSwgdGV4dFBhcnNlcihleHBvcnRzLm5vdFRleHRNYXRoTW9kZSksIGV4cG9ydHMuZG9sTWF0aCwgZXhwb3J0cy5jb21tZW50LCB0ZXh0UGFyc2VyKGV4cG9ydHMubm90VGV4dE1hdGhNb2RlQW5kTm90Q2xvc2luZ0JyYWNrZXQpLCBleHBvcnRzLmVudmlyb25tZW50LCBjb21tYW5kKFwiTWF0aFwiKSkpOyB9KTtcclxufTtcclxuZXhwb3J0cy5sYXRleFBhcnNlciA9IGV4cG9ydHMubGF0ZXhCbG9ja1BhcnNlclRleHRNb2RlLm1hbnkoKTtcclxudmFyIGFub255bSA9IHBhcnNpbW1vbl8xLnN0cmluZyhsYnJhY2UpXHJcbiAgICAudGhlbihleHBvcnRzLmxhdGV4QmxvY2tQYXJzZXJUZXh0TW9kZS5tYW55KCkpXHJcbiAgICAuc2tpcChwYXJzaW1tb25fMS5zdHJpbmcocmJyYWNlKSk7XHJcbmV4cG9ydHMuZW52ID0gcGFyc2ltbW9uXzEuUGFyc2VyKGZ1bmN0aW9uIChpbnB1dCwgaSkge1xyXG4gICAgdmFyIGJlZ2luRm91bmQgPSBwYXJzaW1tb25fMS5zdHJpbmcoXCJcXFxcYmVnaW5cIilcclxuICAgICAgICAudGhlbihwYXJzaW1tb25fMS5zdHJpbmcobGJyYWNlKSlcclxuICAgICAgICAudGhlbihzcGFjZXMpXHJcbiAgICAgICAgLnRoZW4ocGFyc2ltbW9uXzEucmVnZXhwKC9bYS16QS1aXSsvKSlcclxuICAgICAgICAuc2tpcChzcGFjZXMpXHJcbiAgICAgICAgLnNraXAocGFyc2ltbW9uXzEuc3RyaW5nKHJicmFjZSkpXHJcbiAgICAgICAgLl8oaW5wdXQsIGkpO1xyXG4gICAgaWYgKGlzTm90T2soYmVnaW5Gb3VuZCkpXHJcbiAgICAgICAgcmV0dXJuIGJlZ2luRm91bmQ7XHJcbiAgICBpID0gVXRpbHNfMS5tdXN0QmVOdW1iZXIoYmVnaW5Gb3VuZC5pbmRleCk7XHJcbiAgICB2YXIgZW52TmFtZSA9IGJlZ2luRm91bmQudmFsdWU7XHJcbiAgICByZXR1cm4gbWFueVRpbGwoZXhwb3J0cy5sYXRleEJsb2NrUGFyc2VyVGV4dE1vZGUsIHBhcnNpbW1vbl8xLnN0cmluZyhcIlxcXFxlbmRcIilcclxuICAgICAgICAudGhlbihwYXJzaW1tb25fMS5zdHJpbmcobGJyYWNlKSlcclxuICAgICAgICAudGhlbihzcGFjZXMpXHJcbiAgICAgICAgLnRoZW4ocGFyc2ltbW9uXzEuc3RyaW5nKGVudk5hbWUpKVxyXG4gICAgICAgIC50aGVuKHNwYWNlcylcclxuICAgICAgICAudGhlbihwYXJzaW1tb25fMS5zdHJpbmcocmJyYWNlKSkpLm1hcChmdW5jdGlvbiAobGF0ZXgpIHsgcmV0dXJuIFN5bnRheF8xLm5ld1RlWEVudihlbnZOYW1lLCBsYXRleCk7IH0pLl8oaW5wdXQsIGkpO1xyXG59KTtcclxuZXhwb3J0cy5lbnZpcm9ubWVudCA9IHBhcnNpbW1vbl8xLmFsdChhbm9ueW0sIGV4cG9ydHMuZW52KTtcclxuZXhwb3J0cy5zcGVjaWFsQ2hhciA9IHBhcnNpbW1vbl8xLnRlc3QoaXNTcGVjaWFsQ2hhcmFjdGVyKTtcclxuZnVuY3Rpb24gaXNVcHBlcmNhc2VBbHBoKGMpIHtcclxuICAgIHJldHVybiBjID49IFwiQVwiICYmIGMgPD0gXCJaXCI7XHJcbn1cclxuZnVuY3Rpb24gaXNMb3dlcmNhc2VBbHBoKGMpIHtcclxuICAgIHJldHVybiBjID49IFwiYVwiICYmIGMgPD0gXCJ6XCI7XHJcbn1cclxuZXhwb3J0cy5lbmRDbWQgPSBmdW5jdGlvbiAoYykgeyByZXR1cm4gIWlzTG93ZXJjYXNlQWxwaChjKSAmJiAhaXNVcHBlcmNhc2VBbHBoKGMpOyB9O1xyXG52YXIgb3BlbmluZ0JyYWNlID0gcGFyc2ltbW9uXzEuc3RyaW5nKFwie1wiKTtcclxudmFyIGNsb3NpbmdCcmFjZSA9IHBhcnNpbW1vbl8xLnN0cmluZyhcIn1cIik7XHJcbnZhciBpc0Nsb3NpbmdCcmFjZSA9IGZ1bmN0aW9uIChzdHIpIHsgcmV0dXJuIHN0ciA9PT0gKFwifVwiKTsgfTtcclxuZnVuY3Rpb24gZml4QXJnKG1vZGUpIHtcclxuICAgIHJldHVybiBvcGVuaW5nQnJhY2VcclxuICAgICAgICAudGhlbihtYW55VGlsbChsYXRleEJsb2NrUGFyc2VyKG1vZGUsIFwiX1wiKSwgY2xvc2luZ0JyYWNlKSkubWFwKFN5bnRheF8xLm5ld0ZpeEFyZyk7XHJcbn1cclxuZXhwb3J0cy5maXhBcmcgPSBmaXhBcmc7XHJcbmZ1bmN0aW9uIG9wdEFyZyhtb2RlKSB7XHJcbiAgICByZXR1cm4gb3BlbmluZ0JyYWNrZXRcclxuICAgICAgICAudGhlbihtYW55VGlsbChsYXRleEJsb2NrUGFyc2VyKG1vZGUpLCBjbG9zaW5nQnJhY2tldCkpXHJcbiAgICAgICAgLm1hcChTeW50YXhfMS5uZXdPcHRBcmcpO1xyXG59XHJcbmV4cG9ydHMub3B0QXJnID0gb3B0QXJnO1xyXG5mdW5jdGlvbiBjbWRBcmcobW9kZSkge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLmFsdChmaXhBcmcobW9kZSksIG9wdEFyZyhtb2RlKSk7XHJcbn1cclxuZXhwb3J0cy5jbWRBcmcgPSBjbWRBcmc7XHJcbmZ1bmN0aW9uIGNtZEFyZ3MobW9kZSkge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLmFsdChwYXJzaW1tb25fMS5zdHJpbmcoXCJ7fVwiKS5tYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gW107IH0pLCBjbWRBcmcobW9kZSkubWFwKGZ1bmN0aW9uIChzKSB7IHJldHVybiBzOyB9KS5hdExlYXN0KDApKS5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGU7IH0pO1xyXG59XHJcbmV4cG9ydHMuY21kQXJncyA9IGNtZEFyZ3M7XHJcbmZ1bmN0aW9uIGNvbW1hbmQobW9kZSkge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLnNlcU1hcChleHBvcnRzLmNvbW1hbmRTeW1ib2wsIHBhcnNpbW1vbl8xLmFsdChleHBvcnRzLnNwZWNpYWxDaGFyLCBleHBvcnRzLnRha2VUaWxsKGV4cG9ydHMuZW5kQ21kKSksIGNtZEFyZ3MobW9kZSksIGZ1bmN0aW9uIChpZ25vcmVkLCBuYW1lLCBhcmd6KSB7XHJcbiAgICAgICAgcmV0dXJuIGFyZ3ogIT09IHVuZGVmaW5lZCA/IFN5bnRheF8xLm5ld1RlWENvbW0uYXBwbHkodm9pZCAwLCBbbmFtZV0uY29uY2F0KGFyZ3opKSA6IFN5bnRheF8xLm5ld1RlWENvbW0obmFtZSk7XHJcbiAgICB9KS5tYXAoZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnRzLmNvbW1hbmQgPSBjb21tYW5kO1xyXG5leHBvcnRzLnN1Yk9yU3VwZXJzY3JpcHRTeW1ib2xQYXJzZXIgPSBmdW5jdGlvbiAoc3Vic2NyaXB0U3ltYm9sLCBzdXBlcnNjcmlwdFN5bWJvbCkge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLmFsdChwYXJzaW1tb25fMS5zdHJpbmcoc3Vic2NyaXB0U3ltYm9sKSwgcGFyc2ltbW9uXzEuc3RyaW5nKHN1cGVyc2NyaXB0U3ltYm9sKSkubWFwKGZ1bmN0aW9uIChwYXJzZWRTdHIpIHsgcmV0dXJuIChwYXJzZWRTdHIgPT09IHN1YnNjcmlwdFN5bWJvbCA/IFN5bnRheF8xLlN1Yk9yU3VwZXJTeW1ib2wuU1VCIDogU3ludGF4XzEuU3ViT3JTdXBlclN5bWJvbC5TVVApOyB9KTtcclxufTtcclxuZnVuY3Rpb24gc2hpZnRlZFNjcmlwdChtb2RlLCBzdWIsIHN1cCkge1xyXG4gICAgcmV0dXJuIHBhcnNpbW1vbl8xLnNlcU1hcChleHBvcnRzLnN1Yk9yU3VwZXJzY3JpcHRTeW1ib2xQYXJzZXIoc3ViLCBzdXApLCBjbWRBcmdzKG1vZGUpLCBmdW5jdGlvbiAoc3ltYm9sLCBhcmd6KSB7XHJcbiAgICAgICAgcmV0dXJuIFN5bnRheF8xLm5ld1N1Yk9yU3VwZXJTY3JpcHQoc3ltYm9sLCBzeW1ib2wgPT09IFN5bnRheF8xLlN1Yk9yU3VwZXJTeW1ib2wuU1VCID8gc3ViIDogc3VwLCBhcmd6KTtcclxuICAgIH0pLm1hcChmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydHMuc2hpZnRlZFNjcmlwdCA9IHNoaWZ0ZWRTY3JpcHQ7XHJcbmV4cG9ydHMuZG9sTWF0aCA9IG1hdGgoKTtcclxuZnVuY3Rpb24gbWF0aChtYXRoVHlwZSwgc01hdGgsIGVNYXRoKSB7XHJcbiAgICBpZiAobWF0aFR5cGUgPT09IHZvaWQgMCkgeyBtYXRoVHlwZSA9IFwiRG9sbGFyXCI7IH1cclxuICAgIGlmIChzTWF0aCA9PT0gdm9pZCAwKSB7IHNNYXRoID0gXCIkXCI7IH1cclxuICAgIGlmIChlTWF0aCA9PT0gdm9pZCAwKSB7IGVNYXRoID0gXCIkXCI7IH1cclxuICAgIHJldHVybiBwYXJzaW1tb25fMS5zdHJpbmcoc01hdGgpXHJcbiAgICAgICAgLnRoZW4obGF0ZXhCbG9ja1BhcnNlcihcIk1hdGhcIiwgXCJfXCIpXHJcbiAgICAgICAgLm1hbnkoKVxyXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gU3ludGF4XzEubmV3VGVYTWF0aChtYXRoVHlwZSwgc01hdGgsIGVNYXRoLCBzdHIpOyB9KSlcclxuICAgICAgICAuc2tpcChwYXJzaW1tb25fMS5zdHJpbmcoZU1hdGgpKTtcclxufVxyXG5mdW5jdGlvbiBpc09rKHBhcnNlKSB7XHJcbiAgICByZXR1cm4gcGFyc2UgIT09IHVuZGVmaW5lZCAmJiBwYXJzZS5zdGF0dXMgPT09IHRydWU7XHJcbn1cclxuZXhwb3J0cy5pc09rID0gaXNPaztcclxuZnVuY3Rpb24gaXNOb3RPayhwYXJzZSkge1xyXG4gICAgcmV0dXJuIHBhcnNlICE9PSB1bmRlZmluZWQgJiYgcGFyc2Uuc3RhdHVzID09PSBmYWxzZTtcclxufVxyXG5leHBvcnRzLmlzTm90T2sgPSBpc05vdE9rO1xyXG5mdW5jdGlvbiBtdXN0QmVPayhwYXJzZSkge1xyXG4gICAgaWYgKCFpc09rKHBhcnNlKSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwYXJzZSB0byBiZSBzdWNjZXNzOiBcIiArIEpTT04uc3RyaW5naWZ5KHBhcnNlKSk7XHJcbiAgICByZXR1cm4gcGFyc2U7XHJcbn1cclxuZXhwb3J0cy5tdXN0QmVPayA9IG11c3RCZU9rO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1QYXJzZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFV0aWxzXzEgPSByZXF1aXJlKFwiLi4vLi4vLi4vVXRpbHNcIik7XHJcbnZhciBDYXRlZ29yeUNvZGVfMSA9IHJlcXVpcmUoXCIuLi8uLi9UZVgvQ2F0ZWdvcnlDb2RlXCIpO1xyXG5mdW5jdGlvbiBpc01lYXN1cmUoeCkge1xyXG4gICAgcmV0dXJuIGlzQnVpbHRJbk1lYXN1cmUoeCkgfHwgaXNDdXN0b21NZWFzdXJlKHgpO1xyXG59XHJcbmV4cG9ydHMuaXNNZWFzdXJlID0gaXNNZWFzdXJlO1xyXG5leHBvcnRzLm1lYXN1cmVUeXBlcyA9IHtcclxuICAgIFwicHRcIjogdHJ1ZSxcclxuICAgIFwibW1cIjogdHJ1ZSxcclxuICAgIFwiY21cIjogdHJ1ZSxcclxuICAgIFwiaW5cIjogdHJ1ZSxcclxuICAgIFwiZXhcIjogdHJ1ZSxcclxuICAgIFwiZW1cIjogdHJ1ZSxcclxufTtcclxuZnVuY3Rpb24gaXNNZWFzdXJlVHlwZSh4KSB7XHJcbiAgICByZXR1cm4gZXhwb3J0cy5tZWFzdXJlVHlwZXMuaGFzT3duUHJvcGVydHkoeCk7XHJcbn1cclxuZXhwb3J0cy5pc01lYXN1cmVUeXBlID0gaXNNZWFzdXJlVHlwZTtcclxuZnVuY3Rpb24gaXNCdWlsdEluTWVhc3VyZSh4KSB7XHJcbiAgICByZXR1cm4gaXNNZWFzdXJlVHlwZSh4LnR5cGUpICYmIFV0aWxzXzEuaXNOdW1iZXIoeC52YWx1ZSk7XHJcbn1cclxuZXhwb3J0cy5pc0J1aWx0SW5NZWFzdXJlID0gaXNCdWlsdEluTWVhc3VyZTtcclxuZnVuY3Rpb24gaXNDdXN0b21NZWFzdXJlKHgpIHtcclxuICAgIHJldHVybiBpc0xhVGVYQmxvY2soeC5leHByZXNzaW9uKTtcclxufVxyXG5leHBvcnRzLmlzQ3VzdG9tTWVhc3VyZSA9IGlzQ3VzdG9tTWVhc3VyZTtcclxuZXhwb3J0cy5tYXRoVHlwZXMgPSB7XHJcbiAgICBQYXJlbnRoZXNlczogXCJQYXJlbnRoZXNlc1wiLFxyXG4gICAgU3F1YXJlOiBcIlNxdWFyZVwiLFxyXG4gICAgRG9sbGFyOiBcIkRvbGxhclwiXHJcbn07XHJcbmZ1bmN0aW9uIGlzTWF0aFR5cGUoeCkge1xyXG4gICAgaWYgKHggPT09IHVuZGVmaW5lZClcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBlbHNlXHJcbiAgICAgICAgc3dpdGNoICh4KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJQYXJlbnRoZXNlc1wiOlxyXG4gICAgICAgICAgICBjYXNlIFwiU3F1YXJlXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJEb2xsYXJcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxufVxyXG5leHBvcnRzLmlzTWF0aFR5cGUgPSBpc01hdGhUeXBlO1xyXG5mdW5jdGlvbiBpc05hbWVIYXZpbmcoeCwgbmFtZSkge1xyXG4gICAgcmV0dXJuIHggIT09IHVuZGVmaW5lZCAmJiAobmFtZSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyB0eXBlb2YgeC5uYW1lID09PSBcInN0cmluZ1wiXHJcbiAgICAgICAgOiBuYW1lID09PSB4Lm5hbWUpO1xyXG59XHJcbmV4cG9ydHMuaXNOYW1lSGF2aW5nID0gaXNOYW1lSGF2aW5nO1xyXG5mdW5jdGlvbiBpc1RleHRIYXZpbmcoeCkge1xyXG4gICAgcmV0dXJuIHggIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgeC50ZXh0ID09PSBcInN0cmluZ1wiO1xyXG59XHJcbmV4cG9ydHMuaXNUZXh0SGF2aW5nID0gaXNUZXh0SGF2aW5nO1xyXG5mdW5jdGlvbiBpc0xhVGVYSGF2aW5nKHgpIHtcclxuICAgIHJldHVybiB4ICE9PSB1bmRlZmluZWQgJiYgVXRpbHNfMS5pc0FycmF5KHgubGF0ZXgpO1xyXG59XHJcbmV4cG9ydHMuaXNMYVRlWEhhdmluZyA9IGlzTGFUZVhIYXZpbmc7XHJcbmZ1bmN0aW9uIGlzQXJndW1lbnRIYXZpbmcoeCkge1xyXG4gICAgcmV0dXJuIHguYXJndW1lbnRzIGluc3RhbmNlb2YgQXJyYXk7XHJcbn1cclxuZXhwb3J0cy5pc0FyZ3VtZW50SGF2aW5nID0gaXNBcmd1bWVudEhhdmluZztcclxuZXhwb3J0cy50eXBlVGVYU2VxID0gXCJUZVhTZXFcIjtcclxuZXhwb3J0cy50eXBlVGVYRW52ID0gXCJUZVhFbnZcIjtcclxuZXhwb3J0cy50eXBlVGVYQnJhY2VzID0gXCJUZVhCcmFjZXNcIjtcclxuZXhwb3J0cy50eXBlVGVYQ29tbWVudCA9IFwiVGVYQ29tbWVudFwiO1xyXG5leHBvcnRzLnR5cGVUZVhSYXcgPSBcIlRlWFJhd1wiO1xyXG5leHBvcnRzLnR5cGVUZVhDb21tID0gXCJUZVhDb21tXCI7XHJcbmV4cG9ydHMudHlwZVRlWENvbW1TID0gXCJUZVhDb21tU1wiO1xyXG52YXIgU3ViT3JTdXBlclN5bWJvbDtcclxuKGZ1bmN0aW9uIChTdWJPclN1cGVyU3ltYm9sKSB7XHJcbiAgICBTdWJPclN1cGVyU3ltYm9sW1N1Yk9yU3VwZXJTeW1ib2xbXCJTVVBcIl0gPSAwXSA9IFwiU1VQXCI7XHJcbiAgICBTdWJPclN1cGVyU3ltYm9sW1N1Yk9yU3VwZXJTeW1ib2xbXCJTVUJcIl0gPSAxXSA9IFwiU1VCXCI7XHJcbn0pKFN1Yk9yU3VwZXJTeW1ib2wgPSBleHBvcnRzLlN1Yk9yU3VwZXJTeW1ib2wgfHwgKGV4cG9ydHMuU3ViT3JTdXBlclN5bWJvbCA9IHt9KSk7XHJcbmZ1bmN0aW9uIGlzU3ViT3JTdXBlclN5bWJvbCh4KSB7XHJcbiAgICByZXR1cm4geCA9PT0gU3ViT3JTdXBlclN5bWJvbC5TVVAgfHwgeCA9PT0gU3ViT3JTdXBlclN5bWJvbC5TVUI7XHJcbn1cclxuZXhwb3J0cy5pc1N1Yk9yU3VwZXJTeW1ib2wgPSBpc1N1Yk9yU3VwZXJTeW1ib2w7XHJcbmV4cG9ydHMuZnJvbVN0cmluZ0xhVGVYID0gZnVuY3Rpb24gKHgpIHsgcmV0dXJuIG5ld1RlWFJhdyhleHBvcnRzLnByb3RlY3RTdHJpbmcoeCkpOyB9O1xyXG5leHBvcnRzLnByb3RlY3RTdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgdmFyIG5ld1N0cmluZyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIG5ld1N0cmluZy5wdXNoKHByb3RlY3RDaGFyKHMuY2hhckF0KGkpKSk7XHJcbiAgICByZXR1cm4gbmV3U3RyaW5nLmpvaW4oKTtcclxufTtcclxuZnVuY3Rpb24gcHJvdGVjdENoYXIoYykge1xyXG4gICAgc3dpdGNoIChjKSB7XHJcbiAgICAgICAgY2FzZSBcIiNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiXFxcXCNcIjtcclxuICAgICAgICBjYXNlIFwiJFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFxcJFwiO1xyXG4gICAgICAgIGNhc2UgXCIlXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXFwlXCI7XHJcbiAgICAgICAgY2FzZSBcIl5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiXFxcXF57fVwiO1xyXG4gICAgICAgIGNhc2UgXCImXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXFwmXCI7XHJcbiAgICAgICAgY2FzZSBcIntcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiXFxcXHtcIjtcclxuICAgICAgICBjYXNlIFwifVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFxcfVwiO1xyXG4gICAgICAgIGNhc2UgXCJ+XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXFx+e31cIjtcclxuICAgICAgICBjYXNlIFwiXFxcXFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFxcdGV4dGJhY2tzbGFzaHt9XCI7XHJcbiAgICAgICAgY2FzZSBcIl9cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiXFxcXF97fVwiO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucHJvdGVjdENoYXIgPSBwcm90ZWN0Q2hhcjtcclxuZnVuY3Rpb24gaXNUeXBlSGF2aW5nKHgpIHtcclxuICAgIHZhciBhbnlPZlR5cGVzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGFueU9mVHlwZXNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW55T2ZUeXBlcy5sZW5ndGggPT09IDAgPyB0eXBlb2YgeC50eXBlID09PSBcInN0cmluZ1wiIDogYW55T2ZUeXBlcy5zb21lKGZ1bmN0aW9uICh0eXBlKSB7IHJldHVybiB4LnR5cGUgPT09IHR5cGU7IH0pO1xyXG59XHJcbmV4cG9ydHMuaXNUeXBlSGF2aW5nID0gaXNUeXBlSGF2aW5nO1xyXG5mdW5jdGlvbiBpc0xhVGVYQmxvY2soeCkge1xyXG4gICAgcmV0dXJuIGlzTGFUZVhSYXcoeCkgfHwgaXNMYVRlWE5vUmF3KHgpO1xyXG59XHJcbmV4cG9ydHMuaXNMYVRlWEJsb2NrID0gaXNMYVRlWEJsb2NrO1xyXG5mdW5jdGlvbiBpc0xhVGVYTm9SYXcoeCkge1xyXG4gICAgcmV0dXJuIGlzVGVYRW1wdHkoeClcclxuICAgICAgICB8fCBpc1RlWENoYXIoeClcclxuICAgICAgICB8fCBpc1RlWENvbW0oeClcclxuICAgICAgICB8fCBpc1RlWEVudih4KVxyXG4gICAgICAgIHx8IGlzVGVYTWF0aCh4KVxyXG4gICAgICAgIHx8IGlzVGVYTGluZUJyZWFrKHgpXHJcbiAgICAgICAgfHwgaXNUZVhCcmFjZXMoeClcclxuICAgICAgICB8fCBpc1RlWENvbW1lbnQoeCk7XHJcbn1cclxuZXhwb3J0cy5pc0xhVGVYTm9SYXcgPSBpc0xhVGVYTm9SYXc7XHJcbmZ1bmN0aW9uIGlzTGFUZVhSYXcoeCkge1xyXG4gICAgcmV0dXJuIGlzVGVYRW1wdHkoeClcclxuICAgICAgICB8fCBpc1RlWFJhdyh4KVxyXG4gICAgICAgIHx8IGlzVGVYQ29tbSh4KVxyXG4gICAgICAgIHx8IGlzVGVYRW52KHgpXHJcbiAgICAgICAgfHwgaXNUZVhNYXRoKHgpXHJcbiAgICAgICAgfHwgaXNUZVhMaW5lQnJlYWsoeClcclxuICAgICAgICB8fCBpc1RlWEJyYWNlcyh4KVxyXG4gICAgICAgIHx8IGlzVGVYQ29tbWVudCh4KTtcclxufVxyXG5leHBvcnRzLmlzTGFUZVhSYXcgPSBpc0xhVGVYUmF3O1xyXG5mdW5jdGlvbiBpc1RlWFJhdyh4KSB7XHJcbiAgICByZXR1cm4geCAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgJiYgeC50eXBlICE9PSB1bmRlZmluZWRcclxuICAgICAgICAmJiBpc1RleHRIYXZpbmcoeCkgJiYgaXNUeXBlSGF2aW5nKHgsIGV4cG9ydHMudHlwZVRlWFJhdyk7XHJcbn1cclxuZXhwb3J0cy5pc1RlWFJhdyA9IGlzVGVYUmF3O1xyXG5mdW5jdGlvbiBpc1RlWENoYXIoeCkge1xyXG4gICAgcmV0dXJuIHggIT09IHVuZGVmaW5lZFxyXG4gICAgICAgICYmIHR5cGVvZiB4LnN0cmluZyA9PT0gXCJzdHJpbmdcIlxyXG4gICAgICAgICYmIHR5cGVvZiB4LmNhdGVnb3J5ID09PSBcIm51bWJlclwiO1xyXG59XHJcbmV4cG9ydHMuaXNUZVhDaGFyID0gaXNUZVhDaGFyO1xyXG5mdW5jdGlvbiBpc1RlWENvbW0oeCkge1xyXG4gICAgcmV0dXJuIGlzTmFtZUhhdmluZyh4KVxyXG4gICAgICAgICYmIGlzQXJndW1lbnRIYXZpbmcoeClcclxuICAgICAgICAmJiBpc1R5cGVIYXZpbmcoeCwgZXhwb3J0cy50eXBlVGVYQ29tbSwgZXhwb3J0cy50eXBlVGVYQ29tbVMpO1xyXG59XHJcbmV4cG9ydHMuaXNUZVhDb21tID0gaXNUZVhDb21tO1xyXG5mdW5jdGlvbiBpc1RlWENvbW1TKHgpIHtcclxuICAgIHJldHVybiBpc1RlWENvbW0oeCkgJiYgeC5hcmd1bWVudHMubGVuZ3RoID09PSAwO1xyXG59XHJcbmV4cG9ydHMuaXNUZVhDb21tUyA9IGlzVGVYQ29tbVM7XHJcbmZ1bmN0aW9uIGlzVGVYRW52KHgsIG5hbWUpIHtcclxuICAgIHJldHVybiBpc1R5cGVIYXZpbmcoeCwgZXhwb3J0cy50eXBlVGVYRW52KTtcclxufVxyXG5leHBvcnRzLmlzVGVYRW52ID0gaXNUZVhFbnY7XHJcbmZ1bmN0aW9uIGlzVGVYTWF0aCh4KSB7XHJcbiAgICByZXR1cm4gaXNMYVRlWEhhdmluZyh4KSAmJiBpc1R5cGVIYXZpbmcoeCkgJiYgaXNNYXRoVHlwZSh4LnR5cGUpO1xyXG59XHJcbmV4cG9ydHMuaXNUZVhNYXRoID0gaXNUZVhNYXRoO1xyXG5mdW5jdGlvbiBpc1RlWExpbmVCcmVhayh4KSB7XHJcbiAgICByZXR1cm4geCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB4Lm5vTmV3UGFnZSA9PT0gXCJib29sZWFuXCIgJiYgKHgubWVhc3VyZSA9PT0gdW5kZWZpbmVkIHx8IGlzTWVhc3VyZSh4Lm1lYXN1cmUpKTtcclxufVxyXG5leHBvcnRzLmlzVGVYTGluZUJyZWFrID0gaXNUZVhMaW5lQnJlYWs7XHJcbmZ1bmN0aW9uIGlzU3ViT3JTdXBlclNjcmlwdCh4KSB7XHJcbiAgICByZXR1cm4gaXNTdWJPclN1cGVyU3ltYm9sKHgudHlwZSk7XHJcbn1cclxuZXhwb3J0cy5pc1N1Yk9yU3VwZXJTY3JpcHQgPSBpc1N1Yk9yU3VwZXJTY3JpcHQ7XHJcbmZ1bmN0aW9uIGlzVGVYQnJhY2VzKHgpIHtcclxuICAgIHJldHVybiBpc0xhVGVYSGF2aW5nKHgpICYmIGlzVHlwZUhhdmluZyh4LCBleHBvcnRzLnR5cGVUZVhCcmFjZXMpO1xyXG59XHJcbmV4cG9ydHMuaXNUZVhCcmFjZXMgPSBpc1RlWEJyYWNlcztcclxuZnVuY3Rpb24gaXNGaXhBcmcoeCkge1xyXG4gICAgcmV0dXJuIGlzVHlwZUhhdmluZyh4LCBcIkZpeEFyZ1wiKTtcclxufVxyXG5leHBvcnRzLmlzRml4QXJnID0gaXNGaXhBcmc7XHJcbmZ1bmN0aW9uIGlzT3B0QXJnKHgpIHtcclxuICAgIHJldHVybiBpc1R5cGVIYXZpbmcoeCwgXCJPcHRBcmdcIik7XHJcbn1cclxuZXhwb3J0cy5pc09wdEFyZyA9IGlzT3B0QXJnO1xyXG5mdW5jdGlvbiBpc1RlWENvbW1lbnQoeCkge1xyXG4gICAgcmV0dXJuIGlzVGV4dEhhdmluZyh4KSAmJiBpc1R5cGVIYXZpbmcoeCwgZXhwb3J0cy50eXBlVGVYQ29tbWVudCk7XHJcbn1cclxuZXhwb3J0cy5pc1RlWENvbW1lbnQgPSBpc1RlWENvbW1lbnQ7XHJcbmZ1bmN0aW9uIGlzVGVYRW1wdHkoZSkge1xyXG4gICAgcmV0dXJuIGUgIT09IHVuZGVmaW5lZCAmJiBPYmplY3Qua2V5cyhlKS5sZW5ndGggPT09IDA7XHJcbn1cclxuZXhwb3J0cy5pc1RlWEVtcHR5ID0gaXNUZVhFbXB0eTtcclxuZnVuY3Rpb24gbmV3Rml4QXJnKGwpIHtcclxuICAgIHJldHVybiB7IHR5cGU6IFwiRml4QXJnXCIsIGxhdGV4OiBsIH07XHJcbn1cclxuZXhwb3J0cy5uZXdGaXhBcmcgPSBuZXdGaXhBcmc7XHJcbmZ1bmN0aW9uIG5ld09wdEFyZyhsKSB7XHJcbiAgICByZXR1cm4gbC5sZW5ndGggPT09IDEgPyB7IHR5cGU6IFwiT3B0QXJnXCIsIGxhdGV4OiBsIH0gOiB7IHR5cGU6IFwiTU9wdEFyZ1wiLCBsYXRleDogbCB9O1xyXG59XHJcbmV4cG9ydHMubmV3T3B0QXJnID0gbmV3T3B0QXJnO1xyXG5mdW5jdGlvbiBuZXdTeW1BcmcobCkge1xyXG4gICAgcmV0dXJuIHsgdHlwZTogXCJTeW1BcmdcIiwgbGF0ZXg6IFtsXSB9O1xyXG59XHJcbmV4cG9ydHMubmV3U3ltQXJnID0gbmV3U3ltQXJnO1xyXG5mdW5jdGlvbiBuZXdQYXJBcmcobCkge1xyXG4gICAgcmV0dXJuIHsgdHlwZTogXCJQYXJBcmdcIiwgbGF0ZXg6IFtsXSB9O1xyXG59XHJcbmV4cG9ydHMubmV3UGFyQXJnID0gbmV3UGFyQXJnO1xyXG5mdW5jdGlvbiBuZXdNT3B0QXJnKGwpIHtcclxuICAgIHJldHVybiB7IHR5cGU6IFwiTU9wdEFyZ1wiLCBsYXRleDogbCB9O1xyXG59XHJcbmV4cG9ydHMubmV3TU9wdEFyZyA9IG5ld01PcHRBcmc7XHJcbmZ1bmN0aW9uIG5ld01TeW1BcmcobCkge1xyXG4gICAgcmV0dXJuIHsgdHlwZTogXCJNU3ltQXJnXCIsIGxhdGV4OiBsIH07XHJcbn1cclxuZXhwb3J0cy5uZXdNU3ltQXJnID0gbmV3TVN5bUFyZztcclxuZnVuY3Rpb24gbmV3TVBhckFyZyhsKSB7XHJcbiAgICByZXR1cm4geyB0eXBlOiBcIk1QYXJBcmdcIiwgbGF0ZXg6IGwgfTtcclxufVxyXG5leHBvcnRzLm5ld01QYXJBcmcgPSBuZXdNUGFyQXJnO1xyXG5mdW5jdGlvbiBuZXdDb21tYW5kUyhuYW1lKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgYXJndW1lbnRzOiBbXSxcclxuICAgICAgICB0eXBlOiBleHBvcnRzLnR5cGVUZVhDb21tU1xyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLm5ld0NvbW1hbmRTID0gbmV3Q29tbWFuZFM7XHJcbmZ1bmN0aW9uIG5ld1RlWFJhdyh0ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgdHlwZTogZXhwb3J0cy50eXBlVGVYUmF3LFxyXG4gICAgICAgIGNoYXJhY3RlckNhdGVnb3JpZXM6IENhdGVnb3J5Q29kZV8xLmNvbnZlcnRUb1RlWENoYXJzRGVmYXVsdCh0ZXh0KVxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLm5ld1RlWFJhdyA9IG5ld1RlWFJhdztcclxuZnVuY3Rpb24gbmV3VGVYTWF0aCh0eXBlLCBzdGFydFN5bWJvbCwgZW5kU3ltYm9sLCBsYXRleCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsYXRleDogbGF0ZXgsXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBzdGFydFN5bWJvbDogc3RhcnRTeW1ib2wsXHJcbiAgICAgICAgZW5kU3ltYm9sOiBlbmRTeW1ib2xcclxuICAgIH07XHJcbn1cclxuZXhwb3J0cy5uZXdUZVhNYXRoID0gbmV3VGVYTWF0aDtcclxuZnVuY3Rpb24gbmV3VGVYQnJhY2VzKGxhdGV4KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxhdGV4OiBbbGF0ZXhdLFxyXG4gICAgICAgIHR5cGU6IGV4cG9ydHMudHlwZVRlWEJyYWNlc1xyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLm5ld1RlWEJyYWNlcyA9IG5ld1RlWEJyYWNlcztcclxuZXhwb3J0cy5uZXdUZVhNYXRoRG9sID0gZnVuY3Rpb24gKGxhdGV4KSB7XHJcbiAgICByZXR1cm4gbmV3VGVYTWF0aChcIkRvbGxhclwiLCBcIiRcIiwgXCIkXCIsIGxhdGV4KTtcclxufTtcclxuZnVuY3Rpb24gbmV3VGVYQ29tbWVudCh0ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgdHlwZTogZXhwb3J0cy50eXBlVGVYQ29tbWVudFxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLm5ld1RlWENvbW1lbnQgPSBuZXdUZVhDb21tZW50O1xyXG5mdW5jdGlvbiBuZXdUZVhDb21tKG5hbWUpIHtcclxuICAgIHZhciBhcmdzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGFyZ3NbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgYXJndW1lbnRzOiBhcmdzLFxyXG4gICAgICAgIHR5cGU6IGV4cG9ydHMudHlwZVRlWENvbW1cclxuICAgIH07XHJcbn1cclxuZXhwb3J0cy5uZXdUZVhDb21tID0gbmV3VGVYQ29tbTtcclxuZnVuY3Rpb24gbmV3U3ViT3JTdXBlclNjcmlwdCh0eXBlLCBzeW1ib2wsIGFyZ3MpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBzeW1ib2w6IHN5bWJvbCxcclxuICAgICAgICBhcmd1bWVudHM6IGFyZ3NcclxuICAgIH07XHJcbn1cclxuZXhwb3J0cy5uZXdTdWJPclN1cGVyU2NyaXB0ID0gbmV3U3ViT3JTdXBlclNjcmlwdDtcclxuZnVuY3Rpb24gbmV3VGVYRW52KG5hbWUsIGxhdGV4KSB7XHJcbiAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBhcmdzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgIGxhdGV4OiBsYXRleCxcclxuICAgICAgICBhcmd1bWVudHM6IGFyZ3MsXHJcbiAgICAgICAgdHlwZTogZXhwb3J0cy50eXBlVGVYRW52XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMubmV3VGVYRW52ID0gbmV3VGVYRW52O1xyXG5mdW5jdGlvbiBzdHJpbmdpZnlMYVRlWCh0ZXgpIHtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIChzdHJpbmdpZnlMYVRlWElubmVyKHRleCwgYXJyKSk7XHJcbiAgICByZXR1cm4gYXJyLmpvaW4oXCJcIik7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdpZnlMYVRlWCA9IHN0cmluZ2lmeUxhVGVYO1xyXG5mdW5jdGlvbiBzdHJpbmdpZnlMYVRlWElubmVyKHRleCwgc29GYXIpIHtcclxuICAgIGlmIChpc1RlWENvbW0odGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2goXCJcXFxcXCIsIHRleC5uYW1lKTtcclxuICAgICAgICB0ZXguYXJndW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGwpIHsgcmV0dXJuIHN0cmluZ2lmeUxhVGVYSW5uZXIobCwgc29GYXIpOyB9KTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlzVGVYRW52KHRleCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IHN1cHBvcnRlZCB5ZXRcIik7XHJcbiAgICBlbHNlIGlmIChpc1RlWE1hdGgodGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2godGV4LnN0YXJ0U3ltYm9sKTtcclxuICAgICAgICB0ZXgubGF0ZXguZm9yRWFjaChmdW5jdGlvbiAodCkgeyByZXR1cm4gc3RyaW5naWZ5TGFUZVhJbm5lcih0LCBzb0Zhcik7IH0pO1xyXG4gICAgICAgIHNvRmFyLnB1c2godGV4LmVuZFN5bWJvbCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc1RlWExpbmVCcmVhayh0ZXgpKVxyXG4gICAgICAgIHNvRmFyLnB1c2goXCJcXG5cIik7XHJcbiAgICBlbHNlIGlmIChpc1N1Yk9yU3VwZXJTY3JpcHQodGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2godGV4LnN5bWJvbCk7XHJcbiAgICAgICAgaWYgKHRleC5hcmd1bWVudHMpXHJcbiAgICAgICAgICAgIHRleC5hcmd1bWVudHMuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7IHJldHVybiAoc3RyaW5naWZ5TGFUZVhJbm5lcihhcmcsIHNvRmFyKSk7IH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaXNUZVhCcmFjZXModGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2goXCJ7XCIpO1xyXG4gICAgICAgIHRleC5sYXRleC5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7IHJldHVybiBzdHJpbmdpZnlMYVRlWElubmVyKHQsIHNvRmFyKTsgfSk7XHJcbiAgICAgICAgc29GYXIucHVzaChcIn1cIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc1RlWENvbW1lbnQodGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2goXCIlXCIgKyB0ZXgudGV4dCArIFwiXFxuXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaXNUZVhSYXcodGV4KSlcclxuICAgICAgICBzb0Zhci5wdXNoKHRleC50ZXh0KTtcclxuICAgIGVsc2UgaWYgKGlzVGVYQ2hhcih0ZXgpKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vdCBzdXBwb3J0ZWQgeWV0XCIpO1xyXG4gICAgZWxzZSBpZiAoaXNGaXhBcmcodGV4KSkge1xyXG4gICAgICAgIHNvRmFyLnB1c2goXCJ7XCIpO1xyXG4gICAgICAgIHRleC5sYXRleC5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7IHJldHVybiBzdHJpbmdpZnlMYVRlWElubmVyKHQsIHNvRmFyKTsgfSk7XHJcbiAgICAgICAgc29GYXIucHVzaChcIn1cIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc09wdEFyZyh0ZXgpKSB7XHJcbiAgICAgICAgc29GYXIucHVzaChcIltcIik7XHJcbiAgICAgICAgdGV4LmxhdGV4LmZvckVhY2goZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHN0cmluZ2lmeUxhVGVYSW5uZXIodCwgc29GYXIpOyB9KTtcclxuICAgICAgICBzb0Zhci5wdXNoKFwiXVwiKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEaWQgbm90IHJlY29nbml6ZSBcIiArIEpTT04uc3RyaW5naWZ5KHRleCkpO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN5bnRheC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmRlZmF1bHRDYXRlZ29yaWVzID0gZnVuY3Rpb24gKGNoYXIpIHtcclxuICAgIHN3aXRjaCAoY2hhcikge1xyXG4gICAgICAgIGNhc2UgXCJcXFxcXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIGNhc2UgXCJ7XCI6XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgXCJ9XCI6XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIGNhc2UgXCIkXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgIGNhc2UgXCImXCI6XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIGNhc2UgXCJcXHJcIjpcclxuICAgICAgICAgICAgcmV0dXJuIDU7XHJcbiAgICAgICAgY2FzZSBcIiNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgY2FzZSBcIl5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIDc7XHJcbiAgICAgICAgY2FzZSBcIl9cIjpcclxuICAgICAgICAgICAgcmV0dXJuIDg7XHJcbiAgICAgICAgY2FzZSBcIlxcMFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gOTtcclxuICAgICAgICBjYXNlIFwiIFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gMTA7XHJcbiAgICAgICAgY2FzZSBcIn5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIDEzO1xyXG4gICAgICAgIGNhc2UgXCIlXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAxNDtcclxuICAgICAgICBjYXNlIFwiXFxkXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAxNTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gMTE7XHJcbiAgICB9XHJcbn07XHJcbmZ1bmN0aW9uIGNvbnZlcnRUb1RlWENoYXJzRGVmYXVsdChzdHIpIHtcclxuICAgIHJldHVybiBjb252ZXJ0VG9UZVhDaGFycyhleHBvcnRzLmRlZmF1bHRDYXRlZ29yaWVzLCBzdHIpO1xyXG59XHJcbmV4cG9ydHMuY29udmVydFRvVGVYQ2hhcnNEZWZhdWx0ID0gY29udmVydFRvVGVYQ2hhcnNEZWZhdWx0O1xyXG5mdW5jdGlvbiBjb252ZXJ0VG9UZVhDaGFycyhjYXRlZ29yeU1hcCwgc3RyKSB7XHJcbiAgICB2YXIgY2hhcnMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNoYXJBdCA9IHN0ci5jaGFyQXQoaSk7XHJcbiAgICAgICAgY2hhcnMucHVzaCh7XHJcbiAgICAgICAgICAgIHN0cmluZzogY2hhckF0LFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlNYXAoY2hhckF0KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoYXJzO1xyXG59XHJcbmV4cG9ydHMuY29udmVydFRvVGVYQ2hhcnMgPSBjb252ZXJ0VG9UZVhDaGFycztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlDb2RlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmZ1bmN0aW9uIHVwZGF0ZVByb3BlcnRpZXModGFyZ2V0LCB2YWx1ZXMsIG9wdF9rZXlzLCBvcHRfYXR0cmlidXRlcykge1xyXG4gICAgaWYgKG9wdF9hdHRyaWJ1dGVzID09PSB2b2lkIDApIHsgb3B0X2F0dHJpYnV0ZXMgPSB7XHJcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH07IH1cclxuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIE9iamVjdCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ0YXJnZXRcIiBpc25cXCd0IGFuIE9iamVjdCBpbnN0YW5jZScpO1xyXG4gICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGlmICghKHZhbHVlcyBpbnN0YW5jZW9mIE9iamVjdCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJwcm9wZXJ0aWVzXCIgaXNuXFwndCBhbiBPYmplY3QgaW5zdGFuY2UnKTtcclxuICAgIGlmIChvcHRfYXR0cmlidXRlcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgb3B0X2F0dHJpYnV0ZXMgPSB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCEob3B0X2F0dHJpYnV0ZXMgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJhdHRyaWJ1dGVzXCIgaXNuXFwndCBhbiBPYmplY3QgaW5zdGFuY2UnKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRfa2V5cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWVzW2tleV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuY3JlYXRlKG9wdF9hdHRyaWJ1dGVzLCB7IHZhbHVlOiB7IHZhbHVlOiB2YWx1ZXNba2V5XSB9IH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG9wdF9rZXlzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBvcHRfa2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlc1trZXldICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmNyZWF0ZShvcHRfYXR0cmlidXRlcywgeyB2YWx1ZTogeyB2YWx1ZTogdmFsdWVzW2tleV0gfSB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG9wdF9rZXlzIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgdGFyZ2V0S2V5IGluIG9wdF9rZXlzKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBvcHRfa2V5c1t0YXJnZXRLZXldO1xyXG4gICAgICAgICAgICBpZiAodmFsdWVzW2tleV0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHRhcmdldEtleSwgT2JqZWN0LmNyZWF0ZShvcHRfYXR0cmlidXRlcywgeyB2YWx1ZTogeyB2YWx1ZTogdmFsdWVzW2tleV0gfSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJrZXlzXCIgaXNuXFwndCBhbiBPYmplY3QgaW5zdGFuY2UnKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnVwZGF0ZVByb3BlcnRpZXMgPSB1cGRhdGVQcm9wZXJ0aWVzO1xyXG5mdW5jdGlvbiB0ZXN0UHJvcGVydGllcyh0YXJnZXQsIHZhbHVlcywgb3B0X2tleXMsIG9wdF9za2lwVW5kZWZpbmVkKSB7XHJcbiAgICBpZiAob3B0X3NraXBVbmRlZmluZWQgPT09IHZvaWQgMCkgeyBvcHRfc2tpcFVuZGVmaW5lZCA9IHRydWU7IH1cclxuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIE9iamVjdCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ0YXJnZXRcIiBpc25cXCd0IGFuIE9iamVjdCBpbnN0YW5jZScpO1xyXG4gICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKCEodmFsdWVzIGluc3RhbmNlb2YgT2JqZWN0KSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInByb3BlcnRpZXNcIiBpc25cXCd0IGFuIE9iamVjdCBpbnN0YW5jZScpO1xyXG4gICAgaWYgKG9wdF9za2lwVW5kZWZpbmVkID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgb3B0X3NraXBVbmRlZmluZWQgPSB0cnVlO1xyXG4gICAgaWYgKG9wdF9rZXlzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRba2V5XSAhPT0gdmFsdWVzW2tleV1cclxuICAgICAgICAgICAgICAgICYmICEodmFsdWVzW2tleV0gPT09IHVuZGVmaW5lZCAmJiBvcHRfc2tpcFVuZGVmaW5lZCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAob3B0X2tleXMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgIHJldHVybiBvcHRfa2V5cy5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRba2V5XSA9PT0gdmFsdWVzW2tleV0gfHwgKHZhbHVlc1trZXldID09PSB1bmRlZmluZWQgJiYgb3B0X3NraXBVbmRlZmluZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAob3B0X2tleXMgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICBmb3IgKHZhciB0YXJnZXRLZXkgaW4gb3B0X2tleXMpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IG9wdF9rZXlzW3RhcmdldEtleV07XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRbdGFyZ2V0S2V5XSAhPT0gdmFsdWVzW2tleV0gJiYgISh2YWx1ZXNba2V5XSA9PT0gdW5kZWZpbmVkICYmIG9wdF9za2lwVW5kZWZpbmVkKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImtleXNcIiBpc25cXCd0IGFuIE9iamVjdCBpbnN0YW5jZScpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuZXhwb3J0cy50ZXN0UHJvcGVydGllcyA9IHRlc3RQcm9wZXJ0aWVzO1xyXG5leHBvcnRzLm11c3RCZU51bWJlciA9IGZ1bmN0aW9uIChhLCBtc2cpIHtcclxuICAgIGlmICghKGlzTnVtYmVyKGEpKSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyA/IG1zZyA6IFwiRXhwZWN0ZWQgbnVtYmVyXCIpO1xyXG4gICAgcmV0dXJuIGE7XHJcbn07XHJcbmZ1bmN0aW9uIGlzTnVtYmVyKHgpIHtcclxuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJudW1iZXJcIjtcclxufVxyXG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XHJcbmZ1bmN0aW9uIGlzU3RyaW5nKHgpIHtcclxuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJzdHJpbmdcIjtcclxufVxyXG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XHJcbmZ1bmN0aW9uIG11c3ROb3RCZVVuZGVmaW5lZCh4LCBtc2cpIHtcclxuICAgIGlmICgheClcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcclxuICAgIHJldHVybiB4O1xyXG59XHJcbmV4cG9ydHMubXVzdE5vdEJlVW5kZWZpbmVkID0gbXVzdE5vdEJlVW5kZWZpbmVkO1xyXG5mdW5jdGlvbiBtdXN0QmVPYmplY3QobywgbXNnKSB7XHJcbiAgICBpZiAoIShvIGluc3RhbmNlb2YgT2JqZWN0KSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyA/IG1zZyA6IFwiRXhwZWN0ZWQgT2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIG87XHJcbn1cclxuZXhwb3J0cy5tdXN0QmVPYmplY3QgPSBtdXN0QmVPYmplY3Q7XHJcbmZ1bmN0aW9uIG11c3RCZVN0cmluZyhvLCBtc2cpIHtcclxuICAgIGlmICh0eXBlb2YgbyAhPT0gXCJzdHJpbmdcIilcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyA/IG1zZyA6IFwiRXhwZWN0ZWQgc3RyaW5nXCIpO1xyXG4gICAgcmV0dXJuIG87XHJcbn1cclxuZXhwb3J0cy5tdXN0QmVTdHJpbmcgPSBtdXN0QmVTdHJpbmc7XHJcbmZ1bmN0aW9uIG11c3RCZUFycmF5KGEsIG1zZykge1xyXG4gICAgaWYgKCEoaXNBcnJheShhKSkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cgPyBtc2cgOiBcIkV4cGVjdGVkIEFycmF5XCIpO1xyXG4gICAgcmV0dXJuIGE7XHJcbn1cclxuZXhwb3J0cy5tdXN0QmVBcnJheSA9IG11c3RCZUFycmF5O1xyXG5mdW5jdGlvbiBpc0FycmF5KHgpIHtcclxuICAgIHJldHVybiAhIXggJiYgeC5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XHJcbn1cclxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcclxuZXhwb3J0cy5tY29uY2F0ID0gZnVuY3Rpb24gKG1hcHBlbmQpIHtcclxuICAgIHZhciBhcmdzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGFyZ3NbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJncy5yZWR1Y2VSaWdodChtYXBwZW5kKTtcclxufTtcclxuZXhwb3J0cy5zbmQgPSBmdW5jdGlvbiAocGFpcikgeyByZXR1cm4gcGFpclsxXTsgfTtcclxuZnVuY3Rpb24gY29uY2F0TWFwKGFyciwgZikge1xyXG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgYXJyLm1hcChmKSk7XHJcbn1cclxuZXhwb3J0cy5jb25jYXRNYXAgPSBjb25jYXRNYXA7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVV0aWxzLmpzLm1hcCIsIiFmdW5jdGlvbihuLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuUGFyc2ltbW9uPXQoKTpuLlBhcnNpbW1vbj10KCl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6dGhpcyxmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihuKXt2YXIgdD17fTtmdW5jdGlvbiByKGUpe2lmKHRbZV0pcmV0dXJuIHRbZV0uZXhwb3J0czt2YXIgdT10W2VdPXtpOmUsbDohMSxleHBvcnRzOnt9fTtyZXR1cm4gbltlXS5jYWxsKHUuZXhwb3J0cyx1LHUuZXhwb3J0cyxyKSx1Lmw9ITAsdS5leHBvcnRzfXJldHVybiByLm09bixyLmM9dCxyLmQ9ZnVuY3Rpb24obix0LGUpe3IubyhuLHQpfHxPYmplY3QuZGVmaW5lUHJvcGVydHkobix0LHtjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCxnZXQ6ZX0pfSxyLnI9ZnVuY3Rpb24obil7T2JqZWN0LmRlZmluZVByb3BlcnR5KG4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSl9LHIubj1mdW5jdGlvbihuKXt2YXIgdD1uJiZuLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gbi5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBufTtyZXR1cm4gci5kKHQsXCJhXCIsdCksdH0sci5vPWZ1bmN0aW9uKG4sdCl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuLHQpfSxyLnA9XCJcIixyKHIucz0wKX0oW2Z1bmN0aW9uKG4sdCxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBlKG4pe2lmKCEodGhpcyBpbnN0YW5jZW9mIGUpKXJldHVybiBuZXcgZShuKTt0aGlzLl89bn12YXIgdT1lLnByb3RvdHlwZTtmdW5jdGlvbiBvKG4sdCl7Zm9yKHZhciByPTA7cjxuO3IrKyl0KHIpfWZ1bmN0aW9uIGkobix0LHIpe3JldHVybiBmdW5jdGlvbihuLHQpe28odC5sZW5ndGgsZnVuY3Rpb24ocil7bih0W3JdLHIsdCl9KX0oZnVuY3Rpb24ocixlLHUpe3Q9bih0LHIsZSx1KX0sciksdH1mdW5jdGlvbiBhKG4sdCl7cmV0dXJuIGkoZnVuY3Rpb24odCxyLGUsdSl7cmV0dXJuIHQuY29uY2F0KFtuKHIsZSx1KV0pfSxbXSx0KX1mdW5jdGlvbiBmKG4sdCl7dmFyIHI9e3Y6MCxidWY6dH07cmV0dXJuIG8obixmdW5jdGlvbigpe3ZhciBuO3I9e3Y6ci52PDwxfChuPXIuYnVmLG5bMF0+PjcpLGJ1ZjpmdW5jdGlvbihuKXt2YXIgdD1pKGZ1bmN0aW9uKG4sdCxyLGUpe3JldHVybiBuLmNvbmNhdChyPT09ZS5sZW5ndGgtMT9CdWZmZXIuZnJvbShbdCwwXSkucmVhZFVJbnQxNkJFKDApOmUucmVhZFVJbnQxNkJFKHIpKX0sW10sbik7cmV0dXJuIEJ1ZmZlci5mcm9tKGEoZnVuY3Rpb24obil7cmV0dXJuKG48PDEmNjU1MzUpPj44fSx0KSl9KHIuYnVmKX19KSxyfWZ1bmN0aW9uIGMoKXtyZXR1cm5cInVuZGVmaW5lZFwiIT10eXBlb2YgQnVmZmVyfWZ1bmN0aW9uIHMoKXtpZighYygpKXRocm93IG5ldyBFcnJvcihcIkJ1ZmZlciBnbG9iYWwgZG9lcyBub3QgZXhpc3Q7IHBsZWFzZSB1c2Ugd2VicGFjayBpZiB5b3UgbmVlZCB0byBwYXJzZSBCdWZmZXJzIGluIHRoZSBicm93c2VyLlwiKX1mdW5jdGlvbiBsKG4pe3MoKTt2YXIgdD1pKGZ1bmN0aW9uKG4sdCl7cmV0dXJuIG4rdH0sMCxuKTtpZih0JTghPTApdGhyb3cgbmV3IEVycm9yKFwiVGhlIGJpdHMgW1wiK24uam9pbihcIiwgXCIpK1wiXSBhZGQgdXAgdG8gXCIrdCtcIiB3aGljaCBpcyBub3QgYW4gZXZlbiBudW1iZXIgb2YgYnl0ZXM7IHRoZSB0b3RhbCBzaG91bGQgYmUgZGl2aXNpYmxlIGJ5IDhcIik7dmFyIHIsdT10Lzgsbz0ocj1mdW5jdGlvbihuKXtyZXR1cm4gbj40OH0saShmdW5jdGlvbihuLHQpe3JldHVybiBufHwocih0KT90Om4pfSxudWxsLG4pKTtpZihvKXRocm93IG5ldyBFcnJvcihvK1wiIGJpdCByYW5nZSByZXF1ZXN0ZWQgZXhjZWVkcyA0OCBiaXQgKDYgYnl0ZSkgTnVtYmVyIG1heC5cIik7cmV0dXJuIG5ldyBlKGZ1bmN0aW9uKHQscil7dmFyIGU9dStyO3JldHVybiBlPnQubGVuZ3RoP3gocix1LnRvU3RyaW5nKCkrXCIgYnl0ZXNcIik6YihlLGkoZnVuY3Rpb24obix0KXt2YXIgcj1mKHQsbi5idWYpO3JldHVybntjb2xsOm4uY29sbC5jb25jYXQoci52KSxidWY6ci5idWZ9fSx7Y29sbDpbXSxidWY6dC5zbGljZShyLGUpfSxuKS5jb2xsKX0pfWZ1bmN0aW9uIGgobix0KXtyZXR1cm4gbmV3IGUoZnVuY3Rpb24ocixlKXtyZXR1cm4gcygpLGUrdD5yLmxlbmd0aD94KGUsdCtcIiBieXRlcyBmb3IgXCIrbik6YihlK3Qsci5zbGljZShlLGUrdCkpfSl9ZnVuY3Rpb24gcChuLHQpe2lmKFwibnVtYmVyXCIhPXR5cGVvZihyPXQpfHxNYXRoLmZsb29yKHIpIT09cnx8dDwwfHx0PjYpdGhyb3cgbmV3IEVycm9yKG4rXCIgcmVxdWlyZXMgaW50ZWdlciBsZW5ndGggaW4gcmFuZ2UgWzAsIDZdLlwiKTt2YXIgcn1mdW5jdGlvbiBkKG4pe3JldHVybiBwKFwidWludEJFXCIsbiksaChcInVpbnRCRShcIituK1wiKVwiLG4pLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5yZWFkVUludEJFKDAsbil9KX1mdW5jdGlvbiB2KG4pe3JldHVybiBwKFwidWludExFXCIsbiksaChcInVpbnRMRShcIituK1wiKVwiLG4pLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5yZWFkVUludExFKDAsbil9KX1mdW5jdGlvbiBnKG4pe3JldHVybiBwKFwiaW50QkVcIixuKSxoKFwiaW50QkUoXCIrbitcIilcIixuKS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQucmVhZEludEJFKDAsbil9KX1mdW5jdGlvbiBtKG4pe3JldHVybiBwKFwiaW50TEVcIixuKSxoKFwiaW50TEUoXCIrbitcIilcIixuKS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQucmVhZEludExFKDAsbil9KX1mdW5jdGlvbiB5KG4pe3JldHVybiBuIGluc3RhbmNlb2YgZX1mdW5jdGlvbiBFKG4pe3JldHVyblwiW29iamVjdCBBcnJheV1cIj09PXt9LnRvU3RyaW5nLmNhbGwobil9ZnVuY3Rpb24gdyhuKXtyZXR1cm4gYygpJiZCdWZmZXIuaXNCdWZmZXIobil9ZnVuY3Rpb24gYihuLHQpe3JldHVybntzdGF0dXM6ITAsaW5kZXg6bix2YWx1ZTp0LGZ1cnRoZXN0Oi0xLGV4cGVjdGVkOltdfX1mdW5jdGlvbiB4KG4sdCl7cmV0dXJuIEUodCl8fCh0PVt0XSkse3N0YXR1czohMSxpbmRleDotMSx2YWx1ZTpudWxsLGZ1cnRoZXN0Om4sZXhwZWN0ZWQ6dH19ZnVuY3Rpb24gQihuLHQpe2lmKCF0KXJldHVybiBuO2lmKG4uZnVydGhlc3Q+dC5mdXJ0aGVzdClyZXR1cm4gbjt2YXIgcj1uLmZ1cnRoZXN0PT09dC5mdXJ0aGVzdD9mdW5jdGlvbihuLHQpe2lmKGZ1bmN0aW9uKCl7aWYodm9pZCAwIT09ZS5fc3VwcG9ydHNTZXQpcmV0dXJuIGUuX3N1cHBvcnRzU2V0O3ZhciBuPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBTZXQ7cmV0dXJuIGUuX3N1cHBvcnRzU2V0PW4sbn0oKSYmQXJyYXkuZnJvbSl7Zm9yKHZhciByPW5ldyBTZXQobiksdT0wO3U8dC5sZW5ndGg7dSsrKXIuYWRkKHRbdV0pO3ZhciBvPUFycmF5LmZyb20ocik7cmV0dXJuIG8uc29ydCgpLG99Zm9yKHZhciBpPXt9LGE9MDthPG4ubGVuZ3RoO2ErKylpW25bYV1dPSEwO2Zvcih2YXIgZj0wO2Y8dC5sZW5ndGg7ZisrKWlbdFtmXV09ITA7dmFyIGM9W107Zm9yKHZhciBzIGluIGkpKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGkscykmJmMucHVzaChzKTtyZXR1cm4gYy5zb3J0KCksY30obi5leHBlY3RlZCx0LmV4cGVjdGVkKTp0LmV4cGVjdGVkO3JldHVybntzdGF0dXM6bi5zdGF0dXMsaW5kZXg6bi5pbmRleCx2YWx1ZTpuLnZhbHVlLGZ1cnRoZXN0OnQuZnVydGhlc3QsZXhwZWN0ZWQ6cn19dmFyIGo9e307ZnVuY3Rpb24gUyhuLHQpe2lmKHcobikpcmV0dXJue29mZnNldDp0LGxpbmU6LTEsY29sdW1uOi0xfTtuIGluIGp8fChqW25dPXt9KTtmb3IodmFyIHI9altuXSxlPTAsdT0wLG89MCxpPXQ7aT49MDspe2lmKGkgaW4gcil7ZT1yW2ldLmxpbmUsMD09PW8mJihvPXJbaV0ubGluZVN0YXJ0KTticmVha30oXCJcXG5cIj09PW4uY2hhckF0KGkpfHxcIlxcclwiPT09bi5jaGFyQXQoaSkmJlwiXFxuXCIhPT1uLmNoYXJBdChpKzEpKSYmKHUrKywwPT09byYmKG89aSsxKSksaS0tfXZhciBhPWUrdSxmPXQtbztyZXR1cm4gclt0XT17bGluZTphLGxpbmVTdGFydDpvfSx7b2Zmc2V0OnQsbGluZTphKzEsY29sdW1uOmYrMX19ZnVuY3Rpb24gXyhuKXtpZigheShuKSl0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSBwYXJzZXI6IFwiK24pfWZ1bmN0aW9uIEwobix0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2Ygbj9uLmNoYXJBdCh0KTpuW3RdfWZ1bmN0aW9uIE8obil7aWYoXCJudW1iZXJcIiE9dHlwZW9mIG4pdGhyb3cgbmV3IEVycm9yKFwibm90IGEgbnVtYmVyOiBcIituKX1mdW5jdGlvbiBrKG4pe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4pdGhyb3cgbmV3IEVycm9yKFwibm90IGEgZnVuY3Rpb246IFwiK24pfWZ1bmN0aW9uIFAobil7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIG4pdGhyb3cgbmV3IEVycm9yKFwibm90IGEgc3RyaW5nOiBcIituKX12YXIgcT0yLEE9MyxJPTgsRj01KkksTT00Kkksej1cIiAgXCI7ZnVuY3Rpb24gUihuLHQpe3JldHVybiBuZXcgQXJyYXkodCsxKS5qb2luKG4pfWZ1bmN0aW9uIFUobix0LHIpe3ZhciBlPXQtbi5sZW5ndGg7cmV0dXJuIGU8PTA/bjpSKHIsZSkrbn1mdW5jdGlvbiBXKG4sdCxyLGUpe3JldHVybntmcm9tOm4tdD4wP24tdDowLHRvOm4rcj5lP2U6bityfX1mdW5jdGlvbiBEKG4sdCl7dmFyIHIsZSx1LG8sZixjPXQuaW5kZXgscz1jLm9mZnNldCxsPTE7aWYocz09PW4ubGVuZ3RoKXJldHVyblwiR290IHRoZSBlbmQgb2YgdGhlIGlucHV0XCI7aWYodyhuKSl7dmFyIGg9cy1zJUkscD1zLWgsZD1XKGgsRixNK0ksbi5sZW5ndGgpLHY9YShmdW5jdGlvbihuKXtyZXR1cm4gYShmdW5jdGlvbihuKXtyZXR1cm4gVShuLnRvU3RyaW5nKDE2KSwyLFwiMFwiKX0sbil9LGZ1bmN0aW9uKG4sdCl7dmFyIHI9bi5sZW5ndGgsZT1bXSx1PTA7aWYocjw9dClyZXR1cm5bbi5zbGljZSgpXTtmb3IodmFyIG89MDtvPHI7bysrKWVbdV18fGUucHVzaChbXSksZVt1XS5wdXNoKG5bb10pLChvKzEpJXQ9PTAmJnUrKztyZXR1cm4gZX0obi5zbGljZShkLmZyb20sZC50bykudG9KU09OKCkuZGF0YSxJKSk7bz1mdW5jdGlvbihuKXtyZXR1cm4gMD09PW4uZnJvbSYmMT09PW4udG8/e2Zyb206bi5mcm9tLHRvOm4udG99Ontmcm9tOm4uZnJvbS9JLHRvOk1hdGguZmxvb3Iobi50by9JKX19KGQpLGU9aC9JLHI9MypwLHA+PTQmJihyKz0xKSxsPTIsdT1hKGZ1bmN0aW9uKG4pe3JldHVybiBuLmxlbmd0aDw9ND9uLmpvaW4oXCIgXCIpOm4uc2xpY2UoMCw0KS5qb2luKFwiIFwiKStcIiAgXCIrbi5zbGljZSg0KS5qb2luKFwiIFwiKX0sdiksKGY9KDgqKG8udG8+MD9vLnRvLTE6by50bykpLnRvU3RyaW5nKDE2KS5sZW5ndGgpPDImJihmPTIpfWVsc2V7dmFyIGc9bi5zcGxpdCgvXFxyXFxufFtcXG5cXHJcXHUyMDI4XFx1MjAyOV0vKTtyPWMuY29sdW1uLTEsZT1jLmxpbmUtMSxvPVcoZSxxLEEsZy5sZW5ndGgpLHU9Zy5zbGljZShvLmZyb20sby50byksZj1vLnRvLnRvU3RyaW5nKCkubGVuZ3RofXZhciBtPWUtby5mcm9tO3JldHVybiB3KG4pJiYoZj0oOCooby50bz4wP28udG8tMTpvLnRvKSkudG9TdHJpbmcoMTYpLmxlbmd0aCk8MiYmKGY9MiksaShmdW5jdGlvbih0LGUsdSl7dmFyIGksYT11PT09bSxjPWE/XCI+IFwiOno7cmV0dXJuIGk9dyhuKT9VKCg4KihvLmZyb20rdSkpLnRvU3RyaW5nKDE2KSxmLFwiMFwiKTpVKChvLmZyb20rdSsxKS50b1N0cmluZygpLGYsXCIgXCIpLFtdLmNvbmNhdCh0LFtjK2krXCIgfCBcIitlXSxhP1t6K1IoXCIgXCIsZikrXCIgfCBcIitVKFwiXCIscixcIiBcIikrUihcIl5cIixsKV06W10pfSxbXSx1KS5qb2luKFwiXFxuXCIpfWZ1bmN0aW9uIE4obix0KXtyZXR1cm5bXCJcXG5cIixcIi0tIFBBUlNJTkcgRkFJTEVEIFwiK1IoXCItXCIsNTApLFwiXFxuXFxuXCIsRChuLHQpLFwiXFxuXFxuXCIsKHI9dC5leHBlY3RlZCwxPT09ci5sZW5ndGg/XCJFeHBlY3RlZDpcXG5cXG5cIityWzBdOlwiRXhwZWN0ZWQgb25lIG9mIHRoZSBmb2xsb3dpbmc6IFxcblxcblwiK3Iuam9pbihcIiwgXCIpKSxcIlxcblwiXS5qb2luKFwiXCIpO3ZhciByfWZ1bmN0aW9uIEcobil7cmV0dXJuIHZvaWQgMCE9PW4uZmxhZ3M/bi5mbGFnczpbbi5nbG9iYWw/XCJnXCI6XCJcIixuLmlnbm9yZUNhc2U/XCJpXCI6XCJcIixuLm11bHRpbGluZT9cIm1cIjpcIlwiLG4udW5pY29kZT9cInVcIjpcIlwiLG4uc3RpY2t5P1wieVwiOlwiXCJdLmpvaW4oXCJcIil9ZnVuY3Rpb24gQygpe2Zvcih2YXIgbj1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksdD1uLmxlbmd0aCxyPTA7cjx0O3IrPTEpXyhuW3JdKTtyZXR1cm4gZShmdW5jdGlvbihyLGUpe2Zvcih2YXIgdSxvPW5ldyBBcnJheSh0KSxpPTA7aTx0O2krPTEpe2lmKCEodT1CKG5baV0uXyhyLGUpLHUpKS5zdGF0dXMpcmV0dXJuIHU7b1tpXT11LnZhbHVlLGU9dS5pbmRleH1yZXR1cm4gQihiKGUsbyksdSl9KX1mdW5jdGlvbiBKKCl7dmFyIG49W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO2lmKDA9PT1uLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJzZXFNYXAgbmVlZHMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50XCIpO3ZhciB0PW4ucG9wKCk7cmV0dXJuIGsodCksQy5hcHBseShudWxsLG4pLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gdC5hcHBseShudWxsLG4pfSl9ZnVuY3Rpb24gVCgpe3ZhciBuPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSx0PW4ubGVuZ3RoO2lmKDA9PT10KXJldHVybiBZKFwiemVybyBhbHRlcm5hdGVzXCIpO2Zvcih2YXIgcj0wO3I8dDtyKz0xKV8obltyXSk7cmV0dXJuIGUoZnVuY3Rpb24odCxyKXtmb3IodmFyIGUsdT0wO3U8bi5sZW5ndGg7dSs9MSlpZigoZT1CKG5bdV0uXyh0LHIpLGUpKS5zdGF0dXMpcmV0dXJuIGU7cmV0dXJuIGV9KX1mdW5jdGlvbiBWKG4sdCl7cmV0dXJuIEgobix0KS5vcihYKFtdKSl9ZnVuY3Rpb24gSChuLHQpe3JldHVybiBfKG4pLF8odCksSihuLHQudGhlbihuKS5tYW55KCksZnVuY3Rpb24obix0KXtyZXR1cm5bbl0uY29uY2F0KHQpfSl9ZnVuY3Rpb24gSyhuKXtQKG4pO3ZhciB0PVwiJ1wiK24rXCInXCI7cmV0dXJuIGUoZnVuY3Rpb24ocixlKXt2YXIgdT1lK24ubGVuZ3RoLG89ci5zbGljZShlLHUpO3JldHVybiBvPT09bj9iKHUsbyk6eChlLHQpfSl9ZnVuY3Rpb24gUShuLHQpeyFmdW5jdGlvbihuKXtpZighKG4gaW5zdGFuY2VvZiBSZWdFeHApKXRocm93IG5ldyBFcnJvcihcIm5vdCBhIHJlZ2V4cDogXCIrbik7Zm9yKHZhciB0PUcobikscj0wO3I8dC5sZW5ndGg7cisrKXt2YXIgZT10LmNoYXJBdChyKTtpZihcImlcIiE9PWUmJlwibVwiIT09ZSYmXCJ1XCIhPT1lJiZcInNcIiE9PWUpdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCByZWdleHAgZmxhZyBcIicrZSsnXCI6ICcrbil9fShuKSxhcmd1bWVudHMubGVuZ3RoPj0yP08odCk6dD0wO3ZhciByPWZ1bmN0aW9uKG4pe3JldHVybiBSZWdFeHAoXCJeKD86XCIrbi5zb3VyY2UrXCIpXCIsRyhuKSl9KG4pLHU9XCJcIituO3JldHVybiBlKGZ1bmN0aW9uKG4sZSl7dmFyIG89ci5leGVjKG4uc2xpY2UoZSkpO2lmKG8pe2lmKDA8PXQmJnQ8PW8ubGVuZ3RoKXt2YXIgaT1vWzBdLGE9b1t0XTtyZXR1cm4gYihlK2kubGVuZ3RoLGEpfXJldHVybiB4KGUsXCJ2YWxpZCBtYXRjaCBncm91cCAoMCB0byBcIitvLmxlbmd0aCtcIikgaW4gXCIrdSl9cmV0dXJuIHgoZSx1KX0pfWZ1bmN0aW9uIFgobil7cmV0dXJuIGUoZnVuY3Rpb24odCxyKXtyZXR1cm4gYihyLG4pfSl9ZnVuY3Rpb24gWShuKXtyZXR1cm4gZShmdW5jdGlvbih0LHIpe3JldHVybiB4KHIsbil9KX1mdW5jdGlvbiBaKG4pe2lmKHkobikpcmV0dXJuIGUoZnVuY3Rpb24odCxyKXt2YXIgZT1uLl8odCxyKTtyZXR1cm4gZS5pbmRleD1yLGUudmFsdWU9XCJcIixlfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIG4pcmV0dXJuIFooSyhuKSk7aWYobiBpbnN0YW5jZW9mIFJlZ0V4cClyZXR1cm4gWihRKG4pKTt0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSBzdHJpbmcsIHJlZ2V4cCwgb3IgcGFyc2VyOiBcIituKX1mdW5jdGlvbiAkKG4pe3JldHVybiBfKG4pLGUoZnVuY3Rpb24odCxyKXt2YXIgZT1uLl8odCxyKSx1PXQuc2xpY2UocixlLmluZGV4KTtyZXR1cm4gZS5zdGF0dXM/eChyLCdub3QgXCInK3UrJ1wiJyk6YihyLG51bGwpfSl9ZnVuY3Rpb24gbm4obil7cmV0dXJuIGsobiksZShmdW5jdGlvbih0LHIpe3ZhciBlPUwodCxyKTtyZXR1cm4gcjx0Lmxlbmd0aCYmbihlKT9iKHIrMSxlKTp4KHIsXCJhIGNoYXJhY3Rlci9ieXRlIG1hdGNoaW5nIFwiK24pfSl9ZnVuY3Rpb24gdG4obix0KXthcmd1bWVudHMubGVuZ3RoPDImJih0PW4sbj12b2lkIDApO3ZhciByPWUoZnVuY3Rpb24obixlKXtyZXR1cm4gci5fPXQoKS5fLHIuXyhuLGUpfSk7cmV0dXJuIG4/ci5kZXNjKG4pOnJ9ZnVuY3Rpb24gcm4oKXtyZXR1cm4gWShcImZhbnRhc3ktbGFuZC9lbXB0eVwiKX11LnBhcnNlPWZ1bmN0aW9uKG4pe2lmKFwic3RyaW5nXCIhPXR5cGVvZiBuJiYhdyhuKSl0aHJvdyBuZXcgRXJyb3IoXCIucGFyc2UgbXVzdCBiZSBjYWxsZWQgd2l0aCBhIHN0cmluZyBvciBCdWZmZXIgYXMgaXRzIGFyZ3VtZW50XCIpO3ZhciB0LHI9dGhpcy5za2lwKGFuKS5fKG4sMCk7cmV0dXJuIHQ9ci5zdGF0dXM/e3N0YXR1czohMCx2YWx1ZTpyLnZhbHVlfTp7c3RhdHVzOiExLGluZGV4OlMobixyLmZ1cnRoZXN0KSxleHBlY3RlZDpyLmV4cGVjdGVkfSxkZWxldGUgaltuXSx0fSx1LnRyeVBhcnNlPWZ1bmN0aW9uKG4pe3ZhciB0PXRoaXMucGFyc2Uobik7aWYodC5zdGF0dXMpcmV0dXJuIHQudmFsdWU7dmFyIHI9TihuLHQpLGU9bmV3IEVycm9yKHIpO3Rocm93IGUudHlwZT1cIlBhcnNpbW1vbkVycm9yXCIsZS5yZXN1bHQ9dCxlfSx1LmFzc2VydD1mdW5jdGlvbihuLHQpe3JldHVybiB0aGlzLmNoYWluKGZ1bmN0aW9uKHIpe3JldHVybiBuKHIpP1gocik6WSh0KX0pfSx1Lm9yPWZ1bmN0aW9uKG4pe3JldHVybiBUKHRoaXMsbil9LHUudHJpbT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy53cmFwKG4sbil9LHUud3JhcD1mdW5jdGlvbihuLHQpe3JldHVybiBKKG4sdGhpcyx0LGZ1bmN0aW9uKG4sdCl7cmV0dXJuIHR9KX0sdS50aHJ1PWZ1bmN0aW9uKG4pe3JldHVybiBuKHRoaXMpfSx1LnRoZW49ZnVuY3Rpb24obil7cmV0dXJuIF8obiksQyh0aGlzLG4pLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gblsxXX0pfSx1Lm1hbnk9ZnVuY3Rpb24oKXt2YXIgbj10aGlzO3JldHVybiBlKGZ1bmN0aW9uKHQscil7Zm9yKHZhciBlPVtdLHU9dm9pZCAwOzspe2lmKCEodT1CKG4uXyh0LHIpLHUpKS5zdGF0dXMpcmV0dXJuIEIoYihyLGUpLHUpO2lmKHI9PT11LmluZGV4KXRocm93IG5ldyBFcnJvcihcImluZmluaXRlIGxvb3AgZGV0ZWN0ZWQgaW4gLm1hbnkoKSBwYXJzZXIgLS0tIGNhbGxpbmcgLm1hbnkoKSBvbiBhIHBhcnNlciB3aGljaCBjYW4gYWNjZXB0IHplcm8gY2hhcmFjdGVycyBpcyB1c3VhbGx5IHRoZSBjYXVzZVwiKTtyPXUuaW5kZXgsZS5wdXNoKHUudmFsdWUpfX0pfSx1LnRpZVdpdGg9ZnVuY3Rpb24obil7cmV0dXJuIFAobiksdGhpcy5tYXAoZnVuY3Rpb24odCl7aWYoZnVuY3Rpb24obil7aWYoIUUobikpdGhyb3cgbmV3IEVycm9yKFwibm90IGFuIGFycmF5OiBcIituKX0odCksdC5sZW5ndGgpe1AodFswXSk7Zm9yKHZhciByPXRbMF0sZT0xO2U8dC5sZW5ndGg7ZSsrKVAodFtlXSkscis9bit0W2VdO3JldHVybiByfXJldHVyblwiXCJ9KX0sdS50aWU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50aWVXaXRoKFwiXCIpfSx1LnRpbWVzPWZ1bmN0aW9uKG4sdCl7dmFyIHI9dGhpcztyZXR1cm4gYXJndW1lbnRzLmxlbmd0aDwyJiYodD1uKSxPKG4pLE8odCksZShmdW5jdGlvbihlLHUpe2Zvcih2YXIgbz1bXSxpPXZvaWQgMCxhPXZvaWQgMCxmPTA7ZjxuO2YrPTEpe2lmKGE9QihpPXIuXyhlLHUpLGEpLCFpLnN0YXR1cylyZXR1cm4gYTt1PWkuaW5kZXgsby5wdXNoKGkudmFsdWUpfWZvcig7Zjx0JiYoYT1CKGk9ci5fKGUsdSksYSksaS5zdGF0dXMpO2YrPTEpdT1pLmluZGV4LG8ucHVzaChpLnZhbHVlKTtyZXR1cm4gQihiKHUsbyksYSl9KX0sdS5yZXN1bHQ9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKCl7cmV0dXJuIG59KX0sdS5hdE1vc3Q9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMudGltZXMoMCxuKX0sdS5hdExlYXN0PWZ1bmN0aW9uKG4pe3JldHVybiBKKHRoaXMudGltZXMobiksdGhpcy5tYW55KCksZnVuY3Rpb24obix0KXtyZXR1cm4gbi5jb25jYXQodCl9KX0sdS5tYXA9ZnVuY3Rpb24obil7ayhuKTt2YXIgdD10aGlzO3JldHVybiBlKGZ1bmN0aW9uKHIsZSl7dmFyIHU9dC5fKHIsZSk7cmV0dXJuIHUuc3RhdHVzP0IoYih1LmluZGV4LG4odS52YWx1ZSkpLHUpOnV9KX0sdS5jb250cmFtYXA9ZnVuY3Rpb24obil7ayhuKTt2YXIgdD10aGlzO3JldHVybiBlKGZ1bmN0aW9uKHIsZSl7dmFyIHU9dC5wYXJzZShuKHIuc2xpY2UoZSkpKTtyZXR1cm4gdS5zdGF0dXM/YihlK3IubGVuZ3RoLHUudmFsdWUpOnV9KX0sdS5wcm9tYXA9ZnVuY3Rpb24obix0KXtyZXR1cm4gayhuKSxrKHQpLHRoaXMuY29udHJhbWFwKG4pLm1hcCh0KX0sdS5za2lwPWZ1bmN0aW9uKG4pe3JldHVybiBDKHRoaXMsbikubWFwKGZ1bmN0aW9uKG4pe3JldHVybiBuWzBdfSl9LHUubWFyaz1mdW5jdGlvbigpe3JldHVybiBKKGVuLHRoaXMsZW4sZnVuY3Rpb24obix0LHIpe3JldHVybntzdGFydDpuLHZhbHVlOnQsZW5kOnJ9fSl9LHUubm9kZT1mdW5jdGlvbihuKXtyZXR1cm4gSihlbix0aGlzLGVuLGZ1bmN0aW9uKHQscixlKXtyZXR1cm57bmFtZTpuLHZhbHVlOnIsc3RhcnQ6dCxlbmQ6ZX19KX0sdS5zZXBCeT1mdW5jdGlvbihuKXtyZXR1cm4gVih0aGlzLG4pfSx1LnNlcEJ5MT1mdW5jdGlvbihuKXtyZXR1cm4gSCh0aGlzLG4pfSx1Lmxvb2thaGVhZD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5za2lwKFoobikpfSx1Lm5vdEZvbGxvd2VkQnk9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuc2tpcCgkKG4pKX0sdS5kZXNjPWZ1bmN0aW9uKG4pe0Uobil8fChuPVtuXSk7dmFyIHQ9dGhpcztyZXR1cm4gZShmdW5jdGlvbihyLGUpe3ZhciB1PXQuXyhyLGUpO3JldHVybiB1LnN0YXR1c3x8KHUuZXhwZWN0ZWQ9biksdX0pfSx1LmZhbGxiYWNrPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLm9yKFgobikpfSx1LmFwPWZ1bmN0aW9uKG4pe3JldHVybiBKKG4sdGhpcyxmdW5jdGlvbihuLHQpe3JldHVybiBuKHQpfSl9LHUuY2hhaW49ZnVuY3Rpb24obil7dmFyIHQ9dGhpcztyZXR1cm4gZShmdW5jdGlvbihyLGUpe3ZhciB1PXQuXyhyLGUpO3JldHVybiB1LnN0YXR1cz9CKG4odS52YWx1ZSkuXyhyLHUuaW5kZXgpLHUpOnV9KX0sdS5jb25jYXQ9dS5vcix1LmVtcHR5PXJuLHUub2Y9WCx1W1wiZmFudGFzeS1sYW5kL2FwXCJdPXUuYXAsdVtcImZhbnRhc3ktbGFuZC9jaGFpblwiXT11LmNoYWluLHVbXCJmYW50YXN5LWxhbmQvY29uY2F0XCJdPXUuY29uY2F0LHVbXCJmYW50YXN5LWxhbmQvZW1wdHlcIl09dS5lbXB0eSx1W1wiZmFudGFzeS1sYW5kL29mXCJdPXUub2YsdVtcImZhbnRhc3ktbGFuZC9tYXBcIl09dS5tYXA7dmFyIGVuPWUoZnVuY3Rpb24obix0KXtyZXR1cm4gYih0LFMobix0KSl9KSx1bj1lKGZ1bmN0aW9uKG4sdCl7cmV0dXJuIHQ+PW4ubGVuZ3RoP3godCxcImFueSBjaGFyYWN0ZXIvYnl0ZVwiKTpiKHQrMSxMKG4sdCkpfSksb249ZShmdW5jdGlvbihuLHQpe3JldHVybiBiKG4ubGVuZ3RoLG4uc2xpY2UodCkpfSksYW49ZShmdW5jdGlvbihuLHQpe3JldHVybiB0PG4ubGVuZ3RoP3godCxcIkVPRlwiKTpiKHQsbnVsbCl9KSxmbj1RKC9bMC05XS8pLmRlc2MoXCJhIGRpZ2l0XCIpLGNuPVEoL1swLTldKi8pLmRlc2MoXCJvcHRpb25hbCBkaWdpdHNcIiksc249USgvW2Etel0vaSkuZGVzYyhcImEgbGV0dGVyXCIpLGxuPVEoL1thLXpdKi9pKS5kZXNjKFwib3B0aW9uYWwgbGV0dGVyc1wiKSxobj1RKC9cXHMqLykuZGVzYyhcIm9wdGlvbmFsIHdoaXRlc3BhY2VcIikscG49USgvXFxzKy8pLmRlc2MoXCJ3aGl0ZXNwYWNlXCIpLGRuPUsoXCJcXHJcIiksdm49SyhcIlxcblwiKSxnbj1LKFwiXFxyXFxuXCIpLG1uPVQoZ24sdm4sZG4pLmRlc2MoXCJuZXdsaW5lXCIpLHluPVQobW4sYW4pO2UuYWxsPW9uLGUuYWx0PVQsZS5hbnk9dW4sZS5jcj1kbixlLmNyZWF0ZUxhbmd1YWdlPWZ1bmN0aW9uKG4pe3ZhciB0PXt9O2Zvcih2YXIgciBpbiBuKSh7fSkuaGFzT3duUHJvcGVydHkuY2FsbChuLHIpJiZmdW5jdGlvbihyKXt0W3JdPXRuKGZ1bmN0aW9uKCl7cmV0dXJuIG5bcl0odCl9KX0ocik7cmV0dXJuIHR9LGUuY3JsZj1nbixlLmN1c3RvbT1mdW5jdGlvbihuKXtyZXR1cm4gZShuKGIseCkpfSxlLmRpZ2l0PWZuLGUuZGlnaXRzPWNuLGUuZW1wdHk9cm4sZS5lbmQ9eW4sZS5lb2Y9YW4sZS5mYWlsPVksZS5mb3JtYXRFcnJvcj1OLGUuaW5kZXg9ZW4sZS5pc1BhcnNlcj15LGUubGF6eT10bixlLmxldHRlcj1zbixlLmxldHRlcnM9bG4sZS5sZj12bixlLmxvb2thaGVhZD1aLGUubWFrZUZhaWx1cmU9eCxlLm1ha2VTdWNjZXNzPWIsZS5uZXdsaW5lPW1uLGUubm9uZU9mPWZ1bmN0aW9uKG4pe3JldHVybiBubihmdW5jdGlvbih0KXtyZXR1cm4gbi5pbmRleE9mKHQpPDB9KS5kZXNjKFwibm9uZSBvZiAnXCIrbitcIidcIil9LGUubm90Rm9sbG93ZWRCeT0kLGUub2Y9WCxlLm9uZU9mPWZ1bmN0aW9uKG4pe2Zvcih2YXIgdD1uLnNwbGl0KFwiXCIpLHI9MDtyPHQubGVuZ3RoO3IrKyl0W3JdPVwiJ1wiK3Rbcl0rXCInXCI7cmV0dXJuIG5uKGZ1bmN0aW9uKHQpe3JldHVybiBuLmluZGV4T2YodCk+PTB9KS5kZXNjKHQpfSxlLm9wdFdoaXRlc3BhY2U9aG4sZS5QYXJzZXI9ZSxlLnJhbmdlPWZ1bmN0aW9uKG4sdCl7cmV0dXJuIG5uKGZ1bmN0aW9uKHIpe3JldHVybiBuPD1yJiZyPD10fSkuZGVzYyhuK1wiLVwiK3QpfSxlLnJlZ2V4PVEsZS5yZWdleHA9USxlLnNlcEJ5PVYsZS5zZXBCeTE9SCxlLnNlcT1DLGUuc2VxTWFwPUosZS5zZXFPYmo9ZnVuY3Rpb24oKXtmb3IodmFyIG4sdD17fSxyPTAsdT0obj1hcmd1bWVudHMsQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobikpLG89dS5sZW5ndGgsaT0wO2k8bztpKz0xKXt2YXIgYT11W2ldO2lmKCF5KGEpKXtpZihFKGEpJiYyPT09YS5sZW5ndGgmJlwic3RyaW5nXCI9PXR5cGVvZiBhWzBdJiZ5KGFbMV0pKXt2YXIgZj1hWzBdO2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGYpKXRocm93IG5ldyBFcnJvcihcInNlcU9iajogZHVwbGljYXRlIGtleSBcIitmKTt0W2ZdPSEwLHIrKztjb250aW51ZX10aHJvdyBuZXcgRXJyb3IoXCJzZXFPYmogYXJndW1lbnRzIG11c3QgYmUgcGFyc2VycyBvciBbc3RyaW5nLCBwYXJzZXJdIGFycmF5IHBhaXJzLlwiKX19aWYoMD09PXIpdGhyb3cgbmV3IEVycm9yKFwic2VxT2JqIGV4cGVjdHMgYXQgbGVhc3Qgb25lIG5hbWVkIHBhcnNlciwgZm91bmQgemVyb1wiKTtyZXR1cm4gZShmdW5jdGlvbihuLHQpe2Zvcih2YXIgcixlPXt9LGk9MDtpPG87aSs9MSl7dmFyIGEsZjtpZihFKHVbaV0pPyhhPXVbaV1bMF0sZj11W2ldWzFdKTooYT1udWxsLGY9dVtpXSksIShyPUIoZi5fKG4sdCkscikpLnN0YXR1cylyZXR1cm4gcjthJiYoZVthXT1yLnZhbHVlKSx0PXIuaW5kZXh9cmV0dXJuIEIoYih0LGUpLHIpfSl9LGUuc3RyaW5nPUssZS5zdWNjZWVkPVgsZS50YWtlV2hpbGU9ZnVuY3Rpb24obil7cmV0dXJuIGsobiksZShmdW5jdGlvbih0LHIpe2Zvcih2YXIgZT1yO2U8dC5sZW5ndGgmJm4oTCh0LGUpKTspZSsrO3JldHVybiBiKGUsdC5zbGljZShyLGUpKX0pfSxlLnRlc3Q9bm4sZS53aGl0ZXNwYWNlPXBuLGVbXCJmYW50YXN5LWxhbmQvZW1wdHlcIl09cm4sZVtcImZhbnRhc3ktbGFuZC9vZlwiXT1YLGUuQmluYXJ5PXtiaXRTZXE6bCxiaXRTZXFPYmo6ZnVuY3Rpb24obil7cygpO3ZhciB0PXt9LHI9MCxlPWEoZnVuY3Rpb24obil7aWYoRShuKSl7dmFyIGU9bjtpZigyIT09ZS5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiW1wiK2Uuam9pbihcIiwgXCIpK1wiXSBzaG91bGQgYmUgbGVuZ3RoIDIsIGdvdCBsZW5ndGggXCIrZS5sZW5ndGgpO2lmKFAoZVswXSksTyhlWzFdKSxPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxlWzBdKSl0aHJvdyBuZXcgRXJyb3IoXCJkdXBsaWNhdGUga2V5IGluIGJpdFNlcU9iajogXCIrZVswXSk7cmV0dXJuIHRbZVswXV09ITAscisrLGV9cmV0dXJuIE8obiksW251bGwsbl19LG4pO2lmKHI8MSl0aHJvdyBuZXcgRXJyb3IoXCJiaXRTZXFPYmogZXhwZWN0cyBhdCBsZWFzdCBvbmUgbmFtZWQgcGFpciwgZ290IFtcIituLmpvaW4oXCIsIFwiKStcIl1cIik7dmFyIHU9YShmdW5jdGlvbihuKXtyZXR1cm4gblswXX0sZSk7cmV0dXJuIGwoYShmdW5jdGlvbihuKXtyZXR1cm4gblsxXX0sZSkpLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gaShmdW5jdGlvbihuLHQpe3JldHVybiBudWxsIT09dFswXSYmKG5bdFswXV09dFsxXSksbn0se30sYShmdW5jdGlvbih0LHIpe3JldHVyblt0LG5bcl1dfSx1KSl9KX0sYnl0ZTpmdW5jdGlvbihuKXtpZihzKCksTyhuKSxuPjI1NSl0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBzcGVjaWZpZWQgdG8gYnl0ZSBjb25zdHJ1Y3RvciAoXCIrbitcIj0weFwiK24udG9TdHJpbmcoMTYpK1wiKSBpcyBsYXJnZXIgaW4gdmFsdWUgdGhhbiBhIHNpbmdsZSBieXRlLlwiKTt2YXIgdD0obj4xNT9cIjB4XCI6XCIweDBcIikrbi50b1N0cmluZygxNik7cmV0dXJuIGUoZnVuY3Rpb24ocixlKXt2YXIgdT1MKHIsZSk7cmV0dXJuIHU9PT1uP2IoZSsxLHUpOngoZSx0KX0pfSxidWZmZXI6ZnVuY3Rpb24obil7cmV0dXJuIGgoXCJidWZmZXJcIixuKS5tYXAoZnVuY3Rpb24obil7cmV0dXJuIEJ1ZmZlci5mcm9tKG4pfSl9LGVuY29kZWRTdHJpbmc6ZnVuY3Rpb24obix0KXtyZXR1cm4gaChcInN0cmluZ1wiLHQpLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC50b1N0cmluZyhuKX0pfSx1aW50QkU6ZCx1aW50OEJFOmQoMSksdWludDE2QkU6ZCgyKSx1aW50MzJCRTpkKDQpLHVpbnRMRTp2LHVpbnQ4TEU6digxKSx1aW50MTZMRTp2KDIpLHVpbnQzMkxFOnYoNCksaW50QkU6ZyxpbnQ4QkU6ZygxKSxpbnQxNkJFOmcoMiksaW50MzJCRTpnKDQpLGludExFOm0saW50OExFOm0oMSksaW50MTZMRTptKDIpLGludDMyTEU6bSg0KSxmbG9hdEJFOmgoXCJmbG9hdEJFXCIsNCkubWFwKGZ1bmN0aW9uKG4pe3JldHVybiBuLnJlYWRGbG9hdEJFKDApfSksZmxvYXRMRTpoKFwiZmxvYXRMRVwiLDQpLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gbi5yZWFkRmxvYXRMRSgwKX0pLGRvdWJsZUJFOmgoXCJkb3VibGVCRVwiLDgpLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gbi5yZWFkRG91YmxlQkUoMCl9KSxkb3VibGVMRTpoKFwiZG91YmxlTEVcIiw4KS5tYXAoZnVuY3Rpb24obil7cmV0dXJuIG4ucmVhZERvdWJsZUxFKDApfSl9LG4uZXhwb3J0cz1lfV0pfSk7IiwiZXhwb3J0IGludGVyZmFjZSBGdWNrZWRBcmcge1xyXG4gICAgdHlwZTogc3RyaW5nO1xyXG4gICAgbGF0ZXg6IHsgdGV4dD86IHN0cmluZzsgbGF0ZXg/OiBzdHJpbmc7IGFyZ3VtZW50cz86IEZ1Y2tlZEFyZ1tdOyB0eXBlOiBzdHJpbmcgfVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZ1Y2tlZFRva2VuIHtcclxuICAgIHR5cGU6IHN0cmluZztcclxuICAgIGFyZ3VtZW50czogRnVja2VkQXJnW107XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUb1N0cmluZyhcclxuICAgIHRva2VuOiBGdWNrZWRUb2tlbixcclxuICAgIHByZXZpb3VzVG9rZW46IEZ1Y2tlZFRva2VuIHwgdW5kZWZpbmVkLFxyXG4gICAgbmVzdGVkOiBudW1iZXIgPSAwXHJcbikge1xyXG4gICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgYHwke1wiLS0tLVwiLnJlcGVhdChuZXN0ZWQpfSsgJHt0b2tlbi5uYW1lIHx8IHRva2VuLnRleHR9IChwcmV2OiAke3ByZXZpb3VzVG9rZW4/Lm5hbWUgfHwgcHJldmlvdXNUb2tlbj8udGV4dH09JHtwcmV2aW91c1Rva2VuPy50eXBlfSlgXHJcbiAgICApO1xyXG4gICAgbGV0IG91dHB1dCA9IFwiXCI7XHJcblxyXG4gICAgbGV0IGhhbmRsZWRMYXRleEluZGljZXMgPSAwO1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHsgbmVzdGVkOiBuZXN0ZWQsIC4uLnRva2VuIH0sIHVuZGVmaW5lZCwgMikpO1xyXG5cclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGlmICh0b2tlbi50eXBlID09PSBcIlRlWFJhd1wiKSB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIG91dHB1dCArPSB0b2tlbi50ZXh0O1xyXG4gICAgfVxyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gXCJUZVhDb21tXCIpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgc3dpdGNoICh0b2tlbi5uYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJjZG90XCI6IHtcclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBcIipcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJmcmFjXCI6IHtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IChzdHJpbmcgfCB1bmRlZmluZWQpW10gPSBbdW5kZWZpbmVkLCB1bmRlZmluZWRdO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW4uYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJnID0gdG9rZW4uYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wUmVzdWx0ID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYXJnLmxhdGV4Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBSZXN1bHQgKz0gY29udmVydFRvU3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnLmxhdGV4W2pdIGFzIEZ1Y2tlZFRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWQgKyAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IHRlbXBSZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGAoJHtyZXN1bHRbMF19LyR7cmVzdWx0WzFdfSlgO1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJzcXJ0XCI6IHtcclxuICAgICAgICAgICAgICAgIGxldCBudGhSb290ID0gXCIyXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgdG9rZW4uYXJndW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZy50eXBlID09PSBcIk9wdEFyZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG50aFJvb3QgPSBhcmcubGF0ZXhbMF0udGV4dCE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb252ZXJ0VG9TdHJpbmcoYXJnLmxhdGV4WzBdIGFzIEZ1Y2tlZFRva2VuLCB0b2tlbiwgbmVzdGVkICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGhhbmRsZWRMYXRleEluZGljZXMrKztcclxuXHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYOKImigke3ZhbHVlfTske250aFJvb3R9KWA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwicGlcIjpcclxuICAgICAgICAgICAgY2FzZSBcIlBpXCI6IHtcclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBcInBpXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSBcInNpblwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiY29zXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0YW5cIjpcclxuICAgICAgICAgICAgY2FzZSBcImFyY3NpblwiOlxyXG4gICAgICAgICAgICBjYXNlIFwiYXJjY29zXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJhcmN0YW5cIjoge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRva2VuLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoXHJcbiAgICAgICAgcHJldmlvdXNUb2tlbiAmJiAhb3V0cHV0LnRyaW1FbmQoKS5lbmRzV2l0aChcIipcIikgJiZcclxuICAgICAgICAoKHByZXZpb3VzVG9rZW4udHlwZSA9PT0gXCJUZVhSYXdcIiAmJiAhIU51bWJlcihwcmV2aW91c1Rva2VuLnRleHQpKSB8fFxyXG4gICAgICAgICAgICAocHJldmlvdXNUb2tlbi50eXBlID09PSBcIlRlWENvbW1cIiAmJiB0b2tlbi50eXBlID09PSBcIlRlWENvbW1cIikpXHJcbiAgICApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgYENvbW1hOiAke3ByZXZpb3VzVG9rZW4ubmFtZSB8fCBwcmV2aW91c1Rva2VuLnRleHR9PSR7cHJldmlvdXNUb2tlbi50eXBlfXwke3Rva2VuLm5hbWUgfHwgdG9rZW4udGV4dH09JHt0b2tlbi50eXBlfTske291dHB1dH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICBvdXRwdXQgPSBcIipcIiArIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgbGF0ZXhQYXJzZXIgfSBmcm9tIFwibGF0ZXgtcGFyc2VyXCI7XHJcbmltcG9ydCB7IGNvbnZlcnRUb1N0cmluZywgRnVja2VkVG9rZW4gfSBmcm9tIFwiLi9jb252ZXJ0ZXJcIjtcclxuXHJcbmNvbnNvbGUubG9nKFwiTG9hZGVkIGxhdGV4aWN1cyFcIik7XHJcbmlmICh3aW5kb3cpIHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCBlID0+IHtcclxuICAgICAgICBpZiAoIWUuY2xpcGJvYXJkRGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZXh0ID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJ0ZXh0XCIpO1xyXG5cclxuICAgICAgICBsZXQgb3V0ID0gXCJcIjtcclxuICAgICAgICBsZXQgbGFzdFRva2VuID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgbGF0ZXhQYXJzZXIucGFyc2UoXHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlQWxsKFwieyx9XCIsIFwiLlwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2VBbGwoXCLCsFwiLCBcIlwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2VBbGwoXCJcXFxcbGVmdFwiLCBcIlwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2VBbGwoXCJcXFxccmlnaHRcIiwgXCJcIilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlQWxsKFwiUGlcIiwgXCJcXFxcUGlcIilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlQWxsKFwicGlcIiwgXCJcXFxccGlcIilcclxuICAgICAgICAgICAgICAgIC5zcGxpdChcIj1cIilbMF1cclxuICAgICAgICApLnZhbHVlISkge1xyXG4gICAgICAgICAgICBvdXQgKz0gY29udmVydFRvU3RyaW5nKHRva2VuIGFzIEZ1Y2tlZFRva2VuLCBsYXN0VG9rZW4gYXMgRnVja2VkVG9rZW4pO1xyXG4gICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1hdGhJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIilbMF07XHJcbiAgICAgICAgbWF0aElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGV4dFwiLCBmYWxzZSwgb3V0KTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=