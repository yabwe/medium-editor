/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, tearDown*/

describe('Elements TestCase', function () {
    'use strict';

    describe('Initialization', function () {
        beforeEach(function () {
            document.body = document.getElementsByTagName('body')[0];
            this.el = document.createElement('div');
            this.el.className = 'editor';
            document.body.appendChild(this.el);
        });

        afterEach(function () {
            tearDown(this.el);
        });

        it('should set element contenteditable attribute to true', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toEqual('true');
        });

        it('should not set element contenteditable when disableEditing is true', function () {
            var editor = new MediumEditor('.editor', {
                disableEditing: true
            });
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toBeFalsy();
        });

        it('should not set element contenteditable when data-disable-editing is true', function () {
            this.el.setAttribute('data-disable-editing', true);
            var editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('contenteditable')).toBeFalsy();
        });

        it('should set element data attr medium-element to true', function () {
            var editor = new MediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            expect(this.el.getAttribute('data-medium-element')).toEqual('true');
        });
    });
});
