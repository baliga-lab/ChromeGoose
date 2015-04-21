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


/**
 * check the given doc to see if we can parse it.
 */
Metlin.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return url.indexOf("http://metlin.scripps.edu/metabo_batch_list") >=0 ||
			   url.indexOf("http://metlin.scripps.edu/metabo_list") >=0;
	}
	else
		return false;
}


/**
 * retrieve the data from the page.
 */
Metlin.prototype.getPageData = function(doc) {
	var results = [];

	// read kegg compound ids
	var names = [];

	// add a function that takes another list and
	// pushes all it's members into this list.
	names.pushAll = function(list) {
		for (var i=0; i<list.length; i++) {
			this.push(list[i]);
		}
	}

	var tableElements = doc.getElementsByTagName("table");
	for (var i=0; i<tableElements.length; i++) {
		names.pushAll(this.readTableColumn(tableElements[i], "KEGG"));
	}

    var gaggleData = new GaggleData("KEGG Compounds from Metlin",
                                    "NameList",
                                    names.length,
                                    "Unknown",
                                    names);

    var pagedata = {};
    pagedata.data = gaggleData;
    pagedata.guid = cg_util.generateUUID();
    var jsondata = JSON.stringify(pagedata);
    pagedata.jsondata = jsondata;
    pagedata.source = "Page";
    //alert(pagedata.source);
    pageGaggleData.push(pagedata);

	results.push(gaggleData);

	return results;
}

Metlin.prototype.scanPage = function() {
    this.checkData();
    if (this.recognize(document))
        this.getPageData(document);
}

/**
 * read a column of a table with the given title (in the first row
 * of the table). Return the columns contents as a list.
 */
Metlin.prototype.readTableColumn = function(tableElement, columnTitle) {
	var result = [];
	if (tableElement) {

		var rows = tableElement.getElementsByTagName("TR");
		var foundColumn = -1;

		// find column with title equal to columnTitle
		if (rows.length > 0) {
			var row = rows[0];

			// for each table cell
			for (var j=0,k=0; k<row.childNodes.length; k++) {
				if (row.childNodes[k].tagName=="TD" || row.childNodes[k].tagName=="TH") {
					var cell = row.childNodes[k];
					if (columnTitle == ufmt.trim(this.getTextInsideAnchorTags(cell))) {
						foundColumn = j;
						break;
					}
					j++;
				}
			}

			// if a column was found, read it's identifiers
			if (foundColumn >= 0) {
				for (var i=1; i<rows.length; i++) {
					row = rows[i];

					// for each table cell
					for (var j=0,k=0; k<row.childNodes.length; k++) {
						if (row.childNodes[k].tagName=="TD" || row.childNodes[k].tagName=="TH") {
							if (j == foundColumn) {
								var cellContents = ufmt.trim(this.getTextInsideAnchorTags(row.childNodes[k]));
								if (cellContents && cellContents.length > 0) {
									result.push(cellContents);
								}
								break;
							}
							j++;
						}
					}
				}
			}
		}

	}
	return result;
}


/**
 * get the text contained by the given node
 * recursing into anchor tags to get their contained
 * text as well.
 */
Metlin.prototype.getTextInsideAnchorTags = function(node) {
	var txt = "";
	if (node && node.childNodes) {
		for (var i=0,len=node.childNodes.length; i<len; i++) {
			if (node.childNodes[i].nodeType == Node.TEXT_NODE) {
				txt += node.childNodes[i].nodeValue;
			}
			else if (node.childNodes[i].tagName && node.childNodes[i].tagName == "A") {
				txt += this.getTextInsideAnchorTags(node.childNodes[i]);
			}
		}
	}
	return txt;
}



// create and register a websiteHandler
var metlin = new Metlin();

