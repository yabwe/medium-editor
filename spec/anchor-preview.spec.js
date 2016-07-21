/*global fireEvent, selectElementContentsAndFire */

describe('Anchor Preview TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor',
            'lorem ' +
            '<a id="test-link" href="http://test.com">ipsum</a> ' +
            'preview <span id="another-element">&nbsp;</span> ' +
            '<a id="test-empty-link" href="">ipsum</a> ' +
            '<a id="test-link-disable-preview" data-disable-preview="true" href="http://test.com">ipsum</a> ' +
            '<a id="test-markup-link" href="http://test.com"><b>ipsum</b></a> ' +
            '<a id="test-symbol-link" href="http://[{~#custom#~}].com"></a> ' +
            '<a id="text-target-blank-link" target="_blank" href="http://test.com">ipsum</a> ' +
            '<a id="text-custom-class-link" class="custom-class" href="http://test.com">ipsum</a>');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('anchor preview element', function () {
        it('should be displayed on hover of a link element', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200
                }),
                toolbar = editor.getExtensionByName('toolbar'),
                sel = window.getSelection(),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                nextRange;

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();

            // link is set in preview
            expect(anchorPreview.getPreviewElement().querySelector('a').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // load into editor
            spyOn(MediumEditor.extensions.anchor.prototype, 'showForm').and.callThrough();
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(300);
            expect(editor.getExtensionByName('anchor').showForm).toHaveBeenCalled();

            // selecting other text should close the toolbar
            spyOn(MediumEditor.extensions.toolbar.prototype, 'hideToolbar').and.callThrough();
            nextRange = document.createRange();
            nextRange.selectNodeContents(document.getElementById('another-element'));
            sel.removeAllRanges();
            sel.addRange(nextRange);
            fireEvent(document.getElementById('another-element'), 'click');
            jasmine.clock().tick(200);
            expect(toolbar.hideToolbar).toHaveBeenCalled();
        });

        it('should be displayed on hover of a link element with markup inside', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-markup-link'), 'mouseover');

            // preview shows only after delay
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();

            // link is set in preview
            expect(anchorPreview.getPreviewElement().querySelector('a').innerHTML).toBe(document.getElementById('test-markup-link').attributes.href.value);
        });

        it('should show the unencoded link', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            fireEvent(document.getElementById('test-symbol-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(200);

            // link is set in preview
            expect(anchorPreview.getPreviewElement().querySelector('a').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('should display different urls when hovering over different links consecutively', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 300
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview for first link
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(300);
            expect(anchorPreview.getPreviewElement().querySelector('a').innerHTML).toBe(document.getElementById('test-link').attributes.href.value);

            // show preview for second link
            fireEvent(document.getElementById('test-symbol-link'), 'mouseover');
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(false);

            // wait for delay
            jasmine.clock().tick(300);
            expect(anchorPreview.getPreviewElement().querySelector('a').innerHTML).toBe(document.getElementById('test-symbol-link').attributes.href.value);
        });

        it('should display the anchor form in the toolbar when clicked', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        targetCheckbox: true,
                        targetCheckboxText: 'Open in new window',
                        customClassOption: 'custom-class',
                        customClassOptionText: 'Custom Class'
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                anchor = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // load into editor
            jasmine.clock().tick(1);
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(200);

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchor.isDisplayed()).toBe(true);

            // textbox should contain the url
            expect(anchor.getInput().value).toEqual('http://test.com');

            // the checkboxes should be unchecked
            expect(anchor.getAnchorTargetCheckbox().checked).toBe(false);
            expect(anchor.getAnchorButtonCheckbox().checked).toBe(false);
        });

        it('should display the anchor form with target checkbox checked in the toolbar when clicked', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        targetCheckbox: true,
                        targetCheckboxText: 'Open in new window',
                        customClassOption: 'custom-class',
                        customClassOptionText: 'Custom Class'
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                anchor = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // show preview
            fireEvent(document.getElementById('text-target-blank-link'), 'mouseover');

            // load into editor
            jasmine.clock().tick(1);
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(200);

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchor.isDisplayed()).toBe(true);

            // the checkboxes should be unchecked
            expect(anchor.getAnchorTargetCheckbox().checked).toBe(true);
            expect(anchor.getAnchorButtonCheckbox().checked).toBe(false);
        });

        it('should display the anchor form with custom class checkbox checked in the toolbar when clicked', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        targetCheckbox: true,
                        targetCheckboxText: 'Open in new window',
                        customClassOption: 'custom-class',
                        customClassOptionText: 'Custom Class'
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                anchor = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // show preview
            fireEvent(document.getElementById('text-custom-class-link'), 'mouseover');

            // load into editor
            jasmine.clock().tick(1);
            fireEvent(anchorPreview.getPreviewElement(), 'click');
            jasmine.clock().tick(200);

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchor.isDisplayed()).toBe(true);

            // the checkboxes should be unchecked
            expect(anchor.getAnchorTargetCheckbox().checked).toBe(false);
            expect(anchor.getAnchorButtonCheckbox().checked).toBe(true);
        });

        it('should be displayed by default when the hovered link is empty', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-empty-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();
        });

        it('should NOT be displayed when the hovered link is empty and the option showOnEmptyLinks is set to false', function () {
            var editor = this.newMediumEditor('.editor', {
                delay: 200,
                anchorPreview: {
                    showOnEmptyLinks: false
                }
            }),
            anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-empty-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
        });

        it('should be displayed when the link has data attribute to disable preview', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-link-disable-preview'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();

            // showPreview is called but the preview isn't displayed
            expect(anchorPreview.getPreviewElement().classList.contains('medium-toolbar-arrow-over')).toBe(false);
        });

        it('should be displayed when the option showWhenToolbarIsVisible is set to true and toolbar is visible', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    anchorPreview: {
                        showWhenToolbarIsVisible: true
                    },
                    toolbar: {
                        static: true
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0].firstChild);

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).toHaveBeenCalled();
            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(true);
        });

        it('should NOT be displayed when the option showWhenToolbarIsVisible is set to false and toolbar is visible', function () {
            var editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    anchorPreview: {
                        showWhenToolbarIsVisible: false
                    },
                    toolbar: {
                        static: true
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0].firstChild);

            // show preview
            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'showPreview').and.callThrough();
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(250);
            expect(anchorPreview.showPreview).not.toHaveBeenCalled();
            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(false);
        });

        // https://github.com/yabwe/medium-editor/issues/1047
        it('should display the anchor form in the toolbar when clicked when showWhenToolbarIsVisible is set to true and toolbar is visible', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchorPreview: {
                        showWhenToolbarIsVisible: true
                    },
                    toolbar: {
                        static: true
                    }
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview'),
                anchor = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // show toolbar
            selectElementContentsAndFire(editor.elements[0].firstChild);
            jasmine.clock().tick(1);
            expect(toolbar.isDisplayed()).toBe(true);

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // load into editor
            jasmine.clock().tick(1);
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(true);

            var clickEvent = {
                defaultPrevented: false,
                preventDefault: function () {
                    this.defaultPrevented = true;
                }
            };

            // trigger all events toolbar is listening to on clicks
            fireEvent(anchorPreview.getPreviewElement(), 'mousedown');
            fireEvent(anchorPreview.getPreviewElement(), 'mouseup');
            anchorPreview.handleClick(clickEvent);
            jasmine.clock().tick(1);

            // click on the link should have called `preventDefault` to stop from navigating away
            expect(clickEvent.defaultPrevented).toBe(true, 'link navigation was not prevented on click of the anchor-preview');

            // anchor form should be visible in toolbar
            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchor.isDisplayed()).toBe(true, 'anchor form to edit link is not visible');
            expect(anchorPreview.getPreviewElement().classList.contains('medium-editor-anchor-preview-active')).toBe(false,
                'anchor-preview is still visible after being clicked');
        });

        it('should NOT be present when anchorPreview option is set to false', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchorPreview: false
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            expect(anchorPreview).toBeUndefined();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should not be present when toolbar option is disabled', function () {
            var editor = this.newMediumEditor('.editor', {
                    toolbar: false
                }),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            expect(anchorPreview).toBeUndefined();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should be removed from the document when editor is destroyed', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorPreview = editor.getExtensionByName('anchor-preview');

            spyOn(MediumEditor.extensions.anchorPreview.prototype, 'destroy').and.callThrough();
            expect(document.querySelector('.medium-editor-anchor-preview')).not.toBeNull();
            expect(document.querySelector('.medium-editor-anchor-preview-active')).toBeNull();

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            jasmine.clock().tick(1);
            expect(document.querySelector('.medium-editor-anchor-preview-active')).not.toBeNull();

            // destroy
            editor.destroy();
            expect(anchorPreview.destroy).toHaveBeenCalled();
            expect(document.querySelector('.medium-editor-anchor-preview-active')).toBeNull();
            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should NOT be in the DOM when a custom anchorPreview extension is provided', function () {
            this.newMediumEditor('.editor', {
                extensions: {
                    'anchor-preview': {}
                }
            });

            expect(document.querySelector('.medium-editor-anchor-preview')).toBeNull();
        });

        it('should correctly set preview position even if elementsContainer is absolute', function () {
            var container = document.createElement('div'),
                editor, anchorPreview;

            container.style.position = 'absolute';
            container.style.left = '100px';
            container.style.top = '100px';
            document.body.appendChild(container);

            editor = this.newMediumEditor('.editor', {
                elementsContainer: container,
                anchorPreview: {
                    showWhenToolbarIsVisible: true
                },
                toolbar: {
                    static: true
                }
            });
            anchorPreview = editor.getExtensionByName('anchor-preview').getPreviewElement();

            selectElementContentsAndFire(editor.elements[0].firstChild);

            // show preview
            fireEvent(document.getElementById('test-link'), 'mouseover');

            // preview shows only after delay
            jasmine.clock().tick(1);
            expect(anchorPreview.classList.contains('medium-editor-anchor-preview-active')).toBe(true);
            expect(parseInt(anchorPreview.style.left, 10)).toBeLessThan(100);
            expect(parseInt(anchorPreview.style.top, 10)).toBeLessThan(100);

            document.body.removeChild(container);
        });
    });

});
