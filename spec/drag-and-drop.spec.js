/*global describe, it, expect, spyOn,
     afterEach, beforeEach, setupTestHelpers, fireEvent, Util,
     isIE9*/

describe('Drag and Drop TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should do nothing when option is false', function () {
        var editor = this.newMediumEditor(this.el, { imageDragging: false });
        fireEvent(editor.elements[0], 'dragover');
        expect(editor.elements[0].className).not.toContain('medium-editor-dragover');
    });

    it('should add medium-editor-dragover class on drag over', function () {
        var editor = this.newMediumEditor(this.el);
        fireEvent(editor.elements[0], 'dragover');
        expect(editor.elements[0].className).toContain('medium-editor-dragover');
    });

    it('should remove medium-editor-dragover class on drag leave', function () {
        var editor = this.newMediumEditor(this.el);
        fireEvent(editor.elements[0], 'dragover');
        expect(editor.elements[0].className).toContain('medium-editor-dragover');
        fireEvent(editor.elements[0], 'dragleave');
        expect(editor.elements[0].className).not.toContain('medium-editor-dragover');
    });

    describe('drop', function () {
        it('should remove medium-editor-dragover class and add the image to the editor content', function () {
            spyOn(Util, 'insertHTMLCommand').and.callThrough();
            var editor = this.newMediumEditor(this.el);
            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
            fireEvent(editor.elements[0], 'drop');
            expect(editor.elements[0].className).not.toContain('medium-editor-dragover');
            // File API just doesn't work in IE9, so only verify this functionality if it's not IE9
            if (!isIE9()) {
                expect(Util.insertHTMLCommand).toHaveBeenCalled();
            }
        });
    });
});
