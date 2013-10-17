var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Rivets.KeypathParser = (function() {
  function KeypathParser() {}

  KeypathParser.parse = function(keypath, interfaces, root) {
    var char, current, index, tokens;
    tokens = [];
    current = {
      "interface": root,
      path: ''
    };
    for (index in keypath) {
      char = keypath[index];
      if (__indexOf.call(interfaces, char) >= 0) {
        tokens.push(current);
        current = {
          "interface": char,
          path: ''
        };
      } else {
        current.path += char;
      }
    }
    tokens.push(current);
    return tokens;
  };

  return KeypathParser;

})();

Rivets.TextTemplateParser = (function() {
  function TextTemplateParser() {}

  TextTemplateParser.types = {
    text: 0,
    binding: 1
  };

  TextTemplateParser.parse = function(template, delimiters) {
    var index, lastIndex, lastToken, length, substring, tokens, value;
    tokens = [];
    length = template.length;
    index = 0;
    lastIndex = 0;
    while (lastIndex < length) {
      index = template.indexOf(delimiters[0], lastIndex);
      if (index < 0) {
        tokens.push({
          type: this.types.text,
          value: template.slice(lastIndex)
        });
        break;
      } else {
        if (index > 0 && lastIndex < index) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex, index)
          });
        }
        lastIndex = index + 2;
        index = template.indexOf(delimiters[1], lastIndex);
        if (index < 0) {
          substring = template.slice(lastIndex - 2);
          lastToken = tokens[tokens.length - 1];
          if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
            lastToken.value += substring;
          } else {
            tokens.push({
              type: this.types.text,
              value: substring
            });
          }
          break;
        }
        value = template.slice(lastIndex, index).trim();
        tokens.push({
          type: this.types.binding,
          value: value
        });
        lastIndex = index + 2;
      }
    }
    return tokens;
  };

  return TextTemplateParser;

})();
