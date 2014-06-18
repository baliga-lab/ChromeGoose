/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//
// handles interaction with http://metlin.scripps.edu/.
//
// At this time, the METLIN batch search feature is limited to
// returning results for about 50 masses at a time. We fill the
// text box and allow the user to select additional options
// (positive, neutral, or negative) then submit the query.
//
// Kegg compound IDs are returned as a list by screen-scraping.
//


/**
 * constructor.
 */
function Metlin() {
    handler_base.call(this, "Metlin", true, "handlers/metlin.js", "http://metlin.scripps.edu", (WEBHANDLER_BASEURL + "metlin-server.js"));
}

Metlin.prototype = new handler_base();

Metlin.prototype.constructor = Metlin;

Metlin.prototype.show = function() {
	//var url = "http://metlin.scripps.edu/";
	//var newTab = getBrowser().addTab(url);
	//getBrowser().selectedTab = newTab;
}


/**
 * takes a species and a Java Array of names and submits them for
 * processing by the website.
 */
Metlin.prototype.handleNameListDammit = function(species, names) {
	var masses = cg_util.join(names, "%0D%0A");

	// construct a URL to search kegg
	var url = "http://metlin.scripps.edu/metabo_batch_list.php?masses="
	        + masses +
			+ "&chargestate=-1"
			+ "&ppm=500"
			+ "&metabolite_fields%5B%5D=molid&metabolite_fields%5B%5D=mass&metabolite_fields%5B%5D=name&metabolite_fields%5B%5D=formula&metabolite_fields%5B%5D=cas&metabolite_fields%5B%5D=kegg"
			+ "&figsize=240x160"
			+ "&find=TRUE"

	//var newTab = getBrowser().addTab(url);
	//getBrowser().selectedTab = newTab;
	//FG_Workflow_InProgress = false;
	//return newTab;
}


Metlin.prototype.handleNameList = function(namelist) {
	var url = "http://metlin.scripps.edu/metabo_batch.php";

    console.log("Metlin handle namelist: " + namelist);
    if (namelist == null)
        return;

    var species = namelist.getSpecies();
    var names = namelist.getData();
    console.log("Species: " + species + " Names: " + names);

    console.log("Metlin open url: " + url);
    chrome.tabs.create({ url: url });
}

Metlin.prototype.processData = function (jsondata) {
    if (jsondata != null) {
        console.log("Metlin data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            console.log(type);
            if (type == "NameList") {
                try {
                    var namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    var species = namelist.getSpecies();
                    var names = namelist.getData();
                    metlin.insertNamelistIntoPasteBox(document, names);
                }
                catch (e) {
                    console.log("Metlin failed to process data: " + e);
                }
            }
        }
    }
}


Metlin.prototype.insertNamelistIntoPasteBox = function(doc, names) {
	try {
		var textArea = ufmt.first(doc.getElementsByName("masses"));
		if (textArea) {
			textArea.value = cg_util.join(names, "\n");
		}
	}
	catch (exception) {
		console.log(exception);
	}
}


// create and register a websiteHandler
var metlin = new Metlin();

