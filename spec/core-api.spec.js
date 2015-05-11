/*global describe, it, expect, beforeEach, afterEach,
    setupTestHelpers */

describe('Core-API', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('getFocusedElement', function () {
        it('should return the element which currently has a data-medium-focused attribute', function () {
            var elementOne = this.createElement('div', 'editor', 'lorem ipsum'),
                elementTwo = this.createElement('div', 'editor', 'lorem ipsum');
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = this.newMediumEditor('.editor'),
                focused = editor.getFocusedElement();
            expect(focused).not.toBe(elementOne);
            expect(focused).toBe(elementTwo);
        });

        it('should return the element focused via call to selectElement', function () {
            var elementOne = this.createElement('div', 'editor', 'lorem ipsum'),
                elementTwo = this.createElement('div', 'editor', 'lorem ipsum');
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = this.newMediumEditor('.editor');

            editor.selectElement(elementOne.firstChild);
            var focused = editor.getFocusedElement();
            expect(focused).toBe(elementOne);
        });
    });
});