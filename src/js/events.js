/*global Util, console, Selection,
  ButtonsData, DefaultButton */

var Events;

(function (window, document) {
    'use strict';

    Events = function (instance) {
        this.base = instance;
        this.options = this.base.options;
        this.events = [];
        this.bindings = {};

        this.setupListeners();
    };

    Events.prototype = {

        // Helpers for event handling

        attach: function (target, event, listener, useCapture) {
            target.addEventListener(event, listener, useCapture);
            this.events.push([target, event, listener, useCapture]);
        },

        detach: function (target, event, listener, useCapture) {
            var index = this.indexOfListener(target, event, listener, useCapture),
                e;
            if (index !== -1) {
                e = this.events.splice(index, 1)[0];
                e[0].removeEventListener(e[1], e[2], e[3]);
            }
        },

        indexOfListener: function (target, event, listener, useCapture) {
            var i, n, item;
            for (i = 0, n = this.events.length; i < n; i = i + 1) {
                item = this.events[i];
                if (item[0] === target && item[1] === event && item[2] === listener && item[3] === useCapture) {
                    return i;
                }
            }
            return -1;
        },

        detachAll: function () {
            var e = this.events.pop();
            while (e) {
                e[0].removeEventListener(e[1], e[2], e[3]);
                e = this.events.pop();
            }
        },

        // Bindings (custom events)
        bind: function (event, handler) {
            if (!this.bindings[event]) {
                this.bindings[event] = [];
            }
            this.bindings[event].push(handler);
        },

        triggerBinding: function (name, data) {
            if (this.bindings[name]) {
                this.bindings[name].forEach(function (binding) {
                    binding(data);
                });
            }
        },

        // Listening to browser events to emit events medium-editor cares about

        setupListeners: function () {
            // Detecting when focus is lost
            this.attach(this.options.ownerDocument.body, 'click', this.checkForBlur.bind(this), true);
            this.attach(this.options.ownerDocument.body, 'focus', this.checkForBlur.bind(this), true);
        },

        checkForBlur: function (event) {
            var isDescendantOfEditorElements = false,
                selection = this.options.contentWindow.getSelection(),
                toolbarEl = (this.base.toolbar) ? this.base.toolbar.getToolbarElement() : null,
                anchorPreview = this.base.getExtensionByName('anchor-preview'),
                previewEl = (anchorPreview && anchorPreview.getPreviewElement) ? anchorPreview.getPreviewElement() : null,
                selRange = selection.isCollapsed ?
                           null :
                           Selection.getSelectedParentElement(selection.getRangeAt(0)),
                i;

            // This control was introduced also to avoid the toolbar
            // to disapper when selecting from right to left and
            // the selection ends at the beginning of the text.
            for (i = 0; i < this.base.elements.length; i += 1) {
                if (this.base.elements[i] === event.target
                        || Util.isDescendant(this.base.elements[i], event.target)
                        || Util.isDescendant(this.base.elements[i], selRange)) {
                    isDescendantOfEditorElements = true;
                    break;
                }
            }
            // If it's not part of the editor, toolbar, or anchor preview
            if (!isDescendantOfEditorElements
                    && (!toolbarEl || (toolbarEl !== event.target && !Util.isDescendant(toolbarEl, event.target)))
                    && (!previewEl || (previewEl !== event.target && !Util.isDescendant(previewEl, event.target)))) {
                this.triggerBinding('blur', event);
            }
        }
    };

}(window, document));