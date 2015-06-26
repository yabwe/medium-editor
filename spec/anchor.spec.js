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
            var editor = this.newMediumEditor('.editor', {
                    buttonLabels: 'fontawesome'
                }),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            var button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);

            fireEvent(anchorExtension.getInput(), 'mouseup');
            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });

        it('should show the form on shortcut', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar'),
                code = 'K'.charCodeAt(0);

            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: code,
                ctrlKey: true,
                metaKey: true
            });

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });
    });

    describe('Link Creation', function () {
        it('should create a link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'test';
            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            // A trailing <br> may be added when insertHTML is used to add the link internally.
            expect(this.el.innerHTML.indexOf('<a href="test">lorem ipsum</a>')).toBe(0);
        });

        it('should create only one anchor tag when the user selects across a boundary', function () {
            this.el.innerHTML = 'Hello world, this <strong>will become a link, but this part won\'t.</strong>';

            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                selection = window.getSelection(),
                newRange = document.createRange(),
                button, input;

            selection.removeAllRanges();
            newRange.setStart(this.el.childNodes[0], 'Hello world, '.length);
            newRange.setEnd(this.el.childNodes[1].childNodes[0], 'will become a link'.length);
            selection.addRange(newRange);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'test';
            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            var suffix;
            if (this.el.innerHTML.indexOf('<br') !== -1) {
                suffix = '<br>';
            } else {
                suffix = '<strong></strong>';
            }
            expect(this.el.innerHTML).toBe('Hello world, <a href="test">this <strong>will become a link</strong></a>' +
                '<strong>, but this part won\'t.</strong>' + suffix);
        });

        it('should create a link when the user selects text within two paragraphs', function () {
            this.el.innerHTML = '<p>Hello <span>world</span>.</p>' +
                '<p><strong>Let us make a link</strong> across paragraphs.</p>';

            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                selection = window.getSelection(),
                newRange = document.createRange(),
                button, input;

            selection.removeAllRanges();
            newRange.setStart(this.el.querySelector('span'), 0);
            newRange.setEnd(this.el.querySelector('strong'), 1);
            selection.addRange(newRange);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'test';
            fireEvent(input, 'keyup', {
                keyCode: Util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            var expectedHTML = '<p>Hello <a href="test"><span>world</span>.</a></p>';
            // Different browser's native createLink implement this differently.
            if (this.el.innerHTML.indexOf('<strong><a') !== -1) {
                expectedHTML += '<p><strong><a href="test">Let us make a link</a></strong> across paragraphs.</p>';
            } else {
                expectedHTML += '<p><a href="test"><strong>Let us make a link</strong></a> across paragraphs.</p>';
            }
            expect(this.el.innerHTML).toBe(expectedHTML);
        });

        it('shouldn\'t create a link when user presses enter without value', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
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
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContents(editor.elements[0]);
            save = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
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
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                button,
                cancel,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            cancel = anchorExtension.getForm().querySelector('a.medium-editor-toolbar-close');
            fireEvent(button, 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(cancel, 'click');
            expect(toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(anchorExtension.isDisplayed()).toBe(false);
        });

        it('should close the link form when user presses escape', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');
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
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(anchorExtension.isDisplayed()).toBe(true);
            expect(anchorExtension.showForm).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(11); // checkSelection delay
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('link');
            expect(document.execCommand).toHaveBeenCalled();
        });

    });

});
