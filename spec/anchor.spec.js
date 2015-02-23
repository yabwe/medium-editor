/*global MediumEditor, describe, it, expect, spyOn,
     afterEach, beforeEach, selectElementContents,
     jasmine, fireEvent, console, tearDown,
     selectElementContentsAndFire, xit */

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
            spyOn(MediumEditor.statics.AnchorExtension.prototype, 'showForm').and.callThrough();
            var button,
                editor = new MediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(editor.toolbarActions.style.display).toBe('none');
            expect(anchorExtension.isDisplayed()).toBe(true);
            expect(anchorExtension.showForm).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(11); // checkSelection delay
            button = editor.toolbar.querySelector('[data-action="createLink"]');
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
            button = editor.toolbar.querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
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
            button = editor.toolbar.querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = '';
            fireEvent(input, 'keyup', 13);
            expect(editor.elements[0].querySelector('a')).toBeNull();
        });
        it('should add http:// if need be and checkLinkFormat option is set to true', function () {
            var editor = new MediumEditor('.editor', {
                checkLinkFormat: true
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe('http://test.com/');
        });
        it('should not change protocol when a valid one is included', function () {
            var editor = new MediumEditor('.editor', {
                checkLinkFormat: true
            }),
                validUrl = 'mailto:test.com',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl);
        });
        it('should add target="_blank" when respective option is set to true', function () {
            var editor = new MediumEditor('.editor', {
                targetBlank: true
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });
        it('should create a button when user selects this option and presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = new MediumEditor('.editor', {
                anchorButton: true,
                anchorButtonClass: 'btn btn-default'
            }),
                save,
                input,
                button,
                link,
                opts,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContents(editor.elements[0]);
            save = editor.toolbar.querySelector('[data-action="createLink"]');
            fireEvent(save, 'click');

            input = anchorExtension.getInput();
            input.value = 'test';

            button = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-button');
            button.setAttribute('type', 'checkbox');
            button.checked = true;

            fireEvent(input, 'keyup', 13);
            opts = {
                url: 'test',
                target: '_self',
                buttonClass: 'btn btn-default'
            };
            expect(editor.createLink).toHaveBeenCalledWith(opts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.classList.contains('btn')).toBe(true);
            expect(link.classList.contains('btn-default')).toBe(true);
        });
    });

    describe('Cancel', function () {
        it('should close the link form when user clicks on cancel', function () {
            spyOn(MediumEditor.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = new MediumEditor('.editor'),
                button,
                cancel,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-action="createLink"]');
            cancel = anchorExtension.getForm().querySelector('a.medium-editor-toobar-close');
            fireEvent(button, 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(cancel, 'click');
            expect(editor.showAndUpdateToolbar).toHaveBeenCalled();
            expect(anchorExtension.isDisplayed()).toBe(false);
        });
    });

});
