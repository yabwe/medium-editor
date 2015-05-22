/*global describe, it, expect,
         afterEach, beforeEach, setupTestHelpers*/

describe('Elements TestCase', function () {
    'use strict';

    describe('Initialization', function () {
        beforeEach(function () {
            setupTestHelpers.call(this);
            this.el = this.createElement('div', 'editor', 'lore ipsum');
        });

        afterEach(function () {
            this.cleanupTest();
        });

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

        it('should set element data attr medium-element to true', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('data-medium-element')).toEqual('true');
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
    });
});
