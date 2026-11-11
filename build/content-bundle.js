/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/parser.ts"
/*!***********************!*\
  !*** ./src/parser.ts ***!
  \***********************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LatexConverter = void 0;
var LatexConverter = /** @class */ (function () {
    function LatexConverter() {
    }
    LatexConverter.parseParenthesisContent = function (input, open, close) {
        var openParenthesis = 0;
        var outputs = [];
        var currentOutput = "";
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var char = input_1[_i];
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
    };
    LatexConverter.needsMultiplicationSymbol = function (previous, current, next) {
        console.log("".concat(previous, ",").concat(current, ",").concat(next));
        if (current === "(" || next === "(" || current === ")" || next === ")")
            return false;
        if (/[*+-]/.test(current) || /[*+-]/.test(next))
            return false;
        if (["sin", "cos", "tan"].includes(previous) ||
            ["sin", "cos", "tan"].includes(current) ||
            ["sin", "cos", "tan"].includes(next))
            return false;
        return true;
    };
    LatexConverter.needsParenthesis = function (previous, current) {
        if (current === "cos" || current === "sin") {
            return "(";
        }
        if (previous === "cos" || previous === "sin") {
            return ")";
        }
    };
    LatexConverter.parseLatexTokenIntoString = function (token) {
        token = token.trim().trimEnd();
        var innerContent = this.parseParenthesisContent(token, "{", "}") || []; // for nested stuff, like \frac{\frac{2}{4}}{8}
        var functionArgs = this.parseParenthesisContent(token, "[", "]") || []; // such as the [3] in \sqrt[3]{2}, which would be 2^3
        var innerTokens = [];
        for (var _i = 0, innerContent_1 = innerContent; _i < innerContent_1.length; _i++) {
            var input = innerContent_1[_i];
            var parsedToken = this.parseLatexTokenIntoString(input);
            if (!parsedToken) {
                console.error("Could not parse inner token ".concat(parsedToken));
                return undefined;
            }
            innerTokens.push(parsedToken);
        }
        var result = undefined;
        if (/^[0-9\+\-]*$/.test(token))
            result = token;
        if (/^[0-9]*\{,\}[0-9]*$/.test(token))
            result = token.replace("{,}", ",");
        if (token === "\\cdot")
            result = "*";
        if (token === "\\sin")
            result = "sin";
        if (token === "\\cos")
            result = "cos";
        if (token === "\\left(")
            result = "(";
        if (token === "\\right)")
            result = ")";
        if (token.startsWith("\\frac")) {
            result = "".concat(innerTokens[0], "/").concat(innerTokens[1]);
        }
        if (token.startsWith("\\sqrt")) {
            result = "\u221A(".concat(innerTokens[0]).concat(functionArgs.length >= 1 ? ";" + functionArgs[0] : "", ")");
        }
        if (!result) {
            console.error("Could not parse token \"".concat(token, "\"."));
            return undefined;
        }
        console.debug("Parsed ".concat(token, "->").concat(result));
        return result;
    };
    LatexConverter.parse = function (text) {
        var splitItems = text.split(/([\\+\-" "\^])/);
        var outputTokens = [];
        for (var i = 0; i < splitItems.length; i++) {
            if (i % 2 == 0 && splitItems[i].length >= 1) {
                var token = LatexConverter.parseLatexTokenIntoString(splitItems[i - 1] + splitItems[i]);
                if (!token) {
                    console.warn("Failed to parse part \"".concat(splitItems[i - 1] + splitItems[i], "\""));
                    return;
                }
                outputTokens.push(token);
            }
        }
        outputTokens = outputTokens.filter(function (i) { return i !== undefined; });
        console.debug("Output tokens: [".concat(outputTokens.join(";"), "]"));
        var outputString = "";
        var previousToken = undefined;
        for (var i = 0; i < outputTokens.length - 1; i++) {
            var nextToken = outputTokens[i + 1];
            var currentToken = outputTokens[i];
            outputString += currentToken;
            if (LatexConverter.needsMultiplicationSymbol(previousToken || "", currentToken, nextToken)) {
                outputString += "*";
            }
            var parens = LatexConverter.needsParenthesis(previousToken || "", currentToken);
            outputString += parens || "";
            previousToken = currentToken;
        }
        outputString += outputTokens.at(-1);
        return outputString;
    };
    return LatexConverter;
}());
exports.LatexConverter = LatexConverter;


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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
let exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var parser_1 = __webpack_require__(/*! ./parser */ "./src/parser.ts");
addEventListener("paste", function (e) {
    if (!e.clipboardData) {
        return;
    }
    var text = e.clipboardData.getData("text");
    var parsedText = parser_1.LatexConverter.parse(text);
    if (!parsedText) {
        alert("Failed to parse Latex!");
    }
    var mathInput = document.getElementsByTagName("input")[0];
    mathInput.focus();
    document.execCommand("insertText", false, parsedText);
    e.preventDefault();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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N0IsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNqQyxDQUFDO1FBRUQsWUFBWSxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQyxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDO0FBdEpZLHdDQUFjOzs7Ozs7O1VDQTNCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQzVCQSxzRUFBMEM7QUFFMUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQUM7SUFDdkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQixPQUFPO0lBQ1gsQ0FBQztJQUNELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTNDLElBQU0sVUFBVSxHQUFHLHVCQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNkLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRWxCLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYXRleGljdXMvLi9zcmMvcGFyc2VyLnRzIiwid2VicGFjazovL2xhdGV4aWN1cy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9sYXRleGljdXMvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTGF0ZXhDb252ZXJ0ZXIge1xyXG4gICAgc3RhdGljIHBhcnNlUGFyZW50aGVzaXNDb250ZW50KFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgb3BlbjogXCJ7XCIgfCBcIltcIixcclxuICAgICAgICBjbG9zZTogXCJ9XCIgfCBcIl1cIlxyXG4gICAgKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBvcGVuUGFyZW50aGVzaXMgPSAwO1xyXG4gICAgICAgIGxldCBvdXRwdXRzID0gW107XHJcbiAgICAgICAgbGV0IGN1cnJlbnRPdXRwdXQgPSBcIlwiO1xyXG4gICAgICAgIGZvciAobGV0IGNoYXIgb2YgaW5wdXQpIHtcclxuICAgICAgICAgICAgaWYgKGNoYXIgPT09IG9wZW4pIHtcclxuICAgICAgICAgICAgICAgIG9wZW5QYXJlbnRoZXNpcysrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IGNsb3NlKSB7XHJcbiAgICAgICAgICAgICAgICBvcGVuUGFyZW50aGVzaXMtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3BlblBhcmVudGhlc2lzID49IDEpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPdXRwdXQgKz0gY2hhcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wZW5QYXJlbnRoZXNpcyA9PT0gMCAmJiBjdXJyZW50T3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRzLnB1c2goY3VycmVudE91dHB1dC5zbGljZSgxKSk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T3V0cHV0ID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wZW5QYXJlbnRoZXNpcyAhPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG91dHB1dHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG5lZWRzTXVsdGlwbGljYXRpb25TeW1ib2wocHJldmlvdXM6IHN0cmluZywgY3VycmVudDogc3RyaW5nLCBuZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgJHtwcmV2aW91c30sJHtjdXJyZW50fSwke25leHR9YCk7XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBcIihcIiB8fCBuZXh0ID09PSBcIihcIiB8fCBjdXJyZW50ID09PSBcIilcIiB8fCBuZXh0ID09PSBcIilcIikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmICgvWyorLV0vLnRlc3QoY3VycmVudCkgfHwgL1sqKy1dLy50ZXN0KG5leHQpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBbXCJzaW5cIiwgXCJjb3NcIiwgXCJ0YW5cIl0uaW5jbHVkZXMocHJldmlvdXMpIHx8XHJcbiAgICAgICAgICAgIFtcInNpblwiLCBcImNvc1wiLCBcInRhblwiXS5pbmNsdWRlcyhjdXJyZW50KSB8fFxyXG4gICAgICAgICAgICBbXCJzaW5cIiwgXCJjb3NcIiwgXCJ0YW5cIl0uaW5jbHVkZXMobmV4dClcclxuICAgICAgICApXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbmVlZHNQYXJlbnRoZXNpcyhwcmV2aW91czogc3RyaW5nLCBjdXJyZW50OiBzdHJpbmcpOiBcIihcIiB8IFwiKVwiIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gXCJjb3NcIiB8fCBjdXJyZW50ID09PSBcInNpblwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIihcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByZXZpb3VzID09PSBcImNvc1wiIHx8IHByZXZpb3VzID09PSBcInNpblwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIilcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHBhcnNlTGF0ZXhUb2tlbkludG9TdHJpbmcodG9rZW46IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgdG9rZW4gPSB0b2tlbi50cmltKCkudHJpbUVuZCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpbm5lckNvbnRlbnQ6IHN0cmluZ1tdID0gdGhpcy5wYXJzZVBhcmVudGhlc2lzQ29udGVudCh0b2tlbiwgXCJ7XCIsIFwifVwiKSB8fCBbXTsgLy8gZm9yIG5lc3RlZCBzdHVmZiwgbGlrZSBcXGZyYWN7XFxmcmFjezJ9ezR9fXs4fVxyXG4gICAgICAgIGNvbnN0IGZ1bmN0aW9uQXJnczogc3RyaW5nW10gPSB0aGlzLnBhcnNlUGFyZW50aGVzaXNDb250ZW50KHRva2VuLCBcIltcIiwgXCJdXCIpIHx8IFtdOyAvLyBzdWNoIGFzIHRoZSBbM10gaW4gXFxzcXJ0WzNdezJ9LCB3aGljaCB3b3VsZCBiZSAyXjNcclxuICAgICAgICBjb25zdCBpbm5lclRva2Vuczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBpbnB1dCBvZiBpbm5lckNvbnRlbnQpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkVG9rZW4gPSB0aGlzLnBhcnNlTGF0ZXhUb2tlbkludG9TdHJpbmcoaW5wdXQpO1xyXG4gICAgICAgICAgICBpZiAoIXBhcnNlZFRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgcGFyc2UgaW5uZXIgdG9rZW4gJHtwYXJzZWRUb2tlbn1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlubmVyVG9rZW5zLnB1c2gocGFyc2VkVG9rZW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKC9eWzAtOVxcK1xcLV0qJC8udGVzdCh0b2tlbikpIHJlc3VsdCA9IHRva2VuO1xyXG4gICAgICAgIGlmICgvXlswLTldKlxceyxcXH1bMC05XSokLy50ZXN0KHRva2VuKSkgcmVzdWx0ID0gdG9rZW4ucmVwbGFjZShcInssfVwiLCBcIixcIik7XHJcblxyXG4gICAgICAgIGlmICh0b2tlbiA9PT0gXCJcXFxcY2RvdFwiKSByZXN1bHQgPSBcIipcIjtcclxuICAgICAgICBpZiAodG9rZW4gPT09IFwiXFxcXHNpblwiKSByZXN1bHQgPSBcInNpblwiO1xyXG4gICAgICAgIGlmICh0b2tlbiA9PT0gXCJcXFxcY29zXCIpIHJlc3VsdCA9IFwiY29zXCI7XHJcbiAgICAgICAgaWYgKHRva2VuID09PSBcIlxcXFxsZWZ0KFwiKSByZXN1bHQgPSBcIihcIjtcclxuICAgICAgICBpZiAodG9rZW4gPT09IFwiXFxcXHJpZ2h0KVwiKSByZXN1bHQgPSBcIilcIjtcclxuXHJcbiAgICAgICAgaWYgKHRva2VuLnN0YXJ0c1dpdGgoXCJcXFxcZnJhY1wiKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtpbm5lclRva2Vuc1swXX0vJHtpbm5lclRva2Vuc1sxXX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRva2VuLnN0YXJ0c1dpdGgoXCJcXFxcc3FydFwiKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBg4oiaKCR7aW5uZXJUb2tlbnNbMF19JHtmdW5jdGlvbkFyZ3MubGVuZ3RoID49IDEgPyBcIjtcIiArIGZ1bmN0aW9uQXJnc1swXSA6IFwiXCJ9KWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgcGFyc2UgdG9rZW4gXCIke3Rva2VufVwiLmApO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgUGFyc2VkICR7dG9rZW59LT4ke3Jlc3VsdH1gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcGFyc2UodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCBzcGxpdEl0ZW1zOiBzdHJpbmdbXSA9IHRleHQuc3BsaXQoLyhbXFxcXCtcXC1cIiBcIlxcXl0pLyk7XHJcblxyXG4gICAgICAgIGxldCBvdXRwdXRUb2tlbnM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRJdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoaSAlIDIgPT0gMCAmJiBzcGxpdEl0ZW1zW2ldLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbiA9IExhdGV4Q29udmVydGVyLnBhcnNlTGF0ZXhUb2tlbkludG9TdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgc3BsaXRJdGVtc1tpIC0gMV0gKyBzcGxpdEl0ZW1zW2ldXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBwYXJ0IFwiJHtzcGxpdEl0ZW1zW2kgLSAxXSArIHNwbGl0SXRlbXNbaV19XCJgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRUb2tlbnMucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dHB1dFRva2VucyA9IG91dHB1dFRva2Vucy5maWx0ZXIoaSA9PiBpICE9PSB1bmRlZmluZWQpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBPdXRwdXQgdG9rZW5zOiBbJHtvdXRwdXRUb2tlbnMuam9pbihcIjtcIil9XWApO1xyXG5cclxuICAgICAgICBsZXQgb3V0cHV0U3RyaW5nID0gXCJcIjtcclxuICAgICAgICBsZXQgcHJldmlvdXNUb2tlbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRUb2tlbnMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRUb2tlbiA9IG91dHB1dFRva2Vuc1tpICsgMV07XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUb2tlbiA9IG91dHB1dFRva2Vuc1tpXTtcclxuICAgICAgICAgICAgb3V0cHV0U3RyaW5nICs9IGN1cnJlbnRUb2tlbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIExhdGV4Q29udmVydGVyLm5lZWRzTXVsdGlwbGljYXRpb25TeW1ib2woXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNUb2tlbiB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBuZXh0VG9rZW5cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRTdHJpbmcgKz0gXCIqXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcGFyZW5zID0gTGF0ZXhDb252ZXJ0ZXIubmVlZHNQYXJlbnRoZXNpcyhwcmV2aW91c1Rva2VuIHx8IFwiXCIsIGN1cnJlbnRUb2tlbik7XHJcbiAgICAgICAgICAgIG91dHB1dFN0cmluZyArPSBwYXJlbnMgfHwgXCJcIjtcclxuICAgICAgICAgICAgcHJldmlvdXNUb2tlbiA9IGN1cnJlbnRUb2tlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dHB1dFN0cmluZyArPSBvdXRwdXRUb2tlbnMuYXQoLTEpO1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0cHV0U3RyaW5nO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTGF0ZXhDb252ZXJ0ZXIgfSBmcm9tIFwiLi9wYXJzZXJcIjtcclxuXHJcbmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCBlID0+IHtcclxuICAgIGlmICghZS5jbGlwYm9hcmREYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IHRleHQgPSBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHRcIik7XHJcblxyXG4gICAgY29uc3QgcGFyc2VkVGV4dCA9IExhdGV4Q29udmVydGVyLnBhcnNlKHRleHQpO1xyXG4gICAgaWYgKCFwYXJzZWRUZXh0KSB7XHJcbiAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gcGFyc2UgTGF0ZXghXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1hdGhJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIilbMF07XHJcbiAgICBtYXRoSW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImluc2VydFRleHRcIiwgZmFsc2UsIHBhcnNlZFRleHQpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9