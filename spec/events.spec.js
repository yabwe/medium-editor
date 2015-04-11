/*global MediumEditor, describe, it, expect, jasmine,
    fireEvent, afterEach, beforeEach, tearDown */

describe('Events TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.textContent = 'lore ipsum';
        document.body.appendChild(this.el);
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
        tearDown(this.el);
    });

    describe('On', function () {
        it('should bind listener', function () {
            var el, editor, spy;
            el = document.createElement('div');
            el = document.body.appendChild(el);
            spy = jasmine.createSpy('handler');
            editor = new MediumEditor('.editor');
            editor.on(el, 'click', spy);
            fireEvent(el, 'click');
            jasmine.clock().tick(1);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Off', function () {
        it('should unbind listener', function () {
            var el, editor, spy;
            el = document.createElement('div');
            spy = jasmine.createSpy('handler');
            editor = new MediumEditor('.editor');
            editor.on(el, 'click', spy);
            editor.off(el, 'click', spy);
            fireEvent(el, 'click');
            jasmine.clock().tick(1);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('Subscribe', function () {
        it('to editableInput should trigger with the corresponding editor element passed as an argument', function () {
            var editableTwo = document.createElement('div'),
                editor,
                handler,
                firedTarget;
            editableTwo.className = 'editor';
            editableTwo.textContent = 'lore ipsum';
            document.body.appendChild(editableTwo);

            editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(2);

            handler = function (event, editable) {
                firedTarget = editable;
            };

            editor.subscribe('editableInput', handler);

            fireEvent(editableTwo, 'input');
            expect(firedTarget).toBe(editableTwo);

            tearDown(editableTwo);
        });
    });
});
