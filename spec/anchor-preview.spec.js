/*global MediumEditor, describe, it, xit, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, console, tearDown, Toolbar*/

describe('Anchor Preview TestCase', function () {
    'use strict';

    beforeEach(function () {
        jasmine.clock().install();
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ' +
            '<a id="test-link" href="http://test.com">ipsum</a> ' +
            'preview <span id="another-element">&nbsp;</span> ' +
            '<a id="test-empty-link" href="">ipsum</a> ' +
            '<a id="test-symbol-link" href="http://[{~#custom#~}].com"></a>';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    describe('Link Creation', function () {
        it('Hover anchor should show preview', function () {
            var editor = new MediumEditor('.editor', {
                delay: 200
            }),
                sel = window.getSelection(),
                nextRange;

            // show preview
            spyOn(Toolbar.prototype, 'showAnchorPreview').and.callThrough();
            editor.toolbar.editorAnchorObserver({
                target: document.getElementById('test-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // preview shows only after delay
            expect(editor.toolbar.showAnchorPreview).not.toHaveBeenCalled();
            jasmine.clock().tick(250);
            expect(editor.toolbar.showAnchorPreview).toHaveBeenCalled();

            // link is set in preview
            expect(editor.toolbar.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // load into editor
            spyOn(Toolbar.prototype, 'showAnchorForm').and.callThrough();
            fireEvent(editor.toolbar.anchorPreview, 'click');
            jasmine.clock().tick(300);
            expect(editor.toolbar.showAnchorForm).toHaveBeenCalled();

            // selecting other text should close the toolbar
            spyOn(Toolbar.prototype, 'hideToolbarActions').and.callThrough();
            nextRange = document.createRange();
            nextRange.selectNodeContents(document.getElementById('another-element'));
            sel.removeAllRanges();
            sel.addRange(nextRange);
            fireEvent(document.documentElement, 'mouseup');
            jasmine.clock().tick(200);
            expect(editor.toolbar.hideToolbarActions).toHaveBeenCalled();

        });

        it('Should show the unencoded link within the preview', function () {
            var editor = new MediumEditor('.editor');

            // show preview
            editor.toolbar.editorAnchorObserver({
                target: document.getElementById('test-symbol-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-symbol-link'));

            // preview shows only after delay
            jasmine.clock().tick(200);

            // link is set in preview
            expect(editor.toolbar.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('Anchor form stays visible on click', function () {
            var editor = new MediumEditor('.editor');

            // show preview
            editor.toolbar.editorAnchorObserver({
                target: document.getElementById('test-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // load into editor
            fireEvent(editor.toolbar.anchorPreview, 'click');
            jasmine.clock().tick(200);

            expect(editor.toolbar.isToolbarShown()).toBe(true);
            expect(editor.anchorExtension.isDisplayed()).toBe(true);
        });

        it('Hover empty anchor should NOT show preview', function () {
            var editor = new MediumEditor('.editor', {
                delay: 200
            });

            // show preview
            spyOn(Toolbar.prototype, 'showAnchorPreview').and.callThrough();
            editor.toolbar.editorAnchorObserver({
                target: document.getElementById('test-empty-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-empty-link'));

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(editor.toolbar.showAnchorPreview).not.toHaveBeenCalled();
        });

    });

});
