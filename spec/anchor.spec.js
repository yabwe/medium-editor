/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, console, tearDown*/

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.clock().install();
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    describe('Click', function () {
        it('should display the anchor form when toolbar is visible', function () {
            spyOn(MediumEditor.prototype, 'showAnchorForm').and.callThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            expect(editor.toolbarActions.style.display).toBe('none');
            expect(editor.anchorForm.style.display).toBe('block');
            expect(editor.showAnchorForm).toHaveBeenCalled();
        });

        it('should display the toolbar actions when anchor form is visible', function () {
            spyOn(MediumEditor.prototype, 'showToolbarActions').and.callThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            editor.anchorForm.style.display = 'block';
            fireEvent(button, 'click');
            expect(editor.toolbarActions.style.display).toBe('block');
            expect(editor.anchorForm.style.display).toBe('none');
            expect(editor.showToolbarActions).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContents(editor.elements[0]);
            fireEvent(editor.elements[0], 'mouseup');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML, 'link');
            expect(document.execCommand).toHaveBeenCalled();
        });

    });

    describe('Link Creation', function () {
        it('should create a link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = new MediumEditor('.editor'),
                button,
                input;

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            input = editor.anchorForm.querySelector('input');
            input.value = 'test';
            fireEvent(input, 'keyup', 13);
            expect(editor.createLink).toHaveBeenCalled();
        });
        it('shouldn\'t create a link when user presses enter without value', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = new MediumEditor('.editor'),
                button,
                input;

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-element="a"]');
            fireEvent(button, 'click');
            input = editor.anchorForm.querySelector('input');
            input.value = '';
            fireEvent(input, 'keyup', 13);
            expect(editor.elements[0].querySelector('a')).toBeNull();
        });
        it('should add http:// if need be and checkLinkFormat option is set to true', function () {
            var editor = new MediumEditor('.editor', {
                checkLinkFormat: true
            }),
                input = editor.anchorForm.querySelector('input');
            selectElementContents(editor.elements[0]);
            input.value = 'test.com';
            editor.createLink(input);
            expect(editor.elements[0].querySelector('a').href).toBe('http://test.com/');
        });
        it('should not change protocol when a valid one is included', function () {
            var editor = new MediumEditor('.editor', {
                checkLinkFormat: true
            }),
                input = editor.anchorForm.querySelector('input'),
                validUrl = 'mailto:test.com';
            selectElementContents(editor.elements[0]);
            input.value = validUrl;
            editor.createLink(input);
            expect(editor.elements[0].querySelector('a').href).toBe(validUrl);
        });
        it('should add target="_blank" when respective option is set to true', function () {
            var editor = new MediumEditor('.editor', {
                targetBlank: true
            }),
                input = editor.anchorForm.querySelector('input');
            selectElementContents(editor.elements[0]);
            input.value = 'http://test.com';
            editor.createLink(input);
            expect(editor.elements[0].querySelector('a').target).toBe('_blank');
        });
    });

    describe('Cancel', function () {
        it('should close the link form when user clicks on cancel', function () {
            spyOn(MediumEditor.prototype, 'showToolbarActions').and.callThrough();
            var editor = new MediumEditor('.editor'),
                button,
                cancel;

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-element="a"]');
            cancel = editor.anchorForm.querySelector('a');
            fireEvent(button, 'click');
            expect(editor.anchorForm.style.display).toBe('block');
            fireEvent(cancel, 'click');
            expect(editor.showToolbarActions).toHaveBeenCalled();
            expect(editor.anchorForm.style.display).toBe('none');
        });
    });

});
