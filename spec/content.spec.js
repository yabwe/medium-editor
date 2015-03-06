/*global MediumEditor, describe, it, expect, spyOn, jasmine, fireEvent,
         afterEach, beforeEach, selectElementContents, runs, waitsFor,
         tearDown */

describe('Content TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.textContent = 'lore ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    it('should exec the unlink command when user presses space inside an anchor', function () {
        this.el.innerHTML = '<a href="#">test</a>';
        var editor = new MediumEditor('.editor');
        spyOn(document, 'execCommand');
        selectElementContents(editor.elements[0].querySelector('a'));
        fireEvent(editor.elements[0], 'keypress', {
            keyCode: 32
        });
        expect(document.execCommand).toHaveBeenCalledWith('unlink', false, null);
    });
});
