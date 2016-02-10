/*global fireEvent, selectElementContents,
         selectElementContentsAndFire */

describe('Font Name Button TestCase', function () {
    'use strict';

    function testFontNameContents(el, name) {
        expect(el.childNodes.length).toBe(1);
        var child = el.childNodes[0];
        expect(child.nodeName.toLowerCase()).toBe('font');
        expect(child.getAttribute('face')).toBe(name);
        expect(child.innerHTML).toBe('lorem ipsum');
    }

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
        this.mediumOpts = {
            toolbar: {
                buttons: ['fontname']
            }
        };
    });

    afterEach(function () {
        this.cleanupTest();
        delete this.mediumOpts;
    });

    describe('Click', function () {
        it('should display the font name form when toolbar is visible', function () {
            spyOn(MediumEditor.extensions.fontName.prototype, 'showForm').and.callThrough();
            var button,
                editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontNameExtension = editor.getExtensionByName('fontname'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontName"]');
            fireEvent(button, 'click');
            expect(toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(fontNameExtension.isDisplayed()).toBe(true);
            expect(fontNameExtension.showForm).toHaveBeenCalled();
        });
    });

    describe('Font Name', function () {
        it('should change font name when select is changed', function () {
            spyOn(document, 'execCommand').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
                    toolbar: {
                        buttons: ['fontname']
                    },
                    buttonLabels: 'fontawesome'
                }),
                fontNameExtension = editor.getExtensionByName('fontname'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                select;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontName"]');
            fireEvent(button, 'click');

            select = fontNameExtension.getSelect();
            select.value = 'Arial';
            selectElementContents(this.el);
            fireEvent(select, 'change');

            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial');

            fireEvent(fontNameExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');
            testFontNameContents(this.el, 'Arial');
        });

        it('should display current font name when displayed', function () {
            spyOn(MediumEditor.extensions.fontName.prototype, 'showForm').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontNameExtension = editor.getExtensionByName('fontname'),
                toolbar = editor.getExtensionByName('toolbar');
            this.el.innerHTML = '<font face="Arial">lorem ipsum dolor</font>';
            selectElementContentsAndFire(editor.elements[0].firstChild);
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="fontName"]'), 'click');
            expect(fontNameExtension.showForm).toHaveBeenCalledWith('Arial');
        });

        it('should revert font name when select value is set to empty', function () {
            spyOn(document, 'execCommand').and.callThrough();
            spyOn(MediumEditor.extensions.fontName.prototype, 'clearFontName').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontNameExtension = editor.getExtensionByName('fontname'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                select;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontName"]');
            fireEvent(button, 'click');

            select = fontNameExtension.getSelect();
            select.value = 'Arial';
            selectElementContents(editor.elements[0]);
            fireEvent(select, 'change');
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial');
            expect(fontNameExtension.clearFontName).not.toHaveBeenCalled();
            testFontNameContents(this.el, 'Arial');

            select.value = '';
            selectElementContents(editor.elements[0]);
            fireEvent(select, 'change');

            fireEvent(fontNameExtension.getForm().querySelector('a.medium-editor-toobar-save'), 'click');
            testFontNameContents(this.el, null); // TODO: remove the <font> element entirely instead of just the `size` attribute
            expect(fontNameExtension.clearFontName).toHaveBeenCalled();
        });
    });

    describe('Cancel', function () {
        it('should close the font name form when user clicks on cancel', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontNameExtension = editor.getExtensionByName('fontname'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                select,
                cancel;

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="fontName"]');
            cancel = fontNameExtension.getForm().querySelector('a.medium-editor-toobar-close');

            fireEvent(button, 'click');
            expect(fontNameExtension.isDisplayed()).toBe(true);
            select = editor.getExtensionByName('fontname').getSelect();
            select.value = 'Arial';
            fireEvent(select, 'change');
            fireEvent(cancel, 'click');
            expect(this.el.innerHTML).toMatch(/^(<font>)?lorem ipsum(<\/font>)?$/i);
            expect(select.value).toBe('');
            expect(toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(fontNameExtension.isDisplayed()).toBe(false);
        });
    });

    describe('Destroying MediumEditor', function () {
        it('should destroy the font name extension and remove the form', function () {
            spyOn(MediumEditor.extensions.fontName.prototype, 'destroy').and.callThrough();
            var editor = this.newMediumEditor('.editor', this.mediumOpts),
                fontNameExtension = editor.getExtensionByName('fontname'),
                form = fontNameExtension.getForm();

            expect(MediumEditor.util.isDescendant(document.body, form)).toBe(true);
            editor.destroy();

            expect(fontNameExtension.destroy).toHaveBeenCalled();
            expect(MediumEditor.util.isDescendant(document.body, form)).toBe(false);
        });
    });
});
