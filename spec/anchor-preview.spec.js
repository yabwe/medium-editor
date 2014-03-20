/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, console*/

describe('Anchor Preview TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.Clock.useMock();
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem <a id="test-link" href="http://test.com">ipsum</a> preview <span id="another-element">&nbsp;</span> <a id="test-empty-link" href="">ipsum</a>';
        this.body.appendChild(this.el);
    });

    afterEach(function () {
        var elements = document.querySelectorAll('.medium-editor-toolbar'),
            i,
            sel = window.getSelection();
        for (i = 0; i < elements.length; i += 1) {
            this.body.removeChild(elements[i]);
        }
        this.body.removeChild(this.el);
        sel.removeAllRanges();
    });

    describe('Link Creation', function () {
        it('Hover anchor should show preview', function () {
            var editor = new MediumEditor('.editor', { delay: 200 }),
                sel = window.getSelection();

            // show preview
            spyOn(MediumEditor.prototype, 'showAnchorPreview').andCallThrough();
            editor.editorAnchorObserver({ target: document.getElementById('test-link') });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // preview shows only after delay
            expect(editor.showAnchorPreview).not.toHaveBeenCalled();
            jasmine.Clock.tick(250);
            expect(editor.showAnchorPreview).toHaveBeenCalled();

            // link is set in preview
            expect(editor.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-link').href);

            // load into editor
            spyOn(MediumEditor.prototype, 'showAnchorForm').andCallThrough();
            fireEvent(editor.anchorPreview, 'click');
            jasmine.Clock.tick(300);
            expect(editor.showAnchorForm).toHaveBeenCalled();

            // selecting other text should close the toolbar
            spyOn(MediumEditor.prototype, 'hideToolbarActions').andCallThrough();
            sel.removeAllRanges();
            sel.addRange(document.createRange().selectNodeContents(document.getElementById('another-element')));
            fireEvent(document.documentElement, 'mouseup');
            jasmine.Clock.tick(200);
            expect(editor.hideToolbarActions).toHaveBeenCalled();

        });

        it('Anchor form stays visible on click', function () {
            var editor = new MediumEditor('.editor');

            // show preview
            editor.editorAnchorObserver({ target: document.getElementById('test-link') });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // load into editor
            fireEvent(editor.anchorPreview, 'click');
            jasmine.Clock.tick(200);

            // blur the editable area and focus onto the input for the anchor form
            spyOn(MediumEditor.prototype, 'hideToolbarActions').andCallThrough();
            fireEvent(editor.elements[0], 'blur', undefined, undefined, editor.elements[0], document.querySelector('#medium-editor-toolbar-form-anchor input'));
            jasmine.Clock.tick(1);
            expect(editor.hideToolbarActions).not.toHaveBeenCalled();


        });

        it('Hover empty anchor should NOT show preview', function () {
            var editor = new MediumEditor('.editor', { delay: 200 });

            // show preview
            spyOn(MediumEditor.prototype, 'showAnchorPreview').andCallThrough();
            editor.editorAnchorObserver({ target: document.getElementById('test-empty-link') });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-empty-link'));

            // preview shows only after delay
            jasmine.Clock.tick(250);
            expect(editor.showAnchorPreview).not.toHaveBeenCalled();

        });

    });

});
