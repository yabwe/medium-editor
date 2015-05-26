/*global MediumEditor, describe, it, expect, spyOn,
     afterEach, beforeEach, selectElementContents,
     jasmine, fireEvent, Util, setupTestHelpers,
     selectElementContentsAndFire, AnchorForm */

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Anchor Form', function () {
        it('should not hide the toolbar when mouseup fires inside the anchor form', function () {
            var editor = this.newMediumEditor('.editor', { buttonLabels: 'fontawesome' }),
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            var button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');

            expect(editor.toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);

            fireEvent(anchorExtension.getInput(), 'mouseup');
            expect(editor.toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });

        it('should show the form on shortcut', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                code = 'k'.charCodeAt(0);

            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: code,
                ctrlKey: true,
                metaKey: true
            });

            expect(editor.toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });
    });

    describe('Link Creation', function () {
        it('should create a link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                button, input;

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'test';
            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            expect(this.el.innerHTML).toBe('<a href="test">lorem ipsum</a>');
        });

        it('shouldn\'t create a link when user presses enter without value', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                button,
                input;

            selectElementContents(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = '';
            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(editor.elements[0].querySelector('a')).toBeNull();
        });
        it('should add http:// if need be and linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe('http://test.com/');
        });
        it('should add http:// if need be and deprecated checkLinkFormat option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                checkLinkFormat: true // deprecated
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe('http://test.com/');
        });
        it('should not change protocol when a valid one is included', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                validUrl = 'mailto:test.com',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl);
        });
        it('should add target="_blank" when "open in a new window" checkbox is checked', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    targetCheckbox: true
                }
            }),
                anchorExtension = editor.getExtensionByName('anchor'),
                targetCheckbox,
                link;

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            expect(anchorExtension.isDisplayed()).toBe(true);
            targetCheckbox = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
            expect().not.toBeNull(targetCheckbox);
            targetCheckbox.checked = true;
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            expect(anchorExtension.isDisplayed()).toBe(false);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });
        it('should add target="_blank" when "open in a new window" checkbox is enabled via deprecated anchorTarget option and checked', function () {
            var editor = this.newMediumEditor('.editor', {
                anchorTarget: true // deprecated
            }),
                anchorExtension = editor.getExtensionByName('anchor'),
                targetCheckbox,
                link;

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            expect(anchorExtension.isDisplayed()).toBe(true);
            targetCheckbox = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
            expect().not.toBeNull(targetCheckbox);
            targetCheckbox.checked = true;
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            expect(anchorExtension.isDisplayed()).toBe(false);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });
        it('should add target="_blank" when respective option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                targetBlank: true
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });
        it('should create a button when user selects this option and presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    customClassOption: 'btn btn-default'
                }
            }),
                save,
                input,
                button,
                link,
                opts,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContents(editor.elements[0]);
            save = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(save, 'click');

            input = anchorExtension.getInput();
            input.value = 'test';

            button = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-button');
            button.setAttribute('type', 'checkbox');
            button.checked = true;

            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
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
        it('should create a button when deprecated anchorButton + anchorButtonClass options are used', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
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
            save = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(save, 'click');

            input = anchorExtension.getInput();
            input.value = 'test';

            button = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-button');
            button.setAttribute('type', 'checkbox');
            button.checked = true;

            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
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
            spyOn(MediumEditor.statics.Toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                button,
                cancel,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            cancel = anchorExtension.getForm().querySelector('a.medium-editor-toolbar-close');
            fireEvent(button, 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(cancel, 'click');
            expect(editor.toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(anchorExtension.isDisplayed()).toBe(false);
        });

        it('should close the link form when user presses escape', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(anchorExtension.getInput(), 'keyup', {
                keyCode: Util.keyCode.ESCAPE
            });
            expect(anchorExtension.isDisplayed()).toBe(false);
        });
    });

    describe('Click', function () {
        it('should display the anchor form when toolbar is visible', function () {
            spyOn(AnchorForm.prototype, 'showForm').and.callThrough();
            var button,
                editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(editor.toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(anchorExtension.isDisplayed()).toBe(true);
            expect(anchorExtension.showForm).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(11); // checkSelection delay
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('link');
            expect(document.execCommand).toHaveBeenCalled();
        });

    });

});
