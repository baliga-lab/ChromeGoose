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


    loadOpenCPU: function(callback) {
    },

    loadWorkflowComponents: function(callback) {
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
                                var rscriptwrapper = new RScriptWrapper(pair["shortname"], script, "selGaggleData");
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