/*global fireEvent, selectElementContentsAndFire */

describe('MediumEditor.extensions.placeholder TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', '');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should set placeholder for empty elements', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder for elements with text content', function () {
        this.el.innerHTML = 'some text';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder for elements with images only', function () {
        this.el.innerHTML = '<img src="../demo/img/roman.jpg">';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder for elements with unorderedlist', function () {
        this.el.innerHTML = '<ul><li></li></ul>';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder for elements with orderedlist', function () {
        this.el.innerHTML = '<ol><li></li></ol>';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder for elements with table', function () {
        this.el.innerHTML = '<table></table>';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should set placeholder for elements with empty children', function () {
        this.el.innerHTML = '<p><br></p><div class="empty"></div>';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on focus', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        selectElementContentsAndFire(editor.elements[0]);
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on click', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        fireEvent(document.body, 'mousedown');
        fireEvent(document.body, 'mouseup');
        fireEvent(document.body, 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        this.el.innerHTML = '<p>lorem</p><p id="target">ipsum</p><p>dolor</p>';
        fireEvent(document.getElementById('target'), 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on input, and NOT on click', function () {
        var editor = this.newMediumEditor('.editor', { placeholder: { hideOnClick: false }});
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(document.body, 'mousedown');
        fireEvent(document.body, 'mouseup');
        fireEvent(document.body, 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        this.el.innerHTML = '<p>lorem</p><p id="target">ipsum</p><p>dolor</p>';
        editor.trigger('editableInput', {}, editor.elements[0]);
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        this.el.innerHTML = '';
        editor.trigger('editableInput', {}, editor.elements[0]);
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should add a placeholder to empty elements on blur', function () {
        this.el.innerHTML = 'some text';
        var editor = this.newMediumEditor('.editor');
        editor.elements[0].focus();
        fireEvent(editor.elements[0], 'focus');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = '';
        fireEvent(document.body, 'mousedown');
        fireEvent(document.body, 'mouseup');
        fireEvent(document.body, 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should not add a placeholder to elements with text on blur', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = 'some text';
        editor.selectElement(this.el.firstChild);
        fireEvent(document.body, 'mousedown');
        fireEvent(document.body, 'mouseup');
        fireEvent(document.body, 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    // https://github.com/yabwe/medium-editor/issues/768
    it('should remove the placeholder when the content is updated manually', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        editor.setContent('<p>lorem ipsum</p>');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    // https://github.com/yabwe/medium-editor/issues/783
    it('should not show a placeholder when input changes but editor is still empty', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'click');
        editor.elements[0].focus();
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        var toolbar = editor.getExtensionByName('toolbar');
        fireEvent(editor.elements[0], 'blur');
        fireEvent(toolbar.getToolbarElement().querySelector('[data-action="append-h2"]'), 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    /*jslint regexp: true*/
    function validatePlaceholderContent(element, expectedValue) {
        var placeholder = window.getComputedStyle(element, ':after').getPropertyValue('content'),
            regex = /^attr\(([^\)]+)\)$/g,
            match = regex.exec(placeholder);
        if (match) {
            // In firefox, getComputedStyle().getPropertyValue('content') can return attr() instead of what attr() evaluates to
            expect(match[1]).toBe('data-placeholder');
        }
        // When these tests run in firefox in saucelabs, for some reason the content property of the
        // placeholder is 'none'.  Not sure why this happens, or why this is specific to saucelabs
        // but for now, just skipping the assertion in this case
        else if (placeholder !== 'none') {
            expect(placeholder).toMatch(new RegExp('^[\'"]' + expectedValue + '[\'"]$'));
        }
    }
    /*jslint regexp: false*/

    it('should add the default placeholder text when data-placeholder is not present', function () {
        var editor = this.newMediumEditor('.editor');
        validatePlaceholderContent(editor.elements[0], MediumEditor.extensions.placeholder.prototype.text);
    });

    it('should add the default placeholder text when data-placeholder is not present on dynamically added elements', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements.length).toBe(1);

        var newEl = this.createElement('div', 'other-element');
        editor.addElements(newEl);
        validatePlaceholderContent(newEl, MediumEditor.extensions.placeholder.prototype.text);
    });

    it('should remove the added data-placeholder attribute when destroyed', function () {
        expect(this.el.hasAttribute('data-placeholder')).toBe(false);

        var editor = this.newMediumEditor('.editor');
        expect(this.el.getAttribute('data-placeholder')).toBe(MediumEditor.extensions.placeholder.prototype.text);

        editor.destroy();
        expect(this.el.hasAttribute('data-placeholder')).toBe(false);
    });

    it('should remove the added data-placeholder attribute when elements are removed dynamically from the editor', function () {
        var editor = this.newMediumEditor('.editor'),
            newEl = this.createElement('div', 'other-element');

        expect(newEl.hasAttribute('other-element')).toBe(false);
        editor.addElements(newEl);
        expect(newEl.getAttribute('data-placeholder')).toBe(MediumEditor.extensions.placeholder.prototype.text);

        editor.removeElements('.other-element');
        expect(newEl.hasAttribute('data-placeholder')).toBe(false);
    });

    it('should not remove custom data-placeholder attribute when destroyed', function () {
        var placeholderText = 'Custom placeholder';
        this.el.setAttribute('data-placeholder', placeholderText);

        var editor = this.newMediumEditor('.editor');
        expect(this.el.getAttribute('data-placeholder')).toBe(placeholderText);

        editor.destroy();
        expect(this.el.getAttribute('data-placeholder')).toBe(placeholderText);
    });

    it('should use the data-placeholder when it is present', function () {
        var editor,
            placeholderText = 'Custom placeholder';
        this.el.setAttribute('data-placeholder', placeholderText);
        editor = this.newMediumEditor('.editor');
        validatePlaceholderContent(editor.elements[0], placeholderText);
    });

    it('should use custom placeholder text when passed as the placeholder.text option', function () {
        var placeholderText = 'Custom placeholder',
            editor = this.newMediumEditor('.editor', {
            placeholder: {
                text: placeholderText
            }
        });
        validatePlaceholderContent(editor.elements[0], placeholderText);
    });

    it('should not set placeholder for empty elements when placeholder is set to false', function () {
        var editor = this.newMediumEditor('.editor', {
            placeholder: false
        });
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should not add a placeholder to empty elements on blur when placeholder is set to false', function () {
        this.el.innerHTML = 'some text';
        var editor = this.newMediumEditor('.editor', {
            placeholder: false
        });
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = '';
        fireEvent(document.querySelector('div'), 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });
});
