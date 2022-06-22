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


Summarizer.utilities.calculatePageRankings = function (graph, maxIterations,
    dampingFactor, delta) {
    var pageRankStruct = {};
    var totalWeight = {};
    var totalNumNodes = graph.sentenceIdLookup.length; // Number of nodes.
    for (var idx = 0; idx < totalNumNodes; ++idx) {
      pageRankStruct[idx] = {
        "oldPR": 1.0,
        "newPR": 0.0
      };
      totalWeight[idx] = 0.0;
    }
    for (var idx = 0; idx < totalNumNodes; ++idx) {
      var adjacencyList = graph[idx];
      if (adjacencyList == undefined) {
        continue;
      }
      // The adjacency list is an array containg objects that contain the neighbours' index as
      // key and similarity score as the weight.
      _.each(adjacencyList, function (item) {
        totalWeight[idx] += item["weight"];
      });
    }
    var converged = false;
    for (var iter = 0; iter < maxIterations; ++iter) {
      maxPRChange = Summarizer.Utility.runPageRankOnce(graph, pageRankStruct,
        totalWeight, totalNumNodes, dampingFactor);
      if (maxPRChange <= (delta / totalNumNodes)) {
        converged = true;
        break;
      }
    }
    var pageRankResults = {};
    for (var idx = 0; idx < totalNumNodes; ++idx) {
      pageRankResults[idx] = {
        "PR": pageRankStruct[idx]["oldPR"] / totalNumNodes,
        "sentence": graph.sentenceIdLookup[idx]
      };
    }
    return pageRankResults;
  }

Summarizer.utiliies.runPageRankOnce = function (graph, pageRankStruct,
    totalWeight, totalNumNodes, dampingFactor) {
    var sinkContrib = 0.0;
    for (var idx = 0; idx < totalNumNodes; ++idx) {
      if (graph[idx] == undefined || graph[idx].length == 0) {
        // Sink.
        sinkContrib += pageRankStruct[idx]["oldPR"];
        continue;
      }
      var wt = 0.0;
      // Now iterate over all the nodes that are pointing to this node.
      _.each(graph[idx], function (adjNode) {
        var node = adjNode["node"];
        // Get the total weight shared by this adjacent node and its neighbours.
        var sharedWt = totalWeight[node];
        if (sharedWt != 0) { // To prevent NaN
          wt += (adjNode["weight"] / sharedWt) * pageRankStruct[node]["oldPR"];
        }
      });
      wt *= dampingFactor;
      wt += (1 - dampingFactor);
      // Update the structure w/ the new PR.
      pageRankStruct[idx]["newPR"] = wt;
    }
    // Apply the sink contrib overall.
    sinkContrib /= totalNumNodes;
    var max_pr_change = 0.0;
    for (var idx = 0; idx < totalNumNodes; ++idx) {
      pageRankStruct[idx]["newPR"] += sinkContrib;
      // Report back the max PR change.
      var change = Math.abs(pageRankStruct[idx]["newPR"] - pageRankStruct[idx][
        "oldPR"
      ]);
      if (change > max_pr_change) {
        max_pr_change = change;
      }
      // Set old PR to new PR for next iteration.
      pageRankStruct[idx]["oldPR"] = pageRankStruct[idx]["newPR"];
      pageRankStruct[idx]["newPR"] = 0.0;
    }
    return max_pr_change;
  }