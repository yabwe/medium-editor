/*global MediumEditor, describe, it, expect, spyOn,
    AnchorForm, afterEach, beforeEach, setupTestHelpers, _,
    AnchorPreview */

describe('Initialization TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Objects', function () {
        it('should call init when instantiated', function () {
            spyOn(MediumEditor.prototype, 'init');
            var editor = this.newMediumEditor('.test');
            expect(editor.init).toHaveBeenCalled();
        });

        it('should accept multiple instances', function () {
            spyOn(MediumEditor.prototype, 'init');
            var editor1 = this.newMediumEditor('.test'),
                editor2 = this.newMediumEditor('.test');
            expect(editor1 === editor2).toBe(false);
            expect(MediumEditor.prototype.init).toHaveBeenCalled();
            expect(MediumEditor.prototype.init.calls.count()).toBe(2);
        });

        it('should do nothing when selector does not return any elements', function () {
            spyOn(MediumEditor.prototype, 'setup');
            var editor = this.newMediumEditor('.test');
            expect(editor.isActive).toBeFalsy();
            expect(editor.events).toBeUndefined();
            expect(editor.toolbar).toBeUndefined();
            expect(editor.getExtensionByName('anchor')).toBeUndefined();
            expect(editor.getExtensionByName('anchor-preview')).toBeUndefined();
        });
    });

    describe('Elements', function () {
        it('should allow a string as parameter', function () {
            spyOn(document, 'querySelectorAll').and.callThrough();
            this.newMediumEditor('.test');
            expect(document.querySelectorAll).toHaveBeenCalled();
        });

        it('should allow a list of html elements as parameters', function () {
            var elements = document.querySelectorAll('span'),
                editor = this.newMediumEditor(elements);
            expect(editor.elements.length).toEqual(elements.length);
        });

        it('should allow a single element as parameter', function () {
            var element = document.querySelector('span'),
                editor = this.newMediumEditor(element);
            expect(editor.elements).toEqual([element]);
        });

        it('should always initalize elements as an Array', function () {
            var nodeList = document.querySelectorAll('span'),
                node = document.querySelector('span'),
                editor = this.newMediumEditor(nodeList);

            // nodeList is a NodeList, similar to an array but not of the same type
            expect(editor.elements.length).toEqual(nodeList.length);
            expect(typeof nodeList.forEach).toBe('undefined');
            expect(typeof editor.elements.forEach).toBe('function');
            editor.destroy();

            editor = this.newMediumEditor('span');
            expect(editor.elements.length).toEqual(nodeList.length);
            editor.destroy();

            editor = this.newMediumEditor(node);
            expect(editor.elements.length).toEqual(1);
            expect(editor.elements[0]).toBe(node);
            editor.destroy();

            editor = this.newMediumEditor();
            expect(editor.elements).not.toBe(null);
            expect(editor.elements.length).toBe(0);
            editor.destroy();
        });

        it('should be available after destroying and calling setup again', function () {
            var editor = this.newMediumEditor('.editor');
            expect(editor.elements.length).toBe(1);
            editor.destroy();
            expect(editor.elements.length).toBe(0);
            editor.setup();
            expect(editor.elements.length).toBe(1);
        });
    });

    describe('With a valid element', function () {
        it('should have a default set of options', function () {
            var defaultOptions = {
                delay: 0,
                diffLeft: 0,
                diffTop: -10,
                disableReturn: false,
                disableDoubleReturn: false,
                disableEditing: false,
                disableToolbar: false,
                autoLink: false,
                toolbarAlign: 'center',
                elementsContainer: document.body,
                imageDragging: true,
                standardizeSelectionStart: false,
                contentWindow: window,
                ownerDocument: document,
                firstHeader: 'h3',
                allowMultiParagraphSelection: true,
                secondHeader: 'h4',
                buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
                buttonLabels: false,
                targetBlank: false,
                extensions: {},
                activeButtonClass: 'medium-editor-button-active',
                firstButtonClass: 'medium-editor-button-first',
                lastButtonClass: 'medium-editor-button-last',
                spellcheck: true
            },
                editor = this.newMediumEditor('.editor');
            expect(Object.keys(editor.options).length).toBe(Object.keys(defaultOptions).length);
            expect(_.isEqual(editor.options, defaultOptions)).toBe(true);
        });

        it('should accept custom options values', function () {
            var options = {
                diffLeft: 10,
                diffTop: 5,
                firstHeader: 'h2',
                secondHeader: 'h3',
                delay: 300,
                anchor: {
                    placeholderText: 'test',
                    targetCheckboxText: 'new window?'
                },
                paste: {
                    forcePlainText: false,
                    cleanPastedHTML: true
                }
            },
                editor = this.newMediumEditor('.editor', options);
            Object.keys(options).forEach(function (customOption) {
                expect(editor.options[customOption]).toBe(options[customOption]);
            });
        });

        it('should call the default initialization methods', function () {
            spyOn(MediumEditor.prototype, 'setup').and.callThrough();
            spyOn(MediumEditor.statics.Toolbar.prototype, 'createToolbar').and.callThrough();
            spyOn(AnchorForm.prototype, 'createForm').and.callThrough();
            spyOn(AnchorPreview.prototype, 'createPreview').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
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
            var editor1 = this.newMediumEditor('.editor'),
                editor2 = this.newMediumEditor('.editor'),
                editor3 = this.newMediumEditor('.editor');
            expect(editor1.id).toBe(1);
            expect(editor2.id).toBe(2);
            expect(editor3.id).toBe(3);
        });

        it('should not reset ID when destroy and then re-initialized', function () {
            var editor1 = this.newMediumEditor('.editor'),
                editor2;

            this.createElement('div', 'editor-two');
            editor2 = this.newMediumEditor('.editor-two');
            editor1.destroy();
            editor1.init('.editor');

            expect(editor1.id).not.toEqual(editor2.id);
        });

        it('should use document.body as element container when no container element is specified', function () {
            spyOn(document.body, 'appendChild').and.callThrough();
            this.newMediumEditor('.editor');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should accept a custom element container for MediumEditor elements', function () {
            var div = this.createElement('div');
            spyOn(div, 'appendChild').and.callThrough();
            this.newMediumEditor('.editor', {
                elementsContainer: div
            });
            expect(div.appendChild).toHaveBeenCalled();
        });
    });
});