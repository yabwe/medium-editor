/*global describe, it, expect, Util,
    afterEach, beforeEach, fireEvent, setupTestHelpers,
    Placeholder */

describe('Placeholder TestCase', function () {
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
        this.el.innerHTML = '<img src="foo.jpg">';
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

    it('should set placeholder for elements with empty children', function () {
        this.el.innerHTML = '<p><br></p><div class="empty"></div>';
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on keypress', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'keypress');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on click', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'blur');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        this.el.innerHTML = '<p>lorem</p><p id="target">ipsum</p><p>dolor</p>';
        fireEvent(document.getElementById('target'), 'click');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should NOT remove the placeholder on click', function () {
        var editor = this.newMediumEditor('.editor', { placeholder: { hideOnClick: false }});
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'blur');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        this.el.innerHTML = '<p>lorem</p><p id="target">ipsum</p><p>dolor</p>';
        fireEvent(document.getElementById('target'), 'keypress');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        this.el.innerHTML = '';
        fireEvent(editor.elements[0], 'keyup', { keyCode: Util.keyCode.DELETE });
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should add a placeholder to empty elements on blur', function () {
        this.el.innerHTML = 'some text';
        var editor = this.newMediumEditor('.editor');
        editor.elements[0].focus();
        fireEvent(editor.elements[0], 'focus');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = '';
        fireEvent(document.querySelector('div'), 'click');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should not add a placeholder to elements with text on blur', function () {
        var editor = this.newMediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = 'some text';
        fireEvent(editor.elements[0], 'blur');
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
        } else {
            expect(placeholder).toBe('\'' + expectedValue + '\'');
        }
    }
    /*jslint regexp: false*/

    it('should add the default placeholder text when data-placeholder is not present', function () {
        var editor = this.newMediumEditor('.editor');
        validatePlaceholderContent(editor.elements[0], Placeholder.prototype.text);
    });

    it('should remove the added data-placeholder attribute when destroyed', function () {
        expect(this.el.hasAttribute('data-placeholder')).toBe(false);

        var editor = this.newMediumEditor('.editor');
        expect(this.el.getAttribute('data-placeholder')).toBe(Placeholder.prototype.text);

        editor.destroy();
        expect(this.el.hasAttribute('data-placeholder')).toBe(false);
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

    it('should use custom placeholder text when passed as a deprecated option', function () {
        var placeholderText = 'Custom placeholder',
            editor = this.newMediumEditor('.editor', {
            placeholder: placeholderText
        });
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

    it('should not set placeholder for empty elements when deprecated disablePlaceholders is set to true', function () {
        var editor = this.newMediumEditor('.editor', {
            disablePlaceholders: true
        });
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
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
