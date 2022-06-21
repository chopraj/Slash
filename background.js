// Runs as soon as the extension is installed or refreshed

chrome.runtime.onMessage.addListener(recieveMessage)

function recieveMessage(request, sender, response) {
    
}

var Summarizer = {}
Summarizer.utilities = {}

Summarizer.utilities.calculateSimularity = function(sentence1, sentence2) {
    var words1 = sentence1.split(" ");
    var words2 = sentence2.split(" ");
    var intersection = _.intersection(words1, words2);
    var sumOfLengths = Math.log(words1.length) + Math.log(words2.length);
    if (sumOfLengths == 0) {
      return 0;
    } else {
      return intersection.length / sumOfLengths; // JS uses floating point arithmetic by default.
    }
  }

Summarier.utilities.makeGraph = funciton(sentences) {
    var graph = {};
    for (var idx1 = 0; idx1 < sentences.length; ++idx1) {
      for (var idx2 = idx1 + 1; idx2 < sentences.length; ++idx2) {
        if (graph[idx1] == undefined) {
          graph[idx1] = [];
        }
  
        if (graph[idx2] == undefined) {
          graph[idx2] = [];
        }
        var similarityScore = Summarizer.Utility.calculateSimilarity(
          sentences[idx1], sentences[idx2]);
        graph[idx1].push({
          "node": idx2,
          "weight": similarityScore
        });
        graph[idx2].push({
          "node": idx1,
          "weight": similarityScore
        });
      }
    }
    // Inculde a lookup from the sentenceId to the actual sentence.
    graph.sentenceIdLookup = sentences;
    return graph;
  }
