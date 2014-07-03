var gaggleplotexpression = {
    parseData: function(host, packagename, functionname, sessionid, species, desc)
    {
      /*var queries = {};
      $.each(document.location.search.substr(1).split('&'),function(c,q){
        var i = q.split('=');
        queries[i[0].toString()] = i[1].toString();
      });
      console.log(queries); */

      var url = host + "/tmp/" + sessionid + "/graphics/1";
      var html = "<div class='gaggle-plotexpression' style='display: none'><input type='text' value='" +url + "' /></div>";
      console.log("html: " + html);
      var wrapdiv = document.createElement("div");
      wrapdiv.setAttribute("id", "divNewGaggledData");
      $(wrapdiv).html(html);
      document.body.appendChild(wrapdiv);
      console.log("Send GaggleDataAddEvent event...");
      var event = new CustomEvent('GaggleDataAddEvent', {detail: {funcname: functionname, species: species,
                                    handlername: "plotExpressionHandler", description: desc},
                                      bubbles: true, cancelable: false});
      document.dispatchEvent(event);
    }
}