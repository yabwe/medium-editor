/*global selectElementContents, placeCursorInsideElement, isSafari */

describe('MediumEditor.selection TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Exposure', function () {
        it('is exposed on the MediumEditor ctor', function () {
            expect(MediumEditor.selection).toBeTruthy();
        });
    });

    describe('exportSelection', function () {
        it('should not export a position indicating the cursor is before an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            placeCursorInsideElement(this.el.querySelector('span'), 1); // end of first span
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should export a position indicating the cursor is at the beginning of a paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><b>Whatever</b></p>';
            placeCursorInsideElement(this.el.querySelector('b'), 0); // beginning of <b> tag
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(0);
        });

        it('should not export a position indicating the cursor is after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p class="target">Whatever</p>';
            // After the 'W' in whatever
            placeCursorInsideElement(this.el.querySelector('p.target').firstChild, 1);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should not export a position indicating the cursor is after an empty paragraph (in a complicated markup case)',
                function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p>What<span class="target">ever</span></p>';
            // Before the 'e' in whatever
            placeCursorInsideElement(this.el.querySelector('span.target').firstChild, 0);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should not export a position indicating the cursor is after an empty paragraph ' +
                '(in a complicated markup with selection on the element)', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p>What<span class="target">ever</span></p>';
            // Before the 'e' in whatever
            placeCursorInsideElement(this.el.querySelector('span.target'), 0);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should export a position indicating the cursor is in an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            placeCursorInsideElement(this.el.getElementsByTagName('p')[1], 0);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(1);
        });

        it('should export a position indicating the cursor is after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            placeCursorInsideElement(this.el.getElementsByTagName('p')[2], 0);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(2);
        });

        it('should export a position indicating the cursor is after an empty block element', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            placeCursorInsideElement(this.el.querySelector('h2'), 0);
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.emptyBlocksIndex).toEqual(2);
        });

        it('should export a selection that specifies an image is the selection', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#"><img src="../demo/img/medium-editor.jpg" /></a> dolor</p>';
            selectElementContents(this.el.querySelector('a'));
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.trailingImageCount).toBe(1);
            expect(exportedSelection.start).toBe(12);
            expect(exportedSelection.end).toBe(12);
        });

        it('should export a selection that can be imported when the selection starts with an image', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#"><img src="../demo/img/medium-editor.jpg" />img</a> dolor</p>';
            selectElementContents(this.el.querySelector('a'));
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.trailingImageCount).toBe(undefined);
            expect(exportedSelection.start).toBe(12);
            expect(exportedSelection.end).toBe(15);

            selectElementContents(this.el);
            MediumEditor.selection.importSelection(exportedSelection, this.el, document);
            var range = window.getSelection().getRangeAt(0);
            expect(range.toString()).toBe('img');
            if (range.startContainer.nodeName.toLowerCase() === 'a') {
                expect(range.startContainer).toBe(this.el.querySelector('a'));
                expect(range.startOffset).toBe(0);
            } else {
                expect(range.startContainer.nextSibling).toBe(this.el.querySelector('a'));
                expect(range.startOffset).toBe(12);
            }
        });

        it('should export a selection that specifies an image is at the end of a selection', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#">img<b><img src="../demo/img/medium-editor.jpg" /><img src="../demo/img/roman.jpg" /></b></a> dolor</p>';
            selectElementContents(this.el.querySelector('a'));
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection.trailingImageCount).toBe(2);
            expect(exportedSelection.start).toBe(12);
            expect(exportedSelection.end).toBe(15);
        });
    });

    describe('importSelection', function () {
        it('should be able to import an exported selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';

            selectElementContents(this.el.querySelector('i'));
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(Object.keys(exportedSelection).sort()).toEqual(['end', 'start']);

            selectElementContents(this.el);
            expect(exportedSelection).not.toEqual(MediumEditor.selection.exportSelection(this.el, document));

            MediumEditor.selection.importSelection(exportedSelection, this.el, document);
            expect(exportedSelection).toEqual(MediumEditor.selection.exportSelection(this.el, document));
        });

        it('should be able to import an exported selection that contain nodeTypes > 3', function (done) {
            this.el.innerHTML = '<div><p>stuff here <!-- comment nodeType is 8 --> additional stuff here </p></div>';
            selectElementContents(this.el.querySelector('p'));
            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(Object.keys(exportedSelection).sort()).toEqual(['end', 'start']);

            selectElementContents(this.el);
            expect(exportedSelection).toEqual(MediumEditor.selection.exportSelection(this.el, document));

            MediumEditor.selection.importSelection(exportedSelection, this.el, document);
            expect(exportedSelection).toEqual(MediumEditor.selection.exportSelection(this.el, document));
            done();
        });

        it('should import an exported selection outside any anchor tag', function () {
            this.el.innerHTML = '<p id=1>Hello world: <a href="#">http://www.example.com</a></p><p id=2><br></p>';
            var link = this.el.getElementsByTagName('a')[0];

            placeCursorInsideElement(link.childNodes[0], link.childNodes[0].nodeValue.length);
            expect(MediumEditor.util.isDescendant(link, window.getSelection().getRangeAt(0).startContainer, true)).toBe(true);

            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            MediumEditor.selection.importSelection(exportedSelection, this.el, document, true);
            var range = window.getSelection().getRangeAt(0),
                node = range.startContainer;

            // For some reason, Safari mucks with the selection range and makes this case not hold
            // since we only really care about whether this works in IE, and it works as expected
            // in other browsers, just skip this assertion for Safari
            if (!isSafari()) {
                expect(MediumEditor.util.isDescendant(link, node, true)).toBe(false);
            }
            // Even though we set the range to use the P tag as the start container, Safari normalizes the range
            // down to the text node. Setting the range to use the P tag for the start is necessary to support
            // MSIE, where it removes the link when the cursor is placed at the end of the text node in the anchor.
            while (node.nodeName.toLowerCase() !== 'p') {
                node = node.parentNode;
            }
            expect(node.nodeName.toLowerCase()).toBe('p');
            expect(node.getAttribute('id')).toBe('1');
        });

        // https://github.com/yabwe/medium-editor/issues/738
        it('should import an exported non-collapsed selection after an empty paragraph', function () {
            this.el.innerHTML = '<p>This is <a href="#">a link</a></p><p><br/></p><p>not a link</p>';
            var lastTextNode = this.el.childNodes[2].firstChild;

            MediumEditor.selection.select(document, lastTextNode, 0, lastTextNode, 'not a link'.length);

            var exportedSelection = MediumEditor.selection.exportSelection(this.el, document);
            expect(exportedSelection).toEqual({ start: 14, end: 24, emptyBlocksIndex: 2 });
            MediumEditor.selection.importSelection(exportedSelection, this.el, document);

            var range = window.getSelection().getRangeAt(0);
            expect(range.startContainer === lastTextNode || range.startContainer === lastTextNode.parentNode)
                .toBe(true, 'The selection is starting at the wrong element');
            expect(range.startOffset).toBe(0, 'The start of the selection is not at the beginning of the text node');
            expect(range.endContainer === lastTextNode || range.endContainer === lastTextNode.parentNode)
                .toBe(true, 'The selection is ending at the wrong element');
            expect(range.endOffset).toBe('not a link'.length, 'The end of the selection is not at the end of the text node');
        });

        it('should import a position with the cursor in an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 1
            }, this.el, document);

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(this.el.getElementsByTagName('p')[1], 'empty paragraph');
        });

        it('should import a position with the cursor after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            }, this.el, document);

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(this.el.getElementsByTagName('p')[2], 'paragraph after empty paragraph');
        });

        it('should import a position with the cursor after an empty paragraph when there are multipled editable elements', function () {
            var el = this.createElement('div', 'editor', '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>');
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'editableElementIndex': 1,
                'emptyBlocksIndex': 2
            }, el, document);

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(el.getElementsByTagName('p')[2], 'paragraph after empty paragraph');
        });

        it('should import a position with the cursor after an empty block element', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            }, this.el, document);

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'h2');
            expect(startParagraph).toBe(this.el.querySelector('h2'), 'block element after empty block element');
        });

        it('should import a position with the cursor after an empty block element when there are nested block elements', function () {
            this.el.innerHTML = '<blockquote><p><span>www.google.com</span></p></blockquote><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            }, this.el, document);

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'h2');
            expect(startParagraph).toBe(this.el.querySelector('h2'), 'block element after empty block element');
        });

        it('should import a position with the cursor after an empty block element inside an element with various children', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p><b><i>Whatever</i></b></p>';
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 3
            }, this.el, document);

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            expect(MediumEditor.util.isDescendant(this.el.querySelector('i'), innerElement, true)).toBe(true, 'nested inline elment inside block element after empty block element');
        });

        ['br', 'img'].forEach(function (tagName) {
            it('should not import a selection into focusing on the element \'' + tagName + '\' that cannot have children', function () {
                this.el.innerHTML = '<p>Hello</p><p><' + tagName + ' /></p><p>World<p>';
                MediumEditor.selection.importSelection({
                    'start': 5,
                    'end': 5,
                    'emptyBlocksIndex': 1
                }, this.el, document);

                var innerElement = window.getSelection().getRangeAt(0).startContainer;
                expect(innerElement.nodeName.toLowerCase()).toBe('p', 'focused element nodeName');
                expect(innerElement).toBe(window.getSelection().getRangeAt(0).endContainer);
                expect(innerElement.previousSibling.nodeName.toLowerCase()).toBe('p', 'previous sibling name');
                expect(innerElement.nextSibling.nodeName.toLowerCase()).toBe('p', 'next sibling name');
            });
        });

        it('should not import a selection into focusing on an empty element in a table', function () {
            this.el.innerHTML = '<p>Hello</p><table><colgroup><col /></colgroup>' +
                '<thead><tr><th>Head</th></tr></thead>' +
                '<tbody><tr><td>Body</td></tr></tbody></table><p>World<p>';
            MediumEditor.selection.importSelection({
                'start': 5,
                'end': 5,
                'emptyBlocksIndex': 1
            }, this.el, document);

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            // The behavior varies from browser to browser for this case, some select TH, some #textNode
            expect(MediumEditor.util.isDescendant(this.el.querySelector('th'), innerElement, true))
                .toBe(true, 'expect selection to be of TH or a descendant');
            expect(innerElement).toBe(window.getSelection().getRangeAt(0).endContainer);
        });

        it('should not import a selection beyond any block elements that have text, even when emptyBlocksIndex indicates it should ', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2>Not Empty</h2><p><b><i>Whatever</i></b></p>';
            // Import a selection that indicates the text should be at the end of the 'www.google.com' word, but in the 3rd paragraph (at the beginning of 'Whatever')
            MediumEditor.selection.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 3
            }, this.el, document);

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            expect(MediumEditor.util.isDescendant(this.el.querySelectorAll('p')[1], innerElement, true)).toBe(false, 'moved selection beyond non-empty block element');
            expect(MediumEditor.util.isDescendant(this.el.querySelector('h2'), innerElement, true)).toBe(true, 'moved selection to element to incorrect block element');
        });

        // https://github.com/yabwe/medium-editor/issues/732
        it('should support a selection correctly when space + newlines are separating block elements', function () {
            this.el.innerHTML = '<ul>\n' +
                                '    <li><a href="#">a link</a></li>\n' +
                                '    <li>a list item</li>\n' +
                                '    <li>target</li>\n' +
                                '</ul>';
            var lastLi = this.el.querySelectorAll('ul > li')[2];

            // Select the <li> with 'target'
            selectElementContents(lastLi.firstChild);

            var selectionData = MediumEditor.selection.exportSelection(this.el, document);
            expect(selectionData.emptyBlocksIndex).toBeUndefined();

            MediumEditor.selection.importSelection(selectionData, this.el, document);
            var range = window.getSelection().getRangeAt(0);

            expect(range.toString()).toBe('target', 'The selection is around the wrong element');
            expect(MediumEditor.util.isDescendant(lastLi, range.startContainer, true)).toBe(true, 'The start of the selection is invalid');
            expect(MediumEditor.util.isDescendant(lastLi, range.endContainer, true)).toBe(true, 'The end of the selection is invalid');
        });

        it('should support a selection that specifies an image is the selection', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#"><img src="../demo/img/medium-editor.jpg" /></a> dolor</p>';
            MediumEditor.selection.importSelection({ start: 12, end: 12, startsWithImage: true, trailingImageCount: 1 }, this.el, document);
            var range = window.getSelection().getRangeAt(0);
            expect(range.toString()).toBe('');
            expect(MediumEditor.util.isDescendant(range.endContainer, this.el.querySelector('img'), true)).toBe(true, 'the image is not within the selection');
        });

        it('should support a selection that starts with an image', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#"><img src="../demo/img/medium-editor.jpg" />img</a> dolor</p>';
            MediumEditor.selection.importSelection({ start: 12, end: 15, startsWithImage: true }, this.el, document);
            var range = window.getSelection().getRangeAt(0);
            expect(range.toString()).toBe('img');
            if (range.startContainer.nodeName.toLowerCase() === 'a') {
                expect(range.startContainer).toBe(this.el.querySelector('a'));
                expect(range.startOffset).toBe(0);
            } else {
                expect(range.startContainer.nextSibling).toBe(this.el.querySelector('a'));
                expect(range.startOffset).toBe(12);
            }
        });

        it('should support a selection that ends with an image', function () {
            this.el.innerHTML = '<p>lorem ipsum <a href="#">img<img src="../demo/img/medium-editor.jpg" /><img src="../demo/img/roman.jpg" /></a> dolor</p>';
            MediumEditor.selection.importSelection({ start: 12, end: 15, trailingImageCount: 2 }, this.el, document);
            var range = window.getSelection().getRangeAt(0);
            expect(range.toString()).toBe('img');
            expect(MediumEditor.util.isDescendant(range.endContainer, this.el.querySelector('img'), true)).toBe(true, 'the image is not within the selection');
        });

        // https://github.com/yabwe/medium-editor/issues/935
        it('should support a selection that is after white-space at the beginning of a paragraph', function () {
            this.el.innerHTML = '   <p>one two<br><a href="transindex.hu">three</a><br></p><p><a href="amazon.com">one</a> two three</p>';
            this.newMediumEditor(this.el);
            var firstText = this.el.querySelector('p').firstChild;
            MediumEditor.selection.select(document, firstText, 0, firstText, 'one'.length);
            var exported = MediumEditor.selection.exportSelection(this.el, document);
            MediumEditor.selection.importSelection(exported, this.el, document);
            var range = window.getSelection().getRangeAt(0);
            expect(range.toString()).toBe('one');
        });

        it('should support importing a collapsed selection at the end of all content', function () {
            this.el.innerHTML = '<p>lorem ipsum <b>dolor</b></p>';
            var boldText = this.el.querySelector('b').firstChild;

            placeCursorInsideElement(boldText, boldText.length);
            var range = window.getSelection().getRangeAt(0);
            expect(range.collapsed).toBe(true);
            expect(MediumEditor.util.isDescendant(boldText.parentNode, range.startContainer, true)).toBe(true);
            expect(MediumEditor.util.isDescendant(boldText.parentNode, range.endContainer, true)).toBe(true);

            var exported = MediumEditor.selection.exportSelection(this.el, document);
            expect(exported.start).toBe('lorem ipsum dolor'.length);
            expect(exported.end).toBe('lorem ipsum dolor'.length);

            MediumEditor.selection.importSelection(exported, this.el, document);
            range = window.getSelection().getRangeAt(0);
            expect(range.collapsed).toBe(true);
            expect(MediumEditor.util.isDescendant(boldText.parentNode, range.startContainer, true)).toBe(true);
            expect(MediumEditor.util.isDescendant(boldText.parentNode, range.endContainer, true)).toBe(true);
        });
    });

    describe('getSelectedElements', function () {
        it('no selected elements on empty selection', function () {
            window.getSelection().removeAllRanges();
            var elements = MediumEditor.selection.getSelectedElements(document);

            expect(elements.length).toBe(0);
        });

        it('should select element from selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            selectElementContents(this.el.querySelector('i').firstChild);
            var elements = MediumEditor.selection.getSelectedElements(document);

            expect(elements.length).toBe(1);
            expect(elements[0].nodeName.toLowerCase()).toBe('i');
            expect(elements[0].innerHTML).toBe('ipsum');
        });

        it('should select first element when selection is global (ie: all the editor)', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            selectElementContents(this.el);
            var elements = MediumEditor.selection.getSelectedElements(document);

            expect(elements.length).toBe(1);
            expect(elements[0].nodeName.toLowerCase()).toBe('i');
            expect(elements[0].innerHTML).toBe('ipsum');
        });
    });

    describe('getSelectedParentElement', function () {
        it('should return null on bad range', function () {
            expect(MediumEditor.selection.getSelectedParentElement(null)).toBe(null);
            expect(MediumEditor.selection.getSelectedParentElement(false)).toBe(null);
        });

        it('should select the document', function () {
            this.el.innerHTML = '<p>lorem <i>ipsum</i> dolor <span>hello</span> <b>you</b> </p>';
            var range = document.createRange(),
                sel = window.getSelection(),
                element;

            range.setStart(document, 0);
            range.setEnd(this.el.querySelector('b').firstChild, 2);

            sel.removeAllRanges();
            sel.addRange(range);

            element = MediumEditor.selection.getSelectedParentElement(range);

            expect(element).toBe(document);
        });
    });

    describe('selectionContainsContent', function () {
        it('should return true for non-empty text', function () {
            this.el.innerHTML = '<p>this is<span> </span>text</p>';
            selectElementContents(this.el.querySelector('p'));

            expect(MediumEditor.selection.selectionContainsContent(document)).toBe(true);
        });

        it('should return false for white-space only selections', function () {
            this.el.innerHTML = '<p>this is<span> </span>text</p>';
            selectElementContents(this.el.querySelector('span'));

            expect(MediumEditor.selection.selectionContainsContent(document)).toBe(false);
        });

        it('should return true for image with link selections', function () {
            this.el.innerHTML = '<p>this is <a href="#"><img src="../demo/img/medium-editor.jpg" /></a> image test</p>';
            selectElementContents(this.el.querySelector('a'));

            expect(MediumEditor.selection.selectionContainsContent(document)).toBe(true);
        });
    });

    describe('clearSelection', function () {
        it('should clear the selection and set the caret to the start of the prior range when specified', function () {
            this.el.innerHTML = '<p>this is<span> </span>text</p>';
            selectElementContents(this.el.querySelector('p'));
            var selectionStart = document.getSelection().anchorOffset;

            MediumEditor.selection.clearSelection(document, true);
            expect(document.getSelection().focusOffset).toBe(selectionStart);

            var newSelectionEnd = document.getSelection().focusOffset;
            expect(newSelectionEnd).toBe(selectionStart);
        });

        it('should clear the selection and set the caret to the end of the prior range by default', function () {
            this.el.innerHTML = '<p>this is<span> </span>text</p>';
            selectElementContents(this.el.querySelector('p'));
            var selectionEnd = document.getSelection().focusOffset;

            MediumEditor.selection.clearSelection(document);
            expect(document.getSelection().anchorOffset).toBe(selectionEnd);

            var newSelectionStart = document.getSelection().anchorOffset;
            expect(newSelectionStart).toBe(selectionEnd);
        });
    });
});
