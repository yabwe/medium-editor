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
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeTruthy();
            editor.deactivate();
            expect(document.querySelector('.medium-editor-toolbar')).toBeFalsy();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeFalsy();
        });

        it('should remove all the added events', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.events.length).toBeGreaterThan(0);
            editor.deactivate();
            expect(editor.events.length).toBe(0);
        });

        it('should abort any pending throttled event handlers', function () {
            var editor, triggerEvents;

            editor = new MediumEditor('.editor', {delay: 5});
            triggerEvents = function () {
                fireEvent(window, 'resize', null, false);
                fireEvent(document.body, 'click', null, false, document.body);
                fireEvent(document.body, 'blur', null, false);
            };

            // fire event (handler executed immediately)
            triggerEvents();
            jasmine.clock().tick(1);

            // fire event again (handler delayed because of throttle)
            triggerEvents();

            spyOn(editor, 'positionToolbarIfShown').and.callThrough(); // via: handleResize
            spyOn(editor, 'hideToolbarActions').and.callThrough(); // via: handleBlur
            editor.deactivate();
            jasmine.clock().tick(1000); // arbitrary – must be longer than THROTTLE_INTERVAL
            expect(editor.positionToolbarIfShown).not.toHaveBeenCalled();
            expect(editor.hideToolbarActions).not.toHaveBeenCalled();
        });

        // regression test for https://github.com/daviferreira/medium-editor/issues/390
        xit('should work with multiple elements of the same class', function () {
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

            spyOn(editor, 'hideToolbarActions').and.callThrough(); // via: handleBlur

            selectElementContentsAndFire(editor.elements[0], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.hideToolbarActions).not.toHaveBeenCalled();

            selectElementContentsAndFire(editor.elements[1], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.hideToolbarActions).not.toHaveBeenCalled();

            selectElementContents(editor.elements[2]);
            selectElementContentsAndFire(editor.elements[2], { eventToFire: 'click' });
            jasmine.clock().tick(51);
            expect(editor.hideToolbarActions).not.toHaveBeenCalled();

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
