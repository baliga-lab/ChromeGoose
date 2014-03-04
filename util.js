/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */


var WEBHANDLERS_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // Update after 24 hour

var cg_util = {

// Retrieve GA from storage
retrieveFrom: function(key, url, callback) {
    console.log("Retrieving " + key + " from " + url);

    try {
        chrome.storage.local.get(key, function(items) {
            console.log("local storage retrieval results: " + (typeof items));
            if (items == null || items.code == undefined || (Date.now() - items.lastUpdated > WEBHANDLERS_UPDATE_INTERVAL)) {
                // Get updated file, and if found, save it.
                cg_util.getFileFromUrl(url, function(downloadedcode) {
                    //console.log("Received code: " + downloadedcode);
                    if (!downloadedcode) return;
                    console.log("Save code to " + key);
                    var obj = {}
                    obj[key] = {lastUpdated: Date.now(), code: downloadedcode}
                    chrome.storage.local.set(obj);
                    if (callback != null)
                        callback(downloadedcode);
                });
            }
            if (items.code && callback != null) // Cached GA is available, use it
                callback(items.code);
        });
    }
    catch (e) {
        console.log("Failed to retrieve code " + e);
    }
},

checkHandlerData: function (handler, processDataFunc) {
    if (handler == null)
        return;

    var url = document.location.href;
    if (url.indexOf(handler.getPageUrl()) >= 0)
    {
        // Ask the background page for data to be processed
        console.log(handler.getName() + ": Retrieving data from event page...");
        try {
            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RETRIEVEDATA,
                                 "aaa", processDataFunc);
            msg.send();
        }
        catch (e) {
            console.log(handler.getName() + " failed to send message to event page: " + e);
        }
    }
},


getActiveTab: function(callback) {
    chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function(tabs) {
          /* ...and send a request for the DOM info... */
          if (callback != null)
             callback(tabs[0]);
      });
},

openNewTab: function(url) {
    var newURL = url;
    chrome.tabs.create({ url: newURL });
},


/**
 * strip off leading and trailing whitespace from a string
 */
trim: function (sInString) {
  sInString = sInString.replace( /^\s+/g, "" );// strip leading
  return sInString.replace( /\s+$/g, "" );// strip trailing
},



/**
 * Join the elements to a delimited string. There is a native
 * javascript join function, but this one works on java arrays
 * and javascript arrays too.
 */
join: function (items, delimiter) {
	var queryString = "";
	if (items.length > 0) {
		queryString += items[0];
	}
	for (var i=1; i<items.length; i++) {
		queryString += delimiter;
		queryString += items[i];
	}
	return queryString;
},



/**
 * log a message to the javascript console
 */
trace: function (msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
},


/**
 * Returns true if the string starts with the
 * prefix. Returns false otherwise.
 */
startsWith: function(string, prefix) {
	if (string.length >= prefix.length) {
		if (string.substring(0,prefix.length) == prefix)
			return true;
	}
	return false;
},

objectToString: function(o) {
	var first = true;
	var str = "{";
	for (var i in o) {
		if (first)
			first = false;
		else
			str += ", ";
		str += i + ":" + o[i];
	}
	str += "}";
	return str;
},

// Typically run within a few milliseconds
executeCode: function (code) {
    try
    {
        if (code != null) {
            console.log("Executing code...");
            window.eval(code);
        }
    }
    catch (e)
    {
        console.error("Failed to execute code: " + e);
    }
},

getFileFromUrl: function (url, callback) {
    console.log("Downloading file from " + url);
    var x = new XMLHttpRequest();
    x.onload = x.onerror = function()
    {
        if (callback != null)
            callback(x.responseText);
    };
    x.open('GET', url);
    x.send();
}

}