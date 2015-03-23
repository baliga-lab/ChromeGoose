var webhandlers = {

    loadHandlers: function()
    {
       console.log("Loading handlers...");
       try {
           var handlers = new Array();
           handlers.push(new gaggleMicroformatPlaceHolder());
           handlers.push(new gaggleXml());
           handlers.push(new GaggleMicroformatHandler());
           handlers.push(new David());
           handlers.push(new KEGG());
           handlers.push(new EMBLString());
           //handlers.push(new HaloBacterium());
           handlers.push(new HaloAnnotations());
           handlers.push(new NetworkPortal());
           handlers.push(new Phytozome());
           handlers.push(new Entrez("Gene"));
           handlers.push(new Entrez("Protein"));
           handlers.push(new Egrin2Handler());
           handlers.push(new PeptideAtlas());
           handlers.push(new Pipe2Goose());
           handlers.push(new StampHandler());
           handlers.push(new MRMAtlas());
           handlers.push(new MaggieHandler());
           handlers.push(new Metlin());
           handlers.push(new OntDiscEnvHandler());
           handlers.push(new PDDB());
           handlers.push(new SGD(SGD.GO_SLIM_MAPPER, "SGD GO Slim Mapper"));
           handlers.push(new SGD(SGD.GO_TERM_FINDER, "SGD GO Term Finder"));
       }
       catch (e) {
           console.log("Failed to load handler: " + e);
       }

       return handlers;
    },

    loadContentPageHandlers: function() {
       console.log("Loading content page handlers...");
       try {
           var handlers = new Array();
           handlers.push(new gaggleMicroformatPlaceHolder());
           handlers.push(new gaggleXml());
           handlers.push(new GaggleMicroformatHandler());
           handlers.push(new Pipe2Goose());
           //handlers.push(new OpenCPUHandler());
           handlers.push(new EMBLString());
           handlers.push(new Metlin());
           handlers.push(new SGD(SGD.GO_SLIM_MAPPER, "SGD GO Slim Mapper"));
           handlers.push(new SGD(SGD.GO_TERM_FINDER, "SGD GO Term Finder"));

           //handlers[3] = new David();
           //handlers[4] = new KEGG();
           //handlers[5] = new Entrez("Gene");
           //handlers[6] = new Entrez("Protein");
           //handlers[7] = new Pipe2Goose();
       }
       catch (e) {
           console.log("Failed to load handler: " + e);
       }
       return handlers;
    },

    // dataelementid is the id of the DOM select element that contains the parsed gaggle data
    loadOpenCPU: function(dataelement, callback) {
        console.log("Loading packages from OpenCPU...");

        cg_util.httpGet(OPENCPU_SERVER + "/library/", function(libraries) {
            console.log("Returned libraries: " + libraries);
            var handlers = {};
            if (libraries != null) {
                var splitted = libraries.split("\n");
                for (var i = 0; i < splitted.length; i++) {
                    var libname = splitted[i];
                    console.log("R package name: " + libname);
                    if (libname.toLowerCase().indexOf("gaggle") == 0) {
                        var rscriptwrapper = new RScriptWrapper(libname, null, dataelement);
                        handlers[libname] = rscriptwrapper;
                    }
                }
            }

            if (callback != null)
                callback(handlers);
        });
    },

    // dataelementid is the id of the DOM select element that contains the parsed gaggle data
    loadWorkflowComponents: function(dataelementid, callback) {
        // Load script workflow component from workspace server
        console.log("Loading workflow components...");
        cg_util.doGet(GAGGLE_SERVER + "/workflow/getworkflowcomponents" , null, "json", function(data) {
        console.log("Received component data: " + data);
        if (data != null) {
            var index = 0;
            var jsonobj = data; //JSON.parse(data);
            do {
                var pair = jsonobj[index.toString()];
                if (pair == null)
                    break;
                console.log("workflow component pair: " + pair);
                var isscript = pair["isscript"];
                if (isscript == "True") {
                    var scripturl = pair["serviceurl"];
                    console.log("script url: " + scripturl);
                    if (scripturl != null) {
                        var script = cg_util.httpGet(scripturl);
                        if (script != null) {
                            console.log("Received script: " + script);
                            if (scripturl.toLowerCase().indexOf(".r") >= 0) {
                                // this is a R script
                                var rscriptwrapper = new RScriptWrapper(pair["shortname"], script, dataelementid);
                                webHandlers.push(rscriptwrapper);
                                console.log("Script wrapper getName: " + rscriptwrapper.getName());
                                if (callback != null)
                                    callback(rscriptwrapper);
                            }
                        }
                    }

                    //alert("Downloaded script:  " + script);
                }
                index++;
            }
            while (true);
        }
    });
    },

    getHandlerByUrl: function(url, handlers) {
        if (url != null && handlers != null) {
            var urllower = url.toLowerCase();
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                console.log("Processing handler " + handler.getName() + " " + handler.getKeywords());
                if (handler != null && handler.showInMenu() && handler.getKeywords() != null)
                {
                    var keywords = handler.getKeywords();
                    for (var j = 0; j < keywords.length; j++) {
                        console.log("Handler keyword: " + keywords[j]);
                        if (urllower.indexOf(keywords[j].toLowerCase()) >= 0)
                            return handlers[i];
                    }
                }
            }
        }
        return null;
    }
}