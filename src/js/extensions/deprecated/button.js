/*global Util */

/* istanbul ignore next */
var DefaultButton;

/* istanbul ignore next */
(function () {
    'use strict';

    DefaultButton = function (options, instance) {
        Util.deprecated('MediumEditor.statics.DefaultButton', 'MediumEditor.extensions.button', 'v5.0.0');

        this.options = options;
        this.name = options.name;
        this.init(instance);
    };

    DefaultButton.prototype = {
        init: function (instance) {
            this.base = instance;

            this.button = this.createButton();
            this.base.on(this.button, 'click', this.handleClick.bind(this));
            if (this.options.key) {
                this.base.subscribe('editableKeydown', this.handleKeydown.bind(this));
            }
        },
        getButton: function () {
            return this.button;
        },
        getAction: function () {
            return (typeof this.options.action === 'function') ? this.options.action(this.base.options) : this.options.action;
        },
        getAria: function () {
            return (typeof this.options.aria === 'function') ? this.options.aria(this.base.options) : this.options.aria;
        },
        getTagNames: function () {
            return (typeof this.options.tagNames === 'function') ? this.options.tagNames(this.base.options) : this.options.tagNames;
        },
        createButton: function () {
            var button = this.base.options.ownerDocument.createElement('button'),
                content = this.options.contentDefault,
                ariaLabel = this.getAria();
            button.classList.add('medium-editor-action');
            button.classList.add('medium-editor-action-' + this.name);
            button.setAttribute('data-action', this.getAction());
            if (ariaLabel) {
                button.setAttribute('title', ariaLabel);
                button.setAttribute('aria-label', ariaLabel);
            }
            if (this.base.options.buttonLabels) {
                if (this.base.options.buttonLabels === 'fontawesome' && this.options.contentFA) {
                    content = this.options.contentFA;
                } else if (typeof this.base.options.buttonLabels === 'object' && this.base.options.buttonLabels[this.name]) {
                    content = this.base.options.buttonLabels[this.options.name];
                }
            }
            button.innerHTML = content;
            return button;
        },
        handleKeydown: function (evt) {
            var key = String.fromCharCode(evt.which || evt.keyCode).toLowerCase(),
                action;

            if (this.options.key === key && Util.isMetaCtrlKey(evt)) {
                evt.preventDefault();
                evt.stopPropagation();

                action = this.getAction();
                if (action) {
                    this.base.execAction(action);
                }
            }
        },
        handleClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var action = this.getAction();

            if (action) {
                this.base.execAction(action);
            }
        },
        isActive: function () {
            return this.button.classList.contains(this.base.options.activeButtonClass);
        },
        setInactive: function () {
            this.button.classList.remove(this.base.options.activeButtonClass);
            delete this.knownState;
        },
        setActive: function () {
            this.button.classList.add(this.base.options.activeButtonClass);
            delete this.knownState;
        },
        queryCommandState: function () {
            var queryState = null;
            if (this.options.useQueryState) {
                queryState = this.base.queryCommandState(this.getAction());
            }
            return queryState;
        },
        isAlreadyApplied: function (node) {
            var isMatch = false,
                tagNames = this.getTagNames(),
                styleVals,
                computedStyle;

            if (this.knownState === false || this.knownState === true) {
                return this.knownState;
            }

            if (tagNames && tagNames.length > 0 && node.tagName) {
                isMatch = tagNames.indexOf(node.tagName.toLowerCase()) !== -1;
            }

            if (!isMatch && this.options.style) {
                styleVals = this.options.style.value.split('|');
                computedStyle = this.base.options.contentWindow.getComputedStyle(node, null).getPropertyValue(this.options.style.prop);
                styleVals.forEach(function (val) {
                    if (!this.knownState) {
                        isMatch = (computedStyle.indexOf(val) !== -1);
                        // text-decoration is not inherited by default
                        // so if the computed style for text-decoration doesn't match
                        // don't write to knownState so we can fallback to other checks
                        if (isMatch || this.options.style.prop !== 'text-decoration') {
                            this.knownState = isMatch;
                        }
                    }
                }, this);
            }

            return isMatch;
        }
    };
}());