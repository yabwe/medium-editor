/*global MediumEditor, describe, it, expect, spyOn*/

describe('Medium Editor TestCase', function () {
    'use strict';

    describe('Initialization', function () {
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

        it('should have a default set of options', function () {
            var body = document.getElementsByTagName('body')[0],
                defaultOptions = {
                    excludedActions: [],
                    anchorInputPlaceholder: 'Paste or type a link',
                    diffLeft: 0,
                    diffTop: -5,
                    firstHeader: 'h3',
                    secondHeader: 'h4',
                    delay: 0
                },
                editor,
                el = document.createElement('div');
            el.className = 'editor';
            body.appendChild(el);
            editor = new MediumEditor('.editor');
            body.removeChild(el);
            expect(editor.options).toEqual(defaultOptions);
        });
    });
});
