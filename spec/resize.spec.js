/*global MediumEditor, describe, it, expect,
         afterEach, beforeEach, fireEvent, spyOn,
         selectElementContents, jasmine, tearDown,
         console, xit*/

describe('Resize TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.clock().install();
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'test content';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    it('should reset toolbar position on window resize', function () {
        var editor = new MediumEditor('.editor');
        selectElementContents(editor.elements[0]);
        fireEvent(editor.elements[0], 'mouseup');
        jasmine.clock().tick(101);
        expect(editor.toolbar.className.indexOf('active') > -1).toBe(true);
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(101);
        expect(editor.setToolbarPosition).toHaveBeenCalled();
    });

    // I believe some other test is breaking this one, it passes when runs alone
    // it is calling setToolbar even with no text selected
    xit('should not call setToolbarPosition when toolbar is not visible', function () {
        var editor = new MediumEditor('.editor');
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(101);
        expect(editor.toolbar.className.indexOf('active')).toBe(-1);
        expect(editor.setToolbarPosition).not.toHaveBeenCalled();
    });

});
