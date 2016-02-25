/*global fireEvent */

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
        var eventListener;

        beforeEach(function () {
            eventListener = jasmine.createSpy();

            // File API just doesn't work in IE9, so only verify this functionality if it's not IE9
            if (typeof FileReader === 'function') {
                // Spy on the FileReader and use the spy for any added event listeners
                spyOn(window, 'FileReader').and.returnValue({
                    addEventListener: eventListener,
                    readAsDataURL: function () {
                    }
                });
            }
            // Spy to ensure that image is inserted
            spyOn(MediumEditor.util, 'insertHTMLCommand').and.callThrough();
        });

        it('should remove medium-editor-dragover class and add the image to the editor content', function () {
            var editor = this.newMediumEditor(this.el),
                editableInputListener = jasmine.createSpy();

            editor.subscribe('editableInput', editableInputListener);
            expect(editableInputListener).not.toHaveBeenCalled();

            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
            fireEvent(editor.elements[0], 'drop');
            expect(editor.elements[0].className).not.toContain('medium-editor-dragover');

            // File API just doesn't work in IE9, so only verify this functionality if it's not IE9
            if (typeof FileReader === 'function') {
                // Ensure that the load event is bound to the FileReader
                expect(eventListener.calls.mostRecent().args[0]).toEqual('load');
                // Pass into the event handler our dummy image source
                eventListener.calls.mostRecent().args[1]({
                    target: {
                        result: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                    }
                });

                // Expect that the image is inserted
                expect(MediumEditor.util.insertHTMLCommand).toHaveBeenCalled();
                // Expect that the editableInput event is fired
                expect(editableInputListener).toHaveBeenCalled();
            }
        });

        it('should remove medium-editor-dragover class and NOT add the image to the editor content', function () {
            var editor = this.newMediumEditor(this.el, { imageDragging: false }),
                editableInputListener = jasmine.createSpy();

            editor.subscribe('editableInput', editableInputListener);
            fireEvent(editor.elements[0], 'dragover');
            expect(editor.elements[0].className).toContain('medium-editor-dragover');
            fireEvent(editor.elements[0], 'drop');
            expect(editor.elements[0].className).not.toContain('medium-editor-dragover');

            //The following ensures that MediumEditor.Extension.insertImageFile is not called:
            // 1. Ensure that a load event is not bound to the FileReader
            expect(eventListener.calls.mostRecent()).toEqual(undefined);
            // 2. Expect that the image is not inserted
            expect(MediumEditor.util.insertHTMLCommand).not.toHaveBeenCalled();
            // 3. Expect that the editableInput event is not fired
            expect(editableInputListener).not.toHaveBeenCalled();
        });
    });
});
