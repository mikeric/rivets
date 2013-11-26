# Rivets.KeypathParser
# --------------------

# Parser and tokenizer for keypaths in binding declarations.
class Rivets.KeypathParser
  # Parses the keypath and returns a set of adapter interface + path tokens.
  @parse: (keypath, interfaces, root) ->
    tokens = []
    current = {interface: root, path: ''}

    for char in keypath
      if char in interfaces
        tokens.push current
        current = {interface: char, path: ''}
      else
        current.path += char

    tokens.push current
    tokens

# Rivets.TextTemplateParser
# -------------------------

# Rivets.js text template parser and tokenizer for mustache-style text content
# binding declarations.
class Rivets.TextTemplateParser
  @types:
    text: 0
    binding: 1

  # Parses the template and returns a set of tokens, separating static portions
  # of text from binding declarations.
  @parse: (template, delimiters) ->
    regEx  = new RegExp  delimiters [ 0 ] + '(.*?)' + delimiters [1], 'ig'
    tokens    = []
    while true
      match = regEx.exec template
      if match?
        lastPos = lastMatch? ? lastMatch.index + lastMatch [0].length : 0
        tokens.push type: @types.text, value:  template.slice lastPos match.index
        tokens.push type: @types.binding, value: match[1]
      else
       tokens.push type: @types.text, value: text.slice lastMatch.index + lastMatch[0].length
    lastMatch = match;

    tokens
