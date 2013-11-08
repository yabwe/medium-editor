/*global MediumEditor, describe, it, expect,
         afterEach, beforeEach, fireEvent, spyOn,
         selectElementContents, jasmine*/

describe('Placeholder TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'test content';
        this.body.appendChild(this.el);
        jasmine.Clock.useMock();
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

    it('should reset toolbar position on window resize', function () {
        var editor = new MediumEditor('.editor');
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'mouseup');
        jasmine.Clock.tick(101);
        expect(editor.toolbar.className.indexOf('active') > -1).toBe(true);
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.Clock.tick(101);
        expect(editor.setToolbarPosition).toHaveBeenCalled();
    });

    it('should not cal setToolbarPosition when toolbar is not visible', function () {
        var editor = new MediumEditor('.editor');
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.Clock.tick(101);
        expect(editor.toolbar.className.indexOf('active')).toBe(-1);
        expect(editor.setToolbarPosition).not.toHaveBeenCalled();
    });

});
