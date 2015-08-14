/*global fireEvent, selectElementContents,
         selectElementContentsAndFire */

describe('Setup/Destroy TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should toggle the isActive property', function () {
        var editor = this.newMediumEditor('.editor');
        editor.destroy();
        expect(editor.isActive).toBe(false);
        editor.setup();
        expect(editor.isActive).toBe(true);
        editor.destroy();
        expect(editor.isActive).toBe(false);
    });

    describe('Setup', function () {
        it('should init the toolbar and editor elements', function () {
            var editor = this.newMediumEditor('.editor');
            editor.destroy();
            spyOn(MediumEditor.prototype, 'setup').and.callThrough();
            editor.setup();
            expect(editor.setup).toHaveBeenCalled();
            expect(document.querySelector('[data-medium-editor-element]')).toBeTruthy();
            expect(document.querySelector('[aria-multiline]')).toBeTruthy();
            expect(document.querySelector('[medium-editor-index]')).toBeTruthy();
            expect(document.querySelector('[role]')).toBeTruthy();
            expect(document.querySelector('[spellcheck]')).toBeTruthy();
            expect(document.querySelector('[contenteditable]')).toBeTruthy();
        });

        it('should know about defaults', function () {
            expect(MediumEditor.prototype.defaults).toBeTruthy();
        });
    });

    describe('Destroy', function () {
        it('should remove mediumEditor elements from DOM', function () {
            var editor = this.newMediumEditor('.editor');
            expect(document.querySelector('.medium-editor-toolbar')).toBeTruthy();
            editor.destroy();
            expect(document.querySelector('.medium-editor-toolbar')).toBeFalsy();

            // ensure only initial attributes are here: the editor class
            expect(this.el.getAttribute('class')).toBe('editor');
            expect(this.el.attributes.length).toBe(1);
        });

        it('should remove all the added events', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.events.events.length).toBeGreaterThan(0);
            editor.destroy();
            expect(editor.events.events.length).toBe(0);
        });

        it('should abort any pending throttled event handlers', function () {
            var editor, triggerEvents, toolbar;

            editor = this.newMediumEditor('.editor', { delay: 5 });
            triggerEvents = function () {
                fireEvent(window, 'resize');
                fireEvent(document.body, 'click', {
                    target: document.body
                });
                fireEvent(document.body, 'blur');
            };
            // Store toolbar, since destroy will remove the reference from the editor
            toolbar = editor.getExtensionByName('toolbar');

            // fire event (handler executed immediately)
            triggerEvents();
            jasmine.clock().tick(1);

            // fire event again (handler delayed because of throttle)
            triggerEvents();

            spyOn(toolbar, 'positionToolbarIfShown').and.callThrough(); // via: handleResize
            spyOn(editor, 'checkSelection').and.callThrough(); // via: handleBlur
            editor.destroy();
            jasmine.clock().tick(1000); // arbitrary – must be longer than THROTTLE_INTERVAL
            expect(toolbar.positionToolbarIfShown).not.toHaveBeenCalled();
            expect(editor.checkSelection).not.toHaveBeenCalled();
        });

        // regression test for https://github.com/yabwe/medium-editor/issues/390
        it('should work with multiple elements of the same class', function () {
            var editor,
                el,
                elements = [],
                i;

            for (i = 0; i < 3; i += 1) {
                el = document.createElement('div');
                el.className = 'editor';
                el.textContent = i;
                elements.push(
                    document.body.appendChild(el)
                );
            }

            editor = this.newMediumEditor('.editor');
            var toolbar = editor.getExtensionByName('toolbar');

            spyOn(toolbar, 'hideToolbar').and.callThrough(); // via: handleBlur

            selectElementContentsAndFire(editor.elements[0], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(toolbar.hideToolbar).not.toHaveBeenCalled();

            selectElementContentsAndFire(editor.elements[1], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(toolbar.hideToolbar).not.toHaveBeenCalled();

            selectElementContents(editor.elements[2]);
            selectElementContentsAndFire(editor.elements[2], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(toolbar.hideToolbar).not.toHaveBeenCalled();

            elements.forEach(function (element) {
                document.body.removeChild(element);
            });
        });

        // regression test for https://github.com/yabwe/medium-editor/issues/197
        it('should not crash when destroy immediately after a mouse click', function () {
            var editor = this.newMediumEditor('.editor');
            // selected some content and let the toolbar appear
            selectElementContents(editor.elements[0]);
            jasmine.clock().tick(501);

            // fire a mouse up somewhere else (i.e. a button which click handler could have called destroy() )
            fireEvent(document.documentElement, 'mouseup');
            editor.destroy();

            jasmine.clock().tick(501);
            expect(true).toBe(true);
        });
    });
});
