/*global MediumEditor, describe, it, expect, jasmine,
    fireEvent, afterEach, beforeEach, tearDown,
    selectElementContentsAndFire, Events */

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

    describe('Custom Focus/Blur Listener', function () {
        it('should be called and passed the editable element when the editable gets focus', function () {
            var editor = new MediumEditor('.editor'),
                focusedEditable,
                blurredEditable,
                focusListener = function (event, editable) {
                    focusedEditable = editable;
                },
                blurListener = function (event, editable) {
                    blurredEditable = editable;
                };
            editor.subscribe('focus', focusListener);
            editor.subscribe('blur', blurListener);

            editor.selectElement(this.el.firstChild);
            expect(focusedEditable).toBe(this.el);
            expect(blurredEditable).toBeUndefined();

            fireEvent(document.body, 'mousedown');
            fireEvent(document.body, 'mouseup');
            fireEvent(document.body, 'click');
            expect(blurredEditable).toBe(this.el);
        });

        it('should not trigger after detaching', function () {
            var focusSpy = jasmine.createSpy('handler'),
                blurSpy = jasmine.createSpy('handler'),
                editor = new MediumEditor('.editor');
            editor.subscribe('focus', focusSpy);
            editor.subscribe('blur', blurSpy);

            editor.selectElement(this.el.firstChild);
            expect(focusSpy.calls.count()).toBe(1);
            expect(blurSpy).not.toHaveBeenCalled();

            fireEvent(document.body, 'click');
            expect(blurSpy).toHaveBeenCalled();

            editor.unsubscribe('focus', focusSpy);
            editor.selectElement(this.el.firstChild);
            expect(focusSpy.calls.count()).toBe(1);

            editor.unsubscribe('blur', blurSpy);
            fireEvent(document.body, 'click');
            expect(blurSpy.calls.count()).toBe(1);
        });

        it('should not be called after destroying editor', function () {
            var editor = new MediumEditor('.editor'),
                focusSpy = jasmine.createSpy('handler'),
                blurSpy = jasmine.createSpy('handler');
            editor.subscribe('focus', focusSpy);
            editor.subscribe('blur', blurSpy);

            this.el.focus();
            fireEvent(this.el, 'focus');
            expect(focusSpy.calls.count()).toBe(1);
            expect(blurSpy).not.toHaveBeenCalled();

            fireEvent(document.body, 'click');
            expect(blurSpy).toHaveBeenCalled();

            editor.destroy();

            this.el.focus();
            fireEvent(this.el, 'focus');
            expect(focusSpy.calls.count()).toBe(1);

            fireEvent(document.body, 'click');
            expect(blurSpy.calls.count()).toBe(1);
        });
    });

    describe('Custom EditableInput Listener', function () {

        function runEditableInputTests(namePrefix) {
            it(namePrefix + ' should trigger with the corresponding editor element passed as an argument', function () {
                var editableTwo = document.createElement('div'),
                    firedTarget;
                editableTwo.className = 'editor';
                editableTwo.textContent = 'lore ipsum';
                document.body.appendChild(editableTwo);

                var editor = new MediumEditor('.editor'),
                    handler = function (event, editable) {
                        firedTarget = editable;
                    };
                expect(editor.elements.length).toBe(2);
                editor.subscribe('editableInput', handler);

                editableTwo.textContent = 'lore ipsum!';
                fireEvent(editableTwo, 'input');
                fireEvent(editableTwo, 'keypress');
                jasmine.clock().tick(1);
                expect(firedTarget).toBe(editableTwo);

                tearDown(editableTwo);
            });

            it(namePrefix + ' should only trigger when the content has actually changed', function () {
                var editableTwo = document.createElement('div'),
                    firedTarget;
                editableTwo.className = 'editor';
                editableTwo.textContent = 'lore ipsum';
                document.body.appendChild(editableTwo);

                var editor = new MediumEditor('.editor'),
                    handler = function (event, editable) {
                        firedTarget = editable;
                    };
                expect(editor.elements.length).toBe(2);
                editor.subscribe('editableInput', handler);

                // If content hasn't changed, custom event won't fire
                fireEvent(editableTwo, 'input');
                fireEvent(editableTwo, 'keypress');
                expect(firedTarget).toBeUndefined();

                // Change the content, custom event should fire
                editableTwo.textContent = 'lore ipsum!';
                fireEvent(editableTwo, 'input');
                fireEvent(editableTwo, 'keypress');
                jasmine.clock().tick(1);
                expect(firedTarget).toBe(editableTwo);

                tearDown(editableTwo);
            });

            it(namePrefix + ' should trigger when bolding text', function () {
                var editableTwo = document.createElement('div'),
                    firedTarget;
                editableTwo.className = 'editor';
                editableTwo.textContent = 'lore ipsum';
                document.body.appendChild(editableTwo);

                var editor = new MediumEditor('.editor'),
                    button = editor.toolbar.getToolbarElement().querySelector('[data-action="bold"]'),
                    handler = function (event, editable) {
                        firedTarget = editable;
                    };
                expect(editor.elements.length).toBe(2);
                editor.subscribe('editableInput', handler);

                selectElementContentsAndFire(editableTwo.firstChild);
                expect(firedTarget).toBeUndefined();
                fireEvent(button, 'click');
                jasmine.clock().tick(1);

                expect(firedTarget).toBe(editableTwo);

                tearDown(editableTwo);
            });
        }

        var originalState = Events.prototype.InputEventOnContenteditableSupported;

        Events.prototype.InputEventOnContenteditableSupported = true;
        runEditableInputTests('when Input is supported');
        Events.prototype.InputEventOnContenteditableSupported = false;
        runEditableInputTests('when Input is NOT supported');

        Events.prototype.InputEventOnContenteditableSupported = originalState;
    });
});
