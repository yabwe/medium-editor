/*global fireEvent, selectElementContentsAndFire */

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
                            shift: false,
                            alt: false
                        },
                        {
                            command: 'subscript',
                            key: 'p',
                            meta: true,
                            shift: true,
                            alt: false
                        }
                    ]
                }
            });

            selectElementContentsAndFire(editor.elements[0]);
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

        it('should execute custom command functions', function () {
            var foo, editor;

            foo = {
                bar: function () {
                    return true;
                }
            };

            spyOn(foo, 'bar');

            editor = this.newMediumEditor('.editor', {
                keyboardCommands: {
                    commands: [
                        {
                            command: foo.bar,
                            key: 'f',
                            meta: true,
                            shift: false,
                            alt: false
                        }
                    ]
                }
            });

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'f'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                shiftKey: false
            });
            expect(foo.bar).toHaveBeenCalled();
        });

        // TODO: remove this test when jumping in 6.0.0
        it('should be executed for custom command without alt defined', function () {
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
                            key: 'r',
                            meta: true,
                            shift: false
                        }
                    ]
                }
            });

            selectElementContentsAndFire(editor.elements[0]);
            // If alt-key is not pressed, command should still be executed
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'p'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                altKey: false
            });
            expect(editor.execAction).toHaveBeenCalledWith('superscript');

            // If alt-key is pressed, command should stil be executed
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'r'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                altKey: true
            });
            expect(editor.execAction).toHaveBeenCalledWith('subscript');
        });

        it('should support the use of Alt key', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor', {
                keyboardCommands: {
                    commands: [
                        {
                            command: 'append-h1',
                            key: '1',
                            meta: true,
                            shift: false,
                            alt: true
                        },
                        {
                            command: 'append-h2',
                            key: '2',
                            meta: true,
                            shift: false,
                            alt: true
                        },
                        {
                            command: 'append-h3',
                            key: '3',
                            meta: true,
                            shift: false,
                            alt: true
                        },
                        {
                            command: 'append-h4',
                            key: '4',
                            meta: true,
                            shift: false,
                            alt: true
                        },
                        {
                            command: 'append-h5',
                            key: '5',
                            meta: true,
                            shift: false,
                            alt: true
                        },
                        {
                            command: 'append-h6',
                            key: '6',
                            meta: true,
                            shift: false,
                            alt: true
                        }
                    ]
                }
            });

            selectElementContentsAndFire(editor.elements[0]);
            ['1', '2', '3', '4', '5', '6'].forEach(function (heading) {
                fireEvent(editor.elements[0], 'keydown', {
                    keyCode: (heading).toString().charCodeAt(0),
                    ctrlKey: true,
                    metaKey: true,
                    altKey: true
                });
                expect(editor.execAction).toHaveBeenCalledWith('append-h' + heading);
            });
        });

        it('should not execute the button action when shift key is pressed', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var editor = this.newMediumEditor('.editor');

            selectElementContentsAndFire(editor.elements[0]);
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
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'B'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true
            });
            expect(editor.execAction).not.toHaveBeenCalled();
        });

        it('should not execute when the command key are false', function () {
            spyOn(MediumEditor.prototype, 'execAction');
            var result,
                editor = this.newMediumEditor('.editor', {
                keyboardCommands: {
                    commands: [
                        {
                            command: false,
                            key: 'J',
                            meta: true,
                            shift: false
                        }
                    ]
                }
            });

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'J'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                shiftKey: false
            });
            expect(editor.execAction).not.toHaveBeenCalled();

            result = fireEvent(editor.elements[0], 'keydown', {
                keyCode: 'J'.charCodeAt(0),
                ctrlKey: true,
                metaKey: true,
                shiftKey: true
            });
            expect(result).toBe(false, 'The command was not blocked because shift key was pressed');
        });
    });
});
