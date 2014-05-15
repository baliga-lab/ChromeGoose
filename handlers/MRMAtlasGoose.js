/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//var FG_MRMAtlas = new Object();
//FG_MRMAtlas.url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetPABSTList";


function MRMAtlas()
{
    handler_base.call(this, "MRMAtlas", true, "handlers/MRMAtlasGoose.js", "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetPABSTList");
}

MRMAtlas.prototype = new handler_base();

MRMAtlas.prototype.constructor = MRMAtlas;



/**
 * check the given doc to see if we can scrape it
 */
MRMAtlas.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return (url.indexOf(FG_MRMAtlas.url) >=0);
	}
	else
		return false;
}


MRMAtlas.prototype.show = function() {
	//var newTab = getBrowser().addTab(FG_MRMAtlas.url);
	//getBrowser().selectedTab = newTab;
}

/**
 * nothing so far
 */
MRMAtlas.prototype.getPageData = function(doc) {
}

/**
 * takes a species and a Java Array of names
 */
MRMAtlas.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	this.species = namelist.getSpecies();
	this.names = namelist.getData();

	var doc = document;
	var element = null;

	if (cg_util.startsWith(doc.location.href, this._pageUrl)) {
		element = doc.getElementById("protein_name_constraint");
	}

	if (element)
	{
		this.insertNamelistIntoPasteBox(doc);
	}
	else {
		// open url in a new tab
        console.log("MRMAtlas injecting " + this._extensionUrl);
        this.openTabAndExecute(this._pageUrl, this._extensionUrl, "mrmAtlas.scanPage();", null);
	}
}

/**
 * when we open MRMAtlas in a new tab, this event listener
 * should be called. We have to pass in a reference to
 * this object because the onPageLoad function will be
 * passed as an event listener.
 */
MRMAtlas.prototype.processData = function(jsondata) {
    if (jsondata != null) {
        console.log("MRMAtlas data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            //alert(type);
            var gaggledata = null;
            if (type == "NameList") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    this.species = namelist.getSpecies();
                    this.names = namelist.getData();
                    mrmAtlas.insertNamelistIntoPasteBox(document, this.species, this.names);
                }
                catch(e) {
                    console.log("MRMAtlas failed to process namelist " + e);
                }
            }
        }
	}
}

/**
 * insert the list of names held by the mrmatlas
 * object into the html form.
 */
MRMAtlas.prototype.insertNamelistIntoPasteBox = function(doc, species, names) {
	var elements;
	if (!names) return;

	// put names in paste box
	elements = doc.getElementsByName("protein_name_constraint");
	if (elements) {
		// construct a string out of the name list
		elements[0].value = cg_util.join(names, ";");
	}
}

// create and register websiteHandler
var mrmAtlas = new MRMAtlas();

