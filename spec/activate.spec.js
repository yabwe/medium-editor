/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents, runs, waitsFor,
         tearDown */

describe('Activate/Deactivate TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    describe('Activate', function () {
        it('should init the toolbar and editor elements', function () {
            var editor = new MediumEditor('.editor');
            editor.deactivate();
            spyOn(MediumEditor.prototype, 'setup').and.callThrough();
            editor.activate();
            expect(editor.setup).toHaveBeenCalled();
        });
    });

    describe('Deactivate', function () {
        it('should remove mediumEditor elements from DOM', function () {
            var editor = new MediumEditor('.editor');
            expect(document.querySelector('.medium-editor-toolbar')).toBeTruthy();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeTruthy();
            editor.deactivate();
            expect(document.querySelector('.medium-editor-toolbar')).toBeFalsy();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeFalsy();
        });
    });
});
