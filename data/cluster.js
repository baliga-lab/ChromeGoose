function Cluster(name, species, data, rowsize, colsize, rownames, columnnames) {
    // call the parent constructor
    GaggleData.call(this, name, "Cluster", rowsize, species, data);
    this._rownames = rownames;
    this._columnnames = columnnames;
    this._rowsize = rowsize;
    this._columnsize = colsize;
}

Cluster.prototype = new GaggleData();

Cluster.prototype.constructor = Cluster;

Cluster.prototype.parseJSON = function(jsonObj) {
    if (jsonObj != null) {
        this._name = jsonObj["_name"];
        //alert(this._name);
        this._species = jsonObj["_species"];
        var sizestr = jsonObj["_size"];
        //alert(sizestr);
        var splitted = sizestr.split("x");
        this._rowsize = parseInt(splitted[0]);
        this._columnsize = parseInt(splitted[1]);
        this._size = this._rowsize;
        //alert(this._data);
        var dataobj = jsonObj["_data"];
        this._rownames = dataobj["rowNames"];
        this._data = this._rownames;
        //alert(this._rownames);
        this._columnnames = dataobj["columnNames"];
    }
}

Cluster.prototype.getDataAsNameList = function() {
    return this._rownames;
}

