/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

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
    console.log("DAVID scan page...");
    var url = document.location.href;
    if (url.indexOf("http://david.abcc.ncifcrf.gov/") >= 0)
    {
        // Ask the background page for data to be processed
        console.log("DAVID: Retrieving data from event page...");
        try {
            console.log("Retrieving data from event page...");
            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RETRIEVEDATA,
                                 "aaa", this.processData);
            msg.send();
        }
        catch (e) {
            console.log("DAVID failed to send message to event page: " + e);
        }
    }
}

David.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        console.log("Data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var type = jsonobj["_type"];
            var gaggledata = null;
            if (type == "Namelist") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(jsonobj);
                    this.species = namelist.getSpecies();
                    this.names = namelist.getData();

                    var element = document.getElementById("divUpload");
                    if (element != null) {
                        console.log("Global DAVID object: " + david);
                        david.selectUploadTab();
                        david.insertNamelistIntoPasteBox(this.species, this.names);
                    }
                }
                catch (e) {
                    console.log("DAVID failed to process data " + e);
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
	console.log("DAVID handling namelist " + namelist);
	if (namelist == null)
	    return;

	var davidurl = "http://david.abcc.ncifcrf.gov/summary.jsp";
	var element = null;

    console.log("DAVID checking page url:" + document.location.href);
	if (cg_util.startsWith(document.location.href, "http://david.abcc.ncifcrf.gov/")) {
		element = document.getElementById("divUpload");
	}

	if (element)
	{
		console.log("Retrieving data from event page...");
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RETRIEVEDATA,
                              null, this.processData);
        msg.send();
	}
	else {
		// open url in a new tab
		chrome.tabs.create({ url: davidurl });
	}
}



/**
 * this is in the root namespace 'cause it has to be
 * called from a timer
 */
David.prototype.selectUploadTab = function() {
	try {
		var tabobj = document.getElementById("tablist");
		var tabobjlinks = tabobj.getElementsByTagName("A");

		// TODO: Chrome extension content script cannot access javascript of a page.
		// TODO: We need to come up with a workaround.
		//window.content.wrappedJSObject.expandcontent('divUpload', tabobjlinks[0]);
	}
	catch (exception) {
		console.log(exception);
	}
}

/**
 * insert the list of names held by the david
 * object into the html form.
 */
David.prototype.insertNamelistIntoPasteBox = function(species, names) {
	var elements;
	console.log("DAVID: Names to be inserted " + names);
	if (!names) return;

	// put names in paste box
	elements = document.getElementsByName("pasteBox");
	if (elements) {
		// construct a string out of the name list
		console.log("DAVID: Inserting names into the paste box..." + elements);
		elements[0].value = cg_util.join(names, "\n");
	}

	// select type 'list' rather than 'background'
	elements = document.getElementsByName("rbUploadType");
	if (elements) {
		elements[0].checked = true;
	}

	// too bad I can't select the naming system
//	elements = doc.getElementsByName("Identifier");
//	if (elements) {
//		elements[0].style.backgroundcolor=0xFF9999;
//		elements[0].value = "GI_ACCESSION";
//	}
}



var david = new David();
david.scanPage();