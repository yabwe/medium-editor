/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, tearDown*/

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
            expect(MediumEditor.prototype.init.calls.count()).toBe(2);
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
            spyOn(document, 'querySelectorAll').and.callThrough();
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

        it('should allow a single element as parameter', function () {
            var element = document.querySelector('span'),
                editor = new MediumEditor(element);
            expect(editor.elements).toEqual([element]);
        });
    });

    describe('With a valid element', function () {
        beforeEach(function () {
            this.el = document.createElement('div');
            this.el.className = 'editor';
            document.body.appendChild(this.el);
        });

        afterEach(function () {
            tearDown(this.el);
        });

        it('should have a default set of options', function () {
            var defaultOptions = {
                anchorInputPlaceholder: 'Paste or type a link',
                delay: 0,
                diffLeft: 0,
                diffTop: -10,
                disableReturn: false,
                disableDoubleReturn: false,
                disableEditing: false,
                disableToolbar: false,
                elementsContainer: document.body,
                firstHeader: 'h3',
                forcePlainText: true,
                cleanPastedHTML: false,
                allowMultiParagraphSelection: true,
                placeholder: 'Type your text',
                secondHeader: 'h4',
                buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
                buttonLabels: false,
                targetBlank: false,
                anchorTarget: false,
                anchorButton: false,
                anchorButtonClass: 'btn',
                anchorPreviewHideDelay: 500,
                checkLinkFormat: false,
                extensions: {},
                activeButtonClass: 'medium-editor-button-active',
                firstButtonClass: 'medium-editor-button-first',
                lastButtonClass: 'medium-editor-button-last'
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
            spyOn(MediumEditor.prototype, 'initElements').and.callThrough();
            spyOn(MediumEditor.prototype, 'initToolbar').and.callThrough();
            spyOn(MediumEditor.prototype, 'bindSelect').and.callThrough();
            spyOn(MediumEditor.prototype, 'bindButtons').and.callThrough();
            spyOn(MediumEditor.prototype, 'bindAnchorForm').and.callThrough();
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

        it('should use document.body as element container when no container element is specified', function () {
            spyOn(document.body, 'appendChild').and.callThrough();
            (function () {
                return new MediumEditor('.editor');
            }());
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should accept a custom element container for MediumEditor elements', function () {
            var div = document.createElement('div');
            document.body.appendChild(div);
            spyOn(div, 'appendChild').and.callThrough();
            (function () {
                return new MediumEditor('.editor', {
                    elementsContainer: div
                });
            }());
            expect(div.appendChild).toHaveBeenCalled();
            document.body.removeChild(div);
        });
    });
});
