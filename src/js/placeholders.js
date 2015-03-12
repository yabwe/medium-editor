/*global Util, console, Selection,
  ButtonsData, DefaultButton */

var Placeholders;

(function (window, document) {
    'use strict';

    Placeholders = function (instance) {
        this.base = instance;

        this.attachEventHandlers();
    };

    Placeholders.prototype = {

        attachEventHandlers: function () {
            this.base.subscribe('blur', this.handleBlur.bind(this));
            this.base.subscribe('click', this.handleClick.bind(this));
        },

        handleBlur: function (event) {
            // Activate the placeholder
            this.base.placeholderWrapper(event, this.base.elements[0]);
        },

        handleClick: function (event) {
            // Remove placeholder
            event.currentTarget.classList.remove('medium-editor-placeholder');
        }
    };

}(window, document));