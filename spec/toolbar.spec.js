/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents, runs,
         fireEvent, waitsFor, tearDown, xit, jasmine,
         selectElementContentsAndFire */

describe('Toolbar TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    describe('Initialization', function () {
        it('should call the createToolbar method', function () {
            spyOn(MediumEditor.prototype, 'createToolbar').and.callThrough();
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
            expect(editor.toolbar.className).toMatch(/medium-editor-toolbar/);
            expect(document.querySelectorAll('.medium-editor-toolbar').length).toBe(1);
        });

        it('should call the onShowToolbar callback if set', function () {
            this.el.innerHTML = 'specOnShowToolbarTest';
            var editor = new MediumEditor('.editor');
            editor.onShowToolbar = function () {};
            spyOn(editor, 'onShowToolbar').and.callThrough();
            jasmine.clock().install();
            try {
                selectElementContentsAndFire(this.el);
                jasmine.clock().tick(51);
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                expect(editor.onShowToolbar).toHaveBeenCalled();
            } finally {
                jasmine.clock().uninstall();
            }
        });

        it('should not create an anchor form element if disableAnchorForm is set to true', function () {
            expect(document.querySelectorAll('.medium-editor-toolbar-form-anchor').length).toBe(0);
            var editor = new MediumEditor('.editor', {
                disableAnchorForm: true
            });
            expect(editor.toolbar.querySelectorAll('.medium-editor-toolbar-form-anchor').length).toBe(0);
        });

        it('should not call MediumEditor\'s toolbarFormAnchor method if disableAnchorForm is set to true', function () {
            spyOn(MediumEditor.prototype, 'toolbarFormAnchor').and.callThrough();
            var editor = new MediumEditor('.editor', {
                disableAnchorForm: true
            });
            expect(editor.toolbarFormAnchor).not.toHaveBeenCalled();
        });
    });

    describe('Toolbars', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should enable bold button in toolbar when bold text is selected', function () {
            var editor = null,
                newElement = document.createElement('div');

            newElement.id = 'editor-for-toolbar-test';
            newElement.innerHTML = 'lorem ipsum <b><div id="bold_dolorOne">dolor</div></b>';
            document.body.appendChild(newElement);

            editor = new MediumEditor(document.getElementById('editor-for-toolbar-test'), { delay: 0 });
            selectElementContentsAndFire(document.getElementById('bold_dolorOne'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('should not activate buttons in toolbar when stopSelectionUpdates has been called, but should activate buttons after startSelectionUpdates is called', function () {
            var editor = null;

            this.el.innerHTML = 'lorem ipsum <b><div id="bold_dolorTwo">dolor</div></b>';

            editor = new MediumEditor(document.querySelectorAll('.editor'), { delay: 0 });

            editor.stopSelectionUpdates();
            selectElementContentsAndFire(document.getElementById('bold_dolorTwo'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(false);

            editor.startSelectionUpdates();
            selectElementContentsAndFire(document.getElementById('bold_dolorTwo'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('should call onHideToolbar when toolbar is hidden', function () {
            var editor = new MediumEditor('.editor');
            editor.toolbar.classList.add('medium-editor-toolbar-active');
            editor.onHideToolbar = function () {};

            spyOn(editor, 'onHideToolbar').and.callThrough();

            fireEvent(editor.elements[0], 'focus');
            fireEvent(editor.elements[0], 'blur');

            expect(editor.onHideToolbar).toHaveBeenCalled();
        });

        it('should hide the toolbar for one medium-editor instance when another medium-editor instance shows its toolbar', function () {
            var editorOne,
                editorTwo,
                elTwo = document.createElement('div');

            elTwo.id = 'editor-div-two';
            document.body.appendChild(elTwo);

            this.el.innerHTML = '<span id="editor-span-1">lorem ipsum</span>';
            elTwo.innerHTML = '<span id="editor-span-2">lorem ipsum</span>';

            editorOne = new MediumEditor('.editor', { staticToolbar: true });
            editorTwo = new MediumEditor(document.getElementById('editor-div-two'), { staticToolbar: true });

            selectElementContentsAndFire(document.getElementById('editor-span-1'));

            jasmine.clock().tick(1);

            expect(editorOne.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
            expect(editorTwo.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);

            selectElementContentsAndFire(document.getElementById('editor-span-2'));
            fireEvent(editorTwo.elements[0], 'focus');

            jasmine.clock().tick(1);

            expect(editorOne.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(editorTwo.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
        });
    });

    describe('Deactive', function () {
        it('should remove select event from elements', function () {
            spyOn(this.el, 'addEventListener');
            var editor = new MediumEditor('.editor');
            expect(this.el.addEventListener).toHaveBeenCalled();
            spyOn(this.el, 'removeEventListener');
            editor.deactivate();
            expect(this.el.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('Disable', function () {

        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should not show the toolbar on elements when option disableToolbar is set to true', function () {
            var editor = new MediumEditor('.editor', {
                disableToolbar: true
            });
            expect(editor.options.disableToolbar).toEqual(true);
            expect(document.getElementsByClassName('medium-editor-toolbar-actions').length).toEqual(0);
        });

        it('should not create the toolbar if all elements has data attr of disable-toolbar', function () {
            this.el.setAttribute('data-disable-toolbar', 'true');
            var editor = new MediumEditor('.editor');
            expect(document.getElementsByClassName('medium-editor-toolbar-actions').length).toEqual(0);
            expect(editor.toolbar).toBeUndefined();
        });

        it('should not show the toolbar when one element has a data attr of disable-toolbar set and text is selected', function () {
            var element = document.createElement('div'),
                editor = null;

            element.className = 'editor';
            element.setAttribute('data-disable-toolbar', 'true');
            element.innerHTML = 'lorem ipsum';
            document.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'));

            expect(editor.elements.length).toEqual(2);
            expect(editor.toolbar.style.display).toBe('');
            selectElementContentsAndFire(element);
            jasmine.clock().tick(51);

            expect(editor.toolbar.style.display).toBe('');
            // Remove the new element from the DOM
            document.body.removeChild(element);
        });

        it('should not display toolbar when selected text within an element with contenteditable="false"', function () {
            var element = document.createElement('div'),
                editor = null;

            element.className = 'editor';
            this.el.innerHTML = 'lorem ipsum <div id="cef_el" contenteditable="false">dolor</div>';
            document.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'), { delay: 0 });

            selectElementContentsAndFire(document.getElementById('cef_el'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(false);
        });

        // jasmine 2.0 changed async tests, runs no longer exists
        xit('should show the toolbar if it\'s text are selected even though one or more elements that has a data attr of disable-toolbar', function () {
            var value,
                flag,
                element = document.createElement('div'),
                editor = null;

            runs(function () {
                flag = false;
                element.className = 'editor';
                element.setAttribute('data-disable-toolbar', 'true');
                this.el.innerHTML = 'lorem ipsum';
                document.body.appendChild(element);
                editor = new MediumEditor(document.querySelectorAll('.editor'));
                expect(editor.elements.length).toEqual(2);
                expect(editor.toolbar.style.display).toBe('');
                selectElementContents(this.el);
                editor.checkSelection();
                setTimeout(function () {
                    flag = true;
                }, 500);
            });

            // Because the toolbar appear after 100ms, waits 150ms...
            waitsFor(function () {
                value = value + 1; // value += 1 is not accepted by jslint (unused)
                return flag;
            }, 'The i value should be incremented', 500);

            runs(function () {
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                // Remove the new element from the DOM
                document.body.removeChild(element);
            });

        });

        // jasmine 2.0 changed async tests, runs no longer exists
        xit('should not try to toggle toolbar when option disabletoolbar is set to true', function () {
            var element = document.createElement('div'),
                editor = null;

            element.className = 'editor';
            this.el.innerHTML = 'lorem ipsum';
            document.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'), {
                disableToolbar: true
            });

            expect(editor.toolbar).toBe(undefined);

            selectElementContents(this.el);
            editor.checkSelection();

            // Remove the new element from the DOM
            document.body.removeChild(element);
        });

    });
});
