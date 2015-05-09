/*global MediumEditor, describe, it, expect, tearDown */

describe('Core-API', function () {
    'use strict';

    describe('getFocusedElement', function () {
        it('should return the element which currently has a data-medium-focused attribute', function () {
            var elementOne = document.body.appendChild(document.createElement('div')),
                elementTwo = document.body.appendChild(document.createElement('div'));
            elementOne.className = elementTwo.className = 'editor';
            elementOne.innerHTML = elementTwo.innerHTML = 'lorem ipsum';
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = new MediumEditor('.editor'),
                focused = editor.getFocusedElement();
            expect(focused).toBe(elementTwo);

            tearDown(elementOne);
            tearDown(elementTwo);
        });

        it('should return the element focused via call to selectElement', function () {
            var elementOne = document.body.appendChild(document.createElement('div')),
                elementTwo = document.body.appendChild(document.createElement('div'));
            elementOne.className = elementTwo.className = 'editor';
            elementOne.innerHTML = elementTwo.innerHTML = 'lorem ipsum';
            elementTwo.setAttribute('data-medium-focused', true);

            var editor = new MediumEditor('.editor');

            editor.selectElement(elementOne.firstChild);
            var focused = editor.getFocusedElement();
            expect(focused).toBe(elementOne);

            tearDown(elementOne);
            tearDown(elementTwo);
        });
    });
});