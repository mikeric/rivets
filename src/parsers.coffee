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
    tokens = []
    length = template.length
    index = 0
    lastIndex = 0

    while lastIndex < length
      index = template.indexOf delimiters[0], lastIndex

      if index < 0
        tokens.push type: @types.text, value: template.slice lastIndex
        break
      else
        if index > 0 and lastIndex < index
          tokens.push type: @types.text, value: template.slice lastIndex, index

        lastIndex = index + delimiters[0].length
        index = template.indexOf delimiters[1], lastIndex

        if index < 0
          substring = template.slice lastIndex - delimiters[1].length
          lastToken = tokens[tokens.length - 1]

          if lastToken?.type is @types.text
            lastToken.value += substring
          else
            tokens.push type: @types.text, value: substring

          break

        value = template.slice(lastIndex, index).trim()
        tokens.push type: @types.binding, value: value
        lastIndex = index + delimiters[1].length

    tokens
