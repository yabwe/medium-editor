/*global fireEvent, selectElementContents,
         selectElementContentsAndFire, isIE9 */

describe('Font Size Button TestCase', function () {
    'use strict';

    function testFontSizeContents(el, size) {
        expect(el.childNodes.length).toBe(1);
        var child = el.childNodes[0];
        expect(child.nodeName.toLowerCase()).toBe('font');
        expect(child.getAttribute('size')).toBe(size);
        expect(child.innerHTML).toBe('lorem ipsum');
    }

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
        this.mediumOpts = {
            toolbar: {
                buttons: ['fontsize']
            }
        };
    });

    afterEach(function () {
        this.cleanupTest();
        delete this.mediumOpts;
    });

    describe('Click', function () {
        it('should display the font size form when toolbar is visible', function () {
            spyOn(MediumEditor.extensions.fontSize.prototype, 'showForm').and.callThrough();
            var button,
                editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            fireEvent(button, 'click');
            expect(toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(fontSizeExtension.isDisplayed()).toBe(true);
            expect(fontSizeExtension.showForm).toHaveBeenCalled();
        });
    });

    describe('Font Size', function () {
        it('should change font size when slider is moved', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['fontsize']
                    },
                    buttonLabels: 'fontawesome'
                }),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                input;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            fireEvent(button, 'click');

            input = fontSizeExtension.getInput();
            input.value = '7';
            selectElementContents(this.el);
            fireEvent(input, 'change');

            expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '7');

            fireEvent(fontSizeExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');
            testFontSizeContents(this.el, '7');
        });

        it('should display current font size when displayed', function () {
            spyOn(MediumEditor.extensions.fontSize.prototype, 'showForm').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                toolbar = editor.getExtensionByName('toolbar');
            this.el.innerHTML = '<font size="7">lorem ipsum dolor</font>';
            selectElementContentsAndFire(editor.elements[0].firstChild);
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="fontSize"]'), 'click');
            expect(fontSizeExtension.showForm).toHaveBeenCalledWith('7');
        });

        it('should revert font size when slider value is set to 4', function () {
            spyOn(document, 'execCommand').and.callThrough();
            spyOn(MediumEditor.extensions.fontSize.prototype, 'clearFontSize').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                input;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            fireEvent(button, 'click');

            input = fontSizeExtension.getInput();
            input.value = '1';
            selectElementContents(editor.elements[0]);
            fireEvent(input, 'change');
            expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '1');
            expect(fontSizeExtension.clearFontSize).not.toHaveBeenCalled();
            testFontSizeContents(this.el, '1');

            input.value = '4';
            selectElementContents(editor.elements[0]);
            fireEvent(input, 'change');

            fireEvent(fontSizeExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');
            testFontSizeContents(this.el, null); // TODO: remove the <font> element entirely instead of just the `size` attribute
            expect(fontSizeExtension.clearFontSize).toHaveBeenCalled();
        });
    });

    describe('Cancel', function () {
        it('should close the font size form when user clicks on cancel', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                input,
                cancel;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            cancel = fontSizeExtension.getForm().querySelector('a.medium-editor-toobar-close');

            fireEvent(button, 'click');
            expect(fontSizeExtension.isDisplayed()).toBe(true);
            input = editor.getExtensionByName('fontsize').getInput();
            input.value = '7';
            fireEvent(input, 'change');
            fireEvent(cancel, 'click');
            expect(this.el.innerHTML).toMatch(/^(<font>)?lorem ipsum(<\/font>)?$/i);
            // IE9 doesn't support sliders
            if (isIE9()) {
                expect(input.value).toBe('');
            } else {
                expect(input.value).toBe('4');
            }
            expect(toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(fontSizeExtension.isDisplayed()).toBe(false);
        });
    });

    describe('Destroying MediumEditor', function () {
        it('should destroy the font size extension and remove the form', function () {
            spyOn(MediumEditor.extensions.fontSize.prototype, 'destroy').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                form = fontSizeExtension.getForm();

            expect(MediumEditor.util.isDescendant(document.body, form)).toBe(true);
            editor.destroy();

            expect(fontSizeExtension.destroy).toHaveBeenCalled();
            expect(MediumEditor.util.isDescendant(document.body, form)).toBe(false);
        });
    });
});
