/*global MediumEditor, describe, it, expect,
         afterEach, beforeEach, fireEvent, spyOn,
         selectElementContentsAndFire, jasmine, tearDown,
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
        selectElementContentsAndFire(editor.elements[0]);
        jasmine.clock().tick(101);
        expect(editor.toolbar.className.indexOf('active') > -1).toBe(true);
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(101);
        expect(editor.setToolbarPosition).toHaveBeenCalled();
        editor.deactivate();
    });

    it('should not call setToolbarPosition when toolbar is not visible', function () {
        var editor = new MediumEditor('.editor');
        spyOn(editor, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(101);
        expect(editor.toolbar.className.indexOf('active')).toBe(-1);
        expect(editor.setToolbarPosition).not.toHaveBeenCalled();
    });

});
