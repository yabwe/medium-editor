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