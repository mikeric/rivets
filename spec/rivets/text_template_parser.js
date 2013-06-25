describe("Rivets.TextTemplateParser", function() {
  var Rivets = rivets._

  describe("parse()", function() {
    it("tokenizes a text template", function() {
      template = "Hello {{ user.name }}, you have {{ user.messages.unread | length }} unread messages."

      expected = [
        {type: 0, value: "Hello "},
        {type: 1, value: "user.name"},
        {type: 0, value: ", you have "},
        {type: 1, value: "user.messages.unread | length"},
        {type: 0, value: " unread messages."}
      ]

      results = Rivets.TextTemplateParser.parse(template, ['{{', '}}'])
      expect(results.length).toBe(5)

      for (i = 0; i < results.length; i++) {
        expect(results[i].type).toBe(expected[i].type)
        expect(results[i].value).toBe(expected[i].value)
      }
    })

    describe("with no binding fragments", function() {
      it("should return a single text token", function() {
        template = "Hello World!"
        expected = [{type: 0, value: "Hello World!"}]

        results = Rivets.TextTemplateParser.parse(template, ['{{', '}}'])
        expect(results.length).toBe(1)

        for (i = 0; i < results.length; i++) {
          expect(results[i].type).toBe(expected[i].type)
          expect(results[i].value).toBe(expected[i].value)
        }
      })
    })

    describe("with only a binding fragment", function() {
      it("should return a single binding token", function() {
        template = "{{ user.name }}"
        expected = [{type: 1, value: "user.name"}]

        results = Rivets.TextTemplateParser.parse(template, ['{{', '}}'])
        expect(results.length).toBe(1)

        for (i = 0; i < results.length; i++) {
          expect(results[i].type).toBe(expected[i].type)
          expect(results[i].value).toBe(expected[i].value)
        }
      })
    })
  })
})
