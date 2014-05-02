/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//
// Handler for interacting with the SBEAMS Peptide Atlas
//


function PeptideAtlas()
{
    console.log("Initializing Peptide Atlas...");
    handler_base.call(this, "Peptide Atlas", true, "handlers/peptideAtlas.js", "http://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/Search");
}

PeptideAtlas.prototype = new handler_base();

PeptideAtlas.prototype.constructor = PeptideAtlas;


PeptideAtlas.prototype.recognize = function(doc) {
    return false;
};

PeptideAtlas.prototype.show = function() {
    var url = "http://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/Search";
    var newTab = getBrowser().addTab(url);
    getBrowser().selectedTab = newTab;
};

PeptideAtlas.prototype.getPageData = function(doc) {
    return null;
}

PeptideAtlas.prototype.handleNameList = function(namelist) {
    if (namelist != null) {
        var names = namelist.getData();
        var url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/Search?action=GO&search_key=";

        // semi-colon delimited list of gene names
        url += cg_util.join(names, "%3B");

        console.log("Peptide Atlas open url: " + url);
        chrome.tabs.create({ url: url });
    }
}

var peptideAtlas = new PeptideAtlas();