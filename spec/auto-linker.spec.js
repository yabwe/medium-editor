/*global MediumEditor, describe, it, expect, tearDown,
  beforeEach, afterEach, AutoLinkerStatics */

describe('Autolink', function () {
    'use strict';

    describe('utility methods', function () {
        var root,
            complexify = AutoLinkerStatics.complexify,
            simplify = AutoLinkerStatics.simplify;

        beforeEach(function () {
            root = document.createElement('div');
        });

        describe('complexify', function () {
            it('should turn one span to two', function () {
                root.innerHTML = '<span class="a">Hello world</span>';
                root.childNodes[0].childNodes[0].splitText('Hello '.length);
                complexify(root, root.childNodes[0].childNodes);

                expect(root.childNodes.length).toBe(2);
                expect(root.childNodes[0].className).toBe('a');
                expect(root.childNodes[0].textContent).toBe('Hello ');
                expect(root.childNodes[1].className).toBe('a');
                expect(root.childNodes[1].textContent).toBe('world');
            });

            it('should ignore elements outside the lineage of the descendants', function () {
                root.innerHTML = '<span class="ignoreMe">Foo</span> ' +
                        '<span class="a">Hello world</span>' +
                        ' <span class="ignoreMe2">Bar</span>';
                root.querySelector('.a').childNodes[0].splitText('Hello '.length);
                complexify(root, root.querySelector('.a').childNodes);

                expect(root.childNodes.length).toBe(6);
                var linkSpans = root.querySelectorAll('span.a');
                expect(linkSpans.length).toBe(2);
                expect(linkSpans[0].textContent).toBe('Hello ');
                expect(linkSpans[1].textContent).toBe('world');
            });

            it('should leave intact text that we don\'t care about', function () {
                root.innerHTML = '<span class="a"><b>Here is the link: http://www.</b>exa</span>mple.com ';
                var newNode = root.querySelector('b').firstChild.splitText('Here is the link: '.length);
                complexify(root, [newNode, root.querySelector('span').lastChild, root.lastChild]);

                expect(root.innerHTML).toBe('<span class="a"><b>Here is the link: </b></span>' +
                    '<span class="a"><b>http://www.</b></span><span class="a">exa</span>mple.com ');
            });

            it('should break down bold sections while retaining text order', function () {
                root.innerHTML = '<b>Here is the link: http://www.</b>exampl<b>e</b>.com ';
                var newNode = root.querySelector('b').firstChild.splitText('Here is the link: '.length);
                complexify(root, [newNode, root.childNodes[1], root.childNodes[2].childNodes[0], root.lastChild]);
                expect(root.innerHTML).toBe('<b>Here is the link: </b><b>http://www.</b>exampl<b>e</b>.com ');
            });
        });

        describe('simplify', function () {
            it('should turn two spans to one', function () {
                root.innerHTML = '<span class="a">Hello </span><span class="a">world</span>';
                var textNodes = [root.firstChild.firstChild, root.childNodes[1].firstChild];
                simplify(root, textNodes);
                expect(root.childNodes.length).toBe(1);
                expect(root.childNodes[0].className).toBe('a');
                expect(root.childNodes[0].textContent).toBe('Hello world');
            });

            it('should ignore elements outside the lineage of the descendants', function () {
                var initialHTML = '<span class="ignoreMe"><span class="match">F</span><span class="match">oo</span></span> ' +
                        '<span class="a">Hello </span><span class="a">world</span>' +
                        ' <span class="ignoreMe2">B</span><span class="ignoreMe2">ar</span>';
                root.innerHTML = initialHTML;
                var spanAs = root.querySelectorAll('span.a'),
                    textNodes = [spanAs[0].firstChild, spanAs[1].firstChild];
                simplify(root, textNodes);
                expect(root.textContent).toBe('Foo Hello world Bar');
                expect(root.innerHTML).toBe(initialHTML.replace('</span><span class="a">', ''));
            });
        });
    });

    describe('integration', function () {
        beforeEach(function () {
            this.el = document.createElement('div');
            this.el.className = 'editor';
            this.el.id = 'auto-link-editor';
            this.el.innerHTML = '';
            document.body.appendChild(this.el);
        });

        afterEach(function () {
            tearDown(this.el);
        });

        describe('auto-linking typed-in text', function () {

            beforeEach(function () {
                this.editor = new MediumEditor('.editor', {
                    enableAutoLinker: true
                });
            });

            var links = [
                'http://www.royal.gov.uk',
                'http://mountaindew.com',
                'http://coca-cola.com',
                'http://example.com',
                'http://www.example.com',
                'http://www.example.com/foo/bar',
                'http://www.example.com?foo=bar',
                'http://www.example.com/baz?foo=bar',
                'http://www.example.com/baz?foo=bar#buzz',
                'http://www.example.com/#buzz'
            ];

            function triggerAutolinking(editor, contenteditable) {
                // Same code as in the setTimeout that AutoLinker sets.
                editor.saveSelection();
                editor.commands[editor.commands.length - 1].performLinking(contenteditable);
                editor.restoreSelection();
            }

            function generateLinkTest(link, href) {
                return function () {
                    var selection = window.getSelection(),
                        newRange = document.createRange();
                    this.el.innerHTML = '<p>' + link + ' </p>';
                    selection.removeAllRanges();
                    newRange.setStart(this.el.firstChild.childNodes[0], link.length + 1);
                    newRange.setEnd(this.el.firstChild.childNodes[0], link.length + 1);
                    selection.addRange(newRange);

                    triggerAutolinking(this.editor, this.el);

                    var anchors = this.el.getElementsByTagName('a');
                    expect(anchors.length).toBe(1);
                    expect('href: ' + anchors[0].getAttribute('href')).toBe('href: ' + href);
                    expect('Text content: ' + anchors[0].textContent).toBe('Text content: ' + link);
                };
            }

            links.forEach(function (link) {
                it('should auto-link "' + link + '" when typed in',
                    generateLinkTest(link, link));

                it('should auto-link "' + link.toUpperCase() + '" when typed in',
                    generateLinkTest(link.toUpperCase(), link.toUpperCase()));

                var noProtocolLink = link.slice('http://'.length);
                it('should auto-link "' + noProtocolLink + '" when typed in',
                    generateLinkTest(noProtocolLink, link));
            });

            it('should auto-link text that is partially styled and preserve the SPAN and B tags', function () {
                var selection = window.getSelection(),
                    newRange = document.createRange();
                this.el.innerHTML = '<p><span class="a"><b>Here is the link: http://www.</b>exa</span>mple.com </p>';
                selection.removeAllRanges();
                newRange.setStart(this.el.firstChild.lastChild, this.el.firstChild.lastChild.nodeValue.length);
                newRange.setEnd(this.el.firstChild.lastChild, this.el.firstChild.lastChild.nodeValue.length);
                selection.addRange(newRange);

                triggerAutolinking(this.editor, this.el);

                expect(this.el.innerHTML).toBe('<p><span class="a"><b>Here is the link: </b></span>' +
                    '<a href="http://www.example.com"><span class="a"><b>http://www.</b>exa</span>mple.com</a> </p>');
            });

            it('should auto-link text that is partially styled with a profusion of mixed bold sections', function () {
                var selection = window.getSelection(),
                    newRange = document.createRange();
                this.el.innerHTML = '<p><b>Here is the link: http://www.</b>exampl<b>e</b>.com </p>';
                selection.removeAllRanges();
                newRange.setStart(this.el.firstChild.lastChild, this.el.firstChild.lastChild.nodeValue.length);
                newRange.setEnd(this.el.firstChild.lastChild, this.el.firstChild.lastChild.nodeValue.length);
                selection.addRange(newRange);

                triggerAutolinking(this.editor, this.el);

                expect(this.el.innerHTML).toBe('<p><b>Here is the link: </b>' +
                    '<a href="http://www.example.com"><b>http://www.</b>exampl<b>e</b>.com</a> </p>');
            });
        });
    });

});
