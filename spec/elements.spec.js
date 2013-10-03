/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach*/

describe('Elements TestCase', function () {
    'use strict';

    describe('Initialization', function () {
        beforeEach(function () {
            this.body = document.getElementsByTagName('body')[0];
            this.el = document.createElement('div');
            this.el.className = 'editor';
            this.body.appendChild(this.el);
        });

        afterEach(function () {
            var elements = document.querySelectorAll('.medium-editor-toolbar'),
                i;
            for (i = 0; i < elements.length; i += 1) {
                this.body.removeChild(elements[i]);
            }
            this.body.removeChild(this.el);
        });

        it('should set element contenteditable attribute to true', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toEqual('true');
        });

        it('should set element data attr medium-element to true', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('data-medium-element')).toEqual('true');
        });
    });
});
