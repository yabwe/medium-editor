/*global fireEvent, selectElementContents,
  selectElementContentsAndFire */

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

    describe('getContent', function () {
        it('should retrieve the content of the first element', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.getContent()).toEqual('lore ipsum');
        });

        it('should retrieve the content of the element at the specified index', function () {
            var otherHTML = 'something different';
            this.createElement('div', 'editor', otherHTML);
            var editor = this.newMediumEditor('.editor');
            expect(editor.getContent(1)).toEqual(otherHTML);
        });

        it('should return null if no element exists', function () {
            var editor = this.newMediumEditor('.no-valid-selector');
            expect(editor.getContent()).toBeNull();
        });
    });

    describe('resetContent', function () {
        it('should reset the content of all editor elements to their initial values', function () {
            var initialOne = this.el.innerHTML,
                initialTwo = 'Lorem ipsum dolor',
                elementTwo = this.createElement('div', 'editor', initialTwo),
                editor = this.newMediumEditor('.editor');

            editor.setContent('<p>changed content</p>');
            expect(this.el.innerHTML).not.toEqual(initialOne);
            editor.setContent('<p>changed content</p>', 1);
            expect(elementTwo.innerHTML).not.toEqual(initialTwo);

            editor.resetContent();

            expect(this.el.innerHTML).toEqual(initialOne);
            expect(elementTwo.innerHTML).toEqual(initialTwo);
        });

        it('should reset the content of a specific element when provided', function () {
            var initialOne = this.el.innerHTML,
                initialTwo = 'Lorem ipsum dolor',
                elementTwo = this.createElement('div', 'editor', initialTwo),
                editor = this.newMediumEditor('.editor');

            editor.setContent('<p>changed content</p>');
            expect(this.el.innerHTML).not.toEqual(initialOne);
            editor.setContent('<p>changed content</p>', 1);
            expect(elementTwo.innerHTML).not.toEqual(initialTwo);

            editor.resetContent(elementTwo);

            expect(this.el.innerHTML).not.toEqual(initialOne);
            expect(elementTwo.innerHTML).toEqual(initialTwo);
        });

        it('should not reset anything if an invalid element is provided', function () {
            var initialOne = this.el.innerHTML,
                initialTwo = 'Lorem ipsum dolor',
                elementTwo = this.createElement('div', 'editor', initialTwo),
                dummyElement = this.createElement('div', 'not-editor', '<p>dummy element</p>'),
                editor = this.newMediumEditor('.editor');

            editor.setContent('<p>changed content</p>');
            expect(this.el.innerHTML).not.toEqual(initialOne);
            editor.setContent('<p>changed content</p>', 1);
            expect(elementTwo.innerHTML).not.toEqual(initialTwo);

            editor.resetContent(dummyElement);

            expect(this.el.innerHTML).not.toEqual(initialOne);
            expect(elementTwo.innerHTML).not.toEqual(initialTwo);
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
                button,
                // Beacuse not all browsers use <strike> or <s>, check for both
                sTagO = '<(s|strike)>',
                sTagC = '</(s|strike)>',
                // Edge breaks this into 3 separate <u> tags for some reason...
                regex = new RegExp([
                    '^<u>lorem ',
                    '(<i>' + sTagO + '|' + sTagO + '<i>|</u><i><u>' + sTagO + ')',
                    'ipsum',
                    '(</i>' + sTagC + '|' + sTagC + '</i>|' + sTagC + '</u></i><u>)',
                    ' dolor</u>$'
                ].join(''));

            // Save selection around <i> tag
            selectElementContents(editor.elements[0].querySelector('i'));
            editor.saveSelection();

            // Underline entire element
            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');
            fireEvent(button, 'click');

            // Restore selection back to <i> tag and add a <s> tag
            editor.restoreSelection();
            button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
            fireEvent(button, 'click');
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

    describe('execAction', function () {
        it('should pass opt directly to document.execCommand', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            editor.execAction('foreColor', { value: 'red' });
            expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, 'red');
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('fontName support old style', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            editor.execAction('fontName', { name: 'Tahoma' });
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Tahoma');
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('fontName support new stle', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            editor.execAction('fontName', { value: 'Tahoma' });
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Tahoma');
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('fontSize support old style', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            editor.execAction('fontSize', { size: 14 });
            expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, 14);
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('fontSize support new stle', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            editor.execAction('fontSize', { value: 14 });
            expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, 14);
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('createLink support old style', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            selectElementContentsAndFire(editor.elements[0].firstChild);
            jasmine.clock().tick(1);

            editor.execAction('createLink', { url: 'http://www.test.com' });
            expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'http://www.test.com');
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });

        it('createLink support new style', function () {
            // In order to safely spy on document.execCommand we need to disable functionality
            // which overrides document.execCommand in IE & Edge
            var origSupported = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = true;

            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor');

            selectElementContentsAndFire(editor.elements[0].firstChild);
            jasmine.clock().tick(1);

            editor.execAction('createLink', { value: 'http://www.test.com' });
            expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'http://www.test.com');
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = origSupported;
        });
    });

    describe('checkContentChanged', function () {
        it('should trigger editableInput when called after the html has changed', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic', 'underline', 'strikethrough']
                    }
                }),
                spy = jasmine.createSpy('handler');

            editor.subscribe('editableInput', spy);
            expect(spy).not.toHaveBeenCalled();

            selectElementContentsAndFire(this.el.firstChild);
            jasmine.clock().tick(1);

            this.el.innerHTML = 'lorem ipsum';
            expect(spy).not.toHaveBeenCalled();

            var obj = { target: this.el, currentTarget: this.el };
            editor.checkContentChanged();
            expect(spy).toHaveBeenCalledWith(obj, this.el);
        });

        it('should not trigger editableInput when called after the html has not changed', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic', 'underline', 'strikethrough']
                    }
                }),
                spy = jasmine.createSpy('handler');

            editor.subscribe('editableInput', spy);
            expect(spy).not.toHaveBeenCalled();

            selectElementContentsAndFire(this.el.firstChild);
            jasmine.clock().tick(1);

            this.el.innerHTML = 'lore ipsum';
            expect(spy).not.toHaveBeenCalled();

            editor.checkContentChanged();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('getEditorFromElement', function () {
        it('should return the editor instance the element belongs to', function () {
            var elTwo = this.createElement('div', 'editor-two', 'lore ipsum'),
                editorOne = this.newMediumEditor('.editor'),
                editorTwo = this.newMediumEditor('.editor-two');
            expect(editorOne.elements[0]).toBe(this.el);
            expect(editorTwo.elements[0]).toBe(elTwo);

            expect(MediumEditor.getEditorFromElement(this.el)).toBe(editorOne);
            expect(MediumEditor.getEditorFromElement(elTwo)).toBe(editorTwo);
        });

        it('should return null if the element is not within an editor', function () {
            expect(MediumEditor.getEditorFromElement(this.el)).toBeNull();
        });
    });
});
