describe("parseTemplate()", function() {
  it("tokenizes a text template", function() {
    template = "Hello {{ user.name }}, you have {{ user.messages.unread | length }} unread messages."

    expected = [
      {type: 0, value: "Hello "},
      {type: 1, value: "user.name"},
      {type: 0, value: ", you have "},
      {type: 1, value: "user.messages.unread | length"},
      {type: 0, value: " unread messages."}
    ]

    results = parsers.parseTemplate(template, ['{{', '}}'])
    results.length.should.equal(5)

    for (i = 0; i < results.length; i++) {
      results[i].type.should.equal(expected[i].type)
      results[i].value.should.equal(expected[i].value)
    }
  })

  describe("with no binding fragments", function() {
    it("should return a single text token", function() {
      template = "Hello World!"
      expected = [{type: 0, value: "Hello World!"}]

      results = parsers.parseTemplate(template, ['{{', '}}'])
      results.length.should.equal(1)

      for (i = 0; i < results.length; i++) {
        results[i].type.should.equal(expected[i].type)
        results[i].value.should.equal(expected[i].value)
      }
    })
  })

  describe("with only a binding fragment", function() {
    it("should return a single binding token", function() {
      template = "{{ user.name }}"
      expected = [{type: 1, value: "user.name"}]

      results = parsers.parseTemplate(template, ['{{', '}}'])
      results.length.should.equal(1)

      for (i = 0; i < results.length; i++) {
        results[i].type.should.equal(expected[i].type)
        results[i].value.should.equal(expected[i].value)
      }
    })
  })
})
