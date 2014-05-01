

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

document.addEventListener("PIPE2DataEvent", pipe2EventHandler, false);

