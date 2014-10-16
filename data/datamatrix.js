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
        console.log("Parsing DataMatrix json obj...");
        if (jsonObj["gaggle-data"] != null) {
            var metadata = jsonObj["metadata"];
            this._species = "";
            this._name = "";
            this._rowtitles = [];
            this._columntitles = [];
            if (metadata != null) {
               this._species = metadata["species"];
               this._name = metadata["name"];
            }

            var data = jsonObj["gaggle-data"];
            if (data != null) {
                this._data = [];
                this._rowtitles = data["row names"];
                console.log("Row titles: " + this._rowtitles);
                var columns = data["columns"];
                if (columns != null) {
                    for (var i = 0; i < columns.length; i++) {
                        var column = columns[i];
                        var colname = column["name"];
                        console.log("Column: " + colname);
                        this._columntitles.push(colname);
                        var colvalues = column["values"];
                        console.log("Column values " + colvalues);
                        if (colvalues.length > 0) {
                            if (this._data.length == 0) {
                                for (var j = 0; j < colvalues.length; j++) {
                                    console.log("New row for " + colvalues[j]);
                                    var row = [];
                                    row.push(colvalues[j]);
                                    this._data.push(row);
                                }
                            }
                            else {
                                for (var j = 0; j < colvalues.length; j++) {
                                    console.log("Inserting to row " + colvalues[j]);
                                    var row = this._data[j];
                                    row.push(colvalues[j]);
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            this._name = jsonObj["_name"];
            console.log(this._name);
            this._species = jsonObj["_species"];
            console.log(this._species);
            console.log("Row size: " + jsonObj['_rowsize']);
            if (jsonObj['_rowsize'] != null && jsonObj["_columnsize"] != null) {
                this._rowsize = parseInt(jsonObj['_rowsize']);
                this._columnsize = parseInt(jsonObj["_columnsize"]);
            }
            else {
                var sizestr = jsonObj["_size"];
                console.log(sizestr);
                var splitted = sizestr.split("x");
                this._rowsize = parseInt(splitted[0]);
                this._columnsize = parseInt(splitted[1]);
            }
            this._size = this._rowsize;
            var dataobj = jsonObj["_data"];
            if (dataobj["data"] != null)
                this._data = dataobj["data"];
            else
                this._data = dataobj;
            console.log(this._data);

            if (jsonObj["_rowtitles"] != null)
                this._rowtitles = jsonObj["_rowtitles"];
            else
                this._rowtitles = dataobj["rowTitles"];
            console.log(this._rowtitles);

            if (jsonObj["_columntitles"] != null)
                this._columntitles = jsonObj["_columntitles"];
            else
                this._columntitles = dataobj["columnTitles"];

            if (jsonObj["_rowTitlesTitle"] != null)
                this._rowTitlesTitle = jsonObj["_rowTitlesTitle"];
            else
                this._rowTitlesTitle = dataobj["rowTitlesTitle"];
        }
    }
}

DataMatrix.prototype.getRowTitles = function() {
    return this._rowtitles;
}

DataMatrix.prototype.getColumnTitles = function() {
    return this._columntitles;
}

DataMatrix.prototype.getDataAsNameList = function() {
    return this._rowtitles;
}

