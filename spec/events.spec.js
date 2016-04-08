/*global fireEvent, selectElementContents,
         selectElementContentsAndFire */

describe('MediumEditor.Events TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('On', function () {
        it('should bind listener', function () {
            var el, editor, spy;
            el = this.createElement('div');
            spy = jasmine.createSpy('handler');
            editor = this.newMediumEditor('.editor');
            editor.on(el, 'click', spy);
            fireEvent(el, 'click');
            jasmine.clock().tick(1);
            expect(spy).toHaveBeenCalled();
        });

        it('should bind listener even to list of elements', function () {
            var el1, el2, elements, editor, spy;
            el1 = this.createElement('div');
            el1.classList.add('test-element');
            el2 = this.createElement('div');
            el2.classList.add('test-element');
            elements = document.getElementsByClassName('test-element');
            spy = jasmine.createSpy('handler');
            editor = this.newMediumEditor('.editor');
            editor.on(elements, 'click', spy);
            fireEvent(el1, 'click');
            jasmine.clock().tick(1);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Off', function () {
        it('should unbind listener', function () {
            var el, editor, spy;
            el = this.createElement('div');
            spy = jasmine.createSpy('handler');
            editor = this.newMediumEditor('.editor');
            editor.on(el, 'click', spy);
            editor.off(el, 'click', spy);
            fireEvent(el, 'click');
            jasmine.clock().tick(1);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should unbind listener even from list of elements', function () {
            var el1, el2, elements, editor, spy;
            el1 = this.createElement('div');
            el1.classList.add('test-element');
            el2 = this.createElement('div');
            el2.classList.add('test-element');
            elements = document.getElementsByClassName('test-element');
            spy = jasmine.createSpy('handler');
            editor = this.newMediumEditor('.editor');
            editor.on(elements, 'click', spy);
            editor.off(elements, 'click', spy);
            fireEvent(el1, 'click');
            jasmine.clock().tick(1);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('Custom Events', function () {
        it('should be attachable and triggerable if they are not built-in events', function () {
            var editor = this.newMediumEditor('.editor'),
                spy = jasmine.createSpy('handler'),
                tempData = { temp: 'data' };
            editor.subscribe('myIncredibleEvent', spy);
            expect(spy).not.toHaveBeenCalled();
            editor.trigger('myIncredibleEvent', tempData, editor.elements[0]);
            expect(spy).toHaveBeenCalledWith(tempData, editor.elements[0]);
        });

        it('can be disabled for a temporary period of time on a named basis', function () {
            var editor = this.newMediumEditor('.editor'),
                spy = jasmine.createSpy('handler'),
                tempData = { temp: 'data' };
            editor.subscribe('myIncredibleEvent', spy);
            expect(spy).not.toHaveBeenCalled();
            editor.events.disableCustomEvent('myIncredibleEvent');
            editor.trigger('myIncredibleEvent', tempData, editor.elements[0]);
            expect(spy).not.toHaveBeenCalled();
            editor.events.enableCustomEvent('myIncredibleEvent');
            editor.trigger('myIncredibleEvent', tempData, editor.elements[0]);
            expect(spy).toHaveBeenCalledWith(tempData, editor.elements[0]);
        });
    });

    describe('Custom Focus/Blur Listener', function () {
        it('should be called and passed the editable element when the editable gets focus', function () {
            var editor = this.newMediumEditor('.editor'),
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
                editor = this.newMediumEditor('.editor');
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
            var editor = this.newMediumEditor('.editor'),
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

    describe('ExecCommand Listener', function () {
        it('should only wrap document.execCommand when required', function () {
            var origExecCommand = document.execCommand;
            this.newMediumEditor('.editor', {
                placeholder: false
            });
            expect(document.execCommand).toBe(origExecCommand);
        });

        it('should wrap document.execCommand with a custom method', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var origExecCommand = document.execCommand,
                mockInstance = {
                    options: { ownerDocument: document }
                },
                events = new MediumEditor.Events(mockInstance),
                handler = spyOn(events, 'handleDocumentExecCommand');

            events.attachToExecCommand();
            expect(document.execCommand).not.toBe(origExecCommand);
            expect(document.execCommand.listeners.length).toBe(1);

            // Creating a real contenteditable to select to keep firefox happy during tests
            var tempEl = this.createElement('div', '', 'firefox is lame');
            tempEl.setAttribute('contenteditable', true);
            selectElementContents(tempEl);
            document.execCommand('bold', false, null);

            expect(handler).toHaveBeenCalled();
            expect(origExecCommand).toHaveBeenCalledWith('bold', false, null);
        });

        it('should notify all listeners when execCommand is called', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var origExecCommand = document.execCommand,
                mockInstance = {
                    options: { ownerDocument: document }
                },
                eventsOne = new MediumEditor.Events(mockInstance),
                eventsTwo = new MediumEditor.Events(mockInstance),
                handlerOne = spyOn(eventsOne, 'handleDocumentExecCommand'),
                handlerTwo = spyOn(eventsTwo, 'handleDocumentExecCommand'),
                args = ['bold', false, 'something'];

            eventsOne.attachToExecCommand();
            eventsTwo.attachToExecCommand();
            expect(document.execCommand).not.toBe(origExecCommand);
            expect(document.execCommand.listeners.length).toBe(2);
            expect(handlerOne).not.toHaveBeenCalled();
            expect(handlerTwo).not.toHaveBeenCalled();

            // Creating a real contenteditable to select to keep firefox happy during tests
            var tempEl = this.createElement('div', '', 'firefox is lame');
            tempEl.setAttribute('contenteditable', true);
            selectElementContents(tempEl);
            document.execCommand.apply(document, args);

            var expectedObj = {
                command: 'bold',
                value: 'something',
                args: args,
                result: true
            };

            expect(handlerOne).toHaveBeenCalledWith(expectedObj);
            expect(handlerTwo).toHaveBeenCalledWith(expectedObj);
            expect(origExecCommand).toHaveBeenCalledWith('bold', false, 'something');

            eventsOne.destroy();
            eventsTwo.destroy();
        });

        it('should revert back to original execCommand when all listeners are removed', function () {
            var origExecCommand = document.execCommand,
                mockInstance = {
                    options: { ownerDocument: document }
                },
                eventsOne = new MediumEditor.Events(mockInstance),
                eventsTwo = new MediumEditor.Events(mockInstance);

            expect(document.execCommand).toBe(origExecCommand);
            eventsOne.attachToExecCommand();
            eventsTwo.attachToExecCommand();
            expect(document.execCommand).not.toBe(origExecCommand);

            eventsOne.detachExecCommand();
            expect(document.execCommand).not.toBe(origExecCommand);

            eventsTwo.detachExecCommand();
            expect(document.execCommand).toBe(origExecCommand);

            eventsOne.destroy();
            eventsTwo.destroy();
        });

        it('should wrap and unwrap execCommand when using MediumEditor methods', function () {
            var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = false;

            spyOn(document, 'execCommand').and.callThrough();
            var origExecCommand = document.execCommand,
                editor = this.newMediumEditor('.editor');

            editor.subscribe('editableInput', function () { });
            expect(document.execCommand).not.toBe(origExecCommand);

            editor.selectElement(editor.elements[0].firstChild);
            document.execCommand('bold', null, false);
            expect(origExecCommand).toHaveBeenCalledWith('bold', null, false);

            editor.destroy();
            expect(document.execCommand).toBe(origExecCommand);

            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
        });

        it('should expose a method for calling all listeners manually', function () {
            var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = false;

            spyOn(document, 'execCommand').and.callThrough();
            var origExecCommand = document.execCommand,
                mockInstance = {
                    options: { ownerDocument: document }
                },
                eventsOne = new MediumEditor.Events(mockInstance),
                eventsTwo = new MediumEditor.Events(mockInstance),
                handlerOne = spyOn(eventsOne, 'handleDocumentExecCommand'),
                handlerTwo = spyOn(eventsTwo, 'handleDocumentExecCommand'),
                args = ['bold', false, 'something'];

            eventsOne.attachToExecCommand();
            eventsTwo.attachToExecCommand();
            expect(document.execCommand).not.toBe(origExecCommand);
            expect(document.execCommand.listeners.length).toBe(2);
            expect(document.execCommand.callListeners).not.toBeUndefined();
            expect(handlerOne).not.toHaveBeenCalled();
            expect(handlerTwo).not.toHaveBeenCalled();

            document.execCommand.callListeners(args, true);

            var expectedObj = {
                command: 'bold',
                value: 'something',
                args: args,
                result: true
            };

            expect(handlerOne).toHaveBeenCalledWith(expectedObj);
            expect(handlerTwo).toHaveBeenCalledWith(expectedObj);
            expect(origExecCommand).not.toHaveBeenCalled();

            eventsOne.destroy();
            eventsTwo.destroy();

            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
        });
    });

    describe('Custom EditableInput Listener', function () {

        function runEditableInputTests(inputSupported) {
            var namePrefix = inputSupported ? 'when Input is supported' : 'when Input is NOT supported';

            it(namePrefix + ' should trigger with the corresponding editor element passed as an argument', function () {
                var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = inputSupported;

                var editableTwo = this.createElement('div', 'editor', 'lore ipsum'),
                    firedTarget,
                    editor = this.newMediumEditor('.editor'),
                    handler = function (event, editable) {
                        firedTarget = editable;
                    };
                expect(editor.elements.length).toBe(2);

                editor.subscribe('editableInput', handler);
                editor.selectElement(editableTwo.firstChild);

                editableTwo.textContent = 'lore ipsum!';

                // trigger onInput
                fireEvent(editableTwo, 'input');

                // trigger faked 'selectionchange' event
                fireEvent(document, 'selectionchange', { target: document, currentTarget: editableTwo });

                jasmine.clock().tick(1);
                expect(firedTarget).toBe(editableTwo);

                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
            });

            it(namePrefix + ' should only trigger when the content has actually changed', function () {
                var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = inputSupported;

                var editableTwo = this.createElement('div', 'editor', 'lore ipsum'),
                    firedTarget,
                    editor = this.newMediumEditor('.editor'),
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

                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
            });

            it(namePrefix + ',setContent should fire editableInput when content changes', function () {
                var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = inputSupported;

                var newHTML = 'Lorem ipsum dolor',
                    editor = this.newMediumEditor('.editor'),
                    spy = jasmine.createSpy('handler');

                editor.subscribe('editableInput', spy);
                expect(spy).not.toHaveBeenCalled();

                editor.setContent(newHTML, 0);
                var obj = { target: this.el, currentTarget: this.el };
                expect(spy).toHaveBeenCalledWith(obj, this.el);
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
            });

            it(namePrefix + ', setContent should not fire editableInput when content doesn\'t change', function () {
                var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = inputSupported;

                var sameHTML = 'lore ipsum',
                    editor = this.newMediumEditor('.editor'),
                    spy = jasmine.createSpy('handler');

                editor.subscribe('editableInput', spy);
                expect(spy).not.toHaveBeenCalled();

                editor.setContent(sameHTML, 0);
                expect(spy).not.toHaveBeenCalled();
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
            });
        }

        runEditableInputTests(true);
        runEditableInputTests(false);

        it('should trigger when bolding text when input event is NOT supported', function () {
            var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = false;

            var editableTwo = this.createElement('div', 'editor', 'lore ipsum'),
                firedTarget,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button = toolbar.getToolbarElement().querySelector('[data-action="bold"]'),
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

            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
        });
    });

    describe('Setup some listeners', function () {
        var links = [
            'externalInteraction',
            'blur',
            'focus',
            'editableInput',
            'editableClick',
            'editableBlur',
            'editableKeypress',
            'editableKeyup',
            'editableKeydown',
            'editableKeydownEnter',
            'editableKeydownTab',
            'editableKeydownDelete',
            'editableMouseover',
            'editableDrag',
            'editableDrop',
            'editablePaste'
        ];

        links.forEach(function (listener) {
            it('should setup "' + listener + '" listener', function () {
                var editor = this.newMediumEditor('.editor'),
                    events = new MediumEditor.Events(editor);

                events.setupListener(listener);

                expect(events.listeners[listener]).toBe(true);
            });
        });
    });
});
