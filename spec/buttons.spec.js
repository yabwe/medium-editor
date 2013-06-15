/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent*/

describe('Buttons TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.Clock.useMock();
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        this.body.appendChild(this.el);
    });

    afterEach(function () {
        var elements = document.querySelectorAll('.medium-editor-toolbar'),
            i,
            sel = window.getSelection();
        for (i = 0; i < elements.length; i += 1) {
            this.body.removeChild(elements[i]);
        }
        this.body.removeChild(this.el);
        sel.removeAllRanges();
    });

    it('should hide buttons if they are in the excludedActions option', function () {
        var editor = new MediumEditor('.editor', {excludedActions: ['b', 'i', 'a']});
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'mouseup');
        jasmine.Clock.tick(1);
        expect(editor.toolbar.querySelector('[data-element="b"]').style.display).toBe('none');
        expect(editor.toolbar.querySelector('[data-element="i"]').style.display).toBe('none');
        expect(editor.toolbar.querySelector('[data-element="a"]').style.display).toBe('none');
        expect(editor.toolbar.querySelector('[data-element="u"]').style.display).toBe('block');
        expect(editor.toolbar.querySelector('[data-element="h3"]').style.display).toBe('block');
        expect(editor.toolbar.querySelector('[data-element="h4"]').style.display).toBe('block');
        expect(editor.toolbar.querySelector('[data-element="blockquote"]').style.display).toBe('block');
    });

    it('should set active class on click', function () {
        var button,
            editor = new MediumEditor('.editor');
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'mouseup');
        jasmine.Clock.tick(1);
        button = editor.toolbar.querySelector('[data-element="b"]');
        fireEvent(button, 'click');
        expect(button.className).toContain('medium-editor-button-active');
    });

    it('should activate button if selection already has the element', function () {
        var button,
            editor = new MediumEditor('.editor');
        this.el.innerHTML = '<b>lorem ipsum</b>';
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'mouseup');
        jasmine.Clock.tick(1);
        button = editor.toolbar.querySelector('[data-element="b"]');
        expect(button.className).toContain('medium-editor-button-active');
        this.el.innerHTML = 'lorem ipsum';
    });

});
