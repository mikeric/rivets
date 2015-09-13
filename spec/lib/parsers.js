(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.parsers = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.parseType = parseType;
  exports.parseTemplate = parseTemplate;
  var PRIMITIVE = 0;
  var KEYPATH = 1;
  var TEXT = 0;
  var BINDING = 1;

  // Parser and tokenizer for getting the type and value from a string.

  function parseType(string) {
    var type = PRIMITIVE;
    var value = string;

    if (/^'.*'$|^".*"$/.test(string)) {
      value = string.slice(1, -1);
    } else if (string === 'true') {
      value = true;
    } else if (string === 'false') {
      value = false;
    } else if (string === 'null') {
      value = null;
    } else if (string === 'undefined') {
      value = undefined;
    } else if (isNaN(Number(string)) === false) {
      value = Number(string);
    } else {
      type = KEYPATH;
    }

    return { type: type, value: value };
  }

  // Template parser and tokenizer for mustache-style text content bindings.
  // Parses the template and returns a set of tokens, separating static portions
  // of text from binding declarations.

  function parseTemplate(template, delimiters) {
    var tokens = [];
    var length = template.length;
    var index = 0;
    var lastIndex = 0;

    while (lastIndex < length) {
      index = template.indexOf(delimiters[0], lastIndex);

      if (index < 0) {
        tokens.push({
          type: TEXT,
          value: template.slice(lastIndex)
        });

        break;
      } else {
        if (index > 0 && lastIndex < index) {
          tokens.push({
            type: TEXT,
            value: template.slice(lastIndex, index)
          });
        }

        lastIndex = index + delimiters[0].length;
        index = template.indexOf(delimiters[1], lastIndex);

        if (index < 0) {
          var substring = template.slice(lastIndex - delimiters[1].length);
          lastToken = tokens[tokens.length - 1];

          if (lastToken && lastToken.type === TEXT) {
            lastToken.value += substring;
          } else {
            tokens.push({
              type: TEXT,
              value: substring
            });
          }

          break;
        }

        var value = template.slice(lastIndex, index).trim();

        tokens.push({
          type: BINDING,
          value: value
        });

        lastIndex = index + delimiters[1].length;
      }
    }

    return tokens;
  }
});
