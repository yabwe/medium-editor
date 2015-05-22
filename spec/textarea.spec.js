/*global describe, it, beforeEach, afterEach, expect,
         fireEvent, setupTestHelpers */

describe('Textarea TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
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
        document.body.removeChild(this.el);
        this.cleanupTest();
    });

    it('should accept a textarea element and "convert" it to a div, preserving important attributes', function () {
        var editor = this.newMediumEditor('.editor'),
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
        var editor = this.newMediumEditor('.editor');
        expect(this.el.value).toEqual('test content');
        editor.elements[0].innerHTML = 'new content';
        fireEvent(editor.elements[0], 'input');
        expect(this.el.value).toEqual('new content');
    });

    it('should preserver textarea className', function () {
        this.el.className += ' test-class test-class-2';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toBe('editor test-class test-class-2');
    });

    it('should cleanup after destroy', function () {
        var editor = this.newMediumEditor('.editor');
        expect(this.el.classList.contains('medium-editor-hidden')).toBe(true);
        editor.destroy();
        expect(this.el.classList.contains('medium-editor-hidden')).toBe(false);
    });
});
