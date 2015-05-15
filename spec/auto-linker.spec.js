/*global describe, it, expect, beforeEach, afterEach,
    setupTestHelpers, selectElementContentsAndFire, fireEvent,
    Util, jasmine */

describe('Autolink', function () {
    'use strict';

    describe('integration', function () {

        beforeEach(function () {
            setupTestHelpers.call(this);
            this.el = this.createElement('div', 'editor', '');
        });

        afterEach(function () {
            this.cleanupTest();
        });

        describe('auto-linking typed-in text', function () {

            beforeEach(function () {
                this.editor = this.newMediumEditor('.editor', {
                    autoLink: true
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

            function triggerAutolinking(element) {
                fireEvent(element, 'keypress', {
                    keyCode: Util.keyCode.SPACE
                });
                jasmine.clock().tick(1);
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

                    triggerAutolinking(this.el);

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

                triggerAutolinking(this.el);

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

                triggerAutolinking(this.el);

                expect(this.el.innerHTML).toBe('<p><b>Here is the link: </b>' +
                    '<a href="http://www.example.com"><b>http://www.</b>exampl<b>e</b>.com</a> </p>');
            });

            it('should auto-link text in a really hideous example', function () {
                this.el.innerHTML = '' +
                '<span>' +
                    '<b>Link: http</b>' +
                    '<i>://</i>' +
                '</span>' +
                '<span>' +
                    '<b>www</b>' +
                    '<u>.google.com</u>' +
                '</span>' +
                '<span>' +
                    '<b>/wow </b>' +
                    '<i>impressive</i>' +
                '</span>';

                selectElementContentsAndFire(this.el.firstChild);

                triggerAutolinking(this.el);

                var expectedOutput = '' +
                '<span>' +
                    '<b>Link: </b>' +
                '</span>' +
                '<a href="http://www.google.com/wow">' +
                    '<span>' +
                        '<b>http</b>' +
                        '<i>://</i>' +
                    '</span>' +
                    '<span>' +
                        '<b>www</b>' +
                        '<u>.google.com</u>' +
                    '</span>' +
                    '<span>' +
                        '<b>/wow</b>' +
                    '</span>' +
                '</a>' +
                '<span>' +
                    '<b> </b>' +
                    '<i>impressive</i>' +
                '</span>';

                expect(this.el.innerHTML).toBe(expectedOutput);
            });
        });
    });

});
