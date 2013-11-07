/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, fireEvent, waits,
         jasmine, selectElementContents*/

describe('Selection TestCase', function () {
    'use strict';

    beforeEach(function () {
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

    describe('CheckSelection', function () {
        it('should check for selection on mouseup event', function () {
            jasmine.Clock.useMock();
            spyOn(MediumEditor.prototype, 'checkSelection');
            var editor = new MediumEditor('.editor');
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.Clock.tick(1);
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should check for selection on keyup', function () {
            jasmine.Clock.useMock();
            spyOn(MediumEditor.prototype, 'checkSelection');
            var editor = new MediumEditor('.editor');
            fireEvent(editor.elements[0], 'keyup');
            jasmine.Clock.tick(1);
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should do nothing when keepToolbarAlive is true', function () {
            spyOn(window, 'getSelection').andCallThrough();
            var editor = new MediumEditor('.editor');
            editor.keepToolbarAlive = true;
            editor.checkSelection();
            expect(window.getSelection).not.toHaveBeenCalled();
        });

        describe('When keepToolbarAlive is false', function () {
            it('should hide the toolbar if selection is empty', function () {
                spyOn(MediumEditor.prototype, 'setToolbarPosition').andCallThrough();
                spyOn(MediumEditor.prototype, 'setToolbarButtonStates').andCallThrough();
                spyOn(MediumEditor.prototype, 'showToolbarActions').andCallThrough();
                var editor = new MediumEditor('.editor');
                editor.toolbar.style.display = 'block';
                editor.toolbar.classList.add('medium-editor-toolbar-active');
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                editor.checkSelection();
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
                expect(editor.setToolbarPosition).not.toHaveBeenCalled();
                expect(editor.setToolbarButtonStates).not.toHaveBeenCalled();
                expect(editor.showToolbarActions).not.toHaveBeenCalled();
            });

            it('should show the toolbar when something is selected', function () {
                var editor = new MediumEditor('.editor');
                jasmine.Clock.useMock();
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
                selectElementContents(this.el);
                editor.checkSelection();
                jasmine.Clock.tick(501);
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
            });

            it('should update toolbar position and button states when something is selected', function () {
                spyOn(MediumEditor.prototype, 'setToolbarPosition').andCallThrough();
                spyOn(MediumEditor.prototype, 'setToolbarButtonStates').andCallThrough();
                spyOn(MediumEditor.prototype, 'showToolbarActions').andCallThrough();
                var editor = new MediumEditor('.editor');
                selectElementContents(this.el);
                editor.checkSelection();
                expect(editor.setToolbarPosition).toHaveBeenCalled();
                expect(editor.setToolbarButtonStates).toHaveBeenCalled();
                expect(editor.showToolbarActions).toHaveBeenCalled();
            });
        });
    });

});
