/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

function Phytozome()
{
    //alert("This is david!");
    var keywords = [];
    keywords.push("chlamy");
    handler_base.call(this, "Phytozome", true, "handlers/phytozome.js", "http://phytozome.jgi.doe.gov/");
    this._keywords = keywords;
}

Phytozome.prototype = new handler_base();

Phytozome.prototype.constructor = Phytozome;

Phytozome.prototype.scanPage = function ()
{
    cg_util.checkHandlerData(david, this.processData);
};


/**
 * takes a species and a Java Array of names,
 */
Phytozome.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	console.log("Phytozome handling namelist " + namelist);
	if (namelist == null)
	    return;

	var species = namelist.getSpecies();
    var names = namelist.getData();
    console.log("Species: " + species + " Names: " + names);

    var queryString = "&searchText=";
    if (names.length > 0) {
        queryString += names[0];
    }
    for (var i=1; i<names.length; i++) {
        queryString += "%20";
        queryString += names[i];
    }

    // construct a URL to search kegg
    var url =	this._pageUrl
            + "pz/portal.html#!results?search=0&crown=1&star=1&method=4614"
            + queryString + "&offset=0";

    // open the kegg URL in a new tab
    console.log("Phytozome open url: " + url);
    chrome.tabs.create({ url: url });
};

var phytozome = new Phytozome();