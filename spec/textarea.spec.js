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
});
