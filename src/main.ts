if (window) {
    addEventListener("paste", e => {
        if (!e.clipboardData) {
            return;
        }
        let text = e.clipboardData.getData("text");

        const parsedText = LatexConverter.parse(text);
        if (!parsedText) {
            alert("Failed to parse Latex!");
        }

        const mathInput = document.getElementsByTagName("input")[0];
        mathInput.focus();

        document.execCommand("insertText", false, parsedText);
        e.preventDefault();
    });
}
