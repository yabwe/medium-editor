/*global MediumEditor, describe, it, expect, spyOn,
     afterEach, beforeEach, selectElementContents,
     jasmine, fireEvent, tearDown,
     selectElementContentsAndFire */

describe('Font Size Button TestCase', function () {
    'use strict';

    function testFontSizeContents (el, size) {
      expect(el.childNodes.length).toBe(1);
      var child = el.childNodes[0];
      expect(child.tagName).toBe('FONT');
      expect(child.getAttribute('size')).toBe(size);
      expect(child.innerHTML).toBe('lorem ipsum');
    }

    beforeEach(function () {
        jasmine.clock().install();
        this.mediumOpts = {buttons: ['fontsize']};
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    describe('Click', function () {
        it('should display the font size form when toolbar is visible', function () {
            spyOn(MediumEditor.statics.FontSizeExtension.prototype, 'showForm').and.callThrough();
            var button,
                editor = new MediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize');
            selectElementContentsAndFire(editor.elements[0]);
            jasmine.clock().tick(1);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            fireEvent(button, 'click');
            expect(editor.toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(fontSizeExtension.isDisplayed()).toBe(true);
            expect(fontSizeExtension.showForm).toHaveBeenCalled();

            editor.destroy();
        });
    });

    describe('Font Size', function () {
        it('should change font size when slider is moved', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var editor = new MediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                button,
                input;

            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            fireEvent(button, 'click');

            input = fontSizeExtension.getInput();
            input.value = '7';
            selectElementContents(this.el);
            fireEvent(input, 'change');

            expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '7');

            fireEvent(fontSizeExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');
            testFontSizeContents(this.el, '7');
        });

        it('should revert font size when slider value is set to 4', function () {
            spyOn(document, 'execCommand').and.callThrough();
            spyOn(MediumEditor.statics.FontSizeExtension.prototype, 'clearFontSize').and.callThrough();
            var editor = new MediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                button,
                input;

            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
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
            spyOn(MediumEditor.statics.Toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = new MediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize'),
                button,
                input,
                cancel;

            selectElementContentsAndFire(editor.elements[0]);
            button = editor.toolbar.getToolbarElement().querySelector('[data-action="fontSize"]');
            cancel = fontSizeExtension.getForm().querySelector('a.medium-editor-toobar-close');

            fireEvent(button, 'click');
            expect(fontSizeExtension.isDisplayed()).toBe(true);
            input = editor.getExtensionByName('fontsize').getInput();
            input.value = '7';
            fireEvent(input, 'change');
            fireEvent(cancel, 'click');
            expect(this.el.innerHTML).toMatch(/^(<font>)?lorem ipsum(<\/font>)?$/i);
            // IE9 resets the input value to empty instead of 4
            expect(input.value).toMatch(/^4?$/);
            expect(editor.toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(fontSizeExtension.isDisplayed()).toBe(false);
        });
    });

    describe('Destroying MediumEditor', function () {
        it('should deactivate the font size extension and remove the form', function () {
            spyOn(MediumEditor.statics.FontSizeExtension.prototype, 'deactivate').and.callThrough();
            var editor = new MediumEditor('.editor', this.mediumOpts),
                fontSizeExtension = editor.getExtensionByName('fontsize');

            expect(document.getElementById('medium-editor-toolbar-form-fontsize-1')).toBeTruthy();
            editor.destroy();

            expect(fontSizeExtension.deactivate).toHaveBeenCalled();
            expect(document.getElementById('medium-editor-toolbar-form-fontsize-1')).not.toBeTruthy();
        });
    });
});
