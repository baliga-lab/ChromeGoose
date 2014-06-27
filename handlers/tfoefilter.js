var gaggletfoefilter = {
    parseData: function(host, packagename, functionname, sessionid, species)
    {
        var url = host + "/tmp/" + sessionid + "/R/.val";
        console.log("opencpu url: " + url);
        $.get(url, function(data) {
            console.log("Received data: " + data);
        }
    }
}