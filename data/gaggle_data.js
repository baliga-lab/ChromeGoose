function GaggleData(name, dataType, size, species, data) {
    //alert("Gaggle Data " + name);
	this._name = name;
	this._type = dataType;
	this._size = size;
	this._species = species;
	this._data = data;
}

GaggleData.prototype.getName = function() {
	return this._name;
}

/**
 * types are: NameList, Map, Network, DataMatrix, Cluster
 * TODO: support Tuple
 */
GaggleData.prototype.getType = function() {
	return this._type;
}

GaggleData.prototype.getSize = function() {
	return this._size;
}

/*
 * Be careful not to call getData() from within getSpecies().
 */
GaggleData.prototype.getSpecies = function() {
	return this._applyDefaultSpecies(this._species);
}

gaggleData.prototype.getDescription = function() {
	return this.getName() + ": " + this.getType() + this._sizeString();
}

GaggleData.prototype._sizeString = function() {
	if (this.getSize())
		return "(" + this.getSize() + ")";
	else
		return "";
}

GaggleData.prototype.getData = function() {
    dump("Gaggle prototype getData...\n");
	return this._data;
}


GaggleData.prototype.toString = function() {
	return this.getDescription();
}

