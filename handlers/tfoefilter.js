var gaggletfoefilter = {
    parseData: function(host, packagename, functionname, sessionid, species)
    {
        var url = host + "/tmp/" + sessionid + "/graphics/1";
        console.log("opencpu tfoe graphics url: " + url);
        var html = "<div class='gaggle-plottfoe' style='display: none'><input type='text' value='" +url + "' /></div>";
        console.log("html: " + html);
        var wrapdiv = document.createElement("div");
        wrapdiv.setAttribute("id", "divNewGaggledData");
        $(wrapdiv).html(html);
        document.body.appendChild(wrapdiv);

        url = host + "/tmp/" + sessionid + "/stdout";
        $.get(url, function(data){
            console.log("TFOE script received data: " + data);

            console.log("Send GaggleDataAddEvent event...");
            var event = new CustomEvent('GaggleDataAddEvent', {detail: {funcname: functionname, species: species, handlername: "tfoefilter", output: data},
                                         bubbles: true, cancelable: false});
            document.dispatchEvent(event);
        });
    }
};