/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent*/

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.Clock.useMock();
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        this.body.appendChild(this.el);
    });

    afterEach(function () {
        var elements = document.querySelectorAll('.medium-editor-toolbar'),
            i,
            sel = window.getSelection();
        for (i = 0; i < elements.length; i += 1) {
            this.body.removeChild(elements[i]);
        }
        this.body.removeChild(this.el);
        sel.removeAllRanges();
    });

    describe('Click', function () {
        it('should display the anchor form when toolbar is visible', function () {
            spyOn(MediumEditor.prototype, 'showAnchorForm').andCallThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.Clock.tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            expect(editor.toolbarActions.style.display).toBe('none');
            expect(editor.anchorForm.style.display).toBe('block');
            expect(editor.showAnchorForm).toHaveBeenCalled();
        });

        it('should display the toolbar actions when anchor form is visible', function () {
            spyOn(MediumEditor.prototype, 'showToolbarActions').andCallThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.Clock.tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            editor.anchorForm.style.display = 'block';
            fireEvent(button, 'click');
            expect(editor.toolbarActions.style.display).toBe('block');
            expect(editor.anchorForm.style.display).toBe('none');
            expect(editor.showToolbarActions).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            spyOn(document, 'execCommand').andCallThrough();
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.Clock.tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML, 'link');
            expect(document.execCommand).toHaveBeenCalled();
        });

    });

});
