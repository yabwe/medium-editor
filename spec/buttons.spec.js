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

        it('should call the triggerAnchorAction method when button element is "a"', function () {
            spyOn(MediumEditor.prototype, 'triggerAnchorAction');
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="anchor"]');
            fireEvent(button, 'click');
            expect(editor.triggerAnchorAction).toHaveBeenCalled();
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
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['bold']
                });
            this.el.innerHTML = '<b>lorem ipsum</b>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<strong>lorem ipsum</strong>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="bold"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('Italics', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should call the execCommand for native actions', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var button,
                editor = new MediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            fireEvent(button, 'click');
            expect(document.execCommand).toHaveBeenCalled();
            // IE won't generate an `<i>` tag here. it generates an `<em>`:
            expect(this.el.innerHTML).toMatch(/(<i>|<em>)lorem ipsum(<\/i>|<\/em>)/);
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['italic']
                });
            this.el.innerHTML = '<i>lorem ipsum</i>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            this.el.innerHTML = '<em>lorem ipsum</em>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });

        it('button should be active for other cases when text is italic', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['italic']
                });
            this.el.innerHTML = '<p><span id="italic-span" style="font-style: italic">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('italic-span'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="italic"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="italic-span">lorem ipsum</span></p>');
        });
    });

    describe('Underline', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['underline']
                });
            this.el.innerHTML = '<u>lorem ipsum</u>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="underline"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="underline"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active for other cases when text is underlined', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['underline']
                });
            this.el.innerHTML = '<p><span id="underline-span" style="text-decoration: underline">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('underline-span'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="underline"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="underline"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="underline-span">lorem ipsum</span></p>');
        });
    });

    describe('Strikethrough', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['strikethrough']
                });
            this.el.innerHTML = '<strike>lorem ipsum</strike>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="strikethrough"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="strikethrough"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });

        it('button should be active for other cases when text is strikethrough', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['strikethrough']
                });
            this.el.innerHTML = '<p><span id="strike-span" style="text-decoration: line-through">lorem ipsum</span></p>';
            selectElementContentsAndFire(document.getElementById('strike-span'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="strikethrough"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="strikethrough"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('<p><span id="strike-span">lorem ipsum</span></p>');
        });
    });

    describe('Superscript', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['superscript']
                });
            this.el.innerHTML = '<sup>lorem ipsum</sub>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="superscript"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="superscript"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });
    });

    describe('Subscript', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['subscript']
                });
            this.el.innerHTML = '<sub>lorem ipsum</sub>';
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="subscript"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="subscript"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
            expect(this.el.innerHTML).toBe('lorem ipsum');
        });
    });

    describe('Anchor', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['anchor']
                });
            this.el.innerHTML = '<p><span id="span-lorem">lorem</span> <a href="#" id="link">ipsum</a></p>';
            selectElementContentsAndFire(document.getElementById('link'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="anchor"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            selectElementContentsAndFire(document.getElementById('span-lorem'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="anchor"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Quote', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should not be active if the selection is not inside a blockquote', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['quote']
                });
            this.el.innerHTML = '<span id="span-lorem">lorem ipsum</span>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-blockquote"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            button = editor.toolbar.querySelector('[data-action="append-blockquote"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);
        });
    });

    describe('OrderedList', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['orderedlist']
                });
            this.el.innerHTML = '<ol><li id="li-lorem">lorem ipsum</li></ol>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="insertorderedlist"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="insertorderedlist"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('UnorderedList', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['unorderedlist']
                });
            this.el.innerHTML = '<ul><li id="li-lorem">lorem ipsum</li></ul>';
            selectElementContentsAndFire(document.getElementById('li-lorem'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="insertunorderedlist"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="insertunorderedlist"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });

    describe('Pre', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('button should be active if the selection already has the element', function () {
            var button,
                editor = new MediumEditor('.editor', {
                    buttons: ['pre']
                });
            this.el.innerHTML = '<pre><span id="span-lorem">lorem ipsum</span></pre>';
            selectElementContentsAndFire(document.getElementById('span-lorem'));
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-pre"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(true);

            fireEvent(button, 'click');
            jasmine.clock().tick(1);
            button = editor.toolbar.querySelector('[data-action="append-pre"]');
            expect(button.classList.contains('medium-editor-button-active')).toBe(false);
        });
    });
});
