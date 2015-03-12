/*global Util, console, Selection,
  ButtonsData, DefaultButton */

var Placeholders;

(function (window, document) {
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
            }.bind(this));
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
            this.base.subscribe('externalInteraction', this.handleExternalInteraction.bind(this));

            // Events for all editable elements in this instance
            this.base.subscribe('editableClick', this.handleClick.bind(this));
            this.base.subscribe('editableBlur', this.handleBlur.bind(this));
            this.base.subscribe('editableKeypress', this.handleKeypress.bind(this));
        },

        handleKeypress: function (event, element) {
            // Always hide placeholder on keypress
            this.hidePlaceholder(element);
        },

        handleBlur: function (event, element) {
            // Update placeholder for element that lost focus
            this.updatePlaceholder(element);
        },

        handleExternalInteraction: function (event) {
            // Update all placeholders
            this.initPlaceholders();
        },

        handleClick: function (event, element) {
            // Remove placeholder
            this.hidePlaceholder(element);
        }
    };

}(window, document));