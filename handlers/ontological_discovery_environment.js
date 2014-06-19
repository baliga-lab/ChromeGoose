/*
 * Copyright (C) 2008 the Ontological Discovery Environment
 * Oak Ridge, Tennessee, USA.  All rights reserved.
 *
 * If you are viewing this file in Firefox, use 
 *
 *   Tools -> Firegoose -> Import Website Handler
 *  
 * to enable ODE as a target for firegoose.
 */

function OntDiscEnvHandler() {
    handler_base.call(this, "Ontological Discovery Environment", true, "handlers/ontological_discovery_environment.js", "http://ontologicaldiscovery.org", null);
}

OntDiscEnvHandler.prototype = new handler_base();

OntDiscEnvHandler.prototype.constructor = OntDiscEnvHandler;

OntDiscEnvHandler.prototype.recognize = function(doc) {
   // use the normal firegoose microformat parser
	return false;
}

OntDiscEnvHandler.prototype.show = function() {
	var url = "http://ontologicaldiscovery.org";
	//var newTab = getBrowser().addTab(url);
	//getBrowser().selectedTab = newTab;
}

OntDiscEnvHandler.prototype.handleCluster= function(species, name, genes, description) {
	// construct a query string out of the gene list
	console.log("Handling cluster for " + species + ", " + genes + ", " + name + ", " + description);
	var queryString = "";
	if (genes.length > 0) {
		queryString += genes[0];
	}
	for (var i=1; i<genes.length; i++) {
		queryString += ",";
		queryString += genes[i];
	}

	var url =	"http://ontologicaldiscovery.org/index.php?action=manage&cmd=importGeneSet&client=firegoose"
         + "&idtype=symbol"
			+ "&name=" + name + "&label=" + name
         + "&desc=" + description
			+ "&species=" + species
         + "&list=" + queryString;

	// open the URL in a new tab
    console.log("Ontological Discovery open url: " + url);
    chrome.tabs.create({ url: url });
}

OntDiscEnvHandler.prototype.handleNameList = function(namelist) {
   var name="", description="";
   try { // try to get more info than just species and gene list...

      //var broadcastChooser = document.getElementById("fg_broadcastChooser");
      //var broadcastData = FG_gaggleDataHolder.get(broadcastChooser.selectedItem.getAttribute("value"));

      var species = namelist.getSpecies();
      var names = namelist.getData();

      name = namelist.getName();
      description = namelist.getDescription();

      if( name=="" && description!="" ) name=description;
      if( name!="" && description=="" ) description=name;
   } catch(anything) {}
   this.handleCluster(species, name, names, description);
}

OntDiscEnvHandler.prototype.handleNetwork = OntDiscEnvHandler.handleNameList;

// create and register a websiteHandler
ontDiscEnvHandler = new OntDiscEnvHandler();
