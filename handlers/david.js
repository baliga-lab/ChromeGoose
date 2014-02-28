/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */



var david = new David();
david.scanPage();


function David()
{
    this._name = "David";
}

David.prototype.getName = function ()
{
    return this._name;
}

David.prototype.scanPage = function ()
{
    var url = document.location.href;
    if (url.indexOf("http://david.abcc.ncifcrf.gov/") >=0) {
        //alert("This is a David page...");
        // Ask the background page for data
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RETRIEVEDATA,
                              JSON.stringify(data), this.processData);
        msg.send();
    }
}

David.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var type = jsonobj["_type"];
            var gaggledata = null;
            if (type == "Namelist") {
                try {
                    gaggledata = new Namelist("", 0, "", null);
                    gaggledata.parseJSON(jsonobj);


                }
                catch (e) {
                    alert(e);
                }
            }
        }
    }
}

/**
 * check the given doc to see if we can scrape it
 */
David.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return (url.indexOf("http://david.abcc.ncifcrf.gov/") >=0);
	}
	else
		return false;
}


David.prototype.show = function() {
	var newurl = "http://david.abcc.ncifcrf.gov/";
    chrome.tabs.create({ url: newurl });
}

/**
 * nothing so far
 */
David.prototype.getPageData = function(doc) {
}

/**
 * takes a species and a Java Array of names
 */
David.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	alert("Handling namelist " + namelist);
	if (namelist == null)
	    return;

	this.species = namelist.getSpecies();
	//this.names = namelist.getData();

    console.log("DAVID handle namelist " + this.names);

	var davidurl = "http://david.abcc.ncifcrf.gov/summary.jsp";
	var element = null;

    //alert(document.location.href);
	if (cg_util.startsWith(document.location.href, "http://david.abcc.ncifcrf.gov/")) {
		element = document.getElementById("divUpload");
	}

    //alert(element);
	if (element)
	{
		selectUploadTab();
		this.insertNamelistIntoPasteBox(doc);
	}
	else {
		// open url in a new tab
		//var newTab = getBrowser().addTab();
		//var browser = getBrowser().getBrowserForTab(newTab);
		//getBrowser().selectedTab = newTab;
        //alert("Open new tab " + davidurl);
		chrome.tabs.create({ url: davidurl });

		// create a closure which preserves a reference to this
		// so the listener can remove itself after being called.
		// If the user browses away in the new browser, we don't
		// want to keep performing the onPageLoad action.
		/*var david = this;
		var onPageLoadClosure = function(aEvent) {
			david.onPageLoad(david, aEvent);
			// listener removes itself
			browser.removeEventListener("load", david.onPageLoadClosure, true);
		}
		this.onPageLoadClosure = onPageLoadClosure;

		// register the closure as a listener
		browser.addEventListener("load", onPageLoadClosure, true);
		browser.loadURI(url);

		return newTab; */
	}
}

/**
 * when we open David in a new tab, this event listener
 * should be called. We have to pass in a reference to
 * this object because the onPageLoad function will be
 * passed as an event listener.
 */
David.prototype.onPageLoad = function(david, aEvent) {
	if (aEvent.originalTarget.nodeName == "#document") {
		/*var doc = window.content.document;
		console.log("Inserting namelist...");
		this.insertNamelistIntoPasteBox(doc);

		// hack: the David summary page selects the 'list'
		// tab if you have a session open already in tabPane.js
		// do_onload(). Our onload event fires before theirs
		// apparently, so we kludge our way around by setting
		// a timer and selecting the 'Upload' tab after their
		// do_onload() has already run.
		setTimeout("selectUploadTab()", 800);
        FG_Workflow_InProgress = false; */
	}
}

/**
 * this is in the root namespace 'cause it has to be
 * called from a timer
 */
function selectUploadTab() {
	/*try {
		var doc = window.content.document;
		var tabobj=doc.getElementById("tablist");
		var tabobjlinks=tabobj.getElementsByTagName("A");
		window.content.wrappedJSObject.expandcontent('divUpload', tabobjlinks[0]);
	}
	catch (exception) {
		FG_trace(exception);
	} */
}

/**
 * insert the list of names held by the david
 * object into the html form.
 */
David.prototype.insertNamelistIntoPasteBox = function(doc) {
	var elements;
	console.log("Names to be inserted " + this.names);
	if (!this.names) return;

	// put names in paste box
	/*elements = doc.getElementsByName("pasteBox");
	if (elements) {
		// construct a string out of the name list
		console.log("Inserting names into the paste box..." + elements);
		elements[0].value = FG_util.join(this.names, "\n");
	}

	// select type 'list' rather than 'background'
	elements = doc.getElementsByName("rbUploadType");
	if (elements) {
		elements[0].checked = true;
	} */

	// too bad I can't select the naming system
//	elements = doc.getElementsByName("Identifier");
//	if (elements) {
//		elements[0].style.backgroundcolor=0xFF9999;
//		elements[0].value = "GI_ACCESSION";
//	}
}



