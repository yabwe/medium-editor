/*global fireEvent, selectElementContents,
         selectElementContentsAndFire,
         placeCursorInsideElement */

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

    describe('Export/Import Selection', function () {
        it('should be able to import an exported selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var editor = this.newMediumEditor('.editor', {
                toolbar: {
                    buttons: ['italic', 'underline', 'strikethrough']
                }
            });

            selectElementContents(editor.elements[0].querySelector('i'));
            var exportedSelection = editor.exportSelection();
            expect(Object.keys(exportedSelection).sort()).toEqual(['end', 'start']);

            selectElementContents(editor.elements[0]);
            expect(exportedSelection).not.toEqual(editor.exportSelection());

            editor.importSelection(exportedSelection);
            expect(exportedSelection).toEqual(editor.exportSelection());
        });

        it('should import an exported selection outside any anchor tag', function () {
            this.el.innerHTML = '<p id=1>Hello world: <a href="#">http://www.example.com</a></p><p id=2><br></p>';
            var editor = this.newMediumEditor('.editor', {
                toolbar: {
                    buttons: ['italic', 'underline', 'strikethrough']
                }
            }),
                link = editor.elements[0].getElementsByTagName('a')[0];

            placeCursorInsideElement(link.childNodes[0], link.childNodes[0].nodeValue.length);

            var exportedSelection = editor.exportSelection();
            editor.importSelection(exportedSelection, true);
            var range = window.getSelection().getRangeAt(0),
                node = range.startContainer;
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
            var editor = this.newMediumEditor('.editor'),
                lastTextNode = this.el.childNodes[2].firstChild;

            MediumEditor.selection.select(document, lastTextNode, 0, lastTextNode, 'not a link'.length);

            var exportedSelection = editor.exportSelection();
            expect(exportedSelection).toEqual({ start: 14, end: 24, emptyBlocksIndex: 2 });
            editor.importSelection(exportedSelection);

            var range = window.getSelection().getRangeAt(0);
            expect(range.startContainer === lastTextNode || range.startContainer === lastTextNode.parentNode)
                .toBe(true, 'The selection is starting at the wrong element');
            expect(range.startOffset).toBe(0, 'The start of the selection is not at the beginning of the text node');
            expect(range.endContainer === lastTextNode || range.endContainer === lastTextNode.parentNode)
                .toBe(true, 'The selection is ending at the wrong element');
            expect(range.endOffset).toBe('not a link'.length, 'The end of the selection is not at the end of the text node');
        });

        it('should have an index in the exported selection when it is in the second contenteditable', function () {
            this.createElement('div', 'editor', 'lorem <i>ipsum</i> dolor');
            var editor = this.newMediumEditor('.editor', {
                toolbar: {
                    buttons: ['italic', 'underline', 'strikethrough']
                }
            });

            selectElementContents(editor.elements[1].querySelector('i'));
            var exportedSelection = editor.exportSelection();
            expect(Object.keys(exportedSelection).sort()).toEqual(['editableElementIndex', 'end', 'start']);
            expect(exportedSelection.editableElementIndex).toEqual(1);
        });

        it('should not export a position indicating the cursor is before an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            placeCursorInsideElement(editor.elements[0].querySelector('span'), 1); // end of first span
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should export a position indicating the cursor is at the beginning of a paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><b>Whatever</b></p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            placeCursorInsideElement(editor.elements[0].querySelector('b'), 0); // beginning of <b> tag
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(0);
        });

        it('should not export a position indicating the cursor is after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p class="target">Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            // After the 'W' in whatever
            placeCursorInsideElement(editor.elements[0].querySelector('p.target').firstChild, 1);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should not export a position indicating the cursor is after an empty paragraph (in a complicated markup case)',
                function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p>What<span class="target">ever</span></p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            // Before the 'e' in whatever
            placeCursorInsideElement(editor.elements[0].querySelector('span.target').firstChild, 0);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should not export a position indicating the cursor is after an empty paragraph ' +
                '(in a complicated markup with selection on the element)', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p>' +
                '<p>What<span class="target">ever</span></p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            // Before the 'e' in whatever
            placeCursorInsideElement(editor.elements[0].querySelector('span.target'), 0);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(undefined);
        });

        it('should export a position indicating the cursor is in an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            placeCursorInsideElement(editor.elements[0].getElementsByTagName('p')[1], 0);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(1);
        });

        it('should export a position indicating the cursor is after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            placeCursorInsideElement(editor.elements[0].getElementsByTagName('p')[2], 0);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(2);
        });

        it('should export a position indicating the cursor is after an empty block element', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            placeCursorInsideElement(editor.elements[0].querySelector('h2'), 0);
            var exportedSelection = editor.exportSelection();
            expect(exportedSelection.emptyBlocksIndex).toEqual(2);
        });

        it('should import a position with the cursor in an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 1
            });

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(editor.elements[0].getElementsByTagName('p')[1], 'empty paragraph');
        });

        it('should import a position with the cursor after an empty paragraph', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            });

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(editor.elements[0].getElementsByTagName('p')[2], 'paragraph after empty paragraph');
        });

        it('should import a position with the cursor after an empty paragraph when there are multipled editable elements', function () {
            this.createElement('div', 'editor', '<p><span>www.google.com</span></p><p><br /></p><p>Whatever</p>');
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'editableElementIndex': 1,
                'emptyBlocksIndex': 2
            });

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'p');
            expect(startParagraph).toBe(editor.elements[1].getElementsByTagName('p')[2], 'paragraph after empty paragraph');
        });

        it('should import a position with the cursor after an empty block element', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            });

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'h2');
            expect(startParagraph).toBe(editor.elements[0].querySelector('h2'), 'block element after empty block element');
        });

        it('should import a position with the cursor after an empty block element when there are nested block elements', function () {
            this.el.innerHTML = '<blockquote><p><span>www.google.com</span></p></blockquote><h1><br /></h1><h2><br /></h2><p>Whatever</p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 2
            });

            var startParagraph = MediumEditor.util.getClosestTag(window.getSelection().getRangeAt(0).startContainer, 'h2');
            expect(startParagraph).toBe(editor.elements[0].querySelector('h2'), 'block element after empty block element');
        });

        it('should import a position with the cursor after an empty block element inside an element with various children', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2><br /></h2><p><b><i>Whatever</i></b></p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 3
            });

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            expect(MediumEditor.util.isDescendant(editor.elements[0].querySelector('i'), innerElement, true)).toBe(true, 'nested inline elment inside block element after empty block element');
        });

        ['br', 'img'].forEach(function (tagName) {
            it('should not import a selection into focusing on the element \'' + tagName + '\' that cannot have children', function () {
                this.el.innerHTML = '<p>Hello</p><p><' + tagName + ' /></p><p>World<p>';
                var editor = this.newMediumEditor('.editor', {
                    buttons: ['italic', 'underline', 'strikethrough']
                });
                editor.importSelection({
                    'start': 5,
                    'end': 5,
                    'emptyBlocksIndex': 1
                });

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
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            editor.importSelection({
                'start': 5,
                'end': 5,
                'emptyBlocksIndex': 1
            });

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            // The behavior varies from browser to browser for this case, some select TH, some #textNode
            expect(MediumEditor.util.isDescendant(editor.elements[0].querySelector('th'), innerElement, true))
                .toBe(true, 'expect selection to be of TH or a descendant');
            expect(innerElement).toBe(window.getSelection().getRangeAt(0).endContainer);
        });

        it('should not import a selection beyond any block elements that have text, even when emptyBlocksIndex indicates it should ', function () {
            this.el.innerHTML = '<p><span>www.google.com</span></p><h1><br /></h1><h2>Not Empty</h2><p><b><i>Whatever</i></b></p>';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });
            // Import a selection that indicates the text should be at the end of the 'www.google.com' word, but in the 3rd paragraph (at the beginning of 'Whatever')
            editor.importSelection({
                'start': 14,
                'end': 14,
                'emptyBlocksIndex': 3
            });

            var innerElement = window.getSelection().getRangeAt(0).startContainer;
            expect(MediumEditor.util.isDescendant(editor.elements[0].querySelectorAll('p')[1], innerElement, true)).toBe(false, 'moved selection beyond non-empty block element');
            expect(MediumEditor.util.isDescendant(editor.elements[0].querySelector('h2'), innerElement, true)).toBe(true, 'moved selection to element to incorrect block element');
        });

        // https://github.com/yabwe/medium-editor/issues/732
        it('should support a selection correctly when space + newlines are separating block elements', function () {
            this.el.innerHTML = '<ul>\n' +
                                '    <li><a href="#">a link</a></li>\n' +
                                '    <li>a list item</li>\n' +
                                '    <li>target</li>\n' +
                                '</ul>';
            var editor = this.newMediumEditor('.editor'),
                lastLi = this.el.querySelectorAll('ul > li')[2];

            // Select the <li> with 'target'
            selectElementContents(lastLi.firstChild);

            var selectionData = editor.exportSelection();
            expect(selectionData.emptyBlocksIndex).toBe(0);

            editor.importSelection(selectionData);
            var range = window.getSelection().getRangeAt(0);

            expect(range.toString()).toBe('target', 'The selection is around the wrong element');
            expect(MediumEditor.util.isDescendant(lastLi, range.startContainer, true)).toBe(true, 'The start of the selection is invalid');
            expect(MediumEditor.util.isDescendant(lastLi, range.endContainer, true)).toBe(true, 'The end of the selection is invalid');
        });
    });

    describe('Saving Selection', function () {
        it('should be applicable if html changes but text does not', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';

            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic', 'underline', 'strikethrough']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                regex;

            // Save selection around <i> tag
            selectElementContents(editor.elements[0].querySelector('i'));
            editor.saveSelection();

            // Underline entire element
            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');
            fireEvent(button, 'click');

            // Restore selection back to <i> tag and add a <strike> tag
            regex = new RegExp('^<u>lorem (<i><strike>|<strike><i>)ipsum(</i></strike>|</strike></i>) dolor</u>$');
            editor.restoreSelection();
            button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
            fireEvent(button, 'click');
            expect(regex.test(editor.elements[0].innerHTML)).toBe(true);
        });
    });

    describe('CheckSelection', function () {
        it('should check for selection on mouseup event', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'checkState');
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            fireEvent(editor.elements[0], 'mouseup');
            expect(toolbar.checkState).toHaveBeenCalled();
        });

        it('should check for selection on keyup', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'checkState');
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            fireEvent(editor.elements[0], 'keyup');
            expect(toolbar.checkState).toHaveBeenCalled();
        });

        it('should hide the toolbar if selection is empty', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'setToolbarPosition').and.callThrough();
            spyOn(MediumEditor.extensions.toolbar.prototype, 'setToolbarButtonStates').and.callThrough();
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            toolbar.getToolbarElement().style.display = 'block';
            toolbar.getToolbarElement().classList.add('medium-editor-toolbar-active');
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            editor.checkSelection();
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(toolbar.setToolbarPosition).not.toHaveBeenCalled();
            expect(toolbar.setToolbarButtonStates).not.toHaveBeenCalled();
            expect(toolbar.showAndUpdateToolbar).not.toHaveBeenCalled();
        });

        it('should hide the toolbar when selecting multiple paragraphs and the deprecated allowMultiParagraphSelection option is false', function () {
            this.el.innerHTML = '<p id="p-one">lorem ipsum</p><p id="p-two">lorem ipsum</p>';
            var editor = this.newMediumEditor('.editor', {
                    allowMultiParagraphSelection: false
                }),
                toolbar = editor.getExtensionByName('toolbar');
            selectElementContentsAndFire(document.getElementById('p-one'), { eventToFire: 'focus' });
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            selectElementContentsAndFire(this.el, { eventToFire: 'mouseup' });
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
        });

        it('should show the toolbar when something is selected', function () {
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            selectElementContentsAndFire(this.el);
            jasmine.clock().tick(501);
            expect(toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
        });

        it('should update toolbar position and button states when something is selected', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'setToolbarPosition').and.callThrough();
            spyOn(MediumEditor.extensions.toolbar.prototype, 'setToolbarButtonStates').and.callThrough();
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            selectElementContentsAndFire(this.el);
            jasmine.clock().tick(51);
            expect(toolbar.setToolbarPosition).toHaveBeenCalled();
            expect(toolbar.setToolbarButtonStates).toHaveBeenCalled();
            expect(toolbar.showAndUpdateToolbar).toHaveBeenCalled();
        });

        it('should update button states for static toolbar when updateOnEmptySelection is true and the selection is empty', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'setToolbarButtonStates').and.callThrough();

            var editor = this.newMediumEditor('.editor', {
                toolbar: {
                    updateOnEmptySelection: true,
                    static: true
                }
            });

            selectElementContentsAndFire(this.el, { collapse: 'toStart' });
            jasmine.clock().tick(51);

            expect(editor.getExtensionByName('toolbar').setToolbarButtonStates).toHaveBeenCalled();
        });
    });

    describe('getSelectedElements', function () {
        it('no selected elements on empty selection', function () {
            var elements = MediumEditor.selection.getSelectedElements(document);

            expect(elements.length).toBe(0);
        });

        it('should select element from selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var editor = this.newMediumEditor('.editor'),
                elements;

            selectElementContents(editor.elements[0].querySelector('i').firstChild);
            elements = MediumEditor.selection.getSelectedElements(document);

            expect(elements.length).toBe(1);
            expect(elements[0].nodeName.toLowerCase()).toBe('i');
            expect(elements[0].innerHTML).toBe('ipsum');
        });

        it('should select first element when selection is global (ie: all the editor)', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var elements;

            selectElementContents(this.el);
            elements = MediumEditor.selection.getSelectedElements(document);

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
});
