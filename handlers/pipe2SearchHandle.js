function pipe2Search()
{
    //console.log("PIPE2 Goose obj: " + goose);
    var found = false;
    if (cg_util.startsWith(document.location.href, "http://pipe2.systemsbiology.net") &&
        goose!=null) {
        //register
        found = true;
        console.log("Register GaggleDataFromExtension");
        document.addEventListener("GaggleDataFromExtension", pipe2EventHandler, false);
    }
    console.log("Send message to content page: " + mytabid + " " + found);
    var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {tabid: mytabid,
                                pipe2found: found},
                                bubbles: true, cancelable: false});
    document.dispatchEvent(event);
}

function pipe2SearchWithTimer()
{
    var poller = new Object();
    poller.timerCount = 0;
    poller.poll = function() {
        this.timerCount++;
        console.log("polling for presence of PIPE goose: " + this.timerCount + "\n");
        console.log("Got goose " + goose);
        if (goose) {
            try {
                console.log("Register GaggleDataFromExtension");
                document.addEventListener("GaggleDataFromExtension", pipe2EventHandler, false);

                var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {tabid: mytabid,
                                            pipe2found: true},
                                            bubbles: true, cancelable: false});
                document.dispatchEvent(event);
                clearInterval(this.timerId);
            } catch(e) {
                console.log("Error in page's PIPE2SearchWithTimer: " + e);
            }
        }
        else if (this.timerCount >= 10) {
             clearInterval(this.timerId);
             var event = new CustomEvent('PIPE2SearchResultEvent', {detail: {tabid: mytabid,
                                        pipe2found: false},
                                        bubbles: true, cancelable: false});
            document.dispatchEvent(event);
        }
    }

    // set a timer which calls the poller every second
    console.log("Starting poller timer...");
    poller.timerId = setInterval(function() { poller.poll(); }, 1000);
}

function pipe2EventHandler(e) {
    console.log("PIPE2Event captured...");
    var species = e.detail.dataspecies;
    var names = e.detail.datanames;
    console.log("Species: " + species + " Names:  " + names);
    if (names != null && goose != null) {
        console.log("Handling namelist...");
        goose.handleNameList(species, names);
    }
}