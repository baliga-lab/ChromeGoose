var gaggletfoefilter = {

    getFields: function(line, delimit)
    {
        console.log("Get fields from line " + line + " delimit " + delimit.charCodeAt(0));
        line = line.trim();
        var fields = new Array();
        if (line != null) {
            var start = 0;
            do
            {
                var loc = line.indexOf(delimit, start);
                if (loc < 0)
                    loc = line.length;
                //console.log("delimit location: " + loc);
                if (loc > start) {
                    var value = line.substr(start, loc - start);
                    console.log("Get Field value: " + value);
                    fields.push(value);

                    start = loc;
                    //console.log("Character at " + start + ": " + line.charCodeAt(start));
                    while (line.charCodeAt(start) == delimit.charCodeAt(0) && start < line.length) {
                       start++;
                    }
                }
            }
            while (start < line.length);
        }
        return fields;
    },


    parseData: function(host, packagename, functionname, sessionid, species, desc)
    {
        var url = host + "/tmp/" + sessionid + "/graphics/1";
        console.log("opencpu tfoe graphics url: " + url);
        var outputhtml = "<div class='gaggle-plottfoe' style='display: none'><input type='text' value='" +url + "' /></div>";
        console.log("html: " + outputhtml);
        var wrapdiv = document.createElement("div");
        wrapdiv.setAttribute("id", "divNewGaggledData");
        document.body.appendChild(wrapdiv);

        url = host + "/tmp/" + sessionid + "/stdout";
        $.get(url, function(data){
            console.log("TFOE script received data: " + data);

            var splitted = data.split("\n");
            var i = 0;
            var outputlines = "";
            while (i < splitted.length) {
                splitted[i] = splitted[i].replace(/\s/g, "&nbsp;");
                outputlines += splitted[i] + "<br />";
                var start = splitted[i].indexOf("Expression of ");
                if (start >= 0 && splitted[i].indexOf("TFOE experiments...") >= 0) {
                    var genes = new Array();
                    var loc = splitted[i].indexOf("changes");
                    var len = "Expression of ".length;
                    var gene = splitted[i].substr(start + len, loc - start - len - 1);
                    console.log("Gene " + gene);
                    genes.push(gene.trim());
                    outputlines += splitted[i + 1] + "<br />";
                    i += 2;
                    line = splitted[i];
                    outputlines += line + "<br />";

                    console.log("Parsing expression line: " + line);
                    var fields = gaggletfoefilter.getFields(line, ' ');
                    console.log("tfoe expression fields: " + fields);
                    var genestring = fields[fields.length - 1];
                    console.log("Gene string: " + genestring);
                    var splittedgenes = genestring.split(":");
                    var allgenes = genes.concat(splittedgenes);


                    var html = "<div class='gaggle-data' style='display:none'>";
                    html += "<span class='gaggle-name hidden'>" + "mtu expression genes for " + gene + "</span>";
                    html += "<span class='gaggle-species hidden'>" + "mtu" + "</span>";
                    html += "<span class='gaggle-size hidden'>" + allgenes.length + "</span>";
                    html += "<div class='gaggle-namelist'><ul>";
                    for (var j = 0; j < allgenes.length; j++) {
                        html += "<li>" + allgenes[j].trim() + "</li>";
                    }
                    html += "</ul></div></div>";
                    outputhtml += html;
                }
                i++;
            }
            console.log("Final html: " + outputhtml);
            $(wrapdiv).html(outputhtml);

            console.log("Send GaggleDataAddEvent event...");
            var event = new CustomEvent('GaggleDataAddEvent', {detail: {funcname: functionname, species: "mtu", handlername: "tfoefilter", output: outputlines, description: desc},
                                         bubbles: true, cancelable: false});
            document.dispatchEvent(event);
        });
    }
};