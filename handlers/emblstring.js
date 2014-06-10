/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

/**
 * Handle broadcasts to and from EMBL's String database.
 *
 * Updated for String version 7.1
 * Updated for String version 8.0 (not compatible w/ previous versions)
 *
 * Notes: There are a couple cases here of some awkwardness because I haven't
 *        figured out how to do a POST and show the results in a browser tab.
 */

function EMBLString()
{
    handler_base.call(this, "EMBL String", true, "handlers/EMBLString.js", "http://string.embl.de", (WEBHANDLER_BASEURL + "emblstring-server.js"));
    this.progressCounter = 0;
    this.speciesSynonyms = {
         "halobacterium sp.": "halobacterium sp. nrc-1",
         "halobacterium nrc1": "halobacterium sp. nrc-1",
         "halobacterium nrc-1": "halobacterium sp. nrc-1",
         "h. salinarum": "halobacterium sp. nrc-1",
         "halobacterium salinarum": "halobacterium sp. nrc-1",
         "halobacterium salinarum nrc-1": "halobacterium sp. nrc-1"
    };
}

EMBLString.prototype = new handler_base();

EMBLString.prototype.constructor = EMBLString;


/**
 * Are we browsing to a page we can deal with?
 */
/*EMBLString.prototype.recognize = function(doc) {
    if (doc) {
        var url = doc.location.href;
        if ((url.indexOf("http://string.embl.de/newstring_cgi/show_network_section.pl") >=0)
        ||  (url.indexOf("http://string.embl.de/newstring_cgi/show_network_direct.pl") >=0)) {
            // We can only get species the first time String displays a network.
            // The networks produced by "+ more" and "- less" don't have species
            // in the page, so we keep it here for later.
            this._defaultSpecies = this.getSpecies(doc);
            return true;
        }
    }
    return false;
};  */


/**
 * open STRING in a new browser tab
 */
EMBLString.prototype.show = function() {
    var url = "http://string.embl.de/?" + this.callerIdentity();
    //var newTab = getBrowser().addTab(url);
    //getBrowser().selectedTab = newTab;
};

EMBLString.prototype.scanPage = function ()
{
    console.log("EMBL String scan page..." + window.location);

    this.checkData();

    // Now call Selenium to click the button
    if (window.self != top) {
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RETRIEVEHANDLERIFRAMEID,
                              { handler: this._name },
                              function(iframeid) {
                                 console.log("EMBL String got iframeId: " + iframeid);
                                 if (iframeid == null)
                                    return;

                                 var poller = new Object();
                                 poller.timerCount = 0;
                                 poller.poll = function() {
                                       this.timerCount++;
                                       var found = false;
                                       $("input[type=submit]").each(function () {
                                           console.log("Found submit input: " + $(this).val());
                                           if ($(this).val().indexOf("Continue") >= 0) {
                                               found = true;
                                               console.log("EMBL String target iframe Id: " + iframeid);

                                               // click the "Continue" button
                                               var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                                                                  {ID: "", Action: "Chrome", Data: {Command: "ClickIFrame", Data: {IFrameId: iframeid, ElementId: "", ElementClass: "current",
                                                                                                                                   TagName: "input", AttributeName: "value", SearchText: "Continue", OnlyOne: "true"}}},
                                                                  function() {
                                                                  });
                                               msg.send();
                                           };
                                       });

                                       if (found) {
                                          console.log("EMBL Remove timer: " + this.timerId);
                                          clearInterval(this.timerId);
                                       }
                                       else if (this.timerCount == 10)  {
                                          console.log("EMBL Couldn't find the element, clear timer: " + this.timerId);
                                          clearInterval(this.timerId);
                                       }
                                 };

                                 console.log("EMBL String starting poller timer...");
                                 poller.timerId = setInterval(function() { poller.poll(); }, 500);
                              });

        msg.send();
    }

};


/**
 * Create a closure which will be called on the page "load" event that
 * fills in String's List Input form and submits it.
 *
 * Yes, it would be much cleaner to just send a post
 * request and show the results in a browser tab, but
 * can XUL/javascript do that?? Not as far as I could
 * figure out.
 */
EMBLString.prototype.processData = function(jsondata) {//stringSpeciesName, names) {
    console.log("EMBL string processing data " + jsondata);
    var jsonobj = JSON.parse(jsondata);
    if (jsonobj != null) {
        var handler = jsonobj["handler"];
        var sourceobj = jsonobj["source"];
        var type = sourceobj["_type"];
        console.log("EMBL String received data type: " + type);
        var gaggledata = null;
        if (type == "NameList") {
            try {
                namelist = new Namelist("", 0, "", null);
                namelist.parseJSON(sourceobj);
                var stringSpeciesName = namelist.getSpecies();
                var names = namelist.getData();
                // this function removes itself as an event listener, so it's necessary to assign it to a variable
                //var onLoadFormFiller = function(aEvent) {
                console.log("STRING: species = " + stringSpeciesName);
                console.log("STRING: names = " + names);
                console.log("STRING: names.length = " + names.length);

                if (names && names.length>1) {

                    // remove the event listener
                    //var browser = getBrowser().getBrowserForTab(getBrowser().selectedTab);
                    //if (browser)
                    //    browser.removeEventListener("load", onLoadFormFiller, true);

                    var doc = document;

                    // set the species chooser
                    var organism_select_box = doc.getElementById("organism_select_box");
                    if (organism_select_box) {
                        // String went to an ajaxified name-completion type thing, so
                        // this no longer works
            //					for (var i = 0; i < organism_select_box.length; ++i)
            //	  					if (organism_select_box[i].value.toLowerCase() == stringSpeciesName)
            //							organism_select_box.selectedIndex = i;
                    }
                    else {
                        console.log("String handler couldn't find organism_select_box\n");
                    }

                    // construct a string out of the name list
                    var queryString = "";
                    if (names.length > 0) {
                        queryString += names[0];
                    }
                    for (var i=1; i<names.length; i++) {
                        queryString += "\n";
                        queryString += names[i];
                    }

                    var multiple_identifiers = doc.getElementById("multiple_identifiers");
                    if (multiple_identifiers) {
                        multiple_identifiers.value = queryString;

                        var input_form = doc.getElementById("input_form");
                        if (input_form) {
                            input_form.submit();
                        }
                    }
                }
            }
            catch (e) {
                console.log("EMBL String failed to process namelist " + e);
            }
        }
    }
};


/**
 * get species by scraping hidden field
 */
EMBLString.prototype.getSpecies = function() {
    var code = "unknown";
    var doc = document;

    var identifier = doc.getElementsByName("input_query_species");
    if (identifier && identifier[0]) {
        var speciesCode = identifier[0].getAttribute("value");
        code = this.codeToSpecies(speciesCode);
    }

    if (code == "unknown" && this._defaultSpecies) {
        return this._defaultSpecies;
    }

    return code;
};

/**
	 * when we receive a namelist, open the input form with a formFiller
	 * event listener that fills out the input form and submits it.
	 */
EMBLString.prototype.handleNameList = function(namelist) {

    // String's input page no longer uses numeric species codes. The species names are
    // text, but periods seem to have been converted to underscores.
    var species = namelist.getSpecies();
    var namelist = namelist.getData();
    var stringSpeciesName = this.toStringSpeciesName(species);

    //var newTab = getBrowser().addTab();
    //var browser = getBrowser().getBrowserForTab(newTab);

    //browser.addEventListener("load", this.createOnloadFormFiller(stringSpeciesName, names), true);

    var url = "http://string.embl.de/newstring_cgi/show_input_page.pl?input_page_type=multiple_identifiers"
        + "&" + this.callerIdentity();

    //getBrowser().selectedTab = newTab;
    //browser.loadURI(url);
    console.log("EMBL String open url: " + url);
    chrome.tabs.create({ url: url });
};

/**
 * create a caller identity URL param that String can use to log hits
 */
EMBLString.prototype.callerIdentity = function() {
    return "caller_identity=chromegoose";
};

/**
	 * In the input page, string uses species names in which periods appear to
	 * have been replaced by underscores. Also, converts species to all lower case.
	 */
EMBLString.prototype.toStringSpeciesName = function(species) {
    // HACK: make sure we're dealing with a javascript string, not a java string.
    species = "" + species;

    var speciesLowerCase = species.toLowerCase();

    // fudge for Halo synonyms
    if (speciesLowerCase in this.speciesSynonyms) {
        speciesLowerCase = this.speciesSynonyms[speciesLowerCase];
    }

    // replace periods with underscores
    return speciesLowerCase.replace("\.", "_");
};

/**
	 * special hack to be liberal about names for halo
	 */
/*EMBLString.prototype.speciesSynonyms = {
    "halobacterium sp.": "halobacterium sp. nrc-1",
    "halobacterium nrc1": "halobacterium sp. nrc-1",
    "halobacterium nrc-1": "halobacterium sp. nrc-1",
    "h. salinarum": "halobacterium sp. nrc-1",
    "halobacterium salinarum": "halobacterium sp. nrc-1",
    "halobacterium salinarum nrc-1": "halobacterium sp. nrc-1"
}; */

var emblString = new EMBLString();
if (window.self != top) {
    console.log("EMBL scanning page in iframe...");
    emblString.scanPage();
}

