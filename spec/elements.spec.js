describe('Elements TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Initialization', function () {
        it('should set element contenteditable attribute to true', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toEqual('true');
        });

        it('should not set element contenteditable when disableEditing is true', function () {
            var editor = this.newMediumEditor('.editor', {
                disableEditing: true
            });
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toBeFalsy();
        });

        it('should not set element contenteditable when data-disable-editing is true', function () {
            this.el.setAttribute('data-disable-editing', true);
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toBeFalsy();
        });

        it('should set element data attr medium-editor-element to true and add medium-editor-element class', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('data-medium-editor-element')).toEqual('true');
            expect(this.el.className).toBe('editor medium-editor-element');
        });

        it('should set element role attribute to textbox', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('role')).toEqual('textbox');
        });

        it('should set element aria multiline attribute to true', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('aria-multiline')).toEqual('true');
        });

        it('should set the data-medium-editor-editor-index attribute to be the id of the editor instance', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements[0]).toBe(this.el);
            expect(parseInt(this.el.getAttribute('data-medium-editor-editor-index'))).toBe(editor.id);
        });
    });

    describe('Destroy', function () {
        it('should remove the contenteditable attribute', function () {
            var editor = this.newMediumEditor('.editor');
            expect(this.el.getAttribute('contenteditable')).toEqual('true');
            editor.destroy();
            expect(this.el.hasAttribute('contenteditable')).toBe(false);
        });

        it('should remove the medium-editor-element attribute and class name', function () {
            this.el.classList.add('temp-class');
            expect(this.el.className).toBe('editor temp-class');
            var editor = this.newMediumEditor('.editor');
            expect(this.el.getAttribute('data-medium-editor-element')).toEqual('true');
            expect(this.el.className).toBe('editor temp-class medium-editor-element');
            editor.destroy();
            expect(this.el.hasAttribute('data-medium-editor-element')).toBe(false);
            expect(this.el.className).toBe('editor temp-class');
        });

        it('should remove the role attribute', function () {
            var editor = this.newMediumEditor('.editor');
            expect(this.el.getAttribute('role')).toEqual('textbox');
            editor.destroy();
            expect(this.el.hasAttribute('role')).toBe(false);
        });

        it('should remove the aria-multiline attribute', function () {
            var editor = this.newMediumEditor('.editor');
            expect(this.el.getAttribute('aria-multiline')).toEqual('true');
            editor.destroy();
            expect(this.el.hasAttribute('aria-multiline')).toBe(false);
        });

        it('should remove the data-medium-editor-editor-index attribute', function () {
            var editor = this.newMediumEditor('.editor');
            expect(parseInt(this.el.getAttribute('data-medium-editor-editor-index'))).toBe(editor.id);
            editor.destroy();
            expect(this.el.hasAttribute('data-medium-editor-editor-index')).toBe(false);
        });
    });
});
