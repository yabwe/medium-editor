/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach*/

describe('Toolbar TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.body.appendChild(this.el);
    });

    afterEach(function () {
        var elements = document.querySelectorAll('.medium-editor-toolbar'),
            i;
        for (i = 0; i < elements.length; i += 1) {
            this.body.removeChild(elements[i]);
        }
        this.body.removeChild(this.el);
    });

    describe('Initialization', function () {
        it('should call the createToolbar method', function () {
            spyOn(MediumEditor.prototype, 'createToolbar').andCallThrough();
            var editor = new MediumEditor('.editor');
            expect(editor.createToolbar).toHaveBeenCalled();
        });

        it('should set keepToolbarAlive to false', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.keepToolbarAlive).toBe(false);
        });

        it('should create a new element for the editor toolbar', function () {
            expect(document.querySelectorAll('.medium-editor-toolbar').length).toBe(0);
            var editor = new MediumEditor('.editor');
            expect(editor.toolbar.className).toBe('medium-editor-toolbar');
            expect(document.querySelectorAll('.medium-editor-toolbar').length).toBe(1);
        });
    });
});
