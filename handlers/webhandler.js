var webhandlers = {

    loadHandlers: function()
    {
       //alert("Loading handlers...");

       var handlers = new Array();
       handlers[0] = new David();
       handlers[1] = new KEGG();
       return handlers;
    }

}