rivets.configure({
  adapter: {
    subscribe: function(obj, keypath, callback) {
      obj.on(keypath, callback);
    },
    read: function(obj, keypath) {
      obj.get(keypath);
    },
    publish: function(obj, keypath, value) {
      attributes = {};
      attributes[keypath] = value;
      obj.set(attributes);
   }
  }
});


describe('Rivets: ', function() {
  var data;

  beforeEach(function() {
    data = new Data();
  });

  describe('Stuff', function() {
    it('should work', function() {
      expect(data.get('foo')).toBe(undefined);
      expect(data.get('bar')).toBe('not undefined');
    });
  });
});
