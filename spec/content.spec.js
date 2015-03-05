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

    it('should prevent new lines from being inserted when disableReturn options is true', function () {
        this.el.innerHTML = 'lorem ipsum';
        var editor = new MediumEditor('.editor', {
            disableReturn: true
        });
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'keypress', 13);
        expect(this.el.innerHTML).toBe('lorem ipsum');
    });

    it('should prevent consecutive new lines from being inserted when disableDoubleReturn is true', function () {
        this.el.innerHTML = '<br> ';
        var editor = new MediumEditor('.editor', {
            disableDoubleReturn: true
        });
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'keypress', 13);
        expect(this.el.innerHTML).toBe('<br> ');
    });

    it('should call formatBlock when a keyup results in an empty element', function () {
        this.el.innerHTML = '';
        var editor = new MediumEditor('.editor');
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'keyup', 8);
        expect(this.el.innerHTML).toBe('<p><br></p>');
    });

    it('should insert a breaking paragraph before header when hitting entery key while cursor is as the front of a header tag', function () {
        this.el.innerHTML = '<h2>lorem</h2><h3>ipsum</h3>';
        var editor = new MediumEditor('.editor'),
            targetNode = editor.elements[0].querySelector('h3'),
            selection = window.getSelection(),
            newRange = document.createRange();
        selection.removeAllRanges();
        newRange.setStart(targetNode, 0);
        selection.addRange(newRange);
        fireEvent(targetNode, 'keydown', 13);
        expect(this.el.innerHTML).toBe('<h2>lorem</h2><p><br></p><h3>ipsum</h3>');
    });

    it('should remove empty element if hitting delete key inside empty element before a header tag', function () {
        this.el.innerHTML = '<h2>lorem</h2><p><br></p><h3>ipsum</h3>';
        var editor = new MediumEditor('.editor'),
            targetNode = editor.elements[0].querySelector('p');
        selectElementContents(targetNode);
        fireEvent(targetNode, 'keydown', 46);
        expect(this.el.innerHTML).toBe('<h2>lorem</h2><h3>ipsum</h3>');
    });
});
