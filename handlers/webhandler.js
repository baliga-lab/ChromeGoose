var webhandlers = {

    loadHandlers: function()
    {
       console.log("Loading handlers...");
       try {
           var handlers = new Array();
           handlers[0] = new gaggleMicroformatPlaceHolder();
           handlers[1] = new gaggleXml();
           handlers[2] = new GaggleMicroformatHandler();
           handlers[3] = new David();
           handlers[4] = new KEGG();
           handlers[5] = new Entrez("Gene");
           handlers[6] = new Entrez("Protein");
           handlers[7] = new Egrin2Handler();
           handlers[8] = new PeptideAtlas();
           handlers[9] = new Pipe2Goose();
           handlers[10] = new EMBLString();
           handlers[11] = new HaloAnnotations();
           handlers[12] = new StampHandler();
           handlers[13] = new MRMAtlas();
           handlers[14] = new MaggieHandler();
           handlers[15] = new Metlin();
           handlers[16] = new OntDiscEnvHandler();
           handlers[17] = new PDDB();
           handlers[18] = new SGD(SGD.GO_SLIM_MAPPER, "SGD GO Slim Mapper");
           handlers[19] = new SGD(SGD.GO_TERM_FINDER, "SGD GO Term Finder");
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
           handlers.push(new OpenCPUHandler());
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
    }
}