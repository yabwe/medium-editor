/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, tearDown, console,
         selectElementContentsAndFire */

describe('Buttons TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    describe('Button click', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        it('should set active class on click', function () {
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(button.className).toContain('medium-editor-button-active');
        });

        it('should check for selection when selection is undefined', function () {
            spyOn(MediumEditor.prototype, 'checkSelection');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            editor.selection = undefined;
            fireEvent(button, 'click');
            expect(editor.checkSelection).toHaveBeenCalled();
        });

        it('should remove active class if button has it', function () {
            this.el.innerHTML = '<b>lorem ipsum</b>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            expect(button.className).toContain('medium-editor-button-active');
            fireEvent(button, 'click');
            expect(button.className).not.toContain('medium-editor-button-active');
        });

        it('should execute the button action', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.execAction).toHaveBeenCalled();
        });

        it('should execute the button action', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            fireEvent(button, 'click');
            expect(editor.execAction).toHaveBeenCalled();
        });
    });

    describe('AppendEl', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        it('should call the execFormatBlock method when button action is append', function () {
            spyOn(MediumEditor.prototype, 'execFormatBlock');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            expect(editor.execFormatBlock).toHaveBeenCalled();
        });

        it('should create an h3 element when header1 is clicked', function () {
            this.el.innerHTML = '<p><b>lorem ipsum</b></p>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            // depending on the styling you have,
            // IE might strip the <b> out when it applies the H3 here.
            // so, make the <b> match optional in the output:
            expect(this.el.innerHTML).toMatch(/<h3>(<b>)?lorem ipsum(<\/b>)?<\/h3>/);
        });

        it('should get back to a p element if parent element is the same as the action', function () {
            this.el.innerHTML = '<h3><b>lorem ipsum</b></h3>';
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0].firstChild);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-h3"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('<p><b>lorem ipsum</b></p>');
        });
    });

    describe('First and Last', function () {
        it('should add a special class to the first and last buttons', function () {
            var editor = new MediumEditor('.editor'),
                buttons = editor.toolbar.querySelectorAll('button');
            expect(buttons[0].className).toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-first');
            expect(buttons[1].className).not.toContain('medium-editor-button-last');
            expect(buttons[buttons.length - 1].className).toContain('medium-editor-button-last');
        });
    });

    describe('Bold', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['bold']
                }),
                button = editor.toolbar.querySelector('[data-action="bold"]');

            this.el.innerHTML = '<b>lorem ipsum</b>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<strong>lorem ipsum</strong>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Italics', function () {
        it('should call the execCommand for native actions', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            fireEvent(button, 'click');
            expect(document.execCommand).toHaveBeenCalled();
            // IE won't generate an `<i>` tag here. it generates an `<em>`:
            expect(this.el.innerHTML).toMatch(/(<i>|<em>)lorem ipsum(<\/i>|<\/em>)/);
        });

        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['italic']
                }),
                button = editor.toolbar.querySelector('[data-action="italic"]');

            this.el.innerHTML = '<i>lorem ipsum</i>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<em>lorem ipsum</em>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('button should be active for other cases when text is italic', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['italic']
                }),
                button = editor.toolbar.querySelector('[data-action="italic"]');

            this.el.innerHTML = '<p><span id="italic-span" style="font-style: italic">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('italic-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="italic-span">lorem ipsum</span></p>');
        });
    });

    describe('Underline', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['underline']
                }),
                button = editor.toolbar.querySelector('[data-action="underline"]');

            this.el.innerHTML = '<u>lorem ipsum</u>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active for other cases when text is underlined', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['underline']
                }),
                button = editor.toolbar.querySelector('[data-action="underline"]');

            this.el.innerHTML = '<p><span id="underline-span" style="text-decoration: underline">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('underline-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="underline-span">lorem ipsum</span></p>');
        });
    });

    describe('Strikethrough', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['strikethrough']
                }),
                button = editor.toolbar.querySelector('[data-action="strikethrough"]');

            this.el.innerHTML = '<strike>lorem ipsum</strike>';
            selectElementContentsAndFire(editor.elements[0]);
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active for other cases when text is strikethrough', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['strikethrough']
                }),
                button = editor.toolbar.querySelector('[data-action="strikethrough"]');

            this.el.innerHTML = '<p><span id="strike-span" style="text-decoration: line-through">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('strike-span'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="strike-span">lorem ipsum</span></p>');
        });
    });

    describe('Superscript', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['superscript']
                }),
                button = editor.toolbar.querySelector('[data-action="superscript"]');

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
            var editor = new MediumEditor('.editor', {
                    buttons: ['subscript']
                }),
                button = editor.toolbar.querySelector('[data-action="subscript"]');

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
            var editor = new MediumEditor('.editor', {
                    buttons: ['anchor']
                }),
                button = editor.toolbar.querySelector('[data-action="anchor"]');

            this.el.innerHTML = '<p><span id="span-lorem">lorem</span> <a href="#" id="link">ipsum</a></p>';
            selectElementContentsAndFire(document.getElementById('link'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });

        it('button should call the triggerAnchorAction method', function () {
            spyOn(MediumEditor.prototype, 'triggerAnchorAction');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.querySelector('[data-action="anchor"]');
            fireEvent(button, 'click');
            expect(editor.triggerAnchorAction).toHaveBeenCalled();
        });
    });

    describe('Quote', function () {
        it('button should not be active if the selection is not inside a blockquote', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['quote']
                }),
                button = editor.toolbar.querySelector('[data-action="append-blockquote"]');

            this.el.innerHTML = '<span id="span-lorem">lorem ipsum</span>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('OrderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['orderedlist']
                }),
                button = editor.toolbar.querySelector('[data-action="insertorderedlist"]');

            this.el.innerHTML = '<ol><li id="li-lorem">lorem ipsum</li></ol>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('UnorderedList', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['unorderedlist']
                }),
                button = editor.toolbar.querySelector('[data-action="insertunorderedlist"]');

            this.el.innerHTML = '<ul><li id="li-lorem">lorem ipsum</li></ul>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Pre', function () {
        it('button should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['pre']
                }),
                button = editor.toolbar.querySelector('[data-action="append-pre"]');

            this.el.innerHTML = '<pre><span id="span-lorem">lorem ipsum</span></pre>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Justify', function () {
        it('buttons should deactivate other justify buttons', function () {
            this.el.innerHTML = '<p id="justify-para-one">lorem ipsum</p>' +
                                '<p id="justify-para-two" align="left">lorem ipsum</p>' +
                                '<p id="justify-para-three" align="right">lorem ipsum</p>' +
                                '<p id="justify-para-four" align="center">lorem ipsum</p>' +
                                '<p id="justify-para-five" align="justify">lorem ipsum</p>';
            var editor = new MediumEditor('.editor', {
                buttons: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
            }),
                leftButton = editor.toolbar.querySelector('[data-action="justifyLeft"]'),
                rightButton = editor.toolbar.querySelector('[data-action="justifyRight"]'),
                centerButton = editor.toolbar.querySelector('[data-action="justifyCenter"]'),
                fullButton = editor.toolbar.querySelector('[data-action="justifyFull"]');

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
            selectElementContentsAndFire(document.getElementById('justify-para-two'));
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
            selectElementContentsAndFire(document.getElementById('justify-para-three'));
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
            selectElementContentsAndFire(document.getElementById('justify-para-four'));
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Trigger justify right, only it should be active
            fireEvent(rightButton, 'click');
            selectElementContentsAndFire(document.getElementById('justify-para-four'));
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(true);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(false);

            // Fifth paragraph should have justifyFull activated
            selectElementContentsAndFire(document.getElementById('justify-para-five'));
            expect(leftButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(rightButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(centerButton.classList.contains('medium-editor-button-active')).toBe(false);
            expect(fullButton.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Header', function () {
        it('buttons should be active if the selection already has the element', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['header1', 'header2']
                }),
                buttonOne = editor.toolbar.querySelector('[data-action="append-h3"]'),
                buttonTwo = editor.toolbar.querySelector('[data-action="append-h4"]');

            this.el.innerHTML = '<h2>lorem</h2><h3>ipsum</h3><h4>dolor</h4>';
            selectElementContentsAndFire(editor.elements[0].querySelector('h2'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h3'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h4'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('buttons should be active if the selection already custom defined element types', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['header1', 'header2'],
                    firstHeader: 'h1',
                    secondHeader: 'h5'
                }),
                buttonOne = editor.toolbar.querySelector('[data-action="append-h1"]'),
                buttonTwo = editor.toolbar.querySelector('[data-action="append-h5"]');

            expect(buttonOne).toBeTruthy();
            expect(buttonTwo).toBeTruthy();

            this.el.innerHTML = '<h1>lorem</h1><h3>ipsum</h3><h5>dolor</h5>';
            selectElementContentsAndFire(editor.elements[0].querySelector('h1'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(true);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h3'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(false);

            selectElementContentsAndFire(editor.elements[0].querySelector('h5'));
            expect(buttonOne.classList.contains('medium-editor-button-active')).toBe(false);
            expect(buttonTwo.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('buttons should convert between element types and "undo" back to original type', function () {
            var editor = new MediumEditor('.editor', {
                    buttons: ['header1', 'header2'],
                    firstHeader: 'h1'
                }),
                buttonOne = editor.toolbar.querySelector('[data-action="append-h1"]'),
                buttonTwo = editor.toolbar.querySelector('[data-action="append-h4"]');

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
