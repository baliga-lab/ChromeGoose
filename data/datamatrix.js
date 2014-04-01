function DataMatrix(name, species, data, rowsize, colsize, rowtitles, columntitles, rowtitlestitle) {
    // call the parent constructor
    GaggleData.call(this, name, "DataMatrix", rowsize, species, data);
    this._rowtitles = rowtitles;
    this._columntitles = columntitles;
    this._rowtitlestitle = rowtitlestitle;
    this._rowsize = rowsize;
    this._columnsize = colsize;
}

DataMatrix.prototype = new GaggleData();

DataMatrix.prototype.constructor = DataMatrix;

DataMatrix.prototype.parseJSON = function(jsonObj) {
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
        var dataobj = jsonObj["_data"];
        this._data = dataobj["data"];
        //alert(this._data);
        this._rowtitles = dataobj["rowTitles"];
        //alert(this._rowtitles);
        this._columntitles = dataobj["columnTitles"];
        this._rowTitlesTitle = dataobj["rowtitlesTitle"];
    }
}

DataMatrix.prototype.getDataAsNameList = function() {
    return this._rowtitles;
}

