/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents, runs, waitsFor, i */

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
        it('should not show the toolbar on elements when option disableToolbar is set to true', function () {
            var editor = new MediumEditor('.editor', { disableToolbar: true });
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
            this.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'));

            expect(editor.elements.length).toEqual(2);
            expect(editor.toolbar.style.display).toBe('');
            selectElementContents(element);
            editor.checkSelection();
            expect(editor.toolbar.style.display).toBe('');
            // Remove the new element from the DOM
            this.body.removeChild(element);
        });

        it('should show the toolbar it it\'s text are selected even though one or more elements that has a data attr of disable-toolbar', function () {
            var value,
                flag,
                element = document.createElement('div'),
                editor = null;

            runs(function() {
                flag = false;
                element.className = 'editor';
                element.setAttribute('data-disable-toolbar', 'true');
                this.el.innerHTML = 'lorem ipsum';
                this.body.appendChild(element);
                editor = new MediumEditor(document.querySelectorAll('.editor'));
                expect(editor.elements.length).toEqual(2);
                expect(editor.toolbar.style.display).toBe('');
                selectElementContents(this.el);
                editor.checkSelection();
                setTimeout(function() {
                    flag = true;
                }, 500);
            });

            // Because the toolbar appear after 100ms, waits 150ms... 
            waitsFor(function() {
                value = value + 1; // value += 1 is not accepted by jslint (unused)
                return flag;
            }, 'The i value should be incremented', 500);

            runs(function() {
                expect(editor.toolbar.classList.contains('medium-editor-toolbar-active')).toBe(true);
                // Remove the new element from the DOM
                this.body.removeChild(element);
            });

        });

        it('should not try to toggle toolbar when option disabletoolbar is set to true', function () {
            var element = document.createElement('div'),
                editor = null;

            element.className = 'editor';
            this.el.innerHTML = 'lorem ipsum';
            this.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'), { disableToolbar: true });

            expect(editor.toolbar).toBe(undefined);

            selectElementContents(this.el);
            editor.checkSelection();

            // Remove the new element from the DOM
            this.body.removeChild(element);
        });
    });
});
