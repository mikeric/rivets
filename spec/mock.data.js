function Data(attributes) {
  this.attributes = attributes || {};
  this.change = {}
}

Data.prototype.on = function(key, callback) {
  this.change[key][callback] = true;
}

Data.prototype.off = function(key, callback) {
  delete this.change[key][callback];
}

Data.prototype.set = function(attributes) {
  var old, key;

  for(key in attributes) {
    old = this.attributes[key];
    this.attributes[key] = attributes[key];
    if(this.get(key) !== old)
      this.alertCallbacks(key);
  }
}

Data.prototype.get = function(key) {
  this.attributes[key];
}

Data.prototype.alertCallbacks = function(key) {
  if(!this.change[key])
    return;

  for(callback in this.change[key])
    callback(this.get(key));
}

window.Data = Data;
