/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         fireEvent, tearDown*/

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.id = 'medium-editor-test';
        this.el.innerHTML = '<p>lorem <strong>ipsum</strong></p>';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
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
        this.el.removeAttribute('id');
        var editor = new MediumEditor('.editor'),
            json = editor.serialize();
        expect(json).toEqual({
            'element-0': {
                value: '<p>lorem <strong>ipsum</strong></p>'
            }
        });
    });

});
