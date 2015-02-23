/*global MediumEditor, describe, it, xit, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, console, tearDown*/

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
            spyOn(MediumEditor.prototype, 'showAnchorPreview').and.callThrough();
            editor.editorAnchorObserver({
                target: document.getElementById('test-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // preview shows only after delay
            expect(editor.showAnchorPreview).not.toHaveBeenCalled();
            jasmine.clock().tick(250);
            expect(editor.showAnchorPreview).toHaveBeenCalled();

            // link is set in preview
            expect(editor.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // load into editor
            spyOn(MediumEditor.statics.AnchorExtension.prototype, 'showForm').and.callThrough();
            fireEvent(editor.anchorPreview, 'click');
            jasmine.clock().tick(300);
            expect(editor.getExtensionByName('anchor').showForm).toHaveBeenCalled();

            // selecting other text should close the toolbar
            spyOn(MediumEditor.prototype, 'hideToolbarActions').and.callThrough();
            nextRange = document.createRange();
            nextRange.selectNodeContents(document.getElementById('another-element'));
            sel.removeAllRanges();
            sel.addRange(nextRange);
            fireEvent(document.documentElement, 'mouseup');
            jasmine.clock().tick(200);
            expect(editor.hideToolbarActions).toHaveBeenCalled();

        });

        it('Should show the unencoded link within the preview', function () {
            var editor = new MediumEditor('.editor');

            // show preview
            editor.editorAnchorObserver({
                target: document.getElementById('test-symbol-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-symbol-link'));

            // preview shows only after delay
            jasmine.clock().tick(200);

            // link is set in preview
            expect(editor.anchorPreview.querySelector('i').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('Anchor form stays visible on click', function () {
            var editor = new MediumEditor('.editor');

            // show preview
            editor.editorAnchorObserver({
                target: document.getElementById('test-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-link'));

            // load into editor
            fireEvent(editor.anchorPreview, 'click');
            jasmine.clock().tick(200);

            expect(editor.isToolbarShown()).toBe(true);
            expect(editor.getExtensionByName('anchor').isDisplayed()).toBe(true);
        });

        it('Hover empty anchor should NOT show preview', function () {
            var editor = new MediumEditor('.editor', {
                delay: 200
            });

            // show preview
            spyOn(MediumEditor.prototype, 'showAnchorPreview').and.callThrough();
            editor.editorAnchorObserver({
                target: document.getElementById('test-empty-link')
            });
            fireEvent(editor.elements[0], 'mouseover', undefined, undefined, document.getElementById('test-empty-link'));

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(editor.showAnchorPreview).not.toHaveBeenCalled();
        });

    });

});
