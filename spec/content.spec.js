/*global describe, it, expect, spyOn,
    fireEvent, prepareEvent, firePreparedEvent, afterEach, beforeEach,
    selectElementContents, setupTestHelpers, placeCursorInsideElement,
    isFirefox, isIE, Util, selectElementContentsAndFire */

describe('Content TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should removing paragraphs when a list is inserted inside of it', function () {
        this.el.innerHTML = '<p>lorem ipsum<ul><li>dolor</li></ul></p>';
        var editor = this.newMediumEditor('.editor', {
                buttons: ['orderedlist']
            }),
            target = editor.elements[0].querySelector('p'),
            range, sel;
        selectElementContentsAndFire(target);
        fireEvent(editor.toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]'), 'click');
        expect(this.el.innerHTML).toMatch(/^<ol><li>lorem ipsum(<br>)?<\/li><\/ol><ul><li>dolor<\/li><\/ul>?/);

        // for Chrome & Safari we manually moved the caret so let's check it
        if (!isFirefox() && !isIE()) {
            // ensure the cursor is positioned right after the text
            sel = document.getSelection();
            expect(sel.rangeCount).toBe(1);

            range = sel.getRangeAt(0);
            expect(range.endOffset).toBe('lorem ipsum'.length);
            expect(range.startOffset).toBe('lorem ipsum'.length);
        }
    });

    describe('when the tab key is pressed', function () {
        it('should indent when within an <li>', function () {
            this.el.innerHTML = '<ol><li>lorem</li><li>ipsum</li></ol>';
            var editor = this.newMediumEditor('.editor'),
                target = editor.elements[0].querySelector('ol').lastChild;
            spyOn(document, 'execCommand').and.callThrough();
            selectElementContents(target);
            fireEvent(target, 'keydown', {
                keyCode: Util.keyCode.TAB
            });
            expect(document.execCommand).toHaveBeenCalledWith('indent', false, null);
            // Firefox (annoyingly) throws a NS_ERROR_FAILURE when attempting to mimic this through a test case
            // I was unable to find a workaround, and this works fine in a browser
            // so let's just skip skip the innerHTML check in firefox
            if (!isFirefox()) {
                expect(this.el.innerHTML).toBe('<ol><li>lorem</li><ol><li>ipsum</li></ol></ol>');
            }
        });

        it('with shift key, should outdent when within an <li>', function () {
            this.el.innerHTML = '<ol><li>lorem</li><ol><li><span><span>ipsum</span></span></li></ol></ol>';
            var editor = this.newMediumEditor('.editor'),
                target = editor.elements[0].querySelector('ol').lastChild.firstChild.firstChild;
            spyOn(document, 'execCommand').and.callThrough();
            selectElementContents(target);
            fireEvent(target, 'keydown', {
                keyCode: Util.keyCode.TAB,
                shiftKey: true
            });
            expect(document.execCommand).toHaveBeenCalledWith('outdent', false, null);
            // Firefox (annoyingly) throws a NS_ERROR_FAILURE when attempting to mimic this through a test case
            // I was unable to find a workaround, and this works fine in a browser
            // so let's just skip skip the innerHTML check in firefox
            if (!isFirefox()) {
                // Webkit removes the nested spans, IE does not
                expect(this.el.innerHTML).toMatch(/<ol><li>lorem<\/li><li>(<span><span>)?ipsum(<br>|<\/span><\/span>)<\/li><\/ol>/);
            }
        });
    });

    describe('when the enter key is pressed', function () {
        it('should prevent new lines from being inserted when disableReturn options is true', function () {
            this.el.innerHTML = 'lorem ipsum';

            var editor = this.newMediumEditor('.editor', { disableReturn: true }),
                evt;

            placeCursorInsideElement(editor.elements[0], 0);

            evt = prepareEvent(editor.elements[0], 'keydown', {
                keyCode: Util.keyCode.ENTER
            });

            spyOn(evt, 'preventDefault').and.callThrough();

            firePreparedEvent(evt, editor.elements[0], 'keydown');

            expect(evt.preventDefault).toHaveBeenCalled();
        });

        it('should prevent new lines from being inserted when data-disable-return is defined', function () {
            this.el.innerHTML = 'lorem ipsum';
            this.el.setAttribute('data-disable-return', true);

            var editor = this.newMediumEditor('.editor'),
                evt;

            placeCursorInsideElement(editor.elements[0], 0);

            evt = prepareEvent(editor.elements[0], 'keydown', {
                keyCode: Util.keyCode.ENTER
            });

            spyOn(evt, 'preventDefault').and.callThrough();

            firePreparedEvent(evt, editor.elements[0], 'keydown');

            expect(evt.preventDefault).toHaveBeenCalled();
        });

        it('should prevent consecutive new lines from being inserted when disableDoubleReturn is true', function () {
            this.el.innerHTML = '<p><br></p>';
            var editor = this.newMediumEditor('.editor', { disableDoubleReturn: true }),
                p = editor.elements[0].querySelector('p'),
                evt;

            placeCursorInsideElement(p, 0);

            evt = prepareEvent(p, 'keydown', {
                keyCode: Util.keyCode.ENTER
            });

            spyOn(evt, 'preventDefault').and.callThrough();

            firePreparedEvent(evt, p, 'keydown');

            expect(evt.preventDefault).toHaveBeenCalled();
        });

        it('should prevent consecutive new lines from being inserted when data-disable-double-return is defined', function () {
            this.el.innerHTML = '<p><br></p>';
            this.el.setAttribute('data-disable-double-return', true);

            var editor = this.newMediumEditor('.editor'),
                p = editor.elements[0].querySelector('p'),
                evt;

            placeCursorInsideElement(p, 0);

            evt = prepareEvent(p, 'keydown', {
                keyCode: Util.keyCode.ENTER
            });

            spyOn(evt, 'preventDefault').and.callThrough();

            firePreparedEvent(evt, p, 'keydown');

            expect(evt.preventDefault).toHaveBeenCalled();
        });

        it('should prevent consecutive new lines from being inserted inside a sentence when disableDoubleReturn is true', function () {
            this.el.innerHTML = '<p>hello</p><p><br></p><p>word</p>';
            var editor = this.newMediumEditor('.editor', { disableDoubleReturn: true }),
                p = editor.elements[0].getElementsByTagName('p')[2],
                evt;

            placeCursorInsideElement(p, 0);

            evt = prepareEvent(p, 'keydown', {
                keyCode: Util.keyCode.ENTER
            });

            spyOn(evt, 'preventDefault').and.callThrough();

            firePreparedEvent(evt, p, 'keydown');

            expect(evt.preventDefault).toHaveBeenCalled();
        });

        it('should call formatBlock when inside a non-header and non-anchor', function () {
            this.el.innerHTML = '<p>lorem ipsum</p>';
            var editor = this.newMediumEditor('.editor'),
                targetNode = editor.elements[0].querySelector('p');
            spyOn(document, 'execCommand').and.callThrough();
            placeCursorInsideElement(targetNode, 0);
            fireEvent(targetNode, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'p');
            expect(this.el.innerHTML).toBe('<p>lorem ipsum</p>');
        });

        it('with ctrl key, should not call formatBlock', function () {
            this.el.innerHTML = '<p>lorem ipsum</p>';

            var editor = this.newMediumEditor('.editor'),
                p = editor.elements[0].querySelector('p');

            spyOn(document, 'execCommand').and.callThrough();

            placeCursorInsideElement(p, 0);

            fireEvent(p, 'keyup', {
                keyCode: Util.keyCode.ENTER,
                ctrlKey: true
            });

            expect(document.execCommand).not.toHaveBeenCalledWith('formatBlock', false, 'p');
        });
    });

    describe('should unlink anchors', function () {
        it('when the user presses enter inside an anchor', function () {
            this.el.innerHTML = '<a href="#">test</a>';
            var editor = this.newMediumEditor('.editor'),
                target = editor.elements[0].querySelector('a');
            spyOn(document, 'execCommand').and.callThrough();
            placeCursorInsideElement(target, 1);
            fireEvent(target, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(document.execCommand).toHaveBeenCalledWith('unlink', false, null);
        });
    });

    describe('with header tags', function () {
        it('should insert a breaking paragraph before header when hitting enter key at front of header', function () {
            this.el.innerHTML = '<h2>lorem</h2><h3>ipsum</h3>';
            var editor = this.newMediumEditor('.editor'),
                targetNode = editor.elements[0].querySelector('h3');
            placeCursorInsideElement(targetNode, 0);
            fireEvent(targetNode, 'keydown', {
                keyCode: Util.keyCode.ENTER
            });
            expect(this.el.innerHTML).toBe('<h2>lorem</h2><p><br></p><h3>ipsum</h3>');
        });

        it('should remove empty element if hitting delete key inside empty element before a header tag', function () {
            this.el.innerHTML = '<h2>lorem</h2><p><br></p><h3>ipsum</h3>';
            var editor = this.newMediumEditor('.editor'),
                targetNode = editor.elements[0].querySelector('p');
            selectElementContents(targetNode);
            fireEvent(targetNode, 'keydown', {
                keyCode: Util.keyCode.DELETE
            });
            expect(this.el.innerHTML).toBe('<h2>lorem</h2><h3>ipsum</h3>');
        });

        it('should not create a <p> tag when hitting enter', function () {
            this.el.innerHTML = '<h2>lorem ipsum</h2>';
            var editor = this.newMediumEditor('.editor'),
                targetNode = editor.elements[0].querySelector('h2');
            spyOn(document, 'execCommand').and.callThrough();
            placeCursorInsideElement(targetNode, 0);
            fireEvent(targetNode, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(document.execCommand).not.toHaveBeenCalledWith('formatBlock', false, 'p');
            expect(this.el.innerHTML).toBe('<h2>lorem ipsum</h2>');
        });
    });

    it('should insert a space when hitting tab key within a pre node', function () {
        this.el.innerHTML = '<pre>lorem ipsum</pre>';
        var editor = this.newMediumEditor('.editor'),
            targetNode = editor.elements[0].querySelector('pre');
        placeCursorInsideElement(targetNode, 0);
        fireEvent(targetNode, 'keydown', {
            keyCode: Util.keyCode.TAB
        });
        expect(this.el.innerHTML).toBe('<pre>    lorem ipsum</pre>');
    });

    it('should call formatBlock when a keyup results in an empty element', function () {
        this.el.innerHTML = ' ';
        var editor = this.newMediumEditor('.editor'),
            target = editor.elements[0].firstChild;
        spyOn(document, 'execCommand').and.callThrough();
        selectElementContents(target);
        target.parentNode.removeChild(target);
        fireEvent(editor.elements[0], 'keyup', {
            keyCode: Util.keyCode.BACKSPACE
        });
        expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'p');
        // Webkit inserts a <p> tag, firefox & ie do not
        expect(this.el.innerHTML).toMatch(/(<p><br><\/p>)?/);
    });

    describe('when deleting and empty first list item via backspace', function () {
        it('should insert a paragraph before the list if it is the first element in the editor', function () {
            this.el.innerHTML = '<ul><li></li><li>lorem ipsum</li></ul>';
            var editor = this.newMediumEditor('.editor'),
                target = editor.elements[0].querySelector('li'),
                range;
            placeCursorInsideElement(target, 0);
            fireEvent(target, 'keydown', {
                keyCode: Util.keyCode.BACKSPACE
            });
            expect(this.el.innerHTML).toBe('<p><br></p><ul><li>lorem ipsum</li></ul>');
            range = document.getSelection().getRangeAt(0);
            expect(range.commonAncestorContainer.tagName.toLowerCase()).toBe('p');
        });

        it('should not insert a paragraph before the list if it is NOT the first element in the editor', function () {
            this.el.innerHTML = '<p>lorem ipsum</p><ul><li></li><li>lorem ipsum</li></ul>';
            var editor = this.newMediumEditor('.editor'),
                target = editor.elements[0].querySelector('li');
            placeCursorInsideElement(target, 0);
            fireEvent(target, 'keydown', {
                keyCode: Util.keyCode.BACKSPACE
            });
            expect(this.el.innerHTML).toBe('<p>lorem ipsum</p><ul><li></li><li>lorem ipsum</li></ul>');
        });
    });

    describe('spellcheck', function () {
        it('should have spellcheck attribute set to true by default', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements[0].getAttribute('spellcheck')).toBe('true');
        });

        it('should accept spellcheck as an options', function () {
            var editor = this.newMediumEditor('.editor', { spellcheck: false });
            expect(editor.elements[0].getAttribute('spellcheck')).toBe('false');
        });
    });
});
