/*global MediumEditor, describe, it,  expect, spyOn,
    afterEach, beforeEach, jasmine, fireEvent, tearDown */

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

    describe('anchor preview element', function () {
        it('should be displayed on hover of a link element', function () {
            var editor = new MediumEditor('.editor', {
                delay: 200
            }),
                sel = window.getSelection(),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                nextRange;

            // show preview
            spyOn(MediumEditor.statics.AnchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();

            // link is set in preview
            expect(anchorPreview.getPreviewElement().querySelector('i').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // load into editor
            spyOn(MediumEditor.statics.AnchorExtension.prototype, 'showForm').and.callThrough();
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(300);
            expect(editor.getExtensionByName('anchor').showForm).toHaveBeenCalled();

            // selecting other text should close the toolbar
            spyOn(MediumEditor.statics.Toolbar.prototype, 'hideToolbar').and.callThrough();
            nextRange = document.createRange();
            nextRange.selectNodeContents(document.getElementById('another-element'));
            sel.removeAllRanges();
            sel.addRange(nextRange);
            fireEvent(document.getElementById('another-element'), 'click');
            jasmine.clock().tick(200);
            expect(editor.toolbar.hideToolbar).toHaveBeenCalled();
        });

        it('should show the unencoded link', function () {
            var editor = new MediumEditor('.editor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            fireEvent(document.getElementById('test-symbol-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(200);

            // link is set in preview
            expect(anchorPreview.getPreviewElement().querySelector('i').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('should display different urls when hovering over different links consecutively', function () {
            var editor = new MediumEditor('.editor', {
                delay: 300
            }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview for first link
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(300);
            expect(anchorPreview.getPreviewElement().querySelector('i').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // show preview for second link
            fireEvent(document.getElementById('test-symbol-link'), 'mouseover');
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(false);

            // wait for delay
            jasmine.clock().tick(300);
            expect(anchorPreview.getPreviewElement().querySelector('i').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('should display the anchor form in the toolbar when clicked', function () {
            var editor = new MediumEditor('.editor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // load into editor
            jasmine.clock().tick(1);
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(200);

            expect(editor.toolbar.isDisplayed()).toBe(true);
            expect(editor.getExtensionByName('anchor').isDisplayed()).toBe(true);
        });

        it('should NOT be displayed when the hovered link is empty', function () {
            var editor = new MediumEditor('.editor', {
                delay: 200
            }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            spyOn(MediumEditor.statics.AnchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-empty-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
        });

        it('should not be present when disableAnchorPreview option is passed', function () {
            var editor = new MediumEditor('.editor', {
                disableAnchorPreview: true
            }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            expect(anchorPreview).toBeUndefined();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should not be present when disableToolbar option is passed', function () {
            var editor = new MediumEditor('.editor', {
                disableToolbar: true
            }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            expect(anchorPreview).toBeUndefined();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should be removed from the document when editor is destroyed', function () {
            var editor = new MediumEditor('.editor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            spyOn(MediumEditor.statics.AnchorPreview.prototype, 'deactivate').and.callThrough();
            expect(document.querySelector('.medium-editor-anchor-preview')).not.toBeNull();
            expect(document.querySelector('.medium-editor-anchor-preview-active')).toBeNull();

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            jasmine.clock().tick(1);
            expect(document.querySelector('.medium-editor-anchor-preview-active')).not.toBeNull();

            // destroy
            editor.destroy();
            expect(anchorPreview.deactivate).toHaveBeenCalled();
            expect(document.querySelector('.medium-editor-anchor-preview-active')).toBeNull();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });
    });

});
