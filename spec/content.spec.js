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

    it('should exec the unlink command when the user presses space inside an anchor', function () {
        this.el.innerHTML = '<a href="#">test</a>';
        var editor = new MediumEditor('.editor');
        spyOn(document, 'execCommand').and.callThrough();
        selectElementContents(editor.elements[0].querySelector('a'));
        fireEvent(editor.elements[0], 'keypress', 32);
        expect(document.execCommand).toHaveBeenCalledWith('unlink', false, null);
    });

    it('should exec the unlink command when the user presses enter inside an anchor', function () {
        this.el.innerHTML = '<a href="#">test</a>';
        var editor = new MediumEditor('.editor');
        spyOn(document, 'execCommand').and.callThrough();
        selectElementContents(editor.elements[0].querySelector('a'));
        fireEvent(editor.elements[0], 'keyup', 13);
        expect(document.execCommand).toHaveBeenCalledWith('unlink', false, null);
    });

    it('should insert a space when hitting tab key within a pre node', function () {
        this.el.innerHTML = '<pre>lorem ipsum</pre>';
        var editor = new MediumEditor('.editor');
        selectElementContents(editor.elements[0].querySelector('pre'));
        fireEvent(editor.elements[0], 'keydown', 9);
        expect(this.el.innerHTML).toBe('<pre>    </pre>');
    });

    it('should indent when hitting tab key within an <li>', function () {
        this.el.innerHTML = '<ol><li>lorem</li><li id="next-level">ipsum</li></ol>';
        var editor = new MediumEditor('.editor'),
            target = editor.elements[0].querySelector('#next-level'),
            evt;
        spyOn(document, 'execCommand').and.callThrough();
        selectElementContents(target);
        evt = fireEvent(target, 'keydown', 9);
        expect(this.el.innerHTML).toBe('<ol><li>lorem</li><ol><li id="next-level">ipsum</li></ol></ol>');
        expect(document.execCommand).toHaveBeenCalledWith('indent', evt);
    });

    it('should outdent when hitting tab + shift keys within an <li>', function () {
        this.el.innerHTML = '<ol><li>lorem</li><ol><li><span id="next-level"><span>ipsum</span></span></li></ol></ol>';
        var editor = new MediumEditor('.editor'),
            target = editor.elements[0].querySelector('#next-level'),
            evt;
        spyOn(document, 'execCommand').and.callThrough();
        selectElementContents(target);
        evt = fireEvent(target, 'keydown', 9, null, null, null, true);
        expect(this.el.innerHTML).toBe('<ol><li>lorem</li><li>ipsum<br></li></ol>');
        expect(document.execCommand).toHaveBeenCalledWith('outdent', evt);
    });
});
