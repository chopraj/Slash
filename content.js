console.log("content script")
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command == 'startSummary') {
        console.log('from content script', request.length)
        let seletedText = window.getSelection().toString()
    }
})