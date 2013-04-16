function Data(attributes) {
  this.attributes = attributes || {};
  this.change = {}
}

Data.prototype.on = function(key, callback) {
  if(this.hasCallback(key, callback))
    return;
  var ref = this.change[key] || (this.change[key] = []);
  this.change[key].push(callback);
}

Data.prototype.hasCallback = function(key, callback) {
  return indexOf(this.change[key], callback) !== -1;
}

indexOf = function(array, value) {
  array || (array = [])
  if(array.indexOf)
    return array.indexOf(value);

  for(i in array || {}) {
    if(array[i] === value)
      return i;
  }
  return -1;
}

Data.prototype.off = function(key, callback) {
  var index = indexOf(this.change[key], callback);
  if(index !== -1)
    this.change[key].splice(index, 1);
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
  return this.attributes[key];
}

Data.prototype.alertCallbacks = function(key) {
  if(!this.change[key])
    return;

  var key, callbacks;
  for(i in this.change[key]) {
    this.change[key][i](this.get(key));
  }
}

function TreeNode(attributes) {
  Data.call(this, attributes);
  if (!this.attributes.children)
    this.attributes.children = [];
}
TreeNode.prototype = new Data();

TreeNode.prototype.length = function () {
  return this.attributes.children.length;
};

TreeNode.prototype.template = function() {
  return (
    '<span data-text="model.name"></span>' +
    '<ul data-show="model.length">' + 
      '<li data-each-child="model.children">' +
        '<div class="node" data-template="child:template"></div>' +
      '</li>' +
    '</ul>'
  );
};

window.Data = Data;
window.TreeNode = TreeNode;
