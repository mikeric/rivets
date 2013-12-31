describe('Revival', function() {
  var data, bindData, el, ifEl, eachEl, ifText, eachText;

  beforeEach(function() {
    adapter = {
      subscribe: function(obj, keypath, callback) {
        obj.on(keypath, callback);
      },
      unsubscribe: function(obj, keypath, callback) {
        obj.off(keypath, callback);
      },
      read: function(obj, keypath) {
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        attributes = {};
        attributes[keypath] = value;
        obj.set(attributes);
      }
    };

    rivets.adapters[':'] = adapter;
    rivets.config.prefix = 'data';
    rivets.configure({preloadData: true});

    data = new Data({
      funny: true,
      sad: false,
      foo: 'bar',
      items: [{name: 'a'}, {name: 'b'}]
    });

    bindData = {data: data};

    el = document.createElement('div');
    ifEl = document.createElement('div');
    eachEl = document.createElement('div');
    ifText = document.createTextNode('one has {data:foo}!');
    ifEl.appendChild(ifText);
    el.appendChild(ifEl);
    el.appendChild(eachEl);
  });

  describe('If', function() {
    it('should revive from rendered', function() {

      ifEl.setAttribute('data-if', 'data:sad');
      rivets.bind(el, bindData);
      expect(el.getElementsByTagName('div').length).toBe(1);

      // clone the node to simulate unbound HTML from server
      var rendered = el.cloneNode(true);
      rivets.bind(rendered, bindData);

      data.set({'sad': true});
      expect(rendered.getElementsByTagName('div').length).toBe(2);
      data.set({'sad': false});
      expect(rendered.getElementsByTagName('div').length).toBe(1);
    });
  });

  describe('Iteration', function() {
    it('should revive from rendered', function() {

      eachText = document.createTextNode('an item { item.name }!');
      eachEl.appendChild(eachText);
      eachEl.setAttribute('data-each-item', 'data:items');

      rivets.bind([el], bindData);
      expect(el.getElementsByTagName('div').length).toBe(3);

      // clone the node to simulate unbound HTML from server
      var rendered = el.cloneNode(true);
      rivets.bind(rendered, bindData);
      expect(rendered.getElementsByTagName('div').length).toBe(3);

    });
  });

});
