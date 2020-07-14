/*global selectElementContentsAndFire */

describe('Full Content Action TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('All editable contents', function () {
        it('should be bolded and unbolded when using a full-bold command', function () {
            /*jslint regexp: true*/
            var resultRegEx = /^<(b|strong)>lorem ipsum<\/(b|strong)>$/gi;
            /*jslint regexp: false*/

            this.el.innerHTML = '<b>lorem ipsum</b>';
            var editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);

            editor.execAction('full-bold');
            expect(this.el.innerHTML).toBe('lorem ipsum');

            editor.execAction('full-bold');
            expect(resultRegEx.test(this.el.innerHTML)).toBe(true);
        });
    });

    describe('Selection', function () {
        it('should preserve selection after multiple full-content commands', function () {
            this.el.innerHTML = '<p>lorem <u>ipsum</u> dolor</p>';

            var editor = this.newMediumEditor('.editor'),
                // Beacuse not all browsers use <strike> or <s>, check for both
                sTagO = '<(s|strike)>',
                sTagC = '</(s|strike)>',
                regex = new RegExp('^<p><u>lorem ' + sTagO + 'ipsum' + sTagC + ' dolor</u></p>$');

            selectElementContentsAndFire(editor.elements[0].querySelector('u'));

            editor.execAction('full-underline');
            expect(this.el.innerHTML).toBe('<p>lorem ipsum dolor</p>');

            editor.execAction('full-underline');
            expect(this.el.innerHTML).toBe('<p><u>lorem ipsum dolor</u></p>');

            // Ensure the selection is still maintained
            editor.execAction('strikethrough');
            expect(this.el.innerHTML).toMatch(regex);
        });

        it('should justify all contents including multiple block elements', function () {
            this.el.innerHTML = '<p align="center">lorem ipsum dolor</p><p align="left">lorem ipsum dolor</p>';
            var editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0].firstChild);
            expect(window.getComputedStyle(editor.elements[0].childNodes[0]).getPropertyValue('text-align').indexOf('center')).not.toBe(-1);
            expect(window.getComputedStyle(editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('left')).not.toBe(-1);

            editor.execAction('full-justifyRight');
            expect(window.getComputedStyle(editor.elements[0].childNodes[0]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);
            expect(window.getComputedStyle(editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);

            // Ensure only original selected <p> is affected
            editor.execAction('justifyFull');
            expect(window.getComputedStyle(editor.elements[0].childNodes[0]).getPropertyValue('text-align')).toBe('justify');
            expect(window.getComputedStyle(editor.elements[0].childNodes[1]).getPropertyValue('text-align').indexOf('right')).not.toBe(-1);
        });
    });
});
