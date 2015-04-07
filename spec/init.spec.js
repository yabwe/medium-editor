/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, tearDown, _ */

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
            spyOn(MediumEditor.prototype, 'setup');
            var editor = new MediumEditor('.test');
            expect(editor.id).toBe(undefined);
            expect(editor.setup).not.toHaveBeenCalled();
            expect(editor.toolbar).toBeUndefined();
            expect(editor.getExtensionByName('anchor')).toBeUndefined();
            expect(editor.getExtensionByName('anchor-preview')).toBeUndefined();
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
            expect(editor.elements.length).toEqual(elements.length);
        });

        it('should allow a single element as parameter', function () {
            var element = document.querySelector('span'),
                editor = new MediumEditor(element);
            expect(editor.elements).toEqual([element]);
        });

        it('should always initalize elements as an Array', function () {
            var nodeList = document.querySelectorAll('span'),
                node = document.querySelector('span'),
                editor = new MediumEditor(nodeList);

            // nodeList is a NodeList, similar to an array but not of the same type
            expect(editor.elements.length).toEqual(nodeList.length);
            expect(typeof nodeList.forEach).toBe('undefined');
            expect(typeof editor.elements.forEach).toBe('function');
            editor.destroy();

            editor = new MediumEditor('span');
            expect(editor.elements.length).toEqual(nodeList.length);
            editor.destroy();

            editor = new MediumEditor(node);
            expect(editor.elements.length).toEqual(1);
            expect(editor.elements[0]).toBe(node);
            editor.destroy();

            editor = new MediumEditor();
            expect(editor.elements).not.toBe(null);
            expect(editor.elements.length).toBe(0);
            editor.destroy();
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
                anchorInputCheckboxLabel: 'Open in new window',
                delay: 0,
                diffLeft: 0,
                diffTop: -10,
                disableReturn: false,
                disableDoubleReturn: false,
                disableEditing: false,
                disableToolbar: false,
                disableAnchorPreview: false,
                disablePlaceholders: false,
                toolbarAlign: 'center',
                elementsContainer: document.body,
                imageDragging: true,
                standardizeSelectionStart: false,
                contentWindow: window,
                ownerDocument: document,
                firstHeader: 'h3',
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
                lastButtonClass: 'medium-editor-button-last',
                paste: {
                    forcePlainText: true,
                    cleanPastedHtml: false,
                    cleanAttrs: ['class', 'style', 'dir'],
                    cleanTags: ['meta']
                }
            },
                editor = new MediumEditor('.editor');
            expect(Object.keys(editor.options).length).toBe(Object.keys(defaultOptions).length);
            expect(_.isEqual(editor.options, defaultOptions)).toBe(true);
        });

        it('should accept custom options values', function () {
            var options = {
                anchorInputPlaceholder: 'test',
                anchorInputCheckboxLabel: 'new window?',
                diffLeft: 10,
                diffTop: 5,
                firstHeader: 'h2',
                secondHeader: 'h3',
                delay: 300
            },
                editor = new MediumEditor('.editor', options);
            Object.keys(options).forEach(function (customOption) {
                expect(editor.options[customOption]).toBe(options[customOption]);
            });
        });

        it('should call the default initialization methods', function () {
            spyOn(MediumEditor.prototype, 'setup').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'createToolbar').and.callThrough();
            spyOn(MediumEditor.statics.AnchorExtension.prototype, 'createForm').and.callThrough();
            spyOn(MediumEditor.statics.AnchorPreview.prototype, 'createPreview').and.callThrough();
            var editor = new MediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');
            expect(editor.id).toBe(1);
            expect(editor.setup).toHaveBeenCalled();
            expect(editor.toolbar).not.toBeUndefined();
            expect(editor.toolbar.createToolbar).toHaveBeenCalled();
            expect(anchorExtension).not.toBeUndefined();
            expect(anchorExtension.createForm).toHaveBeenCalled();
            expect(anchorPreview).not.toBeUndefined();
            expect(anchorPreview.createPreview).toHaveBeenCalled();
        });

        it('should set the ID according to the numbers of editors instantiated', function () {
            var editor1 = new MediumEditor('.editor'),
                editor2 = new MediumEditor('.editor'),
                editor3 = new MediumEditor('.editor');
            expect(editor1.id).toBe(1);
            expect(editor2.id).toBe(2);
            expect(editor3.id).toBe(3);
        });

        it('should not reset ID when destroy and then re-initialized', function () {
            var secondEditor = document.createElement('div'),
                editor1 = new MediumEditor('.editor'),
                editor2;

            secondEditor.className = 'editor-two';
            document.body.appendChild(secondEditor);

            editor2 = new MediumEditor('.editor-two');
            editor1.destroy();
            editor1.init('.editor');

            expect(editor1.id).not.toEqual(editor2.id);
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
