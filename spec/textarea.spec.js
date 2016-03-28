/*global fireEvent */

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
        this.el.setAttribute('data-imhere', 'ohyeah');
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        document.body.removeChild(this.el);
        this.cleanupTest();
    });

    it('should accept a textarea element and "convert" it to a div, preserving all attributes', function () {
        var editor = this.newMediumEditor('.editor'),
            textarea = this.el;
        expect(editor.elements[0].nodeName.toLowerCase()).toBe('div');

        var attributes = [
            'data-disable-editing',
            'data-disable-toolbar',
            'data-placeholder',
            'data-disable-return',
            'data-disable-double-return',
            'data-disable-preview',
            'spellcheck',
            'data-imhere'
        ];
        attributes.forEach(function (attr) {
            expect(editor.elements[0].getAttribute(attr)).toBe(textarea.getAttribute(attr));
        });
    });

    it('should sync editor changes with the original textarea element', function () {
        var editor = this.newMediumEditor('.editor');
        expect(this.el.value).toEqual('test content');
        editor.elements[0].innerHTML = 'new content';
        fireEvent(editor.elements[0], 'input');
        fireEvent(editor.elements[0], 'keypress');
        jasmine.clock().tick(1);
        expect(this.el.value).toEqual('new content');
    });

    it('should preserver textarea className', function () {
        this.el.className += ' test-class test-class-2';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toBe('editor test-class test-class-2');
    });

    it('should create unique div ids for multiple textareas', function () {
        for (var i = 0; i < 12; i++) {
            var ta = this.createElement('textarea', 'editor');
            ta.value = 'test content';
        }
        var editor = this.newMediumEditor('.editor');
        editor.elements.forEach(function (el) {
            expect(document.querySelectorAll('div#' + el.id).length).toEqual(1);
        });
    });

    it('should create unique medium-editor-textarea-ids across all editor instances', function () {
        var tas = [];
        for (var i = 0; i < 12; i++) {
            var ta = this.createElement('textarea', 'editor');
            ta.value = 'test content';
            tas.push(ta);
        }
        tas.forEach(function (el) {
            this.newMediumEditor(el);
        }, this);
        this.editors.forEach(function (editor) {
            expect(document.querySelectorAll('textarea[medium-editor-textarea-id="' +
                editor.elements[0].getAttribute('medium-editor-textarea-id') + '"]').length).toEqual(1);
        });
    });

    it('should cleanup after destroy', function () {
        var editor = this.newMediumEditor('.editor');
        expect(this.el.classList.contains('medium-editor-hidden')).toBe(true);
        editor.destroy();
        expect(this.el.classList.contains('medium-editor-hidden')).toBe(false);
    });
});
