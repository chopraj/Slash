// Runs as soon as the extension is installed or refreshed

chrome.runtime.onMessage.addListener(recieveMessage)

function recieveMessage(request, sender, response) {
    // code here to summarize text
}