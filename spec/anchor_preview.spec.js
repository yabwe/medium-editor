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
        this.el.innerHTML = 'lorem <a id="test-link" href="http://test.com">ipsum</a> preview';
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
            var editor = new MediumEditor('.editor');

            // show preview
            spyOn(MediumEditor.prototype, 'showAnchorPreview').andCallThrough();
            editor.editorAnchorObserver({ target: document.getElementById('test-link') });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));
            expect(editor.showAnchorPreview).toHaveBeenCalled();

            // link is set in preview
            expect(editor.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-link').href);

            // load into editor
            spyOn(MediumEditor.prototype, 'showAnchorForm').andCallThrough();
            fireEvent(editor.anchorPreview, 'click');
            jasmine.Clock.tick(200);
            expect(editor.showAnchorForm).toHaveBeenCalled();

        });

    });

});
