var Placeholders;

(function () {
    'use strict';

    Placeholders = function (instance) {
        this.base = instance;

        this.initPlaceholders();
        this.attachEventHandlers();
    };

    Placeholders.prototype = {

        initPlaceholders: function () {
            this.base.elements.forEach(function (el) {
                this.updatePlaceholder(el);
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
            if (!(el.querySelector('img')) &&
                    !(el.querySelector('blockquote')) &&
                    el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                this.showPlaceholder(el);
            } else {
                this.hidePlaceholder(el);
            }
        },

        attachEventHandlers: function () {
            // Custom events
            this.base.subscribe('blur', this.handleExternalInteraction.bind(this));

            // Check placeholder on blur
            this.base.subscribe('editableBlur', this.handleBlur.bind(this));

            // Events where we always hide the placeholder
            this.base.subscribe('editableClick', this.handleHidePlaceholderEvent.bind(this));
            this.base.subscribe('editableKeypress', this.handleHidePlaceholderEvent.bind(this));
            this.base.subscribe('editablePaste', this.handleHidePlaceholderEvent.bind(this));
        },

        handleHidePlaceholderEvent: function (event, element) {
            // Events where we hide the placeholder
            this.hidePlaceholder(element);
        },

        handleBlur: function (event, element) {
            // Update placeholder for element that lost focus
            this.updatePlaceholder(element);
        },

        handleExternalInteraction: function () {
            // Update all placeholders
            this.initPlaceholders();
        }
    };

}());
