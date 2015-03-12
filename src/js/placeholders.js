/*global Util, console, Selection,
  ButtonsData, DefaultButton */

var Placeholders;

(function (window, document) {
    'use strict';

    Placeholders = function (instance) {
        this.base = instance;

        this.attachEventHandlers();
        this.setPlaceholders();
    };

    Placeholders.prototype = {

        setPlaceholders: function () {
            this.base.elements.forEach(function (el) {
                this.activatePlaceholder(el);
                this.base.on(el, 'blur', this.placeholderWrapper.bind(this));
                this.base.on(el, 'keypress', this.placeholderWrapper.bind(this));
            }.bind(this));
        },

        // Two functions to handle placeholders
        activatePlaceholder:  function (el) {
            if (!(el.querySelector('img')) &&
                    !(el.querySelector('blockquote')) &&
                    el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                el.classList.add('medium-editor-placeholder');
            }
        },

        placeholderWrapper: function (evt, el) {
            el = el || evt.target;
            el.classList.remove('medium-editor-placeholder');
            if (evt.type !== 'keypress') {
                this.activatePlaceholder(el);
            }
        },

        attachEventHandlers: function () {
            this.base.subscribe('externalInteraction', this.handleBlur.bind(this));
            this.base.subscribe('click', this.handleClick.bind(this));
        },

        handleBlur: function (event) {
            // Activate the placeholder
            this.placeholderWrapper(event, this.base.elements[0]);
        },

        handleClick: function (event) {
            // Remove placeholder
            event.currentTarget.classList.remove('medium-editor-placeholder');
        }
    };

}(window, document));