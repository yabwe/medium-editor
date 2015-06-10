/*global MediumEditor, describe, it, expect, beforeEach,
    afterEach, setupTestHelpers, jasmine, spyOn, fireEvent,
    selectElementContentsAndFire */

describe('KeyboardCommands TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('execAction', function () {
        it('should be executed when the keys are pressed', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            // bold
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'B'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('bold');

            // italics
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'I'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('italic');

            // underline
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'U'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('underline');
        });

        it('should be executed for custom commands', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor', {
                keyboardCommands: {
                    commands: [
                        {
                            command: 'superscript',
                            key: 'p',
                            meta: true,
                            shift: false
                        },
                        {
                            command: 'subscript',
                            key: 'p',
                            meta: true,
                            shift: true
                        }
                    ]
                }
            });
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'p'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                shiftKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('subscript');
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'p'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('superscript');
        });

        it('should not execute the button action when shift key is pressed', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'B'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                shiftKey: true
            });
            expect(editor.execAction).not.toHaveBeenCalled();
        });

        it('should not execute when keyboard-commands are disabled', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor', {
                keyboardCommands: false
            });
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'B'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).not.toHaveBeenCalled();
        });
    });
});