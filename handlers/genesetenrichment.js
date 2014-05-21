function generateGaggleDataHtml(organism, moduleid, names)
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
}

function parseData(host, packagename, functionname, sessionid, species)
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
    var newdata = splitted[0] + "<br />";
    var i = 1;
    var modules = new Array();
    var namelists = new Array();
    
    while(i < splitted.length) {
       var line = splitted[i];
       if (line == null || line.length == 0)
          break;
       /*if (i == 1) {
         for (var k = 0; k < line.length; k++)
            console.log("Line 1 char " + k + ": " + line.charCodeAt(k));
       } */     
       console.log("Original line: " + line);
       
       if (line.indexOf("overlap.genes") >= 0) {
          newdata += line + "<br />";
          console.log("Parsing overlapping genes " + modules.length);
          var modulecnt = 0;
          do {
            var line = splitted[++i];
            newdata += line + "<br />";
            console.log("Overlapping gene module " + line);
            var loc = line.indexOf(" ");
            var moduleidstr = line.substr(0, loc);
            var moduleid = parseInt(moduleidstr);
            modulecnt++;
            var geneline = line.substr(loc);
            console.log("Gene names: " + geneline);
            /*if (modulecnt == 1)
              for (var k = 0; k < geneline.length; k++)
                console.log("Line 1 char " + k + ": " + geneline.charCodeAt(k)); */
            var genenames = geneline.split(":");
            var html = generateGaggleDataHtml(species, moduleid, genenames);
            if (html != null) {
              console.log("Generated html: " + html);
              var existinghtml = $("#divGaggledData").html();
              $("#divGaggledData").html(existinghtml + html);
            }
          }
          while (modulecnt < modules.length && i < splitted.length);
          i++;
       }
       else {
         i++;
         
         var newline = "";
         var findex = 0;
         var start = 0;
       
         do {
           var loc = line.indexOf(" ", start);
           if (loc < 0)
             loc = line.length;
           if (loc > start) {
             var value = line.substr(start, loc - start);
             console.log("Field " + findex + ": " + value);
             if (findex == 2 && value.indexOf(".") < 0) {
                var moduleid = value;
                console.log("Module ID: " + moduleid);
                modules.push(moduleid);
                
                var modulestr = "<a target='_blank' href='http://networks.systemsbiology.net/" + species + "/network/1/module/" + moduleid + "'>" + moduleid + "</a>";
                newline += modulestr;
                console.log("Module link: " + modulestr);
             }
             else
                newline += value;
             start = loc;
             while (line[start] == ' ' && start < line.length) {
               newline += line[start];
               start++;
             }
             
             findex++;
           }
           else {
             newline += line[start];
             start++;
           }
         }
         while (start < line.length);
         newdata += newline + "<br />";
       }
    }
    
    console.log(newdata);
    newdata = newdata.replace(/\n/g, "<br />");
    newdata = "<p><div class='panel panel-primary divGaggleOutputUnit'><div class='panel-heading'><h4 class='panel-title'> Output - Gene Set Enrichment - " + species + "</h4></div><div class='divGaggleDataSet'><div class='panel-body'>" + newdata + "</div></div></div></p>";
    var html = $("#divGaggleOutput").html();
    html += newdata;
    $("#divGaggleOutput").html(html);
    $(".divGaggleOutputUnit").draggable({
      
    });
    $("#inputDataParsingFinishSignal").val("True");
  });
}