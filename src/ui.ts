const VERSION="0.1.0";

const VERSION = "0.0.8";
try {
    window;
    var isBrowser = true;
} catch (e) {
    var isBrowser = false;
}

async function submitReport(currentLatex: string, output: string): Promise<boolean> {
    const res = await fetch("https://ctih1.fi/api/latexicus", {
        method: "POST",
        body: JSON.stringify({
            latexText: currentLatex,
            outputText: output,
            latexicusVersion: VERSION
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) return false;

    return (await res.json()).ok;
}

if (isBrowser) {
    var dismissNotifButton: HTMLButtonElement = document.createElement("button");
    dismissNotifButton.innerHTML = "Clear all";
    dismissNotifButton.className =
        "key rounded-sm border border-blue text-xl transition-all duration-75 scale-100 active:scale-97 bg-red text-white border-none";
    dismissNotifButton.style.width = "100%";
    dismissNotifButton.style.marginTop = "12px";
    dismissNotifButton.onclick = _ => clearNotificationBox();

    (async () => {
        if ((await browser.storage.sync.get("hide-error-prompt"))["hide-error-prompt"]) {
            return;
        }
        console.log("Creating report section");
        document.body.style = "position: relative";
        var reportSection: HTMLDivElement = document.createElement("div");
        reportSection.id = "report-section";
        reportSection.style =
            "position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: none; flex-direction: column; font-size: 0.8rem;";
        reportSection.innerHTML = `
    <p style="text-align: center">${await t("noticed_error_label")}</p>
    <button id="report-submit" class="key transition-all bg-blue-light border-blue-border text-black" style="height: 40px; border-radius: var(--radius-sm); padding: 8px" id="report">${await t("send_error_button")}</button>
    <p class="text-neutral-400" style="font-size: 0.7rem;">${await t("send_error_button_clarification")}</p>
    `;
        document.getElementById("root")!.appendChild(reportSection);
        document.getElementById("report-submit")?.addEventListener("click", async _ => {
            const status = await submitReport(
                document.body.dataset.latexicusInput!,
                document.body.dataset.latexicusOutput!
            );
            if (status) {
                showNotification(await t("send_error_request_sent"), 6000);
            } else {
                showNotification(await t("send_error_request_fail"), 12000, "error");
            }
        });
    })();
}

function initNotifBox(): HTMLDivElement {
    const notificationBoxNode: HTMLDivElement = document.createElement("div");
    window.document.body.appendChild(notificationBoxNode);
    notificationBoxNode.id = "notif-box";
    notificationBoxNode.style =
        "position: fixed;top: 0px; right: 0px; z-index: 69; padding: 4px; max-width: 480px;";
    notificationBoxNode.className = "rounded-sm bg-white";

    notificationBoxNode.appendChild(dismissNotifButton);
    return notificationBoxNode;
}

export function addLatexicusIndicator() {
    (async () => {
        const greenDot = (await browser.storage.sync.get(["hide-green-dot"]))["hide-green-dot"];
        if (greenDot) {
            return;
        }
        const indicator: HTMLSpanElement = document.createElement("span");
        indicator.style =
            "position: fixed; top: 4px; left: 4px; z-index: 70; border-radius: 100%; width: 8px; height: 8px; background-color: #47DB32;";
        document.body.appendChild(indicator);
    })();

    const abicusText = document.querySelectorAll<HTMLDivElement>(
        "#root > main > div:nth-child(2) > div > div"
    )[0];
    if (!abicusText) {
        console.warn("Could not find abicus text");
        return;
    }

    abicusText.style = "text-align: center";
    abicusText.innerHTML += `<br>Latexicus v${VERSION}`;
}

function getNotificationBox(): HTMLDivElement {
    let target: HTMLElement | null = document.getElementById("notif-box");
    if (!target) {
        console.log("Initializing notification box");
        return initNotifBox();
    }

    return target as HTMLDivElement;
}

function handleButtonVisibility() {
    const elements: HTMLCollectionOf<Element> =
        document.getElementsByClassName("notification-element");

    if (elements.length !== 0) {
        dismissNotifButton.style.display = "block";
    } else {
        dismissNotifButton.style.display = "none";
    }
}

export function showNotification(
    text: string,
    timeoutMs: number,
    type: "info" | "error" | "warn" = "info"
) {
    if (!isBrowser) {
        console.log(text);
        return;
    }
    const logElement: HTMLParagraphElement = document.createElement("p");
    logElement.className = "text-xl";
    logElement.classList.add("notification-element");
    const notifId: string = randomString(8);

    logElement.innerText = text;

    if (type === "error") {
        logElement.innerText = "⚠︎:" + text;
        logElement.style.color = "#fc2828";
    }

    logElement.id = `notification-${notifId}`;
    getNotificationBox().prepend(logElement);

    handleButtonVisibility();

    setTimeout(() => {
        removeNotification(notifId);
    }, timeoutMs);

    return notifId;
}

export function removeNotification(notificationId: string) {
    try {
        document.getElementById(`notification-${notificationId}`)!.remove();
    } catch (err) {
        console.warn("Failed to delete notification");
    }

    handleButtonVisibility();
}

function clearNotificationBox() {
    const elements = document.getElementsByClassName("notification-element");
    for (let element of elements) {
        element.remove();
    }

    handleButtonVisibility();
}

export function showReportButton() {}

// https://stackoverflow.com/questions/1349404/generate-a-string-of-random-characters
function randomString(length: number): string {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
