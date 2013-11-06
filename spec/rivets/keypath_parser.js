describe("Rivets.KeypathParser", function() {
    var Rivets = rivets._,
        interfaces = ['.', ':', ',', ';'],
        parse = Rivets.KeypathParser.parse;

    describe("parse()", function() {
        it("uses the root interface for the first path", function() {
            var path = keypath = "foo",
                root = ":",
                tokens = parse(keypath, interfaces, root);
            expect(tokens.length).toEqual(1);
            expect(tokens[0]).toEqual({interface: root, path: path});
        });

        it("supports single-char interfaces", function() {
            var keypath = "foo.bar:baz,wut",
                root = ".",
                tokens = parse(keypath, interfaces, root);
            expect(tokens.length).toEqual(4);
            expect(tokens[0]).toEqual({interface: root, path: "foo"});
            expect(tokens[1]).toEqual({interface: ".", path: "bar"});
            expect(tokens[2]).toEqual({interface: ":", path: "baz"});
            expect(tokens[3]).toEqual({interface: ",", path: "wut"});

            keypath = "0.1.2.3.4.5.6";
            tokens = parse(keypath, interfaces, root);
            for (var i = 0; i < tokens.length; i ++) {
                expect(tokens[i]).toEqual({interface: ".", path: i.toString()});
            }
        });

        it("supports paths wrapped in single-quotes", function() {
            var keypath = "foo.'bar:baz',wut",
                root = ".",
                tokens = parse(keypath, interfaces, root);
            expect(tokens.length).toEqual(3);
            expect(tokens[0]).toEqual({interface: root, path: "foo"});
            expect(tokens[1]).toEqual({interface: ".", path: "bar:baz"});
            expect(tokens[2]).toEqual({interface: ",", path: "wut"});

            keypath = "'0'.'1.0'.'2.1.0'.'3.2.1.0'";
            tokens = parse(keypath, interfaces, root);
            var path;
            for (var i = 0; i < tokens.length; i ++) {
                path = i.toString();
                for (var j = i - 1; j >= 0; j--) {
                    path += "." + j;
                }
                expect(tokens[i]).toEqual({interface: ".", path: path});
            }

            keypath = "'obj'";
            tokens = parse(keypath, interfaces, root);
            expect(tokens.length).toEqual(1);
            expect(tokens[0]).toEqual({interface: root, path: "obj"});
        });
    });
});
