/*global describe, it, expect, afterEach, Util,
    beforeEach, fireEvent, setupTestHelpers */

describe('Protect Header Tags TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', '<p id="first-p">lorem ipsum</p><p></p><h2 id="header">Cats</h2>');
        this.el.id = 'editor';
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('ProtectHeaderTags', function () {
        it('header intact after leading return', function () {
            // place cursor at begining of header
            var editor = this.newMediumEditor('.editor'),
                el = document.getElementById('header'),
                range = document.createRange(),
                sel = window.getSelection();

            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit return
            fireEvent(editor.elements[0], 'keypress', {
                keyCode: Util.keyCode.ENTER
            });

            el = document.getElementById('header');
            expect(el).toBeDefined();
            expect(el.tagName).toBe('H2');
        });

        it('header leading return inserts paragraph, not additional header', function () {
            // place cursor at begining of header
            var editor = this.newMediumEditor('.editor'),
                el = document.getElementById('header'),
                range = document.createRange(),
                sel = window.getSelection();
            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit return
            fireEvent(editor.elements[0], 'keypress', {
                keyCode: Util.keyCode.ENTER
            });

            el = document.getElementById('header');
            expect(el.previousElementSibling.tagName).toBe('P');

        });

        it('header leading backspace into empty p preserves header', function () {
            // place cursor at begining of header
            var editor = this.newMediumEditor('.editor'),
                originalHTML = document.getElementById('editor').innerHTML,
                el = document.getElementById('header'),
                range = document.createRange(),
                sel = window.getSelection();
            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit backspace
            fireEvent(editor.elements[0].querySelector(el.tagName.toLowerCase()), 'keydown', {
                keyCode: Util.keyCode.BACKSPACE
            });

            el = document.getElementById('header');
            expect(el).toBeDefined();
            expect(el.tagName).toBe('H2');

            el = document.getElementById('editor');
            expect(el.innerHTML).not.toBe(originalHTML);

        });

    });

});
