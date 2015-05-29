/*global MediumEditor, describe, it, expect, spyOn, AnchorForm,
         afterEach, beforeEach, jasmine, fireEvent, setupTestHelpers,
         selectElementContentsAndFire, isOldIE, isIE */

describe('Buttons TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Button click', function () {
        it('should set active class on click', function () {
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(button.className).toContain('medium-editor-button-active');
        });

        it('should check for selection when selection is undefined', function () {
            spyOn(MediumEditor.prototype, 'checkSelection');
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should remove active class if button has it', function () {
            this.el.innerHTML = '<b>lorem ipsum</b>';
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(11); // checkSelection delay
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            expect(button.className).toContain('medium-editor-button-active');
            fireEvent(button, 'click');
            expect(button.className).not.toContain('medium-editor-button-active');
        });

        it('should execute the button action', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.execAction).toHaveBeenCalledWith('bold');
        });

        it('should execute the button action on shortcut', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor'),
                code = 'b'.charCodeAt(0);
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: code,
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).toHaveBeenCalled();
        });

        it('should not execute the button action when shift key is pressed', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor'),
                code = 'b'.charCodeAt(0);
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: code,
                ctrlKey: true,
                metaKey: true,
                shiftKey: true
            });
            expect(editor.execAction).not.toHaveBeenCalled();
        });
    });

    describe('Buttons with various labels', function () {
        var defaultLabels = {},
            fontAwesomeLabels = {},
            customLabels = {},
            allButtons = [],
            buttonsData = MediumEditor.statics.ButtonsData,
            currButton,
            tempEl;

        Object.keys(buttonsData).forEach(function (buttonName) {
            if (buttonName !== 'header1' && buttonName !== 'header2') {
                allButtons.push(buttonName);
                currButton = buttonsData[buttonName];
                // If the labels contain HTML entities, we need to escape them
                tempEl = document.createElement('div');

                // Default Labels
                tempEl.innerHTML = currButton.contentDefault;
                defaultLabels[buttonName] = {
                    action: currButton.action,
                    label: tempEl.innerHTML
                };

                // fontawesome labels
                tempEl.innerHTML = currButton.contentFA;
                fontAwesomeLabels[buttonName] = tempEl.innerHTML;

                // custom labels (using aria label as a test)
                customLabels[buttonName] = currButton.aria;
            }
        });

        it('should have aria-label and title attributes set', function () {
            var button,
                editor = this.newMediumEditor('.editor', {
                    buttons: allButtons
                });
            Object.keys(customLabels).forEach(function (buttonName) {
                button = editor.toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                expect(button.getAttribute('aria-label')).toBe(customLabels[buttonName]);
                expect(button.getAttribute('title')).toBe(customLabels[buttonName]);
            });
        });

        it('should contain default content if no custom labels are provided', function () {
            var button,
                editor = this.newMediumEditor('.editor', {
                    buttons: allButtons
                });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);

            Object.keys(defaultLabels).forEach(function (buttonName) {
                button = editor.toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                expect(button.innerHTML).toBe(defaultLabels[buttonName].label);
            });
        });

        it('should contain fontawesome labels and execute the button action when clicked', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var action,
                button,
                editor = this.newMediumEditor('.editor', {
                    buttons: allButtons,
                    buttonLabels: 'fontawesome'
                });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);

            Object.keys(fontAwesomeLabels).forEach(function (buttonName) {
                action = defaultLabels[buttonName].action;
                button = editor.toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                fireEvent(button, 'click');
                expect(editor.execAction).toHaveBeenCalledWith(action);
                expect(button.innerHTML).toBe(fontAwesomeLabels[buttonName]);
            });
        });

        it('should contain custom labels and execute the button action when clicked', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var action,
                button,
                editor = this.newMediumEditor('.editor', {
                    buttons: allButtons,
                    buttonLabels: customLabels
                });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);

            Object.keys(customLabels).forEach(function (buttonName) {
                action = defaultLabels[buttonName].action;
                button = editor.toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                fireEvent(button, 'click');
                expect(editor.execAction).toHaveBeenCalledWith(action);
                expect(button.innerHTML).toBe(customLabels[buttonName]);
            });
        });
    });

    describe('AppendEl', function () {
        it('should call the document.execCommand method when button action is append', function () {
            spyOn(document, 'execCommand');
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            if (isIE()) {
                expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h3>');
            } else {
                expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h3');
            }
        });

        it('should create an h3 element when header1 is clicked', function () {
            this.el.innerHTML = '<p><b>lorem ipsum</b></p>';
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            // depending on the styling you have,
            // IE might strip the <b> out when it applies the H3 here.
            // so, make the <b> match optional in the output:
            expect(this.el.innerHTML).toMatch(/<h3>(<b>)?lorem ipsum(<\/b>)?<\/h3>/);
        });

        it('should get back to a p element if parent element is the same as the action', function () {
            this.el.innerHTML = '<h3><b>lorem ipsum</b></h3>';
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0].firstChild);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<p><b>lorem ipsum</b></p>');
        });
    });

    describe('First and Last', function () {
        it('should add a special class to the first and last buttons', function () {
            var editor = this.newMediumEditor('.editor'),
                buttons = editor.toolbar.getToolbarElement().querySelectorAll('button');
            expect(buttons[0].className).toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-last');
            expect(buttons[buttons.length - 1].className).toContain('medium-editor-button-last');
        });
    });

    describe('Bold', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['bold']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');

            this.el.innerHTML = '<b>lorem ipsum</b>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<strong>lorem ipsum</strong>';
            selectElementContentsAndFire(editor.elements[0], { eventToFire: 'mouseup' });
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('button should be active if the selection is bold and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['bold']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');

            this.el.innerHTML = '<b><i><u>lorem ipsum</u></i></b>';
            selectElementContentsAndFire(editor.elements[0].querySelector('u'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is bold', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['bold']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]');

            this.el.innerHTML = '<p><span id="bold-span" style="font-weight: bold">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('bold-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            // style="font-weight: bold" prevents IE9+10 from doing anything when 'bold' is triggered
            // but it should work in other browsers
            expect(!isOldIE() && button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(!isOldIE() && (this.el.innerHTML !== '<p><span id="bold-span">lorem ipsum</span></p>')).toBe(false);
        });
    });

    describe('Italics', function () {
        it('should call the execCommand for native actions', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="italic"]');
            fireEvent(button, 'click');
            expect(document.execCommand).toHaveBeenCalled();
            // IE won't generate an `<i>` tag here. it generates an `<em>`:
            expect(this.el.innerHTML).toMatch(/(<i>|<em>)lorem ipsum(<\/i>|<\/em>)/);
        });

        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['italic']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="italic"]');

            this.el.innerHTML = '<i>lorem ipsum</i>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<em>lorem ipsum</em>';
            selectElementContentsAndFire(editor.elements[0], { eventToFire: 'mouseup' });
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('button should be active if the selection is italic and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['italic']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="italic"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');

            this.el.innerHTML = '<i><b><u>lorem ipsum</u></b></i>';
            selectElementContentsAndFire(editor.elements[0].querySelector('u'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is italic', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['italic']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="italic"]');

            this.el.innerHTML = '<p><span id="italic-span" style="font-style: italic">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('italic-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            // style="font-style: italic" prevents IE9+10 from doing anything when 'italic' is triggered
            // but it should work in other browsers
            expect(!isOldIE() && button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(!isOldIE() && (this.el.innerHTML !== '<p><span id="italic-span">lorem ipsum</span></p>')).toBe(false);
        });
    });

    describe('Underline', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['underline']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="underline"]');

            this.el.innerHTML = '<u>lorem ipsum</u>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active if the selection is underlined and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['underline']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="underline"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');

            this.el.innerHTML = '<u><b><i>lorem ipsum</i></b></u>';
            selectElementContentsAndFire(editor.elements[0].querySelector('i'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is underlined', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['underline']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="underline"]');

            this.el.innerHTML = '<p><span id="underline-span" style="text-decoration: underline">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('underline-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            // style="text-decoration: underline" prevents IE9+10 from doing anything when 'underline' is triggered
            // but it should work in other browsers
            expect(!isOldIE() && button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(!isOldIE() && (this.el.innerHTML !== '<p><span id="underline-span">lorem ipsum</span></p>')).toBe(false);
        });
    });

    describe('Strikethrough', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['strikethrough']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');

            this.el.innerHTML = '<strike>lorem ipsum</strike>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active if the selection is strikethrough and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['strikethrough']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');

            this.el.innerHTML = '<strike><b><i>lorem ipsum</i></b></strike>';
            selectElementContentsAndFire(editor.elements[0].querySelector('i'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is strikethrough', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['strikethrough']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');

            this.el.innerHTML = '<p><span id="strike-span" style="text-decoration: line-through">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('strike-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            // style="text-decoration: line-through" prevents IE9+10 from doing anything when 'strikethrough' is triggered
            // but it should work in other browsers
            expect(!isOldIE() && button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(!isOldIE() && (this.el.innerHTML !== '<p><span id="strike-span">lorem ipsum</span></p>')).toBe(false);
        });
    });

    describe('Superscript', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['superscript']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="superscript"]');

            this.el.innerHTML = '<sup>lorem ipsum</sub>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });
    });

    describe('Subscript', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['subscript']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="subscript"]');

            this.el.innerHTML = '<sub>lorem ipsum</sub>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });
    });

    describe('Anchor', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['anchor']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');

            this.el.innerHTML = '<p><span id="span-lorem">lorem</span> <a href="#" id="link">ipsum</a></p>';
            selectElementContentsAndFire(document.getElementById('link'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            selectElementContentsAndFire(document.getElementById('span-lorem'), { eventToFire: 'mouseup' });
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should call the anchorExtension.showForm() method', function () {
            spyOn(AnchorForm.prototype, 'showForm');
            var button,
                editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(editor.getExtensionByName('anchor').showForm).toHaveBeenCalled();
        });
    });

    describe('Quote', function () {
        it('button should not be active if the selection is not inside a blockquote', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['quote']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="append-blockquote"]');

            this.el.innerHTML = '<span id="span-lorem">lorem ipsum</span>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Image', function () {
        it('should create an image', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['image']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="image"]');

            this.el.innerHTML = '<span id="span-image">http://i.imgur.com/twlXfUq.jpg</span>';
            selectElementContentsAndFire(document.getElementById('span-image'));

            fireEvent(button, 'click');

            expect(this.el.innerHTML).toContain('<img src="http://i.imgur.com/twlXfUq.jpg">');
            expect(document.execCommand).toHaveBeenCalledWith('insertImage', false, window.getSelection());
        });
    });

    describe('OrderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['orderedlist', 'unorderedlist']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]');

            this.el.innerHTML = '<ol><li id="li-lorem">lorem ipsum</li></ol>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
            // Unordered list should not be active
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            // Unordered list should not be active
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('UnorderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['unorderedlist', 'orderedlist']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]');

            this.el.innerHTML = '<ul><li id="li-lorem">lorem ipsum</li></ul>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
            // Ordered list button should not be active
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            // Ordered list button should not be active
            expect(editor.toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Pre', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['pre']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="append-pre"]');

            this.el.innerHTML = '<pre><span id="span-lorem">lorem ipsum</span></pre>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Justify', function () {
        it('button should be activated based on text-align values', function () {
            this.el.innerHTML = '<div><p id="justify-para-one">lorem ipsum</p></div>';
            document.body.style.setProperty('text-align', 'center');
            try {
                var editor = this.newMediumEditor('.editor', {
                        buttons: ['justifyCenter', 'justifyRight']
                    }),
                    rightButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyRight"]'),
                    centerButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyCenter"]');

                selectElementContentsAndFire(document.getElementById('justify-para-one'));
                expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
                expect(centerButton.classList.contains('medium-editor-button-active')).toBe(true);

                fireEvent(rightButton, 'click');
                expect(rightButton.classList.contains('medium-editor-button-active')).toBe(true);
                expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            } finally {
                document.body.style.removeProperty('text-align');
            }
        });

        it('buttons should deactivate other justify buttons', function () {
            this.el.innerHTML = '<p id="justify-para-one">lorem ipsum</p>' +
                                '<p id="justify-para-two" align="left">lorem ipsum</p>' +
                                '<p id="justify-para-three" align="right">lorem ipsum</p>' +
                                '<p id="justify-para-four" align="center">lorem ipsum</p>' +
                                '<p id="justify-para-five" align="justify">lorem ipsum</p>';
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
                }),
                leftButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyLeft"]'),
                rightButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyRight"]'),
                centerButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyCenter"]'),
                fullButton = editor.toolbar.getToolbarElement().querySelector('[data-action="justifyFull"]');

            // First paragraph should have nothing activated (IE will select align-left)
            selectElementContentsAndFire(document.getElementById('justify-para-one'));
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Trigger justify full, only it should be active
            fireEvent(fullButton, 'click');
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(true);

            // Second paragraph should have justifyLeft activated
            selectElementContentsAndFire(document.getElementById('justify-para-two'), { eventToFire: 'mouseup' });
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Trigger justify center, only it should be active
            fireEvent(centerButton, 'click');
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Third paragraph should have justifyRight activated
            selectElementContentsAndFire(document.getElementById('justify-para-three'), { eventToFire: 'mouseup' });
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Trigger justify left, only it should be active
            fireEvent(leftButton, 'click');
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Fourth paragraph should have justifyCenter activated
            selectElementContentsAndFire(document.getElementById('justify-para-four'), { eventToFire: 'mouseup' });
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Trigger justify right, only it should be active
            fireEvent(rightButton, 'click');
            selectElementContentsAndFire(document.getElementById('justify-para-four'), { eventToFire: 'mouseup' });
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Fifth paragraph should have justifyFull activated
            selectElementContentsAndFire(document.getElementById('justify-para-five'), { eventToFire: 'mouseup' });
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Remove Formatting', function () {

        it('should unwrap basic things', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['removeFormat']
                }),
                button = editor.toolbar.getToolbarElement().querySelector('[data-action="removeFormat"]');

            expect(button).toBeTruthy();

            this.el.innerHTML = '<p>foo<b>bar</b><i>baz</i><strong>bam</strong></p>';
            selectElementContentsAndFire(editor.elements[0].querySelector('p'));
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<p>foobarbazbam</p>');

            this.el.innerHTML = '<div><p><b>foo</b></p><p><i>bar</i></p><ul><li>on<b>e</b></li></ul></div>';
            selectElementContentsAndFire(editor.elements[0].querySelector('div'));
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<div><p>foo</p><p>bar</p><ul><li>one</li></ul></div>');

            // TODO: IE does not unwrap something like <p><span style='color:red'>bar</span></p>
            this.el.innerHTML = '<div><h2>b<i>a</i>r</h2><p><em><strong><u><sub><sup>foo</sup></sub></u></strong></em></p><pre>foo<i>bar</i>baz</pre></div>';
            selectElementContentsAndFire(editor.elements[0].querySelector('div'));
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<div><h2>bar</h2><p>foo</p><pre>foobarbaz</pre></div>');

        });

    });

    describe('Header', function () {
        it('buttons should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['header1', 'header2']
                }),
                buttonOne = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h3"]'),
                buttonTwo = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h4"]');

            this.el.innerHTML = '<h2>lorem</h2><h3>ipsum</h3><h4>dolor</h4>';
            selectElementContentsAndFire(editor.elements[0].querySelector('h2'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h3'), { eventToFire: 'mouseup' });
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h4'), { eventToFire: 'mouseup' });
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('buttons should be active if the selection already custom defined element types', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['header1', 'header2'],
                    firstHeader: 'h1',
                    secondHeader: 'h5'
                }),
                buttonOne = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h1"]'),
                buttonTwo = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h5"]');

            expect(buttonOne).toBeTruthy();
            expect(buttonTwo).toBeTruthy();

            this.el.innerHTML = '<h1>lorem</h1><h3>ipsum</h3><h5>dolor</h5>';
            selectElementContentsAndFire(editor.elements[0].querySelector('h1'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h3'), { eventToFire: 'mouseup' });
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h5'), { eventToFire: 'mouseup' });
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('buttons should convert between element types and "undo" back to original type', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['header1', 'header2'],
                    firstHeader: 'h1'
                }),
                buttonOne = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h1"]'),
                buttonTwo = editor.toolbar.getToolbarElement().querySelector('[data-action="append-h4"]');

            this.el.innerHTML = '<p>lorem ipsum dolor</p>';
            selectElementContentsAndFire(editor.elements[0].firstChild);
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(buttonOne, 'click');
            selectElementContentsAndFire(editor.elements[0].firstChild);
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);
            expect(editor.elements[0].innerHTML).toBe('<h1>lorem ipsum dolor</h1>');

            fireEvent(buttonTwo, 'click');
            selectElementContentsAndFire(editor.elements[0].firstChild);
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
            expect(editor.elements[0].innerHTML).toBe('<h4>lorem ipsum dolor</h4>');

            fireEvent(buttonTwo, 'click');
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);
            expect(editor.elements[0].innerHTML).toBe('<p>lorem ipsum dolor</p>');
        });
    });
});
