/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//
// Broadcast to javascript functions in a web page...
// return data through a variable. Formerly known as
// pageGoose, now specifically tailored to the PIPE
// application
//


//var FG_pipe2Goose = new Object();
//FG_pipe2Goose.url = "http://pipe2.systemsbiology.net";

function Pipe2Goose() {
    handler_base.call(this, "PIPE2", true, "http://pipe2.systemsbiology.net");
}

Pipe2Goose.prototype = new handler_base();

Pipe2Goose.prototype.constructor = Pipe2Goose;


Pipe2Goose.prototype.recognize = function(doc) {
	//var pageScope = doc.defaultView.wrappedJSObject;
	//if (pageScope && pageScope.pipe2GaggleDataForFiregoose)
	//	return true;

};


Pipe2Goose.prototype.show = function() {
	//var newTab = getBrowser().addTab(FG_pipe2Goose.url);
	//getBrowser().selectedTab = newTab;
};

Pipe2Goose.prototype.scanPage = function ()
{
    console.log("PIPE2 scan page...");
    cg_util.checkHandlerData(pipe2goose, this.processData);
};

Pipe2Goose.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        console.log("PIPE2 Data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            console.log("Data type: " + type);
            var gaggledata = null;
            if (type == "NameList") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    this.species = namelist.getSpecies();
                    this.names = namelist.getData();

                    // Hook up the PIPE2SearchResultEvent. If PIPE2 goose is found by pipe2SearchWithTimer(see next),
                    // send data to the page
                    document.addEventListener("PIPE2SearchResultEvent", function(e) {
                                                var found = e.detail.pipe2found;
                                                //var tabid = e.detail.tabid;
                                                console.log("PIPE2 Search result: " + found);

                                                if (found) {
                                                   // Now we pass the data to the injected code
                                                   var event = new CustomEvent('PIPE2DataEvent',
                                                                               {detail:
                                                                                   {dataspecies: species,
                                                                                   datanames: names},
                                                                                   bubbles: true,
                                                                                   cancelable: false});
                                                   document.dispatchEvent(event);
                                                }
                    });

                    // Now we inject the code to the page. The code hooks up the PIPE2DataEvent.
                    // When received data, it calls goose.handleNamelist
                    cg_util.injectJavascript("handlers/pipe2SearchHandle.js", function() {
                        pipe2SearchWithTimer();
                    });

                }
                catch (e) {
                    console.log("PIPE2 failed to process data " + e);
                }
            }
            jsondata = null;
        }
    }
};

/**
 * read data out of a variable in the page.
 */
Pipe2Goose.prototype.getPageData = function(doc) {
	var pageScope = doc.defaultView.wrappedJSObject;
	if (pageScope && pageScope.pipe2GaggleDataForFiregoose) {
		var data = pageScope.pipe2GaggleDataForFiregoose;
		
		// security: these methods get called w/ elevated privileges,
		// so this is not too safe but allows us to get tricky with
		// deferring work until it's definitely needed. We can enable
		// it later, if we want to. Examples of the client side are in
		// http://gaggle.systemsbiology.org/cbare/gaggleDataEventTest.html

		if (data.getName && data.getType && data.getSize && data.getSpecies && data.getDescription && data.getData) {
			return data;
		}
		else if (data.name && data.type && data.data) {
			return new GaggleData(data.name, data.type, data.size, data.species, data.data);
		}
		else {
			return null;
		}
	}
};

/*function Pipe2_HandleNameList(species, names)
{
    var found = false;
    try {
        if (cg_util.startsWith(doc.location.href, this._url)
            goose!=null) {
            // convert java string to javascript string. PIPE2 doesn't handle java string.
            found = true;
            var tempnames = new Array();
            for (var i = 0; i < names.length; i++)
            {
                tempnames[i] = names[i];
            }
            goose.handleNameList(species, tempnames);
        }
    } catch(e) {
        // wtf? Components.utils.reportError(e);
        FG_trace(e);
    }

    if (!found) {
        this.show();

        // create a poller object to be called from a timer
        var poller = new Object();
        poller.timerCount = 0;
        poller.species = species;
        // convert java string to javascript string. PIPE2 doesn't handle java string.
        var tempnames = new Array();
        for (var i = 0; i < names.length; i++)
        {
            tempnames[i] = names[i];
        }
        poller.names = tempnames; //names;
        poller.browser = gBrowser.selectedBrowser;

        // the poll function checks for the presence of the receiving goose
        // and completes the broadcast when the receiving goose is ready
        poller.poll = function() {
            this.timerCount++;
            console.log("polling for presence of PIPE goose: " + this.timerCount + "\n");
            console.log("species = " + this.species + "\n");
            console.log("namelist = " + this.names + "\n");

            var goose = this.browser.contentWindow.wrappedJSObject.goose;
            console.log("Got goose " + goose);
            if (goose) {
                try {
                    goose.handleNameList(this.species, this.names);
                    clearInterval(this.timerId);
                    FG_Workflow_InProgress = false;
                } catch(e) {
                    FG_trace("Error in page's goose.handleNameList(...): " + e);
                }
            }
            else if (this.timerCount >= 10) {
                clearInterval(this.timerId);
                FG_Workflow_InProgress = false;
            }
        }

        // set a timer which calls the poller every second
        poller.timerId = setInterval(function() { poller.poll(); }, 1000);
    }
} */


/**
 * takes a species and a Java Array of names and submits them for
 * processing by the website.
 */
Pipe2Goose.prototype.handleNameList = function(namelist) {
	// since we're broadcasting to an open page, we don't want to open
	// a new page. This is no good from a security point of view.
	// Find the first tab with a page that implements a goose object
	// and call the handler method on the goose object.
	console.log("\nPIPE2 handle namelist: " + namelist);
	if (namelist != null)
	    console.log("Names: " + namelist.getData() + " species " + namelist.getSpecies() + "\n");

    // Pass the data to the background page
    if (namelist == null)
        return;
    var names = namelist.getData();
    var species = namelist.getSpecies();
    //var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_PIPE2DATA,
    //                      {pipe2species: species, pipe2names: names, pipe2url: this._pageUrl},
    //                      function(){
    // Send message to background page to search all the tabs for PIPE2 pages
    console.log("Send message to get all tabs");

    chrome.tabs.getAllInWindow(null,
    function(tabs){
           console.log("Received tabs " + tabs);
           // Inform the background.js of the number of tabs, and to prepare for the PIPE2 processing
           var msg1 = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_PIPE2GETALLTABS,
                                   {numtabs: tabs.length},
                                   function() {

                                   });
           msg1.send();

           for (var i = 0; i < tabs.length; i++) {
               var tab = tabs[i];
               console.log("Sending message to " + tab.id);
               var msg2 = new Message(MSG_FROM_POPUP, chrome.tabs,
                                     tab.id,
                                     MSG_SUBJECT_INSERTPIPE2SEARCHHANDLE,
                                     {targetScript: "handlers/pipe2SearchHandle.js", tabid: tab.id},
                                     function () {
                                     });
               msg2.send();
           }

           for (var j = 0; j < tabs.length; j++) {
               // Now we inject the code to the page
               var tab = tabs[j];
               console.log("Injecting code to " + tab.id);
               cg_util.injectCodeToTab(tab.id, ("var mytabid = " + tab.id + ";pipe2Search();"), null);
           }
    });


//                          });
//    msg.send();



};

var pipe2goose = new Pipe2Goose();


// Goose search logics
// They are called from within the popup page
function pipe2Search()
{
    //console.log("PIPE2 Goose obj: " + goose);
    var found = false;
    try {
        console.log("Checking " + document.location.href);
        var iframepipe2 = document.getElementById("PIPE2");
        if (cg_util.startsWith(document.location.href, "http://pipe2.systemsbiology.net") &&
            iframepipe2 != null) {
            //goose != null) {
            //register
            found = true;
            console.log("Register GaggleDataFromExtension");
            //document.addEventListener("GaggleDataFromExtension", pipe2EventHandler, false);
        }
    }
    catch (e) {
        console.log("Exception checking goose: " + e);
    }

    console.log("Send message to content page: " + found);
    var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {
                                tabid: mytabid,
                                pipe2found: found},
                                bubbles: true, cancelable: false});
    document.dispatchEvent(event);
}

function pipe2SearchWithTimer()
{
    var poller = new Object();
    poller.timerCount = 0;
    poller.poll = function() {
        this.timerCount++;
        console.log("polling for presence of PIPE goose: " + this.timerCount + "\n");
        var iframepipe2 = document.getElementById("PIPE2");
        if (cg_util.startsWith(document.location.href, "http://pipe2.systemsbiology.net") && iframepipe2 != null) {
            //&& goose) {
            try {
                console.log("Register GaggleDataFromExtension");
                //document.addEventListener("GaggleDataFromExtension", pipe2EventHandler, false);

                var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {//tabid: mytabid,
                                            pipe2found: true},
                                            bubbles: true, cancelable: false});
                document.dispatchEvent(event);
                clearInterval(this.timerId);
            } catch(e) {
                console.log("Error in page's PIPE2SearchWithTimer: " + e);
            }
        }
        else if (this.timerCount >= 10) {
             clearInterval(this.timerId);
             var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {//tabid: mytabid,
                                        pipe2found: false},
                                        bubbles: true, cancelable: false});
            document.dispatchEvent(event);
        }
    }

    // set a timer which calls the poller every second
    console.log("Starting poller timer...");
    poller.timerId = setInterval(function() { poller.poll(); }, 1000);
}


