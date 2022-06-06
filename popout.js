document.getElementById('sumbtn').addEventListener("click", function(){
    var length = document.getElementById('length').value
    console.log('hello',length)

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, ({command: 'startSummary', length: length }))
            console.log(tabs[0].id)
    })
    console.log('hello again')
})
