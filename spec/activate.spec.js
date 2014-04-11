/*global MediumEditor, describe, it, expect, spyOn, jasmine, fireEvent,
         afterEach, beforeEach, selectElementContents, runs, waitsFor,
         tearDown */

describe('Activate/Deactivate TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.textContent = 'lore ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    it('should toggle the isActive property', function () {
        var editor = new MediumEditor('.editor');
        editor.deactivate();
        expect(editor.isActive).toBe(false);
        editor.activate();
        expect(editor.isActive).toBe(true);
        editor.deactivate();
        expect(editor.isActive).toBe(false);
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

        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should remove mediumEditor elements from DOM', function () {
            var editor = new MediumEditor('.editor');
            expect(document.querySelector('.medium-editor-toolbar')).toBeTruthy();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeTruthy();
            editor.deactivate();
            expect(document.querySelector('.medium-editor-toolbar')).toBeFalsy();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeFalsy();
        });

        // regression test for https://github.com/daviferreira/medium-editor/issues/197
        it('should not crash when deactivated immediately after a mouse click', function () {
            var editor = new MediumEditor('.editor');
            // selected some content and let the toolbar appear
            selectElementContents(editor.elements[0]);
            jasmine.clock().tick(501);

            // fire a mouse up somewhere else (i.e. a button which click handler could have called deactivate() )
            fireEvent(document.documentElement, 'mouseup');
            editor.deactivate();

            jasmine.clock().tick(501);
        });
    });
});
