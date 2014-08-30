// Name has to be identical to the package name
var gagglefunctionalenrichment = {
    generateGaggleDataHtml: function(organism, moduleid, names)
    {
      if (names == null || names.length == 0)
        return null;

      var html = "<div class='gaggle-data' style='display:none'>";
      html += "<span class='gaggle-name hidden'>" + organism + " module " + moduleid + " overlapped genes(" + names.length + ")</span>";
      html += "<span class='gaggle-species hidden'>" + organism + "</span>";
      html += "<span class='gaggle-size hidden'>" + names.length + "</span>";
      html += "<div class='gaggle-namelist'><ul>";
      for (var i = 0; i < names.length; i++) {
         html += "<li>" + names[i].trim() + "</li>";
      }
      html += "</ul></div></div>";
      return html;
    },

    generateEnrichmentHtml: function(species, linefields, propertyfields)
    {
        console.log("generateenrichmentHtml: " + linefields.length + " " + propertyfields.length);
        if (linefields != null &&  propertyfields != null && linefields.length == propertyfields.length) {
            var html = "<div class='gaggle-enrichment' style='display: none'>";
            for (var i = 0; i < linefields.length; i++) {
                var fieldvalue = linefields[i];
                var ftype="value";
                if (i == 1) {
                    ftype = "url";
                    if (species.toLowerCase() == "mtu") {
                        var prefix = "";
                        // We need to prefix the bicluster number to make its length to be 4.
                        // For example, 303 becomes 0303
                        for (var j = 0; j < 4 - linefields[i].length; j++)
                            prefix += "0";
                        fieldvalue = "http://networks.systemsbiology.net/mtb/biclusters/bicluster_" + prefix + linefields[i];
                    }
                    else
                        fieldvalue = "http://networks.systemsbiology.net/" + species + "/network/1/module/" + linefields[i];
                }
                html += "<label><input value='" + propertyfields[i] + "' /><input value='" + fieldvalue + "' /><input value='" + ftype + "' /></label>";
            }
            html += "</div>";
            return html;
        }
        return "";
    },

    generateGagglePValueHtml: function(species, moduleid, propertyfields, fields) {
        if (propertyfields != null && fields != null) {
            var html = "<div class='gaggle-pvalue' style='display: none'>";
            for (var i = 0; i < fields.length; i++) {
                html += "<label><input value='Module'><input value='" + moduleid + "' /></label><label><input value='" + propertyfields[i] + "'><input value='" + fields[i] + "' /></label>";
            }
            html += "</div>";
            return html;
        }
        return "";
    },

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

    parseData: function(host, packagename, functionname, sessionid, species, desc, runscriptguid, tabid)
    {
      /*var queries = {};
      $.each(document.location.search.substr(1).split('&'),function(c,q){
        var i = q.split('=');
        queries[i[0].toString()] = i[1].toString();
      });
      console.log(queries); */

      var url = host + "/tmp/" + sessionid + "/R/.val";
      console.log("opencpu url: " + url);
      $.get(url, function(data){
           console.log("Received data: " + data);

           var splitted = data.split("\n");
           var enrichmentfields = gagglefunctionalenrichment.getFields(splitted[0], ' ');
           console.log("Enrichment fields: " + enrichmentfields);

           var i = 1;
           var modules = new Array();
           var namelists = new Array();
           var wrapdiv = document.createElement("div");
           wrapdiv.setAttribute("id", "divNewGaggledData");

           var gaggledhtml = "<div id='" + runscriptguid + "' ><div class='gaggle-genesetenrichment-info' style='display: none'><input type='text' value='"
                             + tabid + "' /><input type='text' value='" + runscriptguid  + "' /></div>";
           var parsedobj = {};

           var line = splitted[i];
           while ((line == null || line.length == 0) && i < splitted.length) {
              line = splitted[++i];
           }

           if (i < splitted.length) {
               // First process the Input.Name, Enriched.Module, etc fields

               do {
                  line = splitted[i];
                  if (line.indexOf("overlap.genes") >= 0) {
                     break;
                  }
                  var linefields = gagglefunctionalenrichment.getFields(line, ' ');
                  if (linefields.length > 0) {
                      var moduleid = linefields[0];
                      console.log("Encountered module " + moduleid);
                      modules.push(moduleid);
                      var moduleinfo = {};
                      for (var p = 0; p < enrichmentfields.length; p++)  {
                           moduleinfo[enrichmentfields[p]] = linefields[p];
                           console.log("Module " + moduleid + " Field " + enrichmentfields[p] + " Value " + linefields[p] + " " + moduleinfo);
                      }
                      parsedobj[moduleid] = moduleinfo;
                  }
                  i++;
               }
               while (i < splitted.length);
               console.log("parsed obj: " + parsedobj);

               // Now parse the overlap.genes info
               console.log("Overlap gene line: " + line);
               if (i < splitted.length) {
                   if (line.indexOf("overlap.genes") >= 0) {
                      var modulecnt = 0;
                      var linefields = gagglefunctionalenrichment.getFields(line, ' ');
                      while (modulecnt < modules.length) {
                          line = splitted[++i];
                          console.log("====>Line: " + line);
                          var loc = line.indexOf(" ");
                          var moduleidstr = line.substr(0, loc);
                          var moduleid = parseInt(moduleidstr);
                          modulecnt++;
                          var targetmodule = (modulecnt < modules.length) ? modules[modulecnt] : "-1";
                          // Some overlapped genes could span multiple lines, we need to append them properly
                          var nextmodule = "";
                          var linetoprocess = line;
                          if (linefields.length == 1)
                            linetoprocess += " ";
                          console.log("Initial line to process: " + linetoprocess);
                          i++;
                          while (i < splitted.length) {
                              var nextline = splitted[i];
                              console.log("Inspecting next line " + nextline + " for module id " + modules[modulecnt]);
                              if (nextline == null || nextline.length == 0) {
                                 i++;
                                 continue;
                              }

                              if (nextline.indexOf(".p.value") >= 0)
                                 // We finished processing overlap.gene and possibly pvalues
                                 break;

                              var nextlinefields = gagglefunctionalenrichment.getFields(nextline, ' ');
                              nextmodule = nextlinefields[0];
                              console.log("Next module: " + nextmodule + " target module: " + targetmodule);
                              if (nextmodule.trim() != targetmodule.trim()) {
                                  linetoprocess += nextline;
                              }
                              else
                                break;
                              i++;
                          }
                          console.log("Line to be processed: " + linetoprocess);
                          var moduleinfo = parsedobj[moduleidstr];
                          console.log("Got parsed module info: " + moduleinfo);
                          var fieldvalues = gagglefunctionalenrichment.getFields(linetoprocess, ' ');
                          for (var p = 0; p < linefields.length; p++) {
                            moduleinfo[linefields[p]] = fieldvalues[p + 1];
                            console.log("Module " + moduleid + " Field " + linefields[p] + " Value " + fieldvalues[p + 1]);
                          }
                          i--;
                      }
                   }

                   // Now handle the rest of the output (if any)
                   i++;
                   while (i < splitted.length) {
                      line = splitted[i];
                      while ((line == null || line.length == 0) && i < splitted.length) {
                         line = splitted[++i];
                      }

                      if (i < splitted.length && line.indexOf(".p.value") >= 0) {
                         console.log("Processing pvalue line " + line);
                         var pvaluefields = gagglefunctionalenrichment.getFields(line, ' ');
                         i++;
                         while (i < splitted.length) {
                            line = splitted[i];
                            console.log("Pvalue line: " + line);
                            if (line != null && line.length > 0) {
                                var linevalues = gagglefunctionalenrichment.getFields(line, ' ');
                                if (linevalues.length > 0) {
                                    var moduleidstr = linevalues[0];
                                    var moduleinfo = parsedobj[moduleidstr];
                                    console.log("Handling obj for " + moduleidstr + " moduleinfo " + moduleinfo);
                                    for (var p = 0; p < pvaluefields.length; p++) {
                                        moduleinfo[pvaluefields[p]] = linevalues[p + 1];
                                        console.log("Module " + moduleidstr + " Field " + pvaluefields[p] + " Value " + linevalues[p + 1]);
                                    }
                                }
                            }
                            i++;
                         }
                      }
                      else
                        i++;
                   }
               }
           }

           // Now we generate the gaggled data html and output html
           console.log("---->Generating html " + parsedobj);
           var pvalueproperties = ["Enrichment.p.value", "Corrected.p.value"];
           for (var p = 0; p < modules.length; p++) {
               var moduleid = modules[p];
               console.log("Generating html for module " + moduleid);
               var moduleinfo = parsedobj[moduleid];

               var enrichmentvalues = [];
               for (var k = 0; k < enrichmentfields.length; k++) {
                    console.log("Enrichment field " + enrichmentfields[k] + " Value " + moduleinfo[enrichmentfields[k]]);
                    enrichmentvalues.push(moduleinfo[enrichmentfields[k]]);
               }
               var html = gagglefunctionalenrichment.generateEnrichmentHtml(species, enrichmentvalues, enrichmentfields);
               if (html != null)  {
                  console.log("Enrichment html: " + html);
                  gaggledhtml += html;
               }

               var names = moduleinfo["overlap.genes"].split(":");
               html = gagglefunctionalenrichment.generateGaggleDataHtml(species, moduleid, names);
               if (html != null) {
                   console.log("Generated gaggled data html: " + html);
                   gaggledhtml += html;
               }

               var pvalues = [];
               pvalues.push(moduleinfo["Enrichment.p.value"]);
               pvalues.push(moduleinfo["Corrected.p.value"]);
               html = gagglefunctionalenrichment.generateGagglePValueHtml(species, moduleid, pvalueproperties, pvalues);
               if (html != null) {
                   console.log("Generated pvalue html: " + html);
                   gaggledhtml += html;
               }


           }
           gaggledhtml += "</div>";
           console.log("gaggled html: " + gaggledhtml);
           $(wrapdiv).html(gaggledhtml);
           var containerdiv = document.getElementById("divGaggledData");
           containerdiv.appendChild(wrapdiv);
           // Send custom event to page
           console.log("Send GaggleDataAddEvent event...");
           var event = new CustomEvent('GaggleDataAddEvent', {detail: {funcname: functionname, species: species,
                                            handlername: "geneSetEnrichmentHandler", description: desc},
                                            bubbles: true, cancelable: false});
           document.dispatchEvent(event);
      });
    }
};