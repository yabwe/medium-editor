/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach*/

describe('Initialization TestCase', function () {
    'use strict';

    describe('Objects', function () {
        it('should call init when instantiated', function () {
            spyOn(MediumEditor.prototype, 'init');
            var editor = new MediumEditor('.test');
            expect(editor.init).toHaveBeenCalled();
        });

        it('should accept multiple instances', function () {
            spyOn(MediumEditor.prototype, 'init');
            var editor1 = new MediumEditor('.test'),
                editor2 = new MediumEditor('.test');
            expect(editor1 === editor2).toBe(false);
            expect(MediumEditor.prototype.init).toHaveBeenCalled();
            expect(MediumEditor.prototype.init.calls.length).toBe(2);
        });

        it('should do nothing when selector does not return any elements', function () {
            spyOn(MediumEditor.prototype, 'initElements');
            spyOn(MediumEditor.prototype, 'initToolbar');
            spyOn(MediumEditor.prototype, 'bindSelect');
            spyOn(MediumEditor.prototype, 'bindButtons');
            spyOn(MediumEditor.prototype, 'bindAnchorForm');
            var editor = new MediumEditor('.test');
            expect(editor.id).toBe(undefined);
            expect(editor.initElements).not.toHaveBeenCalled();
            expect(editor.initToolbar).not.toHaveBeenCalled();
            expect(editor.bindSelect).not.toHaveBeenCalled();
            expect(editor.bindButtons).not.toHaveBeenCalled();
            expect(editor.bindAnchorForm).not.toHaveBeenCalled();
            expect(editor.initElements).not.toHaveBeenCalled();
        });
    });

    describe('Elements', function () {
        it('should allow a string as parameter', function () {
            spyOn(document, 'querySelectorAll').andCallThrough();
            (function () {
                return new MediumEditor('.test');
            }());
            expect(document.querySelectorAll).toHaveBeenCalled();
        });

        it('should allow a list of html elements as parameters', function () {
            var elements = document.querySelectorAll('span'),
                editor = new MediumEditor(elements);
            expect(editor.elements).toBe(elements);
        });
    });

    describe('With a valid element', function () {
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

        it('should have a default set of options', function () {
            var defaultOptions = {
                    anchorInputPlaceholder: 'Paste or type a link',
                    delay: 0,
                    diffLeft: 0,
                    diffTop: -10,
                    disableReturn: false,
                    disableToolbar: false,
                    firstHeader: 'h3',
                    forcePlainText: true,
                    allowMultiParagraphSelection: true,
                    placeholder: 'Type your text',
                    secondHeader: 'h4',
                    buttons: [ 'bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote' ]
                },
                editor = new MediumEditor('.editor');
            expect(editor.options).toEqual(defaultOptions);
        });

        it('should accept custom options values', function () {
            var options = {
                    anchorInputPlaceholder: 'test',
                    diffLeft: 10,
                    diffTop: 5,
                    firstHeader: 'h2',
                    secondHeader: 'h3',
                    delay: 300
                },
                editor = new MediumEditor('.editor', options);
            expect(editor.options).toEqual(options);
        });

        it('should call the default initialization methods', function () {
            spyOn(MediumEditor.prototype, 'initElements').andCallThrough();
            spyOn(MediumEditor.prototype, 'initToolbar').andCallThrough();
            spyOn(MediumEditor.prototype, 'bindSelect').andCallThrough();
            spyOn(MediumEditor.prototype, 'bindButtons').andCallThrough();
            spyOn(MediumEditor.prototype, 'bindAnchorForm').andCallThrough();
            var editor = new MediumEditor('.editor');
            expect(editor.id).toBe(1);
            expect(editor.initElements).toHaveBeenCalled();
            expect(editor.initToolbar).toHaveBeenCalled();
            expect(editor.bindSelect).toHaveBeenCalled();
            expect(editor.bindButtons).toHaveBeenCalled();
            expect(editor.bindAnchorForm).toHaveBeenCalled();
            expect(editor.initElements).toHaveBeenCalled();
        });

        it('should set the ID according to the numbers of editors instantiated', function () {
            var editor1 = new MediumEditor('.editor'),
                editor2 = new MediumEditor('.editor'),
                editor3 = new MediumEditor('.editor');
            expect(editor1.id).toBe(1);
            expect(editor2.id).toBe(2);
            expect(editor3.id).toBe(3);
        });
    });
});
