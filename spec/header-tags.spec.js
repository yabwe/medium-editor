/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, fireEvent, waits,
         jasmine, selectElementContents, tearDown */

describe('Protect Header Tags TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.id = 'editor';
        this.el.innerHTML = '<p id="first-p">lorem ipsum</p><p></p><h2 id="header">Cats</h2>';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    describe('ProtectHeaderTags', function () {
        it('header intact after leading return', function () {
            jasmine.clock().install();

            // place cursor at begining of header
            var editor = new MediumEditor('.editor'),
                el = document.getElementById("header"),
                range = document.createRange(),
                sel = window.getSelection();

            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit return
            fireEvent(editor.elements[0], 'keypress', 13);

            el = document.getElementById("header");
            expect(el).toBeDefined();
            expect(el.tagName).toBe('H2');


        });

        it('header leading return inserts paragraph, not additional header', function () {
            jasmine.clock().install();

            // place cursor at begining of header
            var editor = new MediumEditor('.editor'),
                el = document.getElementById("header"),
                range = document.createRange(),
                sel = window.getSelection();
            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit return
            fireEvent(editor.elements[0], 'keypress', 13);

            el = document.getElementById("header");
            expect(el.previousElementSibling.tagName).toBe('P');

        });

        it('header leading backspace into empty p preserves header', function () {
            jasmine.clock().install();

            // place cursor at begining of header
            var editor = new MediumEditor('.editor'),
                originalHTML = document.getElementById("editor").innerHTML,
                el = document.getElementById("header"),
                range = document.createRange(),
                sel = window.getSelection();
            range.setStart(el, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // hit backspace
            editor.onBlockModifier({ which: 8, preventDefault: function () { } });

            el = document.getElementById("header");
            expect(el).toBeDefined();
            expect(el.tagName).toBe('H2');

            el = document.getElementById("editor");
            expect(el.innerHTML).not.toBe(originalHTML);

        });

    });

});
