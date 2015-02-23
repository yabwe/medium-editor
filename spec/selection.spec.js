/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, fireEvent, waits,
         jasmine, selectElementContents, tearDown,
         selectElementContentsAndFire, console */

describe('Selection TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
        jasmine.clock().install();
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    describe('Saving Selection', function () {
        it('should be applicable if html changes but text does not', function () {
            this.el.innerHTML = 'lorem <i>ipsum</i> dolor';

            var editor = new MediumEditor('.editor', {
                buttons: ['italic', 'underline', 'strikethrough']
            }),
                button,
                regex;

            // Save selection around <i> tag
            selectElementContents(editor.elements[0].querySelector('i'));
            editor.saveSelection();

            // Underline entire element
            selectElementContents(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-action="underline"]');
            fireEvent(button, 'click');

            // Restore selection back to <i> tag and add a <strike> tag
            regex = new RegExp("^<u>lorem (<i><strike>|<strike><i>)ipsum(</i></strike>|</strike></i>) dolor</u>$");
            editor.restoreSelection();
            button = editor.toolbar.querySelector('[data-action="strikethrough"]');
            fireEvent(button, 'click');
            expect(regex.test(editor.elements[0].innerHTML)).toBe(true);
        });
    });

    describe('CheckSelection', function () {
        it('should check for selection on mouseup event', function () {
            spyOn(MediumEditor.prototype, 'checkSelection');
            var editor = new MediumEditor('.editor');
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.clock().tick(11); // checkSelection delay
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should check for selection on keyup', function () {
            spyOn(MediumEditor.prototype, 'checkSelection');
            var editor = new MediumEditor('.editor');
            fireEvent(editor.elements[0], 'keyup');
            jasmine.clock().tick(11); // checkSelection delay
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should do nothing when keepToolbarAlive is true', function () {
            spyOn(window, 'getSelection').and.callThrough();
            var editor = new MediumEditor('.editor');
            editor.keepToolbarAlive = true;
            editor.checkSelection();
            expect(window.getSelection).not.toHaveBeenCalled();
        });

        describe('When keepToolbarAlive is false', function () {
            it('should hide the toolbar if selection is empty', function () {
                spyOn(MediumEditor.prototype, 'setToolbarPosition').and.callThrough();
                spyOn(MediumEditor.prototype, 'setToolbarButtonStates').and.callThrough();
                spyOn(MediumEditor.prototype, 'showAndUpdateToolbar').and.callThrough();
                var editor = new MediumEditor('.editor');
                editor.toolbar.style.display = 'block';
                editor.toolbar.classList.add('medium-editor-toolbar-active');
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                editor.checkSelection();
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
                expect(editor.setToolbarPosition).not.toHaveBeenCalled();
                expect(editor.setToolbarButtonStates).not.toHaveBeenCalled();
                expect(editor.showAndUpdateToolbar).not.toHaveBeenCalled();
            });

            it('should hide the toolbar when selecting multiple paragraphs and the allowMultiParagraphSelection option is false', function () {
                this.el.innerHTML = '<p id="p-one">lorem ipsum</p><p id="p-two">lorem ipsum</p>';
                var editor = new MediumEditor('.editor', {
                    allowMultiParagraphSelection: false
                });
                selectElementContentsAndFire(document.getElementById('p-one'));
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                selectElementContentsAndFire(this.el);
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
            });

            it('should show the toolbar when something is selected', function () {
                var editor = new MediumEditor('.editor');
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
                selectElementContentsAndFire(this.el);
                jasmine.clock().tick(501);
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
            });

            it('should update toolbar position and button states when something is selected', function () {
                spyOn(MediumEditor.prototype, 'setToolbarPosition').and.callThrough();
                spyOn(MediumEditor.prototype, 'setToolbarButtonStates').and.callThrough();
                spyOn(MediumEditor.prototype, 'showAndUpdateToolbar').and.callThrough();
                var editor = new MediumEditor('.editor');
                selectElementContentsAndFire(this.el);
                jasmine.clock().tick(51);
                expect(editor.setToolbarPosition).toHaveBeenCalled();
                expect(editor.setToolbarButtonStates).toHaveBeenCalled();
                expect(editor.showAndUpdateToolbar).toHaveBeenCalled();
            });

            it('should update button states when updateOnEmptySelection is true and the selection is empty', function () {
                spyOn(MediumEditor.prototype, 'setToolbarButtonStates').and.callThrough();

                var editor = new MediumEditor('.editor', {
                    updateOnEmptySelection: true
                });

                selectElementContentsAndFire(this.el, { collapse: 'toStart' });
                jasmine.clock().tick(51);

                expect(editor.setToolbarButtonStates).toHaveBeenCalled();
            });
        });
    });

});
