/*global Util, Selection */

var Events;

(function () {
    'use strict';

    Events = function (instance) {
        this.base = instance;
        this.options = this.base.options;
        this.events = [];
        this.customEvents = {};
        this.listeners = {};
    };

    Events.prototype = {

        // Helpers for event handling

        attachDOMEvent: function (target, event, listener, useCapture) {
            target.addEventListener(event, listener, useCapture);
            this.events.push([target, event, listener, useCapture]);
        },

        detachDOMEvent: function (target, event, listener, useCapture) {
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

        detachAllDOMEvents: function () {
            var e = this.events.pop();
            while (e) {
                e[0].removeEventListener(e[1], e[2], e[3]);
                e = this.events.pop();
            }
        },

        // custom events
        attachCustomEvent: function (event, handler) {
            this.setupListener(event);
            // If we don't suppot this custom event, don't do anything
            if (this.listeners[event]) {
                if (!this.customEvents[event]) {
                    this.customEvents[event] = [];
                }
                this.customEvents[event].push(handler);
            }
        },

        triggerCustomEvent: function (name, data, editable) {
            if (this.customEvents[name]) {
                this.customEvents[name].forEach(function (handler) {
                    handler(data, editable);
                });
            }
        },

        // Listening to browser events to emit events medium-editor cares about

        setupListener: function (name) {
            if (this.listeners[name]) {
                return;
            }

            switch (name) {
            case 'externalInteraction':
                // Detecting when focus is lost
                this.attachDOMEvent(this.options.ownerDocument.body, 'click', this.handleInteraction.bind(this), true);
                this.attachDOMEvent(this.options.ownerDocument.body, 'focus', this.handleInteraction.bind(this), true);
                this.listeners[name] = true;
                break;
            case 'editableClick':
                // Detecting click in the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'click', this.handleClick.bind(this));
                }.bind(this));
                this.listeners[name] = true;
                break;
            case 'editableBlur':
                // Detecting blur in the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'blur', this.handleBlur.bind(this));
                }.bind(this));
                this.listeners[name] = true;
                break;
            case 'editableKeypress':
                // Detecting keypress in the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'keypress', this.handleKeypress.bind(this));
                }.bind(this));
                this.listeners[name] = true;
                break;
            case 'editableKeydown':
                // Detecting keydown on the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'keydown', this.handleKeydown.bind(this));
                }.bind(this));
                this.listeners[name] = true;
                break;
            case 'editableKeydownEnter':
                // Detecting keydown for ENTER on the contenteditables
                this.setupListener('editableKeydown');
                this.listeners[name] = true;
                break;
            case 'editableKeydownTab':
                // Detecting keydown for TAB on the contenteditable
                this.setupListener('editableKeydown');
                this.listeners[name] = true;
                break;
            case 'editableKeydownDelete':
                // Detecting keydown for DELETE/BACKSPACE on the contenteditables
                this.setupListener('editableKeydown');
                this.listeners[name] = true;
                break;
            case 'editableMouseover':
                // Detecting mouseover on the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'mouseover', this.handleMouseover.bind(this));
                }, this);
                this.listeners[name] = true;
                break;
            case 'editableDrag':
                // Detecting dragover and dragleave on the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'dragover', this.handleDragging.bind(this));
                    this.attachDOMEvent(element, 'dragleave', this.handleDragging.bind(this));
                }, this);
                this.listeners[name] = true;
                break;
            case 'editableDrop':
                // Detecting drop on the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'drop', this.handleDrop.bind(this));
                }, this);
                this.listeners[name] = true;
                break;
            case 'editablePaste':
                // Detecting paste on the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'paste', this.handlePaste.bind(this));
                }, this);
                this.listeners[name] = true;
                break;
            }
        },

        handleInteraction: function (event) {
            var isDescendantOfEditorElements = false,
                selection = this.options.contentWindow.getSelection(),
                toolbarEl = this.base.toolbar ? this.base.toolbar.getToolbarElement() : null,
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
                if (this.base.elements[i] === event.target ||
                        Util.isDescendant(this.base.elements[i], event.target) ||
                        Util.isDescendant(this.base.elements[i], selRange)) {
                    isDescendantOfEditorElements = true;
                    break;
                }
            }
            // If it's not part of the editor, toolbar, or anchor preview
            if (!isDescendantOfEditorElements &&
                    (!toolbarEl || (toolbarEl !== event.target && !Util.isDescendant(toolbarEl, event.target))) &&
                    (!previewEl || (previewEl !== event.target && !Util.isDescendant(previewEl, event.target)))) {
                this.triggerCustomEvent('externalInteraction', event);
            }
        },

        handleClick: function (event) {
            this.triggerCustomEvent('editableClick', event, event.currentTarget);
        },

        handleBlur: function (event) {
            this.triggerCustomEvent('editableBlur', event, event.currentTarget);
        },

        handleKeypress: function (event) {
            this.triggerCustomEvent('editableKeypress', event, event.currentTarget);
        },

        handleMouseover: function (event) {
            this.triggerCustomEvent('editableMouseover', event, event.currentTarget);
        },

        handleDragging: function (event) {
            this.triggerCustomEvent('editableDrag', event, event.currentTarget);
        },

        handleDrop: function (event) {
            this.triggerCustomEvent('editableDrop', event, event.currentTarget);
        },

        handlePaste: function (event) {
            this.triggerCustomEvent('editablePaste', event, event.currentTarget);
        },

        handleKeydown: function (event) {
            this.triggerCustomEvent('editableKeydown', event, event.currentTarget);

            switch (event.which) {
            case Util.keyCode.ENTER:
                this.triggerCustomEvent('editableKeydownEnter', event, event.currentTarget);
                break;
            case Util.keyCode.TAB:
                this.triggerCustomEvent('editableKeydownTab', event, event.currentTarget);
                break;
            case Util.keyCode.DELETE:
            case Util.keyCode.BACKSPACE:
                this.triggerCustomEvent('editableKeydownDelete', event, event.currentTarget);
                break;
            }
        }
    };

}());
