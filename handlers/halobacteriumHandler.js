/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

function HaloBacterium()
{
    //alert("This is david!");
    var keywords = [];
    keywords.push("networks.systemsbiology.net/hal");
    handler_base.call(this, "HaloBacterium", true, "handlers/halobacteriumHandler.js", "http://baliga.systemsbiology.net/drupal/content/halobacterium-nrc1");
    this._keywords = keywords;
}

HaloBacterium.prototype = new handler_base();

HaloBacterium.prototype.constructor = HaloBacterium;

HaloBacterium.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        console.log("Data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            //alert(type);
            if (type == "NameList") {
                try {
                    var namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    var species = namelist.getSpecies();
                    var names = namelist.getData();
                    console.log("Halo names " + names);
                    var element = document.getElementsByName("test_form");
                    if (element != null) {
                        console.log("Halo inserting data...");
                        haloBacterium.insertNamelistIntoPasteBox(species, names);
                    }
                }
                catch (e) {
                    console.log("HaloBacterium failed to process data " + e);
                }
            }
        }
    }
};

/**
 * check the given doc to see if we can scrape it
 */
HaloBacterium.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return (url.indexOf(this._pageUrl) >=0);
	}
	else
		return false;
};


/**
 * nothing so far
 */
HaloBacterium.prototype.getPageData = function(doc) {
}

/**
 * takes a species and a Java Array of names,
 */
HaloBacterium.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	console.log("HaloBacterium handling namelist " + namelist);
    // open url in a new tab
    // And then scanPage will be called, which retrieves data from the background page, and calls processData
    this.openTabAndExecute(this._pageUrl, this._extensionUrl, "haloBacterium.scanPage();", null);
};


/**
 * insert the list of names into the html form.
 */
HaloBacterium.prototype.insertNamelistIntoPasteBox = function(species, names) {
	console.log("HaloBacterium: Names to be inserted " + names);
	if (!names) return;

	// put names in paste box
	var element = document.getElementById("search_key");
	if (element) {
		// construct a string out of the name list
		console.log("HaloBacterium: Inserting names into the paste box..." + element);
		element.value = cg_util.join(names, " ");
	}

	var button = document.getElementById("go_button");
	if (button) {
		button.click();
	}
}



var haloBacterium = new HaloBacterium();
// If I am injected in an iframe within the gaggle_output.html,
// I need to check if there is data for me
if (window.self != top)
    haloBacterium.scanPage();
