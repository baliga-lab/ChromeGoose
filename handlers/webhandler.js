var webhandlers = {

    loadHandlers: function()
    {
       //alert("Loading handlers...");
       try {
           var handlers = new Array();
           handlers[0] = new gaggleMicroformatPlaceHolder();
           handlers[1] = new David();
           handlers[2] = new KEGG();
           handlers[3] = new gaggleXml();
           handlers[4] = new GaggleMicroformatHandler();
           //handlers[5] = new FE();
       }
       catch (e) {
           alert(e);
       }

       return handlers;
    },


    // dataelementid is the id of the DOM select element that contains the parsed gaggle data
    loadOpenCPU: function(dataelementid, callback) {
        console.log("Loading packages from OpenCPU...");
        var libraries = cg_util.httpGet(OPENCPU_SERVER + "/library/");
        console.log("Returned libraries: " + libraries);
        if (libraries != null) {
            var splitted = libraries.split("\n");
            for (var i = 0; i < splitted.length; i++) {
                var libname = splitted[i];
                console.log("R package name: " + libname);
                if (libname.toLowerCase().indexOf("gaggle") == 0) {
                    var robjects = cg_util.httpGet(OPENCPU_SERVER + "/library/" + libname + "/R");
                    var rscriptwrapper = new RScriptWrapper(libname, null, dataelementid);
                    webHandlers.push(rscriptwrapper);
                    console.log("R Objects: " + robjects);
                    if (robjects != null) {
                        var robjsplit = robjects.split("\n");
                        for (var j = 0; j < robjsplit.length; j++) {
                            var robj = robjsplit[j];
                            console.log("Parsing R obj " + robj);
                            var rscript = cg_util.httpGet(OPENCPU_SERVER + "/library/" + libname + "/R/" + robj);
                            //console.log("R script: " + rscript);
                            if (rscript.indexOf("function") == 0) {
                                // This is a R function script
                                //var rscriptwrapper = new RScriptWrapper(robj, rscript, dataelementid);
                                rscriptwrapper.setScript(robj, rscript);
                                //console.log("Script wrapper getName: " + rscriptwrapper.getName());
                            }
                        }
                    }

                    if (callback != null)
                        callback(rscriptwrapper);
                }
            }
        }
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