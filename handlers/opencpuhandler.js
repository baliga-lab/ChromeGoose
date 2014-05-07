function OpenCPUHandler()
{
    handler_base.call(this, "DAVID", false, "handlers/opencpuhandler.js", null);
}

OpenCPUHandler.prototype = new handler_base();

OpenCPUHandler.prototype.constructor = OpenCPUHandler;

OpenCPUHandler.prototype.scanPage = function ()
{
    console.log("OpenCPU handler scan page...");
    var inputpackage = document.getElementById("inputGaggleRScriptPackageName");
    var inputfunction = document.getElementById("inputGaggleRScriptFunctionName");
    if (inputpackage != null && inputfunction != null) {
        var pagedata = {};
        var data = new Array();
        data[0] = $(inputpackage).val();
        data[1] = $(inputfunction).val();
        var queries = {};
        $.each(document.location.search.substr(1).split('&'),function(c,q){
            var i = q.split('=');
            queries[i[0].toString()] = i[1].toString();
        });
        console.log(queries);
        species = queries["species"];
        data[2] = queries["host"];
        data[3] = queries["sessionID"];

        pagedata.data = new GaggleData((data[1] + " Output"), "OpenCPU", 4, species, data);
        pagedata.guid = cg_util.generateUUID();
        console.log("OpenCPU data ID: " + pagedata.guid);
        var jsondata = JSON.stringify(pagedata);
        pagedata.jsondata = jsondata;
        pagedata.source = "Page";
        pageGaggleData.push(pagedata);
    }
};

var openCPUHandler = new OpenCPUHandler();