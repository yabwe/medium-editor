/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         fireEvent*/

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.id = 'medium-editor-test';
        this.el.innerHTML = '<p>lorem <strong>ipsum</strong></p>';
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

    it('should return the editor content as a JSON object', function () {
        var editor = new MediumEditor('.editor'),
            json = editor.serialize();
        expect(json).toEqual({
            'medium-editor-test': {
                value: '<p>lorem <strong>ipsum</strong></p>'
            }
        });
    });

    it('should set a custom id when elements have no ids', function () {
        this.el.id = null;
        var editor = new MediumEditor('.editor'),
            json = editor.serialize();
        expect(json).toEqual({
            'element-0': {
                value: '<p>lorem <strong>ipsum</strong></p>'
            }
        });
    });

});
