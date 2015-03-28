/*global MediumEditor, describe, it, expect,
         afterEach, beforeEach, fireEvent, spyOn,
         selectElementContentsAndFire, jasmine, tearDown */

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
        jasmine.clock().tick(1);
        expect(editor.toolbar.getToolbarElement().className.indexOf('active') > -1).toBe(true);
        spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(1);
        expect(editor.toolbar.setToolbarPosition).toHaveBeenCalled();
        editor.destroy();
    });

    it('should not call setToolbarPosition when toolbar is not visible', function () {
        var editor = new MediumEditor('.editor');
        spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition');
        fireEvent(window, 'resize');
        jasmine.clock().tick(1);
        expect(editor.toolbar.getToolbarElement().className.indexOf('active')).toBe(-1);
        expect(editor.toolbar.setToolbarPosition).not.toHaveBeenCalled();
    });

    it('should throttle multiple calls to position toolbar', function () {
        var editor = new MediumEditor('.editor'),
            tickTime = 60,
            totalTicks;

        selectElementContentsAndFire(editor.elements[0]);
        jasmine.clock().tick(1);
        expect(editor.toolbar.getToolbarElement().className.indexOf('active') > -1).toBe(true);

        spyOn(MediumEditor.statics.Toolbar.prototype, 'setToolbarPosition');
        for (totalTicks = 0; totalTicks < tickTime; totalTicks += 10) {
            fireEvent(window, 'resize');
            jasmine.clock().tick(10);
        }
        expect(editor.toolbar.setToolbarPosition.calls.count()).toBeLessThan(3);
    });
});
