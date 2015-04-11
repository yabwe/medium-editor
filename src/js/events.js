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
                // Detecting when user has interacted with elements outside of MediumEditor
                this.attachDOMEvent(this.options.ownerDocument.body, 'click', this.handleInteraction.bind(this), true);
                this.attachDOMEvent(this.options.ownerDocument.body, 'focus', this.handleInteraction.bind(this), true);
                this.listeners[name] = true;
                break;
            case 'blur':
                // Detecting when focus is lost
                this.setupListener('externalInteraction');
                this.listeners[name] = true;
                break;
            case 'focus':
                // Detecting when focus moves into some part of MediumEditor
                this.setupListener('externalInteraction');
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
            case 'editableKeyup':
                // Detecting keyup in the contenteditables
                this.base.elements.forEach(function (element) {
                    this.attachDOMEvent(element, 'keyup', this.handleKeyup.bind(this));
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

        focusElement: function (element) {
            element.focus();
            this.updateFocus(element, { target: element, type: 'focus' });
        },

        handleInteraction: function (event) {
            this.updateFocus(event.target, event);
        },

        updateFocus: function (target, eventObj) {
            var selection = this.options.contentWindow.getSelection(),
                toolbarEl = this.base.toolbar ? this.base.toolbar.getToolbarElement() : null,
                anchorPreview = this.base.getExtensionByName('anchor-preview'),
                previewEl = (anchorPreview && anchorPreview.getPreviewElement) ? anchorPreview.getPreviewElement() : null,
                selRange = selection.isCollapsed ?
                           null :
                           Selection.getSelectedParentElement(selection.getRangeAt(0)),
                focused,
                toFocus;

            this.base.elements.some(function (element) {
                // Find the element that has focus
                if (!focused && element.getAttribute('data-medium-focused')) {
                    focused = element;
                }

                // Find the element that is receiving focus
                if (!toFocus &&
                        // target is part of an editor element
                        (Util.isDescendant(element, target, true) ||
                        // introduced also to avoid the toolbar to disapper when selecting from right to left and the selection ends at the beginning of the text.
                        Util.isDescendant(element, selRange))) {
                    toFocus = element;
                }

                // bail if we found both focused and toFocus elements
                return !!focused && !!toFocus;
            }, this);

            // Check if the target is external (not part of the editor, toolbar, or anchorpreview)
            var externalEvent = !Util.isDescendant(focused, target, true) &&
                                !Util.isDescendant(toolbarEl, target, true) &&
                                !Util.isDescendant(previewEl, target, true);

            if (toFocus !== focused) {
                // If element has focus, and focus is going outside of editor
                // Don't blur focused element if clicking on editor, toolbar, or anchorpreview
                if (focused && externalEvent) {
                    // Trigger blur on the editable that has lost focus
                    focused.removeAttribute('data-medium-focused');
                    this.triggerCustomEvent('blur', eventObj, focused);
                }

                // If focus is going into an editor element
                if (toFocus) {
                    // Trigger focus on the editable that now has focus
                    toFocus.setAttribute('data-medium-focused', true);
                    this.triggerCustomEvent('focus', eventObj, toFocus);
                }
            }

            if (externalEvent) {
                this.triggerCustomEvent('externalInteraction', eventObj);
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

        handleKeyup: function (event) {
            this.triggerCustomEvent('editableKeyup', event, event.currentTarget);
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
