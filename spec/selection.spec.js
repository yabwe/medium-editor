/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, fireEvent,
         jasmine, selectElementContents, setupTestHelpers,
         selectElementContentsAndFire, Selection, placeCursorInsideElement */

describe('Selection TestCase', function () {
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
            expect(MediumEditor.selection).toEqual(Selection);
        });
    });

    describe('Export/Import Selection', function () {
        it('should be able to import an exported selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
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
                buttons: ['italic', 'underline', 'strikethrough']
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

        it('should have an index in the exported selection when it is in the second contenteditable', function () {
            this.createElement('div', 'editor', 'lorem <i>ipsum</i> dolor');
            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            });

            selectElementContents(editor.elements[1].querySelector('i'));
            var exportedSelection = editor.exportSelection();
            expect(Object.keys(exportedSelection).sort()).toEqual(['editableElementIndex', 'end', 'start']);
            expect(exportedSelection.editableElementIndex).toEqual(1);
        });
    });

    describe('Saving Selection', function () {
        it('should be applicable if html changes but text does not', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';

            var editor = this.newMediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            }),
                button,
                regex;

            // Save selection around <i> tag
            selectElementContents(editor.elements[0].querySelector('i'));
            editor.saveSelection();

            // Underline entire element
            selectElementContents(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="underline"]');
            fireEvent(button, 'click');

            // Restore selection back to <i> tag and add a <strike> tag
            regex = new RegExp('^<u>lorem (<i><strike>|<strike><i>)ipsum(</i></strike>|</strike></i>) dolor</u>$');
            editor.restoreSelection();
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
            fireEvent(button, 'click');
            expect(regex.test(editor.elements[0].innerHTML)).toBe(true);
        });
    });

    describe('CheckSelection', function () {
        it('should check for selection on mouseup event', function () {
            spyOn(MediumEditor.statics.Toolbar.prototype, 'checkState');
            var editor = this.newMediumEditor('.editor');
            fireEvent(editor.elements[0], 'mouseup');
            expect(editor.toolbar.checkState).toHaveBeenCalled();
        });

        it('should check for selection on keyup', function () {
            spyOn(MediumEditor.statics.Toolbar.prototype, 'checkState');
            var editor = this.newMediumEditor('.editor');
            fireEvent(editor.elements[0], 'keyup');
            expect(editor.toolbar.checkState).toHaveBeenCalled();
        });

        it('should hide the toolbar if selection is empty', function () {
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarButtonStates').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor');
            editor.toolbar.getToolbarElement().style.display = 'block';
            editor.toolbar.getToolbarElement().classList.add('medium-editor-toolbar-active');
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            editor.checkSelection();
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(editor.toolbar.setToolbarPosition).not.toHaveBeenCalled();
            expect(editor.toolbar.setToolbarButtonStates).not.toHaveBeenCalled();
            expect(editor.toolbar.showAndUpdateToolbar).not.toHaveBeenCalled();
        });

        it('should hide the toolbar when selecting multiple paragraphs and the allowMultiParagraphSelection option is false', function () {
            this.el.innerHTML = '<p id="p-one">lorem ipsum</p><p id="p-two">lorem ipsum</p>';
            var editor = this.newMediumEditor('.editor', {
                allowMultiParagraphSelection: false
            });
            selectElementContentsAndFire(document.getElementById('p-one'), { eventToFire: 'focus' });
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            selectElementContentsAndFire(this.el, { eventToFire: 'mouseup' });
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
        });

        it('should show the toolbar when something is selected', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            selectElementContentsAndFire(this.el);
            jasmine.clock().tick(501);
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
        });

        it('should update toolbar position and button states when something is selected', function () {
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarButtonStates').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(this.el);
            jasmine.clock().tick(51);
            expect(editor.toolbar.setToolbarPosition).toHaveBeenCalled();
            expect(editor.toolbar.setToolbarButtonStates).toHaveBeenCalled();
            expect(editor.toolbar.showAndUpdateToolbar).toHaveBeenCalled();
        });

        it('should update button states for static toolbar when updateOnEmptySelection is true and the selection is empty', function () {
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarButtonStates').and.callThrough();

            var editor = this.newMediumEditor('.editor', {
                updateOnEmptySelection: true,
                staticToolbar: true
            });

            selectElementContentsAndFire(this.el, { collapse: 'toStart' });
            jasmine.clock().tick(51);

            expect(editor.toolbar.setToolbarButtonStates).toHaveBeenCalled();
        });
    });

    describe('getSelectedElements', function () {
        it('no selected elements on empty selection', function () {
            var elements = Selection.getSelectedElements(document);

            expect(elements.length).toBe(0);
        });

        it('should select element from selection', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var editor = this.newMediumEditor('.editor'),
                elements;

            selectElementContents(editor.elements[0].querySelector('i').firstChild);
            elements = Selection.getSelectedElements(document);

            expect(elements.length).toBe(1);
            expect(elements[0].tagName.toLowerCase()).toBe('i');
            expect(elements[0].innerHTML).toBe('ipsum');
        });

        it('should select first element when selection is global (ie: all the editor)', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';
            var elements;

            selectElementContents(this.el);
            elements = Selection.getSelectedElements(document);

            expect(elements.length).toBe(1);
            expect(elements[0].tagName.toLowerCase()).toBe('i');
            expect(elements[0].innerHTML).toBe('ipsum');
        });
    });

    describe('getSelectedParentElement', function () {
        it('should return null on bad range', function () {
            expect(Selection.getSelectedParentElement(null)).toBe(null);
            expect(Selection.getSelectedParentElement(false)).toBe(null);
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

            element = Selection.getSelectedParentElement(range);

            expect(element).toBe(document);
        });
    });
});
