/*global fireEvent, selectElementContents */

describe('Core-API', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('getFocusedElement', function () {
        it('should return the element which currently has a data-medium-focused attribute', function () {
            var elementOne = this.createElement('div', 'editor', 'lorem ipsum'),
                elementTwo = this.createElement('div', 'editor', 'lorem ipsum');
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = this.newMediumEditor('.editor'),
                focused = editor.getFocusedElement();
            expect(focused).not.toBe(elementOne);
            expect(focused).toBe(elementTwo);
        });

        it('should return the element focused via call to selectElement', function () {
            var elementOne = this.createElement('div', 'editor', 'lorem ipsum'),
                elementTwo = this.createElement('div', 'editor', 'lorem ipsum');
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = this.newMediumEditor('.editor');

            editor.selectElement(elementOne.firstChild);
            var focused = editor.getFocusedElement();
            expect(focused).toBe(elementOne);
        });
    });

    describe('setContent', function () {
        it('should set the content of the editor\'s element', function () {
            var newHTML = 'Lorem ipsum dolor',
                otherHTML = 'something different',
                elementOne = this.createElement('div', 'editor', 'lorem ipsum'),
                editor = this.newMediumEditor('.editor');

            editor.setContent(newHTML);
            expect(this.el.innerHTML).toEqual(newHTML);
            expect(elementOne.innerHTML).not.toEqual(newHTML);

            editor.setContent(otherHTML, 1);
            expect(elementOne.innerHTML).toEqual(otherHTML);
            expect(this.el.innerHTML).not.toEqual(otherHTML);
        });
    });

    describe('saveSelection/restoreSelection', function () {
        it('should be applicable if html changes but text does not', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';

            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic', 'underline', 'strikethrough']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button;

            // Save selection around <i> tag
            selectElementContents(editor.elements[0].querySelector('i'));
            editor.saveSelection();

            // Underline entire element
            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');
            fireEvent(button, 'click');

            // Restore selection back to <i> tag and add a <strike> tag
            editor.restoreSelection();
            button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
            fireEvent(button, 'click');

            // Edge breaks this into 3 separate <u> tags for some reason...
            var regex = new RegExp('^<u>lorem (<i><strike>|<strike><i>|</u><i><u><strike>)ipsum(</i></strike>|</strike></i>|</strike></u></i><u>) dolor</u>$');
            expect(editor.elements[0].innerHTML).toMatch(regex);
        });
    });

    describe('exportSelection', function () {
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
    });
});
