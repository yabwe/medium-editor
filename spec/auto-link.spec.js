/*global describe, it, expect, beforeEach, afterEach,
    setupTestHelpers, selectElementContentsAndFire, fireEvent,
    Util, jasmine, spyOn, MediumEditor */

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

            it('should auto-link text on its own', function () {
                this.el.innerHTML = 'http://www.example.com';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                expect(this.el.innerHTML).toBe('<a href="http://www.example.com">http://www.example.com</a>');
            });

            it('should auto-link link within basic text', function () {
                this.el.innerHTML = 'Text with http://www.example.com inside!';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                expect(this.el.innerHTML).toBe('Text with <a href="http://www.example.com">http://www.example.com</a> inside!');
            });

            it('should auto-link basic text within a parent element', function () {
                this.el.innerHTML = '<span>Text with http://www.example.com inside!</span>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                expect(this.el.innerHTML).toBe('<span>Text with <a href="http://www.example.com">http://www.example.com</a> inside!</span>');
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

            it('should not auto-link text inside links', function () {
                this.el.innerHTML = 'Click this http://www.example.com link';

                selectElementContentsAndFire(this.el.firstChild);

                triggerAutolinking(this.el);
                expect(this.el.innerHTML).toBe('Click this <a href="http://www.example.com">http://www.example.com</a> link');

                triggerAutolinking(this.el);
                expect(this.el.innerHTML).toBe('Click this <a href="http://www.example.com">http://www.example.com</a> link');
            });

            it('should stop attempting to auto-link on keypress if an error is encountered', function () {
                var spy = spyOn(MediumEditor.extensions.autoLink.prototype, 'performLinking').and.throwError('DOM ERROR');

                this.el.innerHTML = '<span><a href="http://www.google.com>http://www.google.com</a></span>';

                // This will cause an error
                triggerAutolinking(this.el);
                expect(spy.calls.count()).toBe(1);

                // The previous error should prevent performLiking from being called again
                triggerAutolinking(this.el);
                expect(spy.calls.count()).toBe(1);
            });
        });
    });

});
