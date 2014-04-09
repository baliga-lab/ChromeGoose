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
    }

}