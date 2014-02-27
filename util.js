function loadHandlers(withObject)
{
   //alert("Loading handlers...");

   var handlers = new Array();
   handlers[0] = (withObject ? new David() : "David");
   return handlers;
}

function getActiveTab(callback) {
    chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function(tabs) {
          /* ...and send a request for the DOM info... */
          if (callback != null)
             callback(tabs[0]);
      });
}

function openNewTab(url) {
    var newURL = url;
    chrome.tabs.create({ url: newURL });
}

