/*global fireEvent, selectElementContentsAndFire,
         isIE, isOldIE */

describe('Buttons TestCase', function () {
    'use strict';

    var textarea;
    beforeAll(function () {
        textarea = document.createElement('textarea');
        textarea.innerHTML = 'Ignore me please, placed here to make create an image test pass in Gecko';
        document.body.appendChild(textarea);
        textarea.focus();
    });

    afterAll(function () {
        document.body.removeChild(textarea);
    });

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
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(button.className).toContain('medium-editor-button-active');
        });

        it('should check for selection when selection is undefined', function () {
            spyOn(MediumEditor.prototype, 'checkSelection');
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should remove active class if button has it', function () {
            this.el.innerHTML = '<b>lorem ipsum</b>';
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            expect(button.className).toContain('medium-editor-button-active');
            fireEvent(button, 'click');
            expect(button.className).not.toContain('medium-editor-button-active');
        });

        it('should execute the button action', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.execAction).toHaveBeenCalledWith('bold');
        });
    });

    describe('Button default config', function () {
        it('should be accesible via defaults property of the button prototype', function () {
            expect(MediumEditor.extensions.button.prototype.defaults['bold']).toBeTruthy();
            expect(MediumEditor.extensions.button.prototype.defaults['anchor']).toBeFalsy();
        });

        it('should be check-able via static Button.isBuiltInButton() method', function () {
            expect(MediumEditor.extensions.button.isBuiltInButton('bold')).toBe(true);
            expect(MediumEditor.extensions.button.isBuiltInButton('anchor')).toBe(false);
        });
    });

    describe('Button constructor', function () {
        it('should accept a set of config options', function () {
            var italicConfig = MediumEditor.extensions.button.prototype.defaults['italic'],
                italicButton = new MediumEditor.extensions.button(italicConfig);

            Object.keys(italicConfig).forEach(function (prop) {
                expect(italicButton[prop]).toBe(italicConfig[prop]);
            });
        });

        it('should accept a built-in button name', function () {
            var italicButtonOne = new MediumEditor.extensions.button(MediumEditor.extensions.button.prototype.defaults['italic']),
                italicButtonTwo = new MediumEditor.extensions.button('italic');

            expect(italicButtonOne).toEqual(italicButtonTwo);
        });
    });

    describe('Button options', function () {
        it('should support overriding defaults', function () {
            this.el.innerHTML = '<h2>lorem</h2><h3>ipsum</h3>';
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: [
                            'bold',
                            {
                                name: 'h1',
                                action: 'append-h2',
                                aria: 'fake h1',
                                tagNames: ['h2'],
                                contentDefault: '<b>H1</b>',
                                classList: ['customClassName'],
                                attrs: {
                                    'data-custom-attr': 'custom-value'
                                }
                            },
                            {
                                name: 'h2',
                                getAction: function () {
                                    return 'append-h3';
                                },
                                getAria: function () {
                                    return 'fake h2';
                                },
                                getTagNames: function () {
                                    return ['h3'];
                                },
                                contentDefault: '<b>H2</b>'
                            }
                        ]
                    }
                }),
                headerOneButton = editor.getExtensionByName('h1'),
                headerTwoButton = editor.getExtensionByName('h2'),
                toolbar = editor.getExtensionByName('toolbar');

            expect(toolbar.getToolbarElement().querySelectorAll('button').length).toBe(3);

            var button = toolbar.getToolbarElement().querySelector('.medium-editor-action-h1'),
                buttonTwo = toolbar.getToolbarElement().querySelector('.medium-editor-action-h2');
            expect(button).toBe(headerOneButton.getButton());
            expect(button.getAttribute('aria-label')).toBe('fake h1');
            expect(button.getAttribute('title')).toBe('fake h1');
            expect(button.getAttribute('data-custom-attr')).toBe('custom-value');
            expect(button.classList.contains('customClassName')).toBe(true);
            expect(button.innerHTML).toBe('<b>H1</b>');

            selectElementContentsAndFire(editor.elements[0].querySelector('h2').firstChild);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            expect(buttonTwo).toBe(headerTwoButton.getButton());
            expect(buttonTwo.getAttribute('aria-label')).toBe('fake h2');
            expect(buttonTwo.getAttribute('title')).toBe('fake h2');
            expect(buttonTwo.innerHTML).toBe('<b>H2</b>');

            selectElementContentsAndFire(editor.elements[0].querySelector('h3'), { eventToFire: 'mouseup' });
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Buttons with various labels', function () {
        var defaultLabels = {},
            fontAwesomeLabels = {},
            customLabels = {},
            allButtons = [],
            customButtons = [],
            buttonsData = MediumEditor.extensions.button.prototype.defaults,
            currButton,
            tempEl;

        Object.keys(buttonsData).forEach(function (buttonName) {
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
            customButtons.push({
                name: buttonName,
                contentDefault: currButton.aria
            });
        });

        // Add in anchor button
        allButtons.push('anchor');
        tempEl = document.createElement('div');
        tempEl.innerHTML = MediumEditor.extensions.anchor.prototype.contentDefault;
        defaultLabels['anchor'] = {
            label: tempEl.innerHTML
        };
        tempEl.innerHTML = MediumEditor.extensions.anchor.prototype.contentFA;
        fontAwesomeLabels['anchor'] = tempEl.innerHTML;
        customLabels['anchor'] = MediumEditor.extensions.anchor.prototype.aria;
        customButtons.push({
            name: 'anchor',
            contentDefault: customLabels['anchor']
        });

        // Add in fontsize button
        allButtons.push('fontsize');
        tempEl.innerHTML = MediumEditor.extensions.fontSize.prototype.contentDefault;
        defaultLabels['fontsize'] = {
            label: tempEl.innerHTML
        };
        tempEl.innerHTML = MediumEditor.extensions.fontSize.prototype.contentFA;
        fontAwesomeLabels['fontsize'] = tempEl.innerHTML;
        customLabels['fontsize'] = MediumEditor.extensions.fontSize.prototype.aria;
        customButtons.push({
            name: 'fontsize',
            contentDefault: customLabels['fontsize']
        });

        it('should have aria-label and title attributes set', function () {
            var button,
                editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: allButtons
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar');
            Object.keys(customLabels).forEach(function (buttonName) {
                button = toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                expect(button.getAttribute('aria-label')).toBe(customLabels[buttonName]);
                expect(button.getAttribute('title')).toBe(customLabels[buttonName]);
            });
        });

        it('should contain default content if no custom labels are provided', function () {
            var button,
                editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: allButtons
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar');
            expect(toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);

            Object.keys(defaultLabels).forEach(function (buttonName) {
                button = toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                expect(button.innerHTML).toBe(defaultLabels[buttonName].label);
            });
        });

        it('should contain fontawesome labels and execute the button action when clicked', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var action,
                button,
                editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: allButtons
                    },
                    buttonLabels: 'fontawesome'
                }),
                toolbar = editor.getExtensionByName('toolbar');
            expect(toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);

            Object.keys(fontAwesomeLabels).forEach(function (buttonName) {
                action = defaultLabels[buttonName].action;
                button = toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                fireEvent(button, 'click');
                if (action) {
                    expect(editor.execAction).toHaveBeenCalledWith(action);
                }
                expect(button.innerHTML).toBe(fontAwesomeLabels[buttonName]);
            });
        });

        it('should contain custom labels and execute the button action when clicked', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var action,
                button,
                editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: customButtons
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar');
            expect(toolbar.getToolbarElement().querySelectorAll('button').length).toBe(allButtons.length);
            selectElementContentsAndFire(editor.elements[0]);

            Object.keys(customLabels).forEach(function (buttonName) {
                action = defaultLabels[buttonName].action;
                button = toolbar.getToolbarElement().querySelector('.medium-editor-action-' + buttonName);
                expect(button).not.toBeUndefined();
                fireEvent(button, 'click');
                if (action) {
                    expect(editor.execAction).toHaveBeenCalledWith(action);
                }
                expect(button.innerHTML).toBe(customLabels[buttonName]);
            });
        });
    });

    describe('AppendEl', function () {
        it('should call the document.execCommand method when button action is append', function () {
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            spyOn(document, 'execCommand');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            if (isIE()) {
                expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h3>');
            } else {
                expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h3');
            }
        });

        it('should create an h3 element when h3 is clicked', function () {
            this.el.innerHTML = '<p><b>lorem ipsum</b></p>';
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            // depending on the styling you have,
            // IE might strip the <b> out when it applies the H3 here.
            // so, make the <b> match optional in the output:
            expect(this.el.innerHTML).toMatch(/<h3>(<b>)?lorem ipsum(<\/b>)?<\/h3>/);
        });

        it('should get back to a p element if parent element is the same as the action', function () {
            this.el.innerHTML = '<h3><b>lorem ipsum</b></h3>';
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0].firstChild);
            button = toolbar.getToolbarElement().querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<p><b>lorem ipsum</b></p>');
        });
    });

    describe('First and Last', function () {
        it('should add a special class to the first and last buttons', function () {
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                buttons = toolbar.getToolbarElement().querySelectorAll('button');
            expect(buttons[0].className).toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-last');
            expect(buttons[buttons.length - 1].className).toContain('medium-editor-button-last');
        });
    });

    describe('Bold', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['bold']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
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
                    toolbar: {
                        buttons: ['bold']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');
            this.el.innerHTML = '<b><i><u>lorem ipsum</u></i></b>';

            selectElementContentsAndFire(editor.elements[0].querySelector('u'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is bold', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['bold']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="bold"]');
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
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            spyOn(document, 'execCommand').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="italic"]');
            fireEvent(button, 'click');
            expect(document.execCommand).toHaveBeenCalled();
            // IE won't generate an `<i>` tag here. it generates an `<em>`:
            expect(this.el.innerHTML).toMatch(/(<i>|<em>)lorem ipsum(<\/i>|<\/em>)/);
        });

        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="italic"]');
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
                    toolbar: {
                        buttons: ['italic']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="italic"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');
            this.el.innerHTML = '<i><b><u>lorem ipsum</u></b></i>';

            selectElementContentsAndFire(editor.elements[0].querySelector('u'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is italic', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['italic']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="italic"]');
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
                    toolbar: {
                        buttons: ['underline']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');
            this.el.innerHTML = '<u>lorem ipsum</u>';

            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active if the selection is underlined and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['underline']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');
            this.el.innerHTML = '<u><b><i>lorem ipsum</i></b></u>';

            selectElementContentsAndFire(editor.elements[0].querySelector('i'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is underlined', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['underline']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="underline"]');
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
                    toolbar: {
                        buttons: ['strikethrough']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
            this.el.innerHTML = '<strike>lorem ipsum</strike>';

            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active if the selection is strikethrough and queryCommandState fails', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['strikethrough']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');

            spyOn(document, 'queryCommandState').and.throwError('DOM ERROR');
            this.el.innerHTML = '<strike><b><i>lorem ipsum</i></b></strike>';

            selectElementContentsAndFire(editor.elements[0].querySelector('i'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should be active for other cases when text is strikethrough', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['strikethrough']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="strikethrough"]');
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
                    toolbar: {
                        buttons: ['superscript']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="superscript"]');
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
                    toolbar: {
                        buttons: ['subscript']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="subscript"]');
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
                    toolbar: {
                        buttons: ['anchor']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            this.el.innerHTML = '<p><span id="span-lorem">lorem</span> <a href="#" id="link">ipsum</a></p>';

            selectElementContentsAndFire(document.getElementById('link'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            selectElementContentsAndFire(document.getElementById('span-lorem'), { eventToFire: 'mouseup' });
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should call the anchorExtension.showForm() method', function () {
            spyOn(MediumEditor.extensions.anchor.prototype, 'showForm');
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(editor.getExtensionByName('anchor').showForm).toHaveBeenCalled();
        });
    });

    describe('Quote', function () {
        it('button should not be active if the selection is not inside a blockquote', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['quote']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="append-blockquote"]');
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
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['image']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="image"]');
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<span id="span-image">http://i.imgur.com/twlXfUq.jpg  \n\n</span>';

            selectElementContentsAndFire(document.getElementById('span-image'));

            fireEvent(button, 'click');

            expect(this.el.innerHTML).toContain('<img src="http://i.imgur.com/twlXfUq.jpg">');
            expect(document.execCommand).toHaveBeenCalledWith('insertImage', false, 'http://i.imgur.com/twlXfUq.jpg');
        });
    });

    describe('Html', function () {
        it('should create an evaluated html tag', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['html']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="html"]');
            spyOn(document, 'execCommand').and.callThrough();
            this.el.innerHTML = '<span id="span-html">&lt;iframe width="854" height="480" src="https://www.youtube.com/embed/QHH3iSeDBLo" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;  \n\n</span>';

            selectElementContentsAndFire(document.getElementById('span-html'));

            fireEvent(button, 'click');

            expect(this.el.innerHTML).toMatch(/<iframe(?: width="854"| height="480"| src="https:\/\/www.youtube.com\/embed\/QHH3iSeDBLo"| frameborder="0"| allowfullscreen=""){5}>(<br>)?<\/iframe>/gi);
        });
    });

    describe('OrderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['orderedlist', 'unorderedlist']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]');
            this.el.innerHTML = '<ol><li id="li-lorem">lorem ipsum</li></ol>';

            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
            // Unordered list should not be active
            expect(toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            // Unordered list should not be active
            expect(toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('UnorderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['unorderedlist', 'orderedlist']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="insertunorderedlist"]');
            this.el.innerHTML = '<ul><li id="li-lorem">lorem ipsum</li></ul>';

            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
            // Ordered list button should not be active
            expect(toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            // Ordered list button should not be active
            expect(toolbar.getToolbarElement().querySelector('[data-action="insertorderedlist"]').classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Pre', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['pre']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="append-pre"]');
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
                        toolbar: {
                            buttons: ['justifyCenter', 'justifyRight']
                        }
                    }),
                    toolbar = editor.getExtensionByName('toolbar'),
                    rightButton = toolbar.getToolbarElement().querySelector('[data-action="justifyRight"]'),
                    centerButton = toolbar.getToolbarElement().querySelector('[data-action="justifyCenter"]');

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
                    toolbar: {
                        buttons: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                leftButton = toolbar.getToolbarElement().querySelector('[data-action="justifyLeft"]'),
                rightButton = toolbar.getToolbarElement().querySelector('[data-action="justifyRight"]'),
                centerButton = toolbar.getToolbarElement().querySelector('[data-action="justifyCenter"]'),
                fullButton = toolbar.getToolbarElement().querySelector('[data-action="justifyFull"]');

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
                    toolbar: {
                        buttons: ['removeFormat']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="removeFormat"]');

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
                    toolbar: {
                        buttons: ['h3', 'h4']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                buttonOne = toolbar.getToolbarElement().querySelector('[data-action="append-h3"]'),
                buttonTwo = toolbar.getToolbarElement().querySelector('[data-action="append-h4"]');

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
                    toolbar: {
                        buttons: ['h1', 'h5']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                buttonOne = toolbar.getToolbarElement().querySelector('[data-action="append-h1"]'),
                buttonTwo = toolbar.getToolbarElement().querySelector('[data-action="append-h5"]');

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
                    toolbar: {
                        buttons: ['h1', 'h4']
                    }
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                buttonOne = toolbar.getToolbarElement().querySelector('[data-action="append-h1"]'),
                buttonTwo = toolbar.getToolbarElement().querySelector('[data-action="append-h4"]');

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
