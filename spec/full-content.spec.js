/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, tearDown, console,
         selectElementContentsAndFire, xit */

describe('Full Content Action TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
        this.editor = null;
    });

    afterEach(function () {
        if (this.editor) {
            this.editor.deactivate();
            delete this.editor;
        }
        tearDown(this.el);
    });

    describe('All editable contents', function () {
        afterEach(function () {
            if (this.editor) {
                this.editor.deactivate();
                delete this.editor;
            }
        });

        it('should be bolded and unbolded when using a full-bold command', function () {
            /*jslint regexp: true*/
            var resultRegEx = /^<(b|strong)>lorem ipsum<\/(b|strong)>$/gi;
            /*jslint regexp: false*/

            this.el.innerHTML = '<b>lorem ipsum</b>';
            this.editor = new MediumEditor('.editor');
            selectElementContentsAndFire(this.editor.elements[0]);

            this.editor.execAction('full-bold');
            expect(this.el.innerHTML).toBe('lorem ipsum');

            this.editor.execAction('full-bold');
            expect(resultRegEx.test(this.el.innerHTML)).toBe(true);
        });
    });

    describe('Selection', function () {
        afterEach(function () {
            if (this.editor) {
                this.editor.deactivate();
                delete this.editor;
            }
        });

        it('should preserve selection after multiple full-content commands', function () {
            this.el.innerHTML = '<p>lorem <u>ipsum</u> dolor</p>';
            this.editor = new MediumEditor('.editor');
            selectElementContentsAndFire(this.editor.elements[0].querySelector('u'));

            this.editor.execAction('full-underline');
            expect(this.el.innerHTML).toBe('<p>lorem ipsum dolor</p>');

            this.editor.execAction('full-underline');
            expect(this.el.innerHTML).toBe('<p><u>lorem ipsum dolor</u></p>');

            // Ensure the selection is still maintained
            this.editor.execAction('strikethrough');
            expect(this.el.innerHTML).toBe('<p><u>lorem <strike>ipsum</strike> dolor</u></p>');
        });

        it('should justify all contents including multiple block elements', function () {
            this.el.innerHTML = '<p align="center">lorem ipsum dolor</p><p align="left">lorem ipsum dolor</p>';
            this.editor = new MediumEditor('.editor');
            selectElementContentsAndFire(this.editor.elements[0].firstChild);
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[0]).getPropertyValue('text-align').indexOf('center')).not.toBe(-1);
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('left')).not.toBe(-1);

            this.editor.execAction('full-justifyRight');
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[0]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);

            // Ensure only original selected <p> is affected
            this.editor.execAction('justifyFull');
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[0]).getPropertyValue('text-align')).toBe('justify');
            expect(window.getComputedStyle(this.editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);
        });
    });
});
