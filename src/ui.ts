const VERSION="0.0.2";
try {
    window;
    var browser = true;
} catch(e) {
    var browser =false;
}
if(browser) {
    var dismissNotifButton: HTMLButtonElement = document.createElement("button");
    dismissNotifButton.innerHTML = "Clear all";
    dismissNotifButton.className =
        "key rounded-sm border border-blue text-xl transition-all duration-75 scale-100 active:scale-97 bg-red text-white border-none";
    dismissNotifButton.style.width = "100%";
    dismissNotifButton.style.marginTop = "12px";
    dismissNotifButton.onclick = _ => clearNotificationBox();
}


function initNotifBox(): HTMLDivElement {
    const notificationBoxNode: HTMLDivElement = document.createElement("div");
    window.document.body.appendChild(notificationBoxNode);
    notificationBoxNode.id = "notif-box";
    notificationBoxNode.style = "position: fixed;top: 0px; right: 0px; z-index: 69; padding: 4px; max-width: 480px;";
    notificationBoxNode.className = "rounded-sm bg-white";

    notificationBoxNode.appendChild(dismissNotifButton);
    return notificationBoxNode;
}

export function addLatexicusIndicator() {
    const indicator: HTMLSpanElement = document.createElement("span");
    indicator.style =
        "position: fixed; top: 4px; left: 4px; z-index: 70; border-radius: 100%; width: 8px; height: 8px; background-color: #47DB32;";
    document.body.appendChild(indicator);

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

export function showNotification(text: string, timeoutMs: number, type: "info" | "error"  | "warn" = "info") {
    if(!browser) {
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
