/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

function NetworkPortal()
{
    //alert("This is david!");
    handler_base.call(this, "Network Portal", true, "handlers/networkportalHandler.js", "http://networks.systemsbiology.net");
}

NetworkPortal.prototype = new handler_base();

NetworkPortal.prototype.constructor = NetworkPortal;

NetworkPortal.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        console.log("NetworkPortal Data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            console.log(type);
            var gaggledata = null;
            if (type == "NameList") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    this.species = namelist.getSpecies();
                    this.names = namelist.getData();

                    console.log("NetworkPortal inserting namelist...");
                    networkPortal.insertNamelistIntoPasteBox(document, this.species, this.names);
                }
                catch (e) {
                    console.log("NetworkPortal failed to process data " + e);
                }
            }
        }
    }
};

/**
 * check the given doc to see if we can scrape it
 */
NetworkPortal.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return (url.indexOf("http://networks.systemsbiology.net") >=0);
	}
	else
		return false;
};


/**
 * nothing so far
 */
NetworkPortal.prototype.getPageData = function(doc) {
}

/**
 * takes a species and a Java Array of names,
 */
NetworkPortal.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	console.log("Network portal handling namelist " + namelist);
	if (namelist == null)
	    return;

    var names = namelist.getData();
    var url = this._pageUrl + "/search?q=";
    for (var i=0; i<names.length; i++) {
        url += names[i];
        if (i < names.length - 1)
            url += "+";
    }
    // open url in a new tab
    // And then scanPage will be called, which retrieves data from the background page, and calls processData
    console.log("Injecting " + url);
    //this.openTabAndExecute(this._pageUrl, this._extensionUrl, "networkPortal.scanPage();", null);
    chrome.tabs.create({ url: url });
};




/**
 * insert the list of names held by the david
 * object into the html form.
 */
NetworkPortal.prototype.insertNamelistIntoPasteBox = function(doc, species, names) {
	console.log("NetworkPortal: Names to be inserted " + names + " " + doc);
	if (!names) return;

	// put names in paste box
	var inputbox = doc.getElementById("query");
	console.log("NetworkPortal search form: " + inputbox);

	if (inputbox) {
		// construct a string out of the name list
		console.log("NetworkPortal: Inserting names into the paste box..." + inputbox);
		inputbox.value = cg_util.join(names, " ");
	}
}



var networkPortal = new NetworkPortal();
// If I am injected in an iframe within the gaggle_output.html,
// I need to check if there is data for me
if (window.self != top)
    networkPortal.scanPage();
//david.scanPage();