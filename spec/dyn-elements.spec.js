/*global fireEvent */

describe('MediumEditor.DynamicElements TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
        this.addOne = this.createElement('div', 'add-one', 'lore ipsum dolor');
        this.addTwo = this.createElement('div', 'add-two', 'lore ipsum dollar');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('addElements', function () {
        it('should initialize dom element properly when adding dynamically', function () {
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

            editor.addElements(this.addOne);
            expect(this.addOne.getAttribute('data-medium-editor-element')).toBeDefined();
            expect(editor.elements.length).toBe(2);

            editor.addElements(this.addOne);
            expect(editor.elements.length).toBe(2);

            editor.selectElement(this.addOne.firstChild);
            expect(focusedEditable).toBe(this.addOne);
            expect(blurredEditable).toBeUndefined();

            fireEvent(document.body, 'mousedown');
            fireEvent(document.body, 'mouseup');
            fireEvent(document.body, 'click');
            expect(blurredEditable).toBe(this.addOne);
        });

        it('should attach all event handlers to an element when adding an element', function () {
            var listenerWrapper = function () {
                this.listenerInfo.push([arguments[0], arguments[1], arguments[2]]);
                this._addEventListner.apply(this, arguments);
            };

            this.el._addEventListner = this.el.addEventListener;
            this.el.listenerInfo = [];
            this.el.addEventListener = listenerWrapper.bind(this.el);
            this.addOne._addEventListner = this.addOne.addEventListener;
            this.addOne.listenerInfo = [];
            this.addOne.addEventListener = listenerWrapper.bind(this.addOne);

            // Instatiating editor will trigger adding event handlers to each element
            expect(this.el.listenerInfo.length).toBe(0);
            var editor = this.newMediumEditor('.editor', { anchorPreview: false });
            expect(this.el.listenerInfo.length).not.toBe(0);
            var listenerCount = this.el.listenerInfo.length;
            editor.subscribe('editableBlur', function blurHandler () { });
            expect(this.el.listenerInfo.length).toBe(listenerCount + 1);

            // When adding a new element, all handlers should also be added to that element
            expect(this.addOne.listenerInfo.length).toBe(0);
            editor.addElements(this.addOne);
            expect(this.addOne.listenerInfo.length).toBe(this.el.listenerInfo.length);

            // When attaching a new handler, the handler should be added to dynamically added elements too
            editor.subscribe('editableMouseover', function mouseoverHandler () {});
            expect(this.el.listenerInfo.length).toBe(listenerCount + 2);
            expect(this.addOne.listenerInfo.length).toBe(listenerCount + 2);

            // Check that the same handlers have been added to each element
            this.el.listenerInfo.forEach(function (elListener) {
                var found = this.addOne.listenerInfo.some(function (addOneListener) {
                    return elListener[0] === addOneListener[0] && elListener[0].name === addOneListener[0].name;
                });
                expect(found).toBe(true);
            }, this);
        });

        it('should accept a selector to specify elements to add', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            editor.addElements('.add-one');
            expect(editor.elements.length).toBe(2);
        });

        it('should accept a NodeList to specify elements to add', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            editor.addElements(document.getElementsByClassName('add-one'));
            expect(editor.elements.length).toBe(2);
        });

        it('should not add an element that is already an editor element', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            editor.addElements('.editor');
            expect(editor.elements.length).toBe(1);
        });

        it('should attach editableKeydownEnter to the editor when adding an element with a data-disable-return attribute', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.events.customEvents['editableKeydownEnter'].length).toBe(1);

            this.addOne.setAttribute('data-disable-return', true);
            editor.addElements(this.addOne);
            expect(editor.events.customEvents['editableKeydownEnter'].length).toBe(2, 'editableKeydownEnter should be subscribed to when adding a data-disbale-return element');
        });

        it('should trigger addElement custom event for each element', function () {
            var editor = this.newMediumEditor('.editor'),
                spy = jasmine.createSpy('handler');

            editor.subscribe('addElement', spy);
            editor.addElements('.add-one');
            expect(spy).toHaveBeenCalledWith({ target: this.addOne, currentTarget: this.addOne }, this.addOne);

            editor.addElements(document.getElementsByClassName('add-two'));
            expect(spy).toHaveBeenCalledWith({ target: this.addTwo, currentTarget: this.addTwo }, this.addTwo);
        });

        function runAddTest(inputSupported) {
            it('should re-attach element properly when removed from dom, cleaned up and injected to dom again', function () {
                var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
                MediumEditor.Events.prototype.InputEventOnContenteditableSupported = inputSupported;

                var editor = this.newMediumEditor('.editor'),
                focusedEditable,
                firedTarget,
                firedCounter,
                handler = function (event, editable) {
                    firedTarget = editable;
                    firedCounter++;
                },
                focusListener = function (event, editable) {
                    focusedEditable = editable;
                };

                firedCounter = 0;

                editor.subscribe('focus', focusListener);
                editor.subscribe('editableInput', handler);

                editor.addElements(this.addOne);
                expect(this.addOne.getAttribute('data-medium-editor-element')).toBeDefined();
                expect(editor.elements.length).toBe(2);

                // Detach + exec fn + reattach, asynchronous.
                detach(this.addOne, true, function (reattach) {
                    editor.removeElements(this.addOne);
                    expect(editor.elements.length).toBe(1);

                    reattach();

                    editor.addElements(this.addTwo);
                    expect(editor.elements.length).toBe(2);
                    expect(this.addTwo.getAttribute('data-medium-editor-element')).toBeDefined();

                    editor.selectElement(this.addTwo.firstChild);
                    expect(focusedEditable).toBe(this.addTwo);

                    editor.selectElement(this.addTwo.firstChild);
                    this.addTwo.textContent = 'lore ipsum!';

                    // trigger onInput
                    fireEvent(this.addTwo, 'input');

                    // trigger faked 'selectionchange' event
                    fireEvent(document, 'selectionchange', { target: document, currentTarget: this.addTwo });

                    jasmine.clock().tick(1);
                    expect(firedTarget).toBe(this.addTwo);
                    expect(firedCounter).toBe(1);

                    MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
                }.bind(this));
            });
        }

        runAddTest(true);
        runAddTest(false);
    });

    describe('removeElements', function () {
        it('should accept specific elements to remove', function () {
            var editor = this.newMediumEditor('.editor, .add-one');
            expect(editor.elements.indexOf(this.addOne)).not.toBe(-1);
            expect(editor.elements.indexOf(this.el)).not.toBe(-1);
            editor.removeElements(this.addOne);
            expect(editor.elements.indexOf(this.addOne)).toBe(-1);
            expect(editor.elements.indexOf(this.el)).not.toBe(-1);
            editor.removeElements(this.el);
            expect(editor.elements.indexOf(this.el)).toBe(-1);
        });

        it('should accept a selector to specify elements to remove', function () {
            var editor = this.newMediumEditor('.editor, .add-one');
            expect(editor.elements.length).toBe(2);
            editor.removeElements('.editor');
            expect(editor.elements.length).toBe(1);
            editor.removeElements('.add-one');
            expect(editor.elements.length).toBe(0);
        });

        it('should accept a NodeList to specify elements to remove', function () {
            var editor = this.newMediumEditor('.editor, .add-one');
            expect(editor.elements.length).toBe(2);
            editor.removeElements(document.getElementsByClassName('editor'));
            expect(editor.elements.length).toBe(1);
            editor.removeElements(document.getElementsByClassName('add-one'));
            expect(editor.elements.length).toBe(0);
        });

        it('should detach all event handlers from an element', function () {
            var attached = [],
                origAdd = this.el.addEventListener,
                origRemove = this.el.removeEventListener;

            this.el.removeEventListener = function () {
                var args = arguments;
                attached = attached.filter(function (props) {
                    if (props[0] === args[0] && props[1] === args[1] && props[2] === args[2]) {
                        return false;
                    }
                    return true;
                });
                origRemove.apply(this, arguments);
            }.bind(this.el);
            this.el.addEventListener = function () {
                attached.push([arguments[0], arguments[1], arguments[2]]);
                origAdd.apply(this, arguments);
            }.bind(this.el);

            // Instatiating editor will trigger adding event handlers to each element
            var editor = this.newMediumEditor('.editor, .add-one');
            expect(attached.length).not.toBe(0);

            // Removing should make calls to remove each individual event handler
            editor.removeElements(this.el);
            expect(attached.length).toBe(0);
        });

        it('should trigger removeElement custom event for each element', function () {
            var editor = this.newMediumEditor('.editor, .add-one, .add-two'),
                spy = jasmine.createSpy('handler');

            editor.subscribe('removeElement', spy);
            editor.removeElements('.add-one');
            expect(spy).toHaveBeenCalledWith({ target: this.addOne, currentTarget: this.addOne }, this.addOne);

            editor.removeElements(document.getElementsByClassName('add-two'));
            expect(spy).toHaveBeenCalledWith({ target: this.addTwo, currentTarget: this.addTwo }, this.addTwo);
        });
    });
});

function detach(node, async, fn) {
    var parent = node.parentNode,
        next = node.nextSibling;
    // No parent node? Abort!
    if (!parent) {
        return;
    }
    // Detach node from DOM.
    parent.removeChild(node);
    // Handle case where optional `async` argument is omitted.
    if (typeof async !== 'boolean') {
        fn = async;
        async = false;
    }
    // Note that if a function wasn't passed, the node won't be re-attached!
    if (fn && async) {
        // If async == true, reattach must be called manually.
        fn.call(node, reattach);
    } else if (fn) {
        // If async != true, reattach will happen automatically.
        fn.call(node);
        reattach();
    }
    // Re-attach node to DOM.
    function reattach() {
        parent.insertBefore(node, next);
    }
}
