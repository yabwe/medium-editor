/*global console */

var DefaultButton,
    ButtonsData;

(function (window, document) {
    'use strict';

    ButtonsData = {
        'bold': {
            name: 'bold',
            action: 'bold',
            aria: 'bold',
            tagNames: ['b', 'strong'],
            style: {
                prop: 'font-weight',
                value: '700|bold'
            },
            useQueryState: true,
            contentDefault: '<b>B</b>',
            contentFA: '<i class="fa fa-bold"></i>',
            key: 'b'
        },
        'italic': {
            name: 'italic',
            action: 'italic',
            aria: 'italic',
            tagNames: ['i', 'em'],
            style: {
                prop: 'font-style',
                value: 'italic'
            },
            useQueryState: true,
            contentDefault: '<b><i>I</i></b>',
            contentFA: '<i class="fa fa-italic"></i>',
            key: 'i'
        },
        'underline': {
            name: 'underline',
            action: 'underline',
            aria: 'underline',
            tagNames: ['u'],
            style: {
                prop: 'text-decoration',
                value: 'underline'
            },
            useQueryState: true,
            contentDefault: '<b><u>U</u></b>',
            contentFA: '<i class="fa fa-underline"></i>',
            key: 'u'
        },
        'strikethrough': {
            name: 'strikethrough',
            action: 'strikethrough',
            aria: 'strike through',
            tagNames: ['strike'],
            style: {
                prop: 'text-decoration',
                value: 'line-through'
            },
            useQueryState: true,
            contentDefault: '<s>A</s>',
            contentFA: '<i class="fa fa-strikethrough"></i>'
        },
        'superscript': {
            name: 'superscript',
            action: 'superscript',
            aria: 'superscript',
            tagNames: ['sup'],
            /* firefox doesn't behave the way we want it to, so we CAN'T use queryCommandState for superscript
               https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md#documentquerycommandstate */
            // useQueryState: true
            contentDefault: '<b>x<sup>1</sup></b>',
            contentFA: '<i class="fa fa-superscript"></i>'
        },
        'subscript': {
            name: 'subscript',
            action: 'subscript',
            aria: 'subscript',
            tagNames: ['sub'],
            /* firefox doesn't behave the way we want it to, so we CAN'T use queryCommandState for subscript
               https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md#documentquerycommandstate */
            // useQueryState: true
            contentDefault: '<b>x<sub>1</sub></b>',
            contentFA: '<i class="fa fa-subscript"></i>'
        },
        'image': {
            name: 'image',
            action: 'image',
            aria: 'image',
            tagNames: ['img'],
            contentDefault: '<b>image</b>',
            contentFA: '<i class="fa fa-picture-o"></i>'
        },
        'quote': {
            name: 'quote',
            action: 'append-blockquote',
            aria: 'blockquote',
            tagNames: ['blockquote'],
            contentDefault: '<b>&ldquo;</b>',
            contentFA: '<i class="fa fa-quote-right"></i>'
        },
        'orderedlist': {
            name: 'orderedlist',
            action: 'insertorderedlist',
            aria: 'ordered list',
            tagNames: ['ol'],
            useQueryState: true,
            contentDefault: '<b>1.</b>',
            contentFA: '<i class="fa fa-list-ol"></i>'
        },
        'unorderedlist': {
            name: 'unorderedlist',
            action: 'insertunorderedlist',
            aria: 'unordered list',
            tagNames: ['ul'],
            useQueryState: true,
            contentDefault: '<b>&bull;</b>',
            contentFA: '<i class="fa fa-list-ul"></i>'
        },
        'pre': {
            name: 'pre',
            action: 'append-pre',
            aria: 'preformatted text',
            tagNames: ['pre'],
            contentDefault: '<b>0101</b>',
            contentFA: '<i class="fa fa-code fa-lg"></i>'
        },
        'indent': {
            name: 'indent',
            action: 'indent',
            aria: 'indent',
            tagNames: [],
            contentDefault: '<b>&rarr;</b>',
            contentFA: '<i class="fa fa-indent"></i>'
        },
        'outdent': {
            name: 'outdent',
            action: 'outdent',
            aria: 'outdent',
            tagNames: [],
            contentDefault: '<b>&larr;</b>',
            contentFA: '<i class="fa fa-outdent"></i>'
        },
        'justifyCenter': {
            name: 'justifyCenter',
            action: 'justifyCenter',
            aria: 'center justify',
            tagNames: [],
            style: {
                prop: 'text-align',
                value: 'center'
            },
            useQueryState: true,
            contentDefault: '<b>C</b>',
            contentFA: '<i class="fa fa-align-center"></i>'
        },
        'justifyFull': {
            name: 'justifyFull',
            action: 'justifyFull',
            aria: 'full justify',
            tagNames: [],
            style: {
                prop: 'text-align',
                value: 'justify'
            },
            useQueryState: true,
            contentDefault: '<b>J</b>',
            contentFA: '<i class="fa fa-align-justify"></i>'
        },
        'justifyLeft': {
            name: 'justifyLeft',
            action: 'justifyLeft',
            aria: 'left justify',
            tagNames: [],
            style: {
                prop: 'text-align',
                value: 'left'
            },
            useQueryState: true,
            contentDefault: '<b>L</b>',
            contentFA: '<i class="fa fa-align-left"></i>'
        },
        'justifyRight': {
            name: 'justifyRight',
            action: 'justifyRight',
            aria: 'right justify',
            tagNames: [],
            style: {
                prop: 'text-align',
                value: 'right'
            },
            useQueryState: true,
            contentDefault: '<b>R</b>',
            contentFA: '<i class="fa fa-align-right"></i>'
        },
        'header1': {
            name: 'header1',
            action: function (options) {
                return 'append-' + options.firstHeader;
            },
            aria: function (options) {
                return options.firstHeader;
            },
            tagNames: function (options) {
                return [options.firstHeader];
            },
            contentDefault: '<b>H1</b>'
        },
        'header2': {
            name: 'header2',
            action: function (options) {
                return 'append-' + options.secondHeader;
            },
            aria: function (options) {
                return options.secondHeader;
            },
            tagNames: function (options) {
                return [options.secondHeader];
            },
            contentDefault: '<b>H2</b>'
        }
    };

    DefaultButton = function (options, instance) {
        this.options = options;
        this.name = options.name;
        this.init(instance);
    };

    DefaultButton.prototype = {
        init: function (instance) {
            this.base = instance;

            this.button = this.createButton();
            this.base.on(this.button, 'click', this.handleClick.bind(this));
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
                content = this.options.contentDefault;
            button.classList.add('medium-editor-action');
            button.classList.add('medium-editor-action-' + this.name);
            button.setAttribute('data-action', this.getAction());
            button.setAttribute('aria-label', this.getAria());
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
                try {
                    queryState = this.base.options.ownerDocument.queryCommandState(this.getAction());
                } catch (exc) {
                    queryState = null;
                }
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
                        this.knownState = isMatch = (computedStyle.indexOf(val) !== -1);
                    }
                }.bind(this));
            }

            return isMatch;
        }
    };
}(window, document));
