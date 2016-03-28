/*global fireEvent, selectElementContentsAndFire */

describe('Autolink', function () {
    'use strict';

    describe('extension', function () {

        beforeEach(function () {
            setupTestHelpers.call(this);
            this.el = this.createElement('div', 'editor', '');
        });

        afterEach(function () {
            this.cleanupTest();
        });

        it('should turn off browser auto-link during initialization', function () {
            var autoUrlDetectTurnedOn = true,
                origExecCommand = document.execCommand;
            spyOn(document, 'execCommand').and.callFake(function (command, showUi, val) {
                if (command === 'AutoUrlDetect') {
                    autoUrlDetectTurnedOn = val;
                }
                return origExecCommand.apply(document, arguments);
            });
            this.newMediumEditor('.editor', {
                autoLink: true
            });
            expect(autoUrlDetectTurnedOn).toBe(false);
        });

        it('should reset browser auto-link (if supported) during destroy', function () {
            var autoUrlDetectTurnedOn = true,
                origExecCommand = document.execCommand,
                origQCS = document.queryCommandSupported;
            spyOn(document, 'execCommand').and.callFake(function (command, showUi, val) {
                if (command === 'AutoUrlDetect') {
                    autoUrlDetectTurnedOn = val;
                }
                return origExecCommand.apply(document, arguments);
            });
            spyOn(document, 'queryCommandSupported').and.callFake(function (command) {
                if (command === 'AutoUrlDetect') {
                    return true;
                }
                return origQCS.apply(document, arguments);
            });

            var editor = this.newMediumEditor('.editor', {
                autoLink: true
            });

            expect(autoUrlDetectTurnedOn).toBe(false);
            editor.destroy();
            expect(autoUrlDetectTurnedOn).toBe(true);
        });

        it('should not reset multiple browser auto-links (if supported) during destroy', function () {
            var autoUrlDetectTurnedOn = true,
                origExecCommand = document.execCommand,
                origQCS = document.queryCommandSupported;
            this.el = this.createElement('div', 'editor2', '');
            spyOn(document, 'execCommand').and.callFake(function (command, showUi, val) {
                if (command === 'AutoUrlDetect') {
                    autoUrlDetectTurnedOn = val;
                }
                return origExecCommand.apply(document, arguments);
            });
            spyOn(document, 'queryCommandSupported').and.callFake(function (command) {
                if (command === 'AutoUrlDetect') {
                    return true;
                }
                return origQCS.apply(document, arguments);
            });

            var
                editor = this.newMediumEditor('.editor', {
                    autoLink: true
                }),
                editor2 = this.newMediumEditor('.editor2', {
                    autoLink: true
                });

            expect(autoUrlDetectTurnedOn).toBe(false);
            editor.destroy();
            expect(autoUrlDetectTurnedOn).toBe(false);
            editor2.destroy();
            expect(autoUrlDetectTurnedOn).toBe(true);
        });
    });

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
                'http://www.bbc.co.uk',
                'http://mountaindew.com',
                'http://coca-cola.com',
                'http://example.com',
                'http://wwww.example.com', // with more "w"s it's still a valid subdomain
                'http://www.example.com',
                'http://www.example.com/foo/bar',
                'http://www.example.com?foo=bar',
                'http://www.example.com/baz?foo=bar',
                'http://www.example.com/baz?foo=bar#buzz',
                'http://www.example.com/#buzz',
                'http://about.museum',
                'http://getty.art.museum/visit/center/art.html',
                'http://en.wikipedia.org/wiki/List_of_diplomatic_missions_of_China'
            ],
                notLinks = [
                'http:google.com',
                'http:/example.com',
                'app.can',
                'sadasda.sdfasf.sdfas',
                'www.example.combasic',
                // Our algorithm assumes that '.' is punctuation, not part of the URL.
                'en.wikipedia.org/wiki/Embassy_of_China_in_Washington,_D.C.'
            ];

            function triggerAutolinking(element, key) {
                var keyPressed = key || MediumEditor.util.keyCode.SPACE;
                fireEvent(element, 'keypress', {
                    keyCode: keyPressed
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
                    expect(anchors[0].firstChild.getAttribute('data-auto-link')).toBe('true');
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

            function generateNotLinkTest(link) {
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
                    expect(anchors.length).toBe(0, '# of anchors');
                };
            }

            notLinks.forEach(function (link) {
                it('should not auto-link "' + link + '" when typed in', generateNotLinkTest(link));
            });

            it('should auto-link text on its own', function () {
                this.el.innerHTML = 'http://www.example.com';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].textContent).toBe('http://www.example.com');
            });

            it('should auto-link text on all SPACE or ENTER', function () {
                var links;
                this.el.innerHTML = 'http://www.example.enter';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el, MediumEditor.util.keyCode.ENTER);
                links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1, 'links length after ENTER');
                expect(links[0].getAttribute('href')).toBe('http://www.example.enter');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].textContent).toBe('http://www.example.enter');

                this.el.innerHTML = 'http://www.example.space';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el, MediumEditor.util.keyCode.SPACE);
                links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1, 'links length after SPACE');
                expect(links[0].getAttribute('href')).toBe('http://www.example.space');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].textContent).toBe('http://www.example.space');
            });

            it('should auto-link text on blur', function () {
                var links;
                this.el.innerHTML = 'http://www.example.blur';

                selectElementContentsAndFire(this.el);

                fireEvent(this.el, 'blur');
                jasmine.clock().tick(1);

                links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.blur');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].textContent).toBe('http://www.example.blur');
            });

            it('should fire editableInput after autolinking', function () {
                var spy = jasmine.createSpy('handler');
                this.el.innerHTML = 'http://www.example.com';

                selectElementContentsAndFire(this.el);
                this.editor.subscribe('editableInput', spy);
                expect(spy).not.toHaveBeenCalled();

                fireEvent(this.el, 'blur');
                jasmine.clock().tick(1);

                expect(spy).toHaveBeenCalled();
            });

            it('should auto-link link within basic text', function () {
                this.el.innerHTML = 'Text with http://www.example.com inside!';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].getAttribute('href')).toBe(links[0].textContent);
                expect(this.el.childNodes[0].nodeValue).toBe('Text with ');
                expect(this.el.childNodes[this.el.childNodes.length - 1].nodeValue).toBe(' inside!');
            });

            it('should auto-link basic text within a parent element', function () {
                this.el.innerHTML = '<span>Text with http://www.example.com inside!</span>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(this.el.firstChild.nodeName.toLowerCase()).toBe('span');
                expect(this.el.firstChild.textContent).toBe('Text with http://www.example.com inside!');
                expect(this.el.firstChild.getElementsByTagName('a').length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].textContent).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
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

                expect(this.el.innerHTML.indexOf('<p><span class="a"><b>Here is the link: </b></span>')).toBe(0);

                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].firstChild.nodeName.toLowerCase()).toBe('span');
                expect(links[0].firstChild.innerHTML).toBe('<span class="a"><b>http://www.</b>exa</span>mple.com');
                expect(this.el.firstChild.lastChild.nodeValue).toBe(' ');
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

                expect(this.el.innerHTML.indexOf('<p><b>Here is the link: </b>')).toBe(0);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].firstChild.nodeName.toLowerCase()).toBe('span');
                expect(links[0].firstChild.innerHTML).toBe('<b>http://www.</b>exampl<b>e</b>.com');
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(this.el.firstChild.lastChild.nodeValue).toBe(' ');
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

                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
                expect(links[0].firstChild.getAttribute('data-href')).toBe('http://www.google.com/wow');
                links[0].firstChild.removeAttribute('data-href'); // to make the next innerHTML check work consistently

                var expectedOutput = '' +
                '<span>' +
                    '<b>Link: </b>' +
                '</span>' +
                '<a href="http://www.google.com/wow">' +
                    '<span data-auto-link="true">' +
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
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');

                triggerAutolinking(this.el);
                links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
            });

            it('should not auto-link text inside a span with data-auto-link=true', function () {
                this.el.innerHTML = 'Click this <span data-href="http://www.example.com" data-auto-link="true">' +
                    'http://www.example.com</span> link';

                selectElementContentsAndFire(this.el.firstChild);

                triggerAutolinking(this.el);
                expect(this.el.getElementsByTagName('a').length).toBe(0, 'should not create a link');
                expect(this.el.getElementsByTagName('span').length).toBe(1, 'span should remain in place');
            });

            it('should not auto-link text containing a span with data-auto-link=true', function () {
                this.el.innerHTML = 'Click this <span data-href="http://www.example.com" data-auto-link="true">' +
                    'www.example.com</span>foo/bar/baz link';

                selectElementContentsAndFire(this.el.firstChild);

                triggerAutolinking(this.el);
                expect(this.el.getElementsByTagName('a').length).toBe(0, 'should not create a link');
                expect(this.el.getElementsByTagName('span').length).toBe(1, 'span should remain in place');
            });

            it('should remove a span with data-auto-link=true when the text no longer matches the original link', function () {
                this.el.innerHTML = 'Click this <span data-auto-link="true" data-href="http://www.example.com">' +
                    'foo</span> link';

                triggerAutolinking(this.el);
                expect(this.el.getElementsByTagName('span').length).toBe(0, 'span should have been removed');
            });

            it('should create a link with data-auto-link=true when the text no longer matches the original link' +
                    ' and it has been unlinked', function () {
                this.el.innerHTML = 'Click this <span data-auto-link="true" data-href="http://www.example.com">' +
                    'www.example.co.uk</span> link';

                triggerAutolinking(this.el);
                expect(this.el.getElementsByTagName('a').length).toBe(1, 'link should have been added');
                expect(this.el.getElementsByTagName('a')[0].getAttribute('href')).toBe('http://www.example.co.uk',
                    'link should have been added');
            });

            it('should create a link with target="_blank" when respective option is set to true', function () {
                this.el = this.createElement('div', 'editor-blank', '');
                this.newMediumEditor('.editor-blank', {
                    autoLink: true,
                    targetBlank: true
                });

                this.el.innerHTML = 'http://www.example.com';
                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(1);
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].target).toBe('_blank');
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

            it('should create a link for a url within a list item', function () {
                this.el.innerHTML = '<p>This is my list of links:</p><ol><li>http://www.example.com</li></ol><p>It is very impressive</p>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a'),
                    li = this.el.querySelector('li');
                expect(links.length).toBe(1, 'A single link was not automatically created');
                expect(li.firstChild).toBe(links[0]);
                expect(li.textContent).toBe('http://www.example.com');
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(links[0].firstChild.getAttribute('data-auto-link')).toBe('true');
            });

            // https://github.com/yabwe/medium-editor/issues/790
            it('should not create a link when text in consecutive list items could be a valid url when combined', function () {
                this.el.innerHTML = '<ul><li>text ending in a period.</li><li>name - text starting with a TLD</li></ul>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(0, 'A link was created without a valid url being in the text');
                expect(this.el.innerHTML).toBe('<ul><li>text ending in a period.</li><li>name - text starting with a TLD</li></ul>',
                    'Content does not contain a valid url, but auto-link caused the content to change');
            });

            // https://github.com/yabwe/medium-editor/issues/790
            it('should not create a link which spans multiple list items', function () {
                this.el.innerHTML = '<blockquote><ol><li>abc</li><li>www.example.com</li></ol></blockquote>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a'),
                    lastLi = this.el.querySelector('ol').lastChild;
                expect(links.length).toBe(1, 'There should have been exactly 1 link created');
                expect(links[0].getAttribute('href')).toBe('http://www.example.com');
                expect(lastLi.firstChild).toBe(links[0]);
                expect(lastLi.textContent).toBe('www.example.com');
            });

            it('should not create a link which spans multiple list items', function () {
                this.el.innerHTML = '<blockquote><ol><li>www</li><li>.example.com</li></ol></blockquote>';

                selectElementContentsAndFire(this.el);
                triggerAutolinking(this.el);
                var links = this.el.getElementsByTagName('a');
                expect(links.length).toBe(0, 'There should not have been any links created');
            });
        });
    });

});
