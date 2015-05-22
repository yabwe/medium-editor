/*global MediumEditor, describe, it, expect,
         afterEach, beforeEach, fireEvent, spyOn,
         selectElementContentsAndFire, jasmine, setupTestHelpers */

describe('Resize TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'test content');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should reset toolbar position on window resize', function () {
        var editor = this.newMediumEditor('.editor');
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
        var editor = this.newMediumEditor('.editor');
        spyOn(editor.toolbar, 'setToolbarPosition').and.callThrough();
        fireEvent(window, 'resize');
        jasmine.clock().tick(1);
        expect(editor.toolbar.getToolbarElement().className.indexOf('active')).toBe(-1);
        expect(editor.toolbar.setToolbarPosition).not.toHaveBeenCalled();
    });

    it('should throttle multiple calls to position toolbar', function () {
        var editor = this.newMediumEditor('.editor'),
            tickTime = 60,
            totalTicks;

        selectElementContentsAndFire(editor.elements[0]);
        jasmine.clock().tick(1);
        expect(editor.toolbar.getToolbarElement().className.indexOf('active') > -1).toBe(true);

        spyOn(editor.toolbar, 'setToolbarPosition').and.callThrough();
        for (totalTicks = 0; totalTicks < tickTime; totalTicks += 10) {
            fireEvent(window, 'resize');
            jasmine.clock().tick(10);
        }
        expect(editor.toolbar.setToolbarPosition.calls.count()).toBeLessThan(3);
    });
});
