/*global describe, it, beforeEach, afterEach, tearDown, expect,
         MediumEditor, fireEvent*/

describe('Textarea TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('textarea');
        this.el.className = 'editor';
        this.el.value = 'test content';
        this.el.setAttribute('data-disable-toolbar', false);
        this.el.setAttribute('data-placeholder', 'Something');
        this.el.setAttribute('data-disable-return', false);
        this.el.setAttribute('data-disable-double-return', false);
        this.el.setAttribute('data-disable-preview', false);
        this.el.setAttribute('spellcheck', true);
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        var divs = document.querySelectorAll('div.editor');
        for (var i = 0; i < divs.length; i += 1) {
            tearDown(divs[i]);
        }
    });

    it('should accept a textarea element and "convert" it to a div, preserving important attributes', function () {
        var editor = new MediumEditor('.editor'),
            textarea = this.el;
        expect(editor.elements[0].tagName.toLowerCase()).toBe('div');

        var attributesToPreserve = ['data-disable-editing',
            'data-disable-toolbar',
            'data-placeholder',
            'data-disable-return',
            'data-disable-double-return',
            'data-disable-preview',
            'spellcheck'];
        attributesToPreserve.forEach(function (attr) {
            expect(editor.elements[0].getAttribute(attr)).toBe(textarea.getAttribute(attr));
        });
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
