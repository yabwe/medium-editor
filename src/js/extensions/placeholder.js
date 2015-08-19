(function () {
    'use strict';

    var Placeholder = MediumEditor.Extension.extend({
        name: 'placeholder',

        /* Placeholder Options */

        /* text: [string]
         * Text to display in the placeholder
         */
        text: 'Type your text',

        /* hideOnClick: [boolean]
         * Should we hide the placeholder on click (true) or when user starts typing (false)
         */
        hideOnClick: true,

        init: function () {
            MediumEditor.Extension.prototype.init.apply(this, arguments);

            this.initPlaceholders();
            this.attachEventHandlers();
        },

        initPlaceholders: function () {
            this.getEditorElements().forEach(function (el) {
                if (!el.getAttribute('data-placeholder')) {
                    el.setAttribute('data-placeholder', this.text);
                }
                this.updatePlaceholder(el);
            }, this);
        },

        destroy: function () {
            this.getEditorElements().forEach(function (el) {
                if (el.getAttribute('data-placeholder') === this.text) {
                    el.removeAttribute('data-placeholder');
                }
            }, this);
        },

        showPlaceholder: function (el) {
            if (el) {
                el.classList.add('medium-editor-placeholder');
            }
        },

        hidePlaceholder: function (el) {
            if (el) {
                el.classList.remove('medium-editor-placeholder');
            }
        },

        updatePlaceholder: function (el) {
            // if one of these element ('img, blockquote, ul, ol') are found inside the given element, we won't display the placeholder
            if (!(el.querySelector('img, blockquote, ul, ol')) && el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                return this.showPlaceholder(el);
            }

            this.hidePlaceholder(el);
        },

        attachEventHandlers: function () {
            if (this.hideOnClick) {
                // We want to always hide the placeholder when it gets focus
                this.subscribe('focus', this.handleFocus.bind(this));
            } else {
                // We want to hide/show the placeholder each time something changes
                this.subscribe('editableInput', this.handleInput.bind(this));
            }

            // When the editor loses focus, we should always check if the placeholder shoudl be visible
            this.subscribe('blur', this.handleBlur.bind(this));
        },

        handleInput: function (event, element) {
            // Editor's content has changed, check if the placeholder should be hidden
            this.updatePlaceholder(element);
        },

        handleFocus: function (event, element) {
            // Editor has focus, hide the placeholder
            this.hidePlaceholder(element);
        },

        handleBlur: function (event, element) {
            // Editor has lost focus, check the placeholder should be shown
            this.updatePlaceholder(element);
        }
    });

    MediumEditor.extensions.placeholder = Placeholder;
}());
