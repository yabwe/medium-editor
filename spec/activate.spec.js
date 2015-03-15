/*global MediumEditor, describe, it, expect, spyOn, jasmine, fireEvent,
         afterEach, beforeEach, selectElementContents, runs, waitsFor,
         tearDown, xit, selectElementContentsAndFire */

describe('Activate/Deactivate TestCase', function () {
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

    it('should toggle the isActive property', function () {
        var editor = new MediumEditor('.editor');
        editor.deactivate();
        expect(editor.isActive).toBe(false);
        editor.activate();
        expect(editor.isActive).toBe(true);
        editor.deactivate();
        expect(editor.isActive).toBe(false);
    });

    describe('Activate', function () {
        it('should init the toolbar and editor elements', function () {
            var editor = new MediumEditor('.editor');
            editor.deactivate();
            spyOn(MediumEditor.prototype, 'setup').and.callThrough();
            editor.activate();
            expect(editor.setup).toHaveBeenCalled();
        });
    });

    describe('Deactivate', function () {

        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should remove mediumEditor elements from DOM', function () {
            var editor = new MediumEditor('.editor');
            expect(document.querySelector('.medium-editor-toolbar')).toBeTruthy();
            editor.deactivate();
            expect(document.querySelector('.medium-editor-toolbar')).toBeFalsy();
        });

        it('should remove all the added events', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.events.events.length).toBeGreaterThan(0);
            editor.deactivate();
            expect(editor.events.events.length).toBe(0);
        });

        it('should abort any pending throttled event handlers', function () {
            var editor, triggerEvents, toolbar;

            editor = new MediumEditor('.editor', {delay: 5});
            triggerEvents = function () {
                fireEvent(window, 'resize');
                fireEvent(document.body, 'click', {
                    target: document.body
                });
                fireEvent(document.body, 'blur');
            };
            // Store toolbar, since deactivate will remove the reference from the editor
            toolbar = editor.toolbar;

            // fire event (handler executed immediately)
            triggerEvents();
            jasmine.clock().tick(1);

            // fire event again (handler delayed because of throttle)
            triggerEvents();

            spyOn(toolbar, 'positionToolbarIfShown').and.callThrough(); // via: handleResize
            spyOn(editor, 'checkSelection').and.callThrough(); // via: handleBlur
            editor.deactivate();
            jasmine.clock().tick(1000); // arbitrary – must be longer than THROTTLE_INTERVAL
            expect(toolbar.positionToolbarIfShown).not.toHaveBeenCalled();
            expect(editor.checkSelection).not.toHaveBeenCalled();
        });

        // regression test for https://github.com/daviferreira/medium-editor/issues/390
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

            jasmine.clock().install();

            editor = new MediumEditor('.editor');

            spyOn(editor.toolbar, 'hideToolbar').and.callThrough(); // via: handleBlur

            selectElementContentsAndFire(editor.elements[0], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.toolbar.hideToolbar).not.toHaveBeenCalled();

            selectElementContentsAndFire(editor.elements[1], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.toolbar.hideToolbar).not.toHaveBeenCalled();

            selectElementContents(editor.elements[2]);
            selectElementContentsAndFire(editor.elements[2], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.toolbar.hideToolbar).not.toHaveBeenCalled();

            elements.forEach(function (el) {
                document.body.removeChild(el);
            });

            jasmine.clock().uninstall();
        });

        // regression test for https://github.com/daviferreira/medium-editor/issues/197
        it('should not crash when deactivated immediately after a mouse click', function () {
            var editor = new MediumEditor('.editor');
            // selected some content and let the toolbar appear
            selectElementContents(editor.elements[0]);
            jasmine.clock().tick(501);

            // fire a mouse up somewhere else (i.e. a button which click handler could have called deactivate() )
            fireEvent(document.documentElement, 'mouseup');
            editor.deactivate();

            jasmine.clock().tick(501);
            expect(true).toBe(true);
        });
    });
});
