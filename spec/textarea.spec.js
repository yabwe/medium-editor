/*global describe, it, beforeEach, afterEach, tearDown, expect,
         MediumEditor, fireEvent*/

describe('Textarea TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('textarea');
        this.el.className = 'editor';
        this.el.value = 'test content';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        var divs = document.querySelectorAll('div.editor');
        for (var i = 0; i < divs.length; i += 1) {
            tearDown(divs[i]);
        }
    });

    it('should accept a textarea element and "convert" it to a div', function () {
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].tagName.toLowerCase()).toBe('div');
    });

    it('should sync editor changes with the original textarea element', function () {
        var editor = new MediumEditor('.editor');
        expect(this.el.value).toEqual('test content');
        editor.elements[0].innerHTML = 'new content';
        fireEvent(editor.elements[0], 'input');
        expect(this.el.value).toEqual('new content');
    });

    it('should preserver textarea className', function () {
        this.el.className += ' test-class test-class-2';
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).toBe('editor test-class test-class-2');
    });
});
