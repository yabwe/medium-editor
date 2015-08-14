/*global fireEvent, isIE9 */

describe('Drag and Drop TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('drag', function () {
        it('should add medium-editor-dragover class', function () {
            var editor = this.newMediumEditor(this.el);
            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
        });

        it('should add medium-editor-dragover class even when data is invalid', function () {
            var editor = this.newMediumEditor(this.el, {
                imageDragging: false
            });
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
    });

    describe('drop', function () {
        it('should remove medium-editor-dragover class and add the image to the editor content', function () {
            spyOn(MediumEditor.util, 'insertHTMLCommand').and.callThrough();
            var editor = this.newMediumEditor(this.el);
            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
            fireEvent(editor.elements[0], 'drop');
            expect(editor.elements[0].className).not.toContain('medium-editor-dragover');
            // File API just doesn't work in IE9, so only verify this functionality if it's not IE9
            if (!isIE9()) {
                expect(MediumEditor.util.insertHTMLCommand).toHaveBeenCalled();
            }
        });

        it('should remove medium-editor-dragover class and NOT add the image to the editor content', function () {
            spyOn(MediumEditor.util, 'insertHTMLCommand').and.callThrough();
            var editor = this.newMediumEditor(this.el, { imageDragging: false });
            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
            fireEvent(editor.elements[0], 'drop');
            expect(editor.elements[0].className).not.toContain('medium-editor-dragover');
            expect(MediumEditor.util.insertHTMLCommand).not.toHaveBeenCalled();
        });
    });
});
