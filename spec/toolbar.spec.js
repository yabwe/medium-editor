/*global MediumEditor, describe, it, expect, spyOn,
    afterEach, beforeEach, selectElementContents,
    fireEvent, tearDown, jasmine, selectElementContentsAndFire,
    placeCursorInsideElement, Toolbar */

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
            spyOn(MediumEditor.statics.Toolbar.prototype, 'createToolbar').and.callThrough();
            var editor = new MediumEditor('.editor');
            expect(editor.toolbar).not.toBeUndefined();
            expect(editor.toolbar.createToolbar).toHaveBeenCalled();
        });

        it('should create a new element for the editor toolbar', function () {
            expect(document.querySelectorAll('.medium-editor-toolbar').length).toBe(0);
            var editor = new MediumEditor('.editor'),
                toolbar = editor.toolbar.getToolbarElement();
            expect(toolbar.className).toMatch(/medium-editor-toolbar/);
            expect(document.querySelectorAll('.medium-editor-toolbar').length).toBe(1);
        });

        it('should not create an anchor form element or anchor extension if anchor is not passed as a button', function () {
            expect(document.querySelectorAll('.medium-editor-toolbar-form-anchor').length).toBe(0);
            var editor = new MediumEditor('.editor', {
                buttons: ['bold', 'italic', 'underline']
            });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('.medium-editor-toolbar-form-anchor').length).toBe(0);
            expect(editor.getExtensionByName('anchor')).toBeUndefined();
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
            expect(editor.toolbar.getToolbarElement().querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('should not activate buttons in toolbar when stopSelectionUpdates has been called, but should activate buttons after startSelectionUpdates is called', function () {
            var editor = null;

            this.el.innerHTML = 'lorem ipsum <b><div id="bold_dolorTwo">dolor</div></b>';

            editor = new MediumEditor(document.querySelectorAll('.editor'), { delay: 0 });

            editor.stopSelectionUpdates();
            selectElementContentsAndFire(document.getElementById('bold_dolorTwo'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.getToolbarElement().querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(false);

            editor.startSelectionUpdates();
            selectElementContentsAndFire(document.getElementById('bold_dolorTwo'));

            jasmine.clock().tick(51);
            expect(editor.toolbar.getToolbarElement().querySelector('button[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('should call onShowToolbar when toolbar is shwon and onHideToolbar when toolbar is hidden', function () {
            var editor,
                temp = {
                    onShow: function () {},
                    onHide: function () {}
                };

            spyOn(temp, 'onShow').and.callThrough();
            spyOn(temp, 'onHide').and.callThrough();

            this.el.innerHTML = 'specOnShowToolbarTest';

            editor = new MediumEditor('.editor', {
                onShowToolbar: temp.onShow,
                onHideToolbar: temp.onHide
            });

            selectElementContentsAndFire(this.el);

            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            expect(temp.onShow).toHaveBeenCalled();
            expect(temp.onHide).not.toHaveBeenCalled();

            // Remove selection and call check selection, which should make the toolbar be hidden
            jasmine.clock().tick(1);
            window.getSelection().removeAllRanges();
            editor.checkSelection();

            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(temp.onHide).toHaveBeenCalled();
        });
    });

    describe('Static Toolbars', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should let the user click outside of the selected area to leave', function () {
            this.el.innerHTML = 'This is my text<span>and this is some other text</span>';
            var editor = new MediumEditor('.editor', {
                staticToolbar: true,
                standardizeSelectionStart: true,
                updateOnEmptySelection: true
            });

            placeCursorInsideElement(this.el.firstChild, 'This is my text'.length);
            fireEvent(document.documentElement, 'mousedown', {
                target: document.body
            });
            fireEvent(this.el, 'blur', {
                relatedTarget: document.createElement('div')
            });
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(window.getSelection().anchorNode).toBe(null);
        });

        it('should not throw an error when check selection is called when there is an empty selection', function () {
            this.el.innerHTML = '<b>lorem ipsum</b>';
            var editor = new MediumEditor('.editor', {
                staticToolbar: true,
                stickyToolbar: true
            });

            selectElementContents(this.el.querySelector('b'));
            window.getSelection().removeAllRanges();
            editor.checkSelection();
            jasmine.clock().tick(1); // checkSelection delay
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('should update toolbar position when user clicks on medium editor element', function () {
            var editor = new MediumEditor('.editor', {
                staticToolbar: true
            });
            spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition').and.callThrough();
            fireEvent(editor.elements[0], 'click');
            jasmine.clock().tick(1); // checkSelection delay
            expect(editor.toolbar.setToolbarPosition).toHaveBeenCalled();
        });

        it('should show and update toolbar buttons when staticToolbar and updateOnEmptySelection options are set to true', function () {
            this.el.innerHTML = '<b>lorem ipsum</b>';
            var editor = new MediumEditor('.editor', {
                staticToolbar: true,
                stickyToolbar: true,
                updateOnEmptySelection: true
            });

            selectElementContents(this.el.querySelector('b'));
            window.getSelection().getRangeAt(0).collapse(false);
            editor.checkSelection();
            jasmine.clock().tick(1); // checkSelection delay
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]').classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('should be hidden for one medium-editor instance when another medium-editor instance shows its toolbar', function () {
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

            jasmine.clock().tick(1); // checkSelection delay

            expect(editorOne.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            expect(editorTwo.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);

            selectElementContentsAndFire(document.getElementById('editor-span-2'));
            fireEvent(elTwo, 'focus', {
                target: elTwo,
                relatedTarget: this.el
            });

            jasmine.clock().tick(1); // checkSelection delay

            expect(editorOne.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
            expect(editorTwo.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
        });
    });

    describe('Deactive', function () {
        it('should remove select event from elements', function () {
            spyOn(this.el, 'addEventListener');
            var editor = new MediumEditor('.editor');
            expect(this.el.addEventListener).toHaveBeenCalled();
            spyOn(this.el, 'removeEventListener');
            editor.destroy();
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
            expect(editor.toolbar.getToolbarElement().style.display).toBe('');
            selectElementContentsAndFire(element);
            jasmine.clock().tick(51);

            expect(editor.toolbar.getToolbarElement().style.display).toBe('');
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
            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(false);
        });

        it('should show the toolbar if it\'s text are selected even though one or more elements that has a data attr of disable-toolbar', function () {
            var editor,
                element = document.createElement('div');

            element.className = 'editor';
            element.setAttribute('data-disable-toolbar', 'true');
            this.el.innerHTML = 'lorem ipsum';
            document.body.appendChild(element);
            editor = new MediumEditor(document.querySelectorAll('.editor'));
            expect(editor.elements.length).toEqual(3);
            expect(editor.toolbar.getToolbarElement().style.display).toBe('');
            selectElementContents(this.el);
            editor.checkSelection();

            expect(editor.toolbar.getToolbarElement().classList.contains('medium-editor-toolbar-active')).toBe(true);
            // Remove the new element from the DOM
            document.body.removeChild(element);

        });

        it('should not try to toggle toolbar when option disabletoolbar is set to true', function () {
            var element = document.createElement('div'),
                editor = null;

            element.className = 'editor';
            this.el.innerHTML = 'lorem ipsum';
            document.body.appendChild(element);

            editor = new MediumEditor(document.querySelectorAll('.editor'), {
                disableToolbar: true
            });

            expect(editor.toolbar).toBeUndefined();

            selectElementContents(this.el);
            editor.checkSelection();

            // Remove the new element from the DOM
            document.body.removeChild(element);
        });
    });

    describe('Scroll', function () {
        it('should position toolbar if shown', function () {
            var editor = new MediumEditor('.editor');
            spyOn(Toolbar.prototype, 'positionToolbarIfShown');
            fireEvent(window, 'scroll');
            expect(editor.toolbar.positionToolbarIfShown).toHaveBeenCalled();
        });
    });
});
