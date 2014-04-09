function Namelist(name, size, species, data) {
    // call the parent constructor
    GaggleData.call(this, name, "NameList", size, species, data);
}

Namelist.prototype = new GaggleData();

Namelist.prototype.constructor = Namelist;

Namelist.prototype.parseJSON = function(jsonObj) {
    if (jsonObj != null) {
        this._name = jsonObj["_name"];
        this._species = jsonObj["_species"];
        this._size = parseInt(jsonObj["_size"]);
        this._data = (jsonObj["_data"] != null) ? jsonObj["_data"] : jsonObj["gaggle-data"];
    }
}