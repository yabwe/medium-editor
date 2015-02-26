/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_"))) {
  (function (view) {

  "use strict";

  if (!('Element' in view)) return;

  var
      classListProp = "classList"
    , protoProp = "prototype"
    , elemCtrProto = view.Element[protoProp]
    , objCtr = Object
    , strTrim = String[protoProp].trim || function () {
      return this.replace(/^\s+|\s+$/g, "");
    }
    , arrIndexOf = Array[protoProp].indexOf || function (item) {
      var
          i = 0
        , len = this.length
      ;
      for (; i < len; i++) {
        if (i in this && this[i] === item) {
          return i;
        }
      }
      return -1;
    }
    // Vendors: please allow content code to instantiate DOMExceptions
    , DOMEx = function (type, message) {
      this.name = type;
      this.code = DOMException[type];
      this.message = message;
    }
    , checkTokenAndGetIndex = function (classList, token) {
      if (token === "") {
        throw new DOMEx(
            "SYNTAX_ERR"
          , "An invalid or illegal string was specified"
        );
      }
      if (/\s/.test(token)) {
        throw new DOMEx(
            "INVALID_CHARACTER_ERR"
          , "String contains an invalid character"
        );
      }
      return arrIndexOf.call(classList, token);
    }
    , ClassList = function (elem) {
      var
          trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
        , i = 0
        , len = classes.length
      ;
      for (; i < len; i++) {
        this.push(classes[i]);
      }
      this._updateClassName = function () {
        elem.setAttribute("class", this.toString());
      };
    }
    , classListProto = ClassList[protoProp] = []
    , classListGetter = function () {
      return new ClassList(this);
    }
  ;
  // Most DOMException implementations don't allow calling DOMException's toString()
  // on non-DOMExceptions. Error's toString() is sufficient here.
  DOMEx[protoProp] = Error[protoProp];
  classListProto.item = function (i) {
    return this[i] || null;
  };
  classListProto.contains = function (token) {
    token += "";
    return checkTokenAndGetIndex(this, token) !== -1;
  };
  classListProto.add = function () {
    var
        tokens = arguments
      , i = 0
      , l = tokens.length
      , token
      , updated = false
    ;
    do {
      token = tokens[i] + "";
      if (checkTokenAndGetIndex(this, token) === -1) {
        this.push(token);
        updated = true;
      }
    }
    while (++i < l);

    if (updated) {
      this._updateClassName();
    }
  };
  classListProto.remove = function () {
    var
        tokens = arguments
      , i = 0
      , l = tokens.length
      , token
      , updated = false
      , index
    ;
    do {
      token = tokens[i] + "";
      index = checkTokenAndGetIndex(this, token);
      while (index !== -1) {
        this.splice(index, 1);
        updated = true;
        index = checkTokenAndGetIndex(this, token);
      }
    }
    while (++i < l);

    if (updated) {
      this._updateClassName();
    }
  };
  classListProto.toggle = function (token, force) {
    token += "";

    var
        result = this.contains(token)
      , method = result ?
        force !== true && "remove"
      :
        force !== false && "add"
    ;

    if (method) {
      this[method](token);
    }

    if (force === true || force === false) {
      return force;
    } else {
      return !result;
    }
  };
  classListProto.toString = function () {
    return this.join(" ");
  };

  if (objCtr.defineProperty) {
    var classListPropDesc = {
        get: classListGetter
      , enumerable: true
      , configurable: true
    };
    try {
      objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
    } catch (ex) { // IE 8 doesn't support enumerable:true
      if (ex.number === -0x7FF5EC54) {
        classListPropDesc.enumerable = false;
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      }
    }
  } else if (objCtr[protoProp].__defineGetter__) {
    elemCtrProto.__defineGetter__(classListProp, classListGetter);
  }

  }(self));
}

(function (root, factory) {
    'use strict';
    if (typeof module === 'object') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory;
        });
    } else {
        root.MediumEditor = factory;
    }
}(this, function () {

    'use strict';

var Util;

(function (window, document) {
    'use strict';

    function copyInto(dest, source, overwrite) {
        var prop;
        dest = dest || {};
        for (prop in source) {
            if (source.hasOwnProperty(prop) && (overwrite || dest.hasOwnProperty(prop) === false)) {
                dest[prop] = source[prop];
            }
        }
        return dest;
    }

    Util = {

        // http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
        // by rg89
        isIE: ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))),

        // https://github.com/jashkenas/underscore
        keyCode: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESCAPE: 27,
            SPACE: 32,
            DELETE: 46
        },

        parentElements: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'],

        defaults: function defaults(dest, source) {
            return copyInto(dest, source);
        },

        extend: function extend(dest, source) {
            return copyInto(dest, source, true);
        },

        derives: function derives(base, derived) {
            var origPrototype = derived.prototype;
            function Proto() { }
            Proto.prototype = base.prototype;
            derived.prototype = new Proto();
            derived.prototype.constructor = base;
            derived.prototype = copyInto(derived.prototype, origPrototype);
            return derived;
        },

        // Find the next node in the DOM tree that represents any text that is being
        // displayed directly next to the targetNode (passed as an argument)
        // Text that appears directly next to the current node can be:
        //  - A sibling text node
        //  - A descendant of a sibling element
        //  - A sibling text node of an ancestor
        //  - A descendant of a sibling element of an ancestor
        findAdjacentTextNodeWithContent: function findAdjacentTextNodeWithContent(rootNode, targetNode, ownerDocument) {
            var pastTarget = false,
                nextNode,
                nodeIterator = ownerDocument.createNodeIterator(rootNode, NodeFilter.SHOW_TEXT, null, false);

            // Use a native NodeIterator to iterate over all the text nodes that are descendants
            // of the rootNode.  Once past the targetNode, choose the first non-empty text node
            nextNode = nodeIterator.nextNode();
            while (nextNode) {
                if (nextNode === targetNode) {
                    pastTarget = true;
                } else if (pastTarget) {
                    if (nextNode.nodeType === 3 && nextNode.nodeValue && nextNode.nodeValue.trim().length > 0) {
                        break;
                    }
                }
                nextNode = nodeIterator.nextNode();
            }

            return nextNode;
        },

        isDescendant: function isDescendant(parent, child) {
            if (!parent || !child) {
                return false;
            }
            var node = child.parentNode;
            while (node !== null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        },

        // https://github.com/jashkenas/underscore
        isElement: function isElement(obj) {
            return !!(obj && obj.nodeType === 1);
        },

        now: function now() {
            return Date.now || new Date().getTime();
        },

        // https://github.com/jashkenas/underscore
        throttle: function throttle(func, wait) {
            var THROTTLE_INTERVAL = 50,
                context,
                args,
                result,
                timeout = null,
                previous = 0,
                later;

            if (!wait && wait !== 0) {
                wait = THROTTLE_INTERVAL;
            }

            later = function () {
                previous = Util.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            };

            return function () {
                var currNow = Util.now(),
                    remaining = wait - (currNow - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = currNow;
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },

        traverseUp: function (current, testElementFunction) {

            do {
                if (current.nodeType === 1) {
                    if (testElementFunction(current)) {
                        return current;
                    }
                    // do not traverse upwards past the nearest containing editor
                    if (current.getAttribute('data-medium-element')) {
                        return false;
                    }
                }

                current = current.parentNode;
            } while (current);

            return false;

        },

        htmlEntities: function (str) {
            // converts special characters (like <) into their escaped/encoded values (like &lt;).
            // This allows you to show to display the string without the browser reading it as HTML.
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
        insertHTMLCommand: function (doc, html) {
            var selection, range, el, fragment, node, lastNode;

            if (doc.queryCommandSupported('insertHTML')) {
                try {
                    return doc.execCommand('insertHTML', false, html);
                } catch (ignore) {}
            }

            selection = window.getSelection();
            if (selection.getRangeAt && selection.rangeCount) {
                range = selection.getRangeAt(0);
                range.deleteContents();

                el = doc.createElement("div");
                el.innerHTML = html;
                fragment = doc.createDocumentFragment();
                while (el.firstChild) {
                    node = el.firstChild;
                    lastNode = fragment.appendChild(node);
                }
                range.insertNode(fragment);

                // Preserve the selection:
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        },

        // TODO: not sure if this should be here
        setTargetBlank: function (el) {
            var i;
            if (el.tagName.toLowerCase() === 'a') {
                el.target = '_blank';
            } else {
                el = el.getElementsByTagName('a');

                for (i = 0; i < el.length; i += 1) {
                    el[i].target = '_blank';
                }
            }
        },

        isListItemChild: function (node) {
            var parentNode = node.parentNode,
                tagName = parentNode.tagName.toLowerCase();
            while (this.parentElements.indexOf(tagName) === -1 && tagName !== 'div') {
                if (tagName === 'li') {
                    return true;
                }
                parentNode = parentNode.parentNode;
                if (parentNode && parentNode.tagName) {
                    tagName = parentNode.tagName.toLowerCase();
                } else {
                    return false;
                }
            }
            return false;
        }
    };
}(window, document));

var Selection;

(function (window, document) {
    'use strict';

    Selection = {
        // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
        // by You
        getSelectionStart: function (ownerDocument) {
            var node = ownerDocument.getSelection().anchorNode,
                startNode = (node && node.nodeType === 3 ? node.parentNode : node);
            return startNode;
        },

        findMatchingSelectionParent: function (testElementFunction, contentWindow) {
            var selection = contentWindow.getSelection(), range, current;

            if (selection.rangeCount === 0) {
                return false;
            }

            range = selection.getRangeAt(0);
            current = range.commonAncestorContainer;

            return Util.traverseUp(current, testElementFunction);
        },

        getSelectionElement: function (contentWindow) {
            return this.findMatchingSelectionParent(function (el) {
                return el.getAttribute('data-medium-element');
            }, contentWindow);
        },

        selectionInContentEditableFalse: function (contentWindow) {
            return this.findMatchingSelectionParent(function (el) {
                return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
            }, contentWindow);
        },

        // http://stackoverflow.com/questions/4176923/html-of-selected-text
        // by Tim Down
        getSelectionHtml: function getSelectionHtml() {
            var i,
                html = '',
                sel,
                len,
                container;
            if (this.options.contentWindow.getSelection !== undefined) {
                sel = this.options.contentWindow.getSelection();
                if (sel.rangeCount) {
                    container = this.options.ownerDocument.createElement('div');
                    for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (this.options.ownerDocument.selection !== undefined) {
                if (this.options.ownerDocument.selection.type === 'Text') {
                    html = this.options.ownerDocument.selection.createRange().htmlText;
                }
            }
            return html;
        },

        /**
         *  Find the caret position within an element irrespective of any inline tags it may contain.
         *
         *  @param {DOMElement} An element containing the cursor to find offsets relative to.
         *  @param {Range} A Range representing cursor position. Will window.getSelection if none is passed.
         *  @return {Object} 'left' and 'right' attributes contain offsets from begining and end of Element
         */
        getCaretOffsets: function getCaretOffsets(element, range) {
            var preCaretRange, postCaretRange;

            if (!range) {
                range = window.getSelection().getRangeAt(0);
            }

            preCaretRange = range.cloneRange();
            postCaretRange = range.cloneRange();

            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            postCaretRange.selectNodeContents(element);
            postCaretRange.setStart(range.endContainer, range.endOffset);

            return {
                left: preCaretRange.toString().length,
                right: postCaretRange.toString().length
            };
        },

        // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
        rangeSelectsSingleNode: function (range) {
            var startNode = range.startContainer;
            return startNode === range.endContainer &&
                startNode.hasChildNodes() &&
                range.endOffset === range.startOffset + 1;
        },

        getSelectedParentElement: function (range) {
            var selectedParentElement = null;
            if (this.rangeSelectsSingleNode(range) && range.startContainer.childNodes[range.startOffset].nodeType !== 3) {
                selectedParentElement = range.startContainer.childNodes[range.startOffset];
            } else if (range.startContainer.nodeType === 3) {
                selectedParentElement = range.startContainer.parentNode;
            } else {
                selectedParentElement = range.startContainer;
            }
            return selectedParentElement;
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && Util.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        }
    };
}(document, window));

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
                        this.knownState = isMatch = (computedStyle.indexOf(val) !== -1);
                    }
                }.bind(this));
            }

            return isMatch;
        }
    };
}(window, document));

var pasteHandler;

(function (window, document) {
    'use strict';
    /*jslint regexp: true*/
    /*
        jslint does not allow character negation, because the negation
        will not match any unicode characters. In the regexes in this
        block, negation is used specifically to match the end of an html
        tag, and in fact unicode characters *should* be allowed.
    */
    function createReplacements() {
        return [

            // replace two bogus tags that begin pastes from google docs
            [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
            [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

             // un-html spaces and newlines inserted by OS X
            [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
            [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

            // replace google docs italics+bold with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

            // replace google docs italics with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

            //[replace google docs bolds with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

             // replace manually entered b/i/a tags with real ones
            [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

             // replace manually a tags with real ones, converting smart-quotes from google docs
            [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

        ];
    }
    /*jslint regexp: false*/

    pasteHandler = {
        handlePaste: function (element, evt, options) {
            var paragraphs,
                html = '',
                p,
                dataFormatHTML = 'text/html',
                dataFormatPlain = 'text/plain';

            element.classList.remove('medium-editor-placeholder');
            if (!options.forcePlainText && !options.cleanPastedHTML) {
                return element;
            }

            if (options.contentWindow.clipboardData && evt.clipboardData === undefined) {
                evt.clipboardData = options.contentWindow.clipboardData;
                // If window.clipboardData exists, but e.clipboardData doesn't exist,
                // we're probably in IE. IE only has two possibilities for clipboard
                // data format: 'Text' and 'URL'.
                //
                // Of the two, we want 'Text':
                dataFormatHTML = 'Text';
                dataFormatPlain = 'Text';
            }

            if (evt.clipboardData && evt.clipboardData.getData && !evt.defaultPrevented) {
                evt.preventDefault();

                if (options.cleanPastedHTML && evt.clipboardData.getData(dataFormatHTML)) {
                    return this.cleanPaste(evt.clipboardData.getData(dataFormatHTML), options);
                }
                if (!(options.disableReturn || element.getAttribute('data-disable-return'))) {
                    paragraphs = evt.clipboardData.getData(dataFormatPlain).split(/[\r\n]/g);
                    for (p = 0; p < paragraphs.length; p += 1) {
                        if (paragraphs[p] !== '') {
                            html += '<p>' + Util.htmlEntities(paragraphs[p]) + '</p>';
                        }
                    }
                    Util.insertHTMLCommand(options.ownerDocument, html);
                } else {
                    html = Util.htmlEntities(evt.clipboardData.getData(dataFormatPlain));
                    Util.insertHTMLCommand(options.ownerDocument, html);
                }
            }
        },

        cleanPaste: function (text, options) {
            var i, elList, workEl,
                el = Selection.getSelectionElement(options.contentWindow),
                multiline = /<p|<br|<div/.test(text),
                replacements = createReplacements();

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {
                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>', options.ownerDocument);

                try {
                    options.ownerDocument.execCommand('insertText', false, "\n");
                } catch (ignore) { }

                // block element cleanup
                elList = el.querySelectorAll('a,p,div,br');
                for (i = 0; i < elList.length; i += 1) {
                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'a':
                        if (options.targetBlank) {
                            Util.setTargetBlank(workEl);
                        }
                        break;
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }
                }
            } else {
                this.pasteHTML(text, options.ownerDocument);
            }
        },

        pasteHTML: function (html, ownerDocument) {
            var elList, workEl, i, fragmentBody, pasteBlock = ownerDocument.createDocumentFragment();

            pasteBlock.appendChild(ownerDocument.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody, ownerDocument);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {
                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }
            }
            Util.insertHTMLCommand(ownerDocument, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {
                // remove stray br's following common block elements
                el.parentNode.removeChild(el);
            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {
                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);
            } else if (el.parentNode.childElementCount === 1 && el.parentNode.textContent === '') {
                // and br's that are the only child of a div/p
                this.removeWithParent(el);
            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el, ownerDocument) {
            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with'),
                isCEF = function (el) {
                    return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
                };

            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];
                new_el = ownerDocument.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {
                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';
                } else {
                    new_el.innerHTML = el.innerHTML;
                }
                el.parentNode.replaceChild(new_el, el);
            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];

                // bail if span is in contenteditable = false
                if (Util.traverseUp(el, isCEF)) {
                    return false;
                }

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(ownerDocument.createTextNode(el.textContent), el);
                }
            }
        }
    };
}(window, document));

var AnchorExtension;

(function (window, document) {
    'use strict';

    function AnchorDerived() {
        this.parent = true;
        this.options = {
            name: 'anchor',
            action: 'createLink',
            aria: 'link',
            tagNames: ['a'],
            contentDefault: '<b>#</b>',
            contentFA: '<i class="fa fa-link"></i>'
        };
        this.name = 'anchor';
        this.hasForm = true;
    }

    AnchorDerived.prototype = {

        // Button and Extension handling

        // Called when the button the toolbar is clicked
        // Overrides DefaultButton.handleClick
        handleClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            if (!this.base.selection) {
                this.base.checkSelection();
            }

            var selectedParentElement = Selection.getSelectedParentElement(this.base.selectionRange);
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                return this.base.execAction('unlink');
            }

            if (!this.isDisplayed()) {
                this.showForm();
            }

            return false;
        },

        // Called by medium-editor to append form to the toolbar
        getForm: function () {
            if (!this.anchorForm) {
                this.anchorForm = this.createForm();
            }
            return this.anchorForm;
        },

        // Used by medium-editor when the default toolbar is to be displayed
        isDisplayed: function () {
            return this.getForm().style.display === 'block';
        },

        hideForm: function () {
            this.getForm().style.display = 'none';
            this.getInput().value = '';
        },

        showForm: function (link_value) {
            var input = this.getInput();

            this.base.saveSelection();
            this.base.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.base.setToolbarPosition();
            this.base.keepToolbarAlive = true;

            input.value = link_value || '';
            input.focus();
        },

        // Called by core when tearing down medium-editor (deactivate)
        deactivate: function () {
            if (!this.anchorForm) {
                return false;
            }

            if (this.anchorForm.parentNode) {
                this.anchorForm.parentNode.removeChild(this.anchorForm);
            }

            delete this.anchorForm;
        },

        // core methods

        doLinkCreation: function () {
            var targetCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-target'),
                buttonCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-button'),
                opts = {
                    url: this.getInput().value
                };

            this.base.restoreSelection();

            if (this.base.options.checkLinkFormat) {
                opts.url = this.checkLinkFormat(opts.url);
            }

            if (targetCheckbox && targetCheckbox.checked) {
                opts.target = "_blank";
            } else {
                opts.target = "_self";
            }

            if (buttonCheckbox && buttonCheckbox.checked) {
                opts.buttonClass = this.base.options.anchorButtonClass;
            }

            this.base.createLink(opts);
            this.base.keepToolbarAlive = false;
            this.base.checkSelection();
        },

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        doFormCancel: function () {
            this.base.restoreSelection();
            this.base.keepToolbarAlive = false;
            this.base.checkSelection();
        },

        // form creation and event handling

        createForm: function () {
            var doc = this.base.options.ownerDocument,
                form = doc.createElement('div'),
                input = doc.createElement('input'),
                close = doc.createElement('a'),
                save = doc.createElement('a'),
                target,
                target_label,
                button,
                button_label;

            // Anchor Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-anchor-' + this.base.id;

            // Handle clicks on the form itself
            this.base.on(form, 'click', this.handleFormClick.bind(this));

            // Add url textbox
            input.setAttribute('type', 'text');
            input.className = 'medium-editor-toolbar-input';
            input.setAttribute('placeholder', this.base.options.anchorInputPlaceholder);
            form.appendChild(input);

            // Handle typing in the textbox
            this.base.on(input, 'keyup', this.handleTextboxKeyup.bind(this));

            // Handle clicks into the textbox
            this.base.on(input, 'click', this.handleFormClick.bind(this));

            // Add save buton
            save.setAttribute('href', '#');
            save.className = 'medium-editor-toobar-save';
            save.innerHTML = this.base.options.buttonLabels === 'fontawesome' ?
                             '<i class="fa fa-check"></i>' :
                             '&#10003;';
            form.appendChild(save);

            // Handle save button clicks (capture)
            this.base.on(save, 'click', this.handleSaveClick.bind(this), true);

            // Add close button
            close.setAttribute('href', '#');
            close.className = 'medium-editor-toobar-close';
            close.innerHTML = this.base.options.buttonLabels === 'fontawesome' ?
                              '<i class="fa fa-times"></i>' :
                              '&times;';
            form.appendChild(close);

            // Handle close button clicks
            this.base.on(close, 'click', this.handleCloseClick.bind(this));

            // (Optional) Add 'open in new window' checkbox
            if (this.base.options.anchorTarget) {
                target = doc.createElement('input');
                target.setAttribute('type', 'checkbox');
                target.className = 'medium-editor-toolbar-anchor-target';

                target_label = doc.createElement('label');
                target_label.innerHTML = this.base.options.anchorInputCheckboxLabel;
                target_label.insertBefore(target, target_label.firstChild);

                form.appendChild(target_label);
            }

            // (Optional) Add 'add button class to anchor' checkbox
            if (this.base.options.anchorButton) {
                button = doc.createElement('input');
                button.setAttribute('type', 'checkbox');
                button.className = 'medium-editor-toolbar-anchor-button';

                button_label = doc.createElement('label');
                button_label.innerHTML = "Button";
                button_label.insertBefore(button, button_label.firstChild);

                form.appendChild(button_label);
            }

            // Handle click (capture) & focus (capture) outside of the form
            this.base.on(doc.body, 'click', this.handleOutsideInteraction.bind(this), true);
            this.base.on(doc.body, 'focus', this.handleOutsideInteraction.bind(this), true);

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        handleOutsideInteraction: function (event) {
            if (event.target !== this.getForm() &&
                    !Util.isDescendant(this.getForm(), event.target) &&
                    !Util.isDescendant(this.base.toolbarActions, event.target)) {
                this.base.keepToolbarAlive = false;
                this.base.checkSelection();
            }
        },

        handleTextboxKeyup: function (event) {
            // For ENTER -> create the anchor
            if (event.keyCode === Util.keyCode.ENTER) {
                event.preventDefault();
                this.doLinkCreation();
                return;
            }

            // For ESCAPE -> close the form
            if (event.keyCode === Util.keyCode.ESCAPE) {
                event.preventDefault();
                this.doFormCancel();
            }
        },

        handleFormClick: function (event) {
            // make sure not to hide form when clicking inside the form
            event.stopPropagation();
            this.base.keepToolbarAlive = true;
        },

        handleSaveClick: function (event) {
            // Clicking Save -> create the anchor
            event.preventDefault();
            this.doLinkCreation();
        },

        handleCloseClick: function (event) {
            // Click Close -> close the form
            event.preventDefault();
            this.doFormCancel();
        }
    };

    AnchorExtension = Util.derives(DefaultButton, AnchorDerived);
}(window, document));

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

(function () {
    'use strict';

    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton,
        AnchorExtension: AnchorExtension
    };

    MediumEditor.prototype = {
        defaults: {
            allowMultiParagraphSelection: true,
            anchorInputPlaceholder: 'Paste or type a link',
            anchorInputCheckboxLabel: 'Open in new window',
            anchorPreviewHideDelay: 500,
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
            buttonLabels: false,
            checkLinkFormat: false,
            cleanPastedHTML: false,
            delay: 0,
            diffLeft: 0,
            diffTop: -10,
            disableReturn: false,
            disableDoubleReturn: false,
            disableToolbar: false,
            disableEditing: false,
            disablePlaceholders: false,
            toolbarAlign: 'center',
            elementsContainer: false,
            imageDragging: true,
            standardizeSelectionStart: false,
            contentWindow: window,
            ownerDocument: document,
            firstHeader: 'h3',
            forcePlainText: true,
            placeholder: 'Type your text',
            secondHeader: 'h4',
            targetBlank: false,
            anchorTarget: false,
            anchorButton: false,
            anchorButtonClass: 'btn',
            extensions: {},
            activeButtonClass: 'medium-editor-button-active',
            firstButtonClass: 'medium-editor-button-first',
            lastButtonClass: 'medium-editor-button-last'
        },

        init: function (elements, options) {
            var uniqueId = 1;

            this.options = Util.defaults(options, this.defaults);
            this.setElementSelection(elements);
            if (this.elements.length === 0) {
                return;
            }

            if (!this.options.elementsContainer) {
                this.options.elementsContainer = this.options.ownerDocument.body;
            }

            while (this.options.elementsContainer.querySelector('#medium-editor-toolbar-' + uniqueId)) {
                uniqueId = uniqueId + 1;
            }

            this.id = uniqueId;

            return this.setup();
        },

        setup: function () {
            this.events = [];
            this.isActive = true;
            this.initThrottledMethods()
                .initCommands()
                .initElements()
                .bindSelect()
                .bindDragDrop()
                .bindPaste()
                .setPlaceholders()
                .bindElementActions()
                .bindWindowActions();
        },

        on: function (target, event, listener, useCapture) {
            target.addEventListener(event, listener, useCapture);
            this.events.push([target, event, listener, useCapture]);
        },

        off: function (target, event, listener, useCapture) {
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

        delay: function (fn) {
            var self = this;
            setTimeout(function () {
                if (self.isActive) {
                    fn();
                }
            }, this.options.delay);
        },

        removeAllEvents: function () {
            var e = this.events.pop();
            while (e) {
                e[0].removeEventListener(e[1], e[2], e[3]);
                e = this.events.pop();
            }
        },

        initThrottledMethods: function () {
            var self = this;

            // handleResize is throttled because:
            // - It will be called when the browser is resizing, which can fire many times very quickly
            // - For some event (like resize) a slight lag in UI responsiveness is OK and provides performance benefits
            this.handleResize = Util.throttle(function () {
                if (self.isActive) {
                    self.positionToolbarIfShown();
                }
            });

            // handleBlur is throttled because:
            // - This method could be called many times due to the type of event handlers that are calling it
            // - We want a slight delay so that other events in the stack can run, some of which may
            //   prevent the toolbar from being hidden (via this.keepToolbarAlive).
            this.handleBlur = Util.throttle(function () {
                if (self.isActive && !self.keepToolbarAlive) {
                    self.hideToolbarActions();
                }
            });

            return this;
        },

        initElements: function () {
            var i,
                addToolbar = false;
            for (i = 0; i < this.elements.length; i += 1) {
                if (!this.options.disableEditing && !this.elements[i].getAttribute('data-disable-editing')) {
                    this.elements[i].setAttribute('contentEditable', true);
                }
                if (!this.elements[i].getAttribute('data-placeholder')) {
                    this.elements[i].setAttribute('data-placeholder', this.options.placeholder);
                }
                this.elements[i].setAttribute('data-medium-element', true);
                this.elements[i].setAttribute('role', 'textbox');
                this.elements[i].setAttribute('aria-multiline', true);
                this.bindParagraphCreation(i);
                if (!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')) {
                    addToolbar = true;
                }
            }
            // Init toolbar
            if (addToolbar) {
                this.initToolbar()
                    .setFirstAndLastButtons()
                    .bindAnchorPreview();
            }
            return this;
        },

        setElementSelection: function (selector) {
            if (!selector) {
                selector = [];
            }
            // If string, use as query selector
            if (typeof selector === 'string') {
                selector = this.options.ownerDocument.querySelectorAll(selector);
            }
            // If element, put into array
            if (Util.isElement(selector)) {
                selector = [selector];
            }
            // Convert NodeList (or other array like object) into an array
            this.elements = Array.prototype.slice.apply(selector);
        },

        bindBlur: function () {
            var self = this,
                blurFunction = function (e) {
                    var isDescendantOfEditorElements = false,
                        selection = self.options.contentWindow.getSelection(),
                        selRange = selection.isCollapsed ?
                                   null :
                                   Selection.getSelectedParentElement(selection.getRangeAt(0)),
                        i;

                    // This control was introduced also to avoid the toolbar
                    // to disapper when selecting from right to left and
                    // the selection ends at the beginning of the text.
                    for (i = 0; i < self.elements.length; i += 1) {
                        if (Util.isDescendant(self.elements[i], e.target)
                                || Util.isDescendant(self.elements[i], selRange)) {
                            isDescendantOfEditorElements = true;
                            break;
                        }
                    }
                    // If it's not part of the editor, or the toolbar
                    if (e.target !== self.toolbar
                            && self.elements.indexOf(e.target) === -1
                            && !isDescendantOfEditorElements
                            && !Util.isDescendant(self.toolbar, e.target)
                            && !Util.isDescendant(self.anchorPreview, e.target)) {

                        // Activate the placeholder
                        if (!self.options.disablePlaceholders) {
                            self.placeholderWrapper(e, self.elements[0]);
                        }

                        // Hide the toolbar after a small delay so we can prevent this on toolbar click
                        self.handleBlur();
                    }
                };

            // Hide the toolbar when focusing outside of the editor.
            this.on(this.options.ownerDocument.body, 'click', blurFunction, true);
            this.on(this.options.ownerDocument.body, 'focus', blurFunction, true);

            return this;
        },

        bindClick: function (i) {
            var self = this;

            this.on(this.elements[i], 'click', function () {
                if (!self.options.disablePlaceholders) {
                    // Remove placeholder
                    this.classList.remove('medium-editor-placeholder');
                }

                if (self.options.staticToolbar) {
                    self.setToolbarPosition();
                }
            });

            return this;
        },

        /**
         * This handles blur and keypress events on elements
         * Including Placeholders, and tooldbar hiding on blur
         */
        bindElementActions: function () {
            var i;

            for (i = 0; i < this.elements.length; i += 1) {

                if (!this.options.disablePlaceholders) {
                    // Active all of the placeholders
                    this.activatePlaceholder(this.elements[i]);
                }

                // Bind the return and tab keypress events
                this.bindReturn(i)
                    .bindKeydown(i)
                    .bindClick(i);
            }

            return this;
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

        serialize: function () {
            var i,
                elementid,
                content = {};
            for (i = 0; i < this.elements.length; i += 1) {
                elementid = (this.elements[i].id !== '') ? this.elements[i].id : 'element-' + i;
                content[elementid] = {
                    value: this.elements[i].innerHTML.trim()
                };
            }
            return content;
        },

        initExtension: function (extension, name) {
            if (extension.parent) {
                extension.base = this;
            }
            if (typeof extension.init === 'function') {
                extension.init(this);
            }
            if (!extension.name) {
                extension.name = name;
            }
            return extension;
        },

        initCommands: function () {
            var buttons = this.options.buttons,
                extensions = this.options.extensions,
                ext,
                name;
            this.commands = [];

            buttons.forEach(function (buttonName) {
                if (extensions[buttonName]) {
                    ext = this.initExtension(extensions[buttonName], buttonName);
                    this.commands.push(ext);
                } else if (buttonName === 'anchor') {
                    ext = this.initExtension(new AnchorExtension(), buttonName);
                    this.commands.push(ext);
                } else if (ButtonsData.hasOwnProperty(buttonName)) {
                    ext = new DefaultButton(ButtonsData[buttonName], this);
                    this.commands.push(ext);
                }
            }.bind(this));

            for (name in extensions) {
                if (extensions.hasOwnProperty(name) && buttons.indexOf(name) === -1) {
                    ext = this.initExtension(extensions[name], name);
                }
            }

            return this;
        },

        getExtensionByName: function (name) {
            var extension;
            if (this.commands && this.commands.length) {
                this.commands.forEach(function (ext) {
                    if (ext.name === name) {
                        extension = ext;
                    }
                });
            }
            return extension;
        },

        /**
         * Helper function to call a method with a number of parameters on all registered extensions.
         * The function assures that the function exists before calling.
         *
         * @param {string} funcName name of the function to call
         * @param [args] arguments passed into funcName
         */
        callExtensions: function (funcName) {
            if (arguments.length < 1) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                ext,
                name;

            for (name in this.options.extensions) {
                if (this.options.extensions.hasOwnProperty(name)) {
                    ext = this.options.extensions[name];
                    if (ext[funcName] !== undefined) {
                        ext[funcName].apply(ext, args);
                    }
                }
            }
            return this;
        },

        bindParagraphCreation: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                var node,
                    tagName;
                if (e.which === Util.keyCode.SPACE) {
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        self.options.ownerDocument.execCommand('unlink', false, null);
                    }
                }
            });

            this.on(this.elements[index], 'keyup', function (e) {
                var node = Selection.getSelectionStart(self.options.ownerDocument),
                    tagName,
                    editorElement;

                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                }
                if (e.which === Util.keyCode.ENTER) {
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    editorElement = Selection.getSelectionElement(self.options.contentWindow);

                    if (!(self.options.disableReturn || editorElement.getAttribute('data-disable-return')) &&
                            tagName !== 'li' && !Util.isListItemChild(node)) {
                        if (!e.shiftKey) {

                            // paragraph creation should not be forced within a header tag
                            if (!/h\d/.test(tagName)) {
                                self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                            }
                        }
                        if (tagName === 'a') {
                            self.options.ownerDocument.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        bindReturn: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                if (e.which === Util.keyCode.ENTER) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = Selection.getSelectionStart(self.options.contentWindow);
                        if (node && node.textContent.trim() === '') {
                            e.preventDefault();
                        }
                    }
                }
            });
            return this;
        },

        bindKeydown: function (index) {
            var self = this;
            this.on(this.elements[index], 'keydown', function (e) {
                var node, tag, key;

                if (e.which === Util.keyCode.TAB) {
                    // Override tab only for pre nodes
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tag = node && node.tagName.toLowerCase();

                    if (tag === 'pre') {
                        e.preventDefault();
                        self.options.ownerDocument.execCommand('insertHtml', null, '    ');
                    }

                    // Tab to indent list structures!
                    if (tag === 'li' || Util.isListItemChild(node)) {
                        e.preventDefault();

                        // If Shift is down, outdent, otherwise indent
                        if (e.shiftKey) {
                            self.options.ownerDocument.execCommand('outdent', e);
                        } else {
                            self.options.ownerDocument.execCommand('indent', e);
                        }
                    }
                } else if (e.which === Util.keyCode.BACKSPACE || e.which === Util.keyCode.DELETE || e.which === Util.keyCode.ENTER) {

                    // Bind keys which can create or destroy a block element: backspace, delete, return
                    self.onBlockModifier(e);

                } else if (e.ctrlKey || e.metaKey) {
                    key = String.fromCharCode(e.which || e.keyCode).toLowerCase();
                    self.commands.forEach(function (extension) {
                        if (extension.options.key && extension.options.key === key) {
                            extension.handleClick(e);
                        }
                    });
                }
            });
            return this;
        },

        onBlockModifier: function (e) {
            var range, sel, p, node = Selection.getSelectionStart(this.options.ownerDocument),
                tagName = node.tagName.toLowerCase(),
                isEmpty = /^(\s+|<br\/?>)?$/i,
                isHeader = /h\d/i;

            if ((e.which === Util.keyCode.BACKSPACE || e.which === Util.keyCode.ENTER)
                    && node.previousElementSibling
                    // in a header
                    && isHeader.test(tagName)
                    // at the very end of the block
                    && Selection.getCaretOffsets(node).left === 0) {
                if (e.which === Util.keyCode.BACKSPACE && isEmpty.test(node.previousElementSibling.innerHTML)) {
                    // backspacing the begining of a header into an empty previous element will
                    // change the tagName of the current node to prevent one
                    // instead delete previous node and cancel the event.
                    node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);
                    e.preventDefault();
                } else if (e.which === Util.keyCode.ENTER) {
                    // hitting return in the begining of a header will create empty header elements before the current one
                    // instead, make "<p><br></p>" element, which are what happens if you hit return in an empty paragraph
                    p = this.options.ownerDocument.createElement('p');
                    p.innerHTML = '<br>';
                    node.previousElementSibling.parentNode.insertBefore(p, node);
                    e.preventDefault();
                }
            } else if (e.which === Util.keyCode.DELETE
                        && node.nextElementSibling
                        && node.previousElementSibling
                        // not in a header
                        && !isHeader.test(tagName)
                        // in an empty tag
                        && isEmpty.test(node.innerHTML)
                        // when the next tag *is* a header
                        && isHeader.test(node.nextElementSibling.tagName)) {
                // hitting delete in an empty element preceding a header, ex:
                //  <p>[CURSOR]</p><h1>Header</h1>
                // Will cause the h1 to become a paragraph.
                // Instead, delete the paragraph node and move the cursor to the begining of the h1

                // remove node and move cursor to start of header
                range = document.createRange();
                sel = window.getSelection();

                range.setStart(node.nextElementSibling, 0);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                node.previousElementSibling.parentNode.removeChild(node);

                e.preventDefault();
            }
        },

        initToolbar: function () {
            if (this.toolbar) {
                return this;
            }
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview = this.createAnchorPreview();

            return this;
        },

        createToolbar: function () {
            var toolbar = this.options.ownerDocument.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';

            if (this.options.staticToolbar) {
                toolbar.className += " static-toolbar";
            } else {
                toolbar.className += " stalker-toolbar";
            }

            toolbar.appendChild(this.toolbarButtons());

            // Add any forms that extensions may have
            this.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    toolbar.appendChild(extension.getForm());
                }
            });

            this.options.elementsContainer.appendChild(toolbar);
            return toolbar;
        },

        //TODO: actionTemplate
        toolbarButtons: function () {
            var ul = this.options.ownerDocument.createElement('ul'),
                li,
                btn;

            ul.id = 'medium-editor-toolbar-actions' + this.id;
            ul.className = 'medium-editor-toolbar-actions clearfix';

            this.commands.forEach(function (extension) {
                if (typeof extension.getButton === 'function') {
                    btn = extension.getButton(this);
                    li = this.options.ownerDocument.createElement('li');
                    if (Util.isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }.bind(this));

            return ul;
        },

        bindSelect: function () {
            var i,
                blurHelper = function (event) {
                    // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                    if (event &&
                            event.type &&
                            event.type.toLowerCase() === 'blur' &&
                            event.relatedTarget &&
                            Util.isDescendant(this.toolbar, event.relatedTarget)) {
                        return false;
                    }
                    this.checkSelection();
                }.bind(this),
                timeoutHelper = function () {
                    setTimeout(function () {
                        this.checkSelection();
                    }.bind(this), 0);
                }.bind(this);

            this.on(this.options.ownerDocument.documentElement, 'mouseup', this.checkSelection.bind(this));

            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'keyup', this.checkSelection.bind(this));
                this.on(this.elements[i], 'blur', blurHelper);
                this.on(this.elements[i], 'click', timeoutHelper);
            }

            return this;
        },

        bindDragDrop: function () {
            var self = this, i, className, onDrag, onDrop, element;

            if (!self.options.imageDragging) {
                return this;
            }

            className = 'medium-editor-dragover';

            onDrag = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";

                if (e.type === "dragover") {
                    this.classList.add(className);
                } else {
                    this.classList.remove(className);
                }
            };

            onDrop = function (e) {
                var files;
                e.preventDefault();
                e.stopPropagation();
                files = Array.prototype.slice.call(e.dataTransfer.files, 0);
                files.some(function (file) {
                    if (file.type.match("image")) {
                        var fileReader, id;
                        fileReader = new FileReader();
                        fileReader.readAsDataURL(file);

                        id = 'medium-img-' + (+new Date());
                        Util.insertHTMLCommand(self.options.ownerDocument, '<img class="medium-image-loading" id="' + id + '" />');

                        fileReader.onload = function () {
                            var img = document.getElementById(id);
                            if (img) {
                                img.removeAttribute('id');
                                img.removeAttribute('class');
                                img.src = fileReader.result;
                            }
                        };
                    }
                });
                this.classList.remove(className);
            };

            for (i = 0; i < this.elements.length; i += 1) {
                element = this.elements[i];


                this.on(element, 'dragover', onDrag);
                this.on(element, 'dragleave', onDrag);
                this.on(element, 'drop', onDrop);
            }
            return this;
        },

        stopSelectionUpdates: function () {
            this.preventSelectionUpdates = true;
        },

        startSelectionUpdates: function () {
            this.preventSelectionUpdates = false;
        },

        checkSelection: function () {
            var newSelection,
                selectionElement;

            if (!this.preventSelectionUpdates &&
                    this.keepToolbarAlive !== true &&
                    !this.options.disableToolbar) {

                newSelection = this.options.contentWindow.getSelection();
                if ((!this.options.updateOnEmptySelection && newSelection.toString().trim() === '') ||
                        (this.options.allowMultiParagraphSelection === false && this.multipleBlockElementsSelected()) ||
                        Selection.selectionInContentEditableFalse(this.options.contentWindow)) {
                    if (!this.options.staticToolbar) {
                        this.hideToolbarActions();
                    } else {
                        this.showAndUpdateToolbar();
                    }

                } else {
                    selectionElement = Selection.getSelectionElement(this.options.contentWindow);
                    if (!selectionElement || selectionElement.getAttribute('data-disable-toolbar')) {
                        if (!this.options.staticToolbar) {
                            this.hideToolbarActions();
                        }
                    } else {
                        this.checkSelectionElement(newSelection, selectionElement);
                    }
                }
            }
            return this;
        },

        // Checks for existance of multiple block elements in the current selection
        multipleBlockElementsSelected: function () {
            /*jslint regexp: true*/
            var selectionHtml = Selection.getSelectionHtml.call(this).replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[1-6]|blockquote)[^>]*>/g);
            /*jslint regexp: false*/

            return !!hasMultiParagraphs && hasMultiParagraphs.length > 1;
        },

        checkSelectionElement: function (newSelection, selectionElement) {
            var i,
                adjacentNode,
                offset = 0,
                newRange;
            this.selection = newSelection;
            this.selectionRange = this.selection.getRangeAt(0);

            /*
            * In firefox, there are cases (ie doubleclick of a word) where the selectionRange start
            * will be at the very end of an element.  In other browsers, the selectionRange start
            * would instead be at the very beginning of an element that actually has content.
            * example:
            *   <span>foo</span><span>bar</span>
            *
            * If the text 'bar' is selected, most browsers will have the selectionRange start at the beginning
            * of the 'bar' span.  However, there are cases where firefox will have the selectionRange start
            * at the end of the 'foo' span.  The contenteditable behavior will be ok, but if there are any
            * properties on the 'bar' span, they won't be reflected accurately in the toolbar
            * (ie 'Bold' button wouldn't be active)
            *
            * So, for cases where the selectionRange start is at the end of an element/node, find the next
            * adjacent text node that actually has content in it, and move the selectionRange start there.
            */
            if (this.options.standardizeSelectionStart &&
                    this.selectionRange.startContainer.nodeValue &&
                    (this.selectionRange.startOffset === this.selectionRange.startContainer.nodeValue.length)) {
                adjacentNode = Util.findAdjacentTextNodeWithContent(Selection.getSelectionElement(this.options.contentWindow), this.selectionRange.startContainer, this.options.ownerDocument);
                if (adjacentNode) {
                    offset = 0;
                    while (adjacentNode.nodeValue.substr(offset, 1).trim().length === 0) {
                        offset = offset + 1;
                    }
                    newRange = this.options.ownerDocument.createRange();
                    newRange.setStart(adjacentNode, offset);
                    newRange.setEnd(this.selectionRange.endContainer, this.selectionRange.endOffset);
                    this.selection.removeAllRanges();
                    this.selection.addRange(newRange);
                    this.selectionRange = newRange;
                }
            }

            for (i = 0; i < this.elements.length; i += 1) {
                if (this.elements[i] === selectionElement) {
                    this.showAndUpdateToolbar();
                    return;
                }
            }

            if (!this.options.staticToolbar) {
                this.hideToolbarActions();
            }
        },

        showAndUpdateToolbar: function () {
            this.setToolbarButtonStates()
                .setToolbarPosition()
                .showToolbarDefaultActions();
        },

        setToolbarPosition: function () {
            // document.documentElement for IE 9
            var scrollTop = (this.options.ownerDocument.documentElement && this.options.ownerDocument.documentElement.scrollTop) || this.options.ownerDocument.body.scrollTop,
                selection = this.options.contentWindow.getSelection(),
                windowWidth = this.options.contentWindow.innerWidth,
                container = Selection.getSelectionElement(this.options.contentWindow),
                buttonHeight = 50,
                toolbarWidth,
                toolbarHeight,
                halfOffsetWidth,
                defaultLeft,
                containerRect,
                containerTop,
                containerCenter,
                range,
                boundary,
                middleBoundary,
                targetLeft;

            // If there isn't a valid selection, bail
            if (!container || !this.options.contentWindow.getSelection().focusNode) {
                return this;
            }

            // If the container isn't part of this medium-editor instance, bail
            if (this.elements.indexOf(container) === -1) {
                return this;
            }

            // Calculate container dimensions
            containerRect = container.getBoundingClientRect();
            containerTop = containerRect.top + scrollTop;
            containerCenter = (containerRect.left + (containerRect.width / 2));

            // position the toolbar at left 0, so we can get the real width of the toolbar
            this.toolbar.style.left = '0';
            toolbarWidth = this.toolbar.offsetWidth;
            toolbarHeight = this.toolbar.offsetHeight;
            halfOffsetWidth = toolbarWidth / 2;
            defaultLeft = this.options.diffLeft - halfOffsetWidth;

            if (this.options.staticToolbar) {
                this.showToolbar();

                if (this.options.stickyToolbar) {
                    // If it's beyond the height of the editor, position it at the bottom of the editor
                    if (scrollTop > (containerTop + container.offsetHeight - toolbarHeight)) {
                        this.toolbar.style.top = (containerTop + container.offsetHeight - toolbarHeight) + 'px';
                        this.toolbar.classList.remove('sticky-toolbar');

                    // Stick the toolbar to the top of the window
                    } else if (scrollTop > (containerTop - toolbarHeight)) {
                        this.toolbar.classList.add('sticky-toolbar');
                        this.toolbar.style.top = "0px";

                    // Normal static toolbar position
                    } else {
                        this.toolbar.classList.remove('sticky-toolbar');
                        this.toolbar.style.top = containerTop - toolbarHeight + "px";
                    }
                } else {
                    this.toolbar.style.top = containerTop - toolbarHeight + "px";
                }

                if (this.options.toolbarAlign === 'left') {
                    targetLeft = containerRect.left;
                } else if (this.options.toolbarAlign === 'center') {
                    targetLeft = containerCenter - halfOffsetWidth;
                } else if (this.options.toolbarAlign === 'right') {
                    targetLeft = containerRect.right - toolbarWidth;
                }

                if (targetLeft < 0) {
                    targetLeft = 0;
                } else if ((targetLeft + toolbarWidth) > windowWidth) {
                    targetLeft = windowWidth - toolbarWidth;
                }

                this.toolbar.style.left = targetLeft + 'px';

            } else if (!selection.isCollapsed) {
                this.showToolbar();

                range = selection.getRangeAt(0);
                boundary = range.getBoundingClientRect();
                middleBoundary = (boundary.left + boundary.right) / 2;

                if (boundary.top < buttonHeight) {
                    this.toolbar.classList.add('medium-toolbar-arrow-over');
                    this.toolbar.classList.remove('medium-toolbar-arrow-under');
                    this.toolbar.style.top = buttonHeight + boundary.bottom - this.options.diffTop + this.options.contentWindow.pageYOffset - toolbarHeight + 'px';
                } else {
                    this.toolbar.classList.add('medium-toolbar-arrow-under');
                    this.toolbar.classList.remove('medium-toolbar-arrow-over');
                    this.toolbar.style.top = boundary.top + this.options.diffTop + this.options.contentWindow.pageYOffset - toolbarHeight + 'px';
                }
                if (middleBoundary < halfOffsetWidth) {
                    this.toolbar.style.left = defaultLeft + halfOffsetWidth + 'px';
                } else if ((windowWidth - middleBoundary) < halfOffsetWidth) {
                    this.toolbar.style.left = windowWidth + defaultLeft - halfOffsetWidth + 'px';
                } else {
                    this.toolbar.style.left = defaultLeft + middleBoundary + 'px';
                }
            }

            this.hideAnchorPreview();

            return this;
        },

        setToolbarButtonStates: function () {
            this.commands.forEach(function (extension) {
                if (typeof extension.isActive === 'function') {
                    extension.setInactive();
                }
            }.bind(this));
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                manualStateChecks = [],
                queryState = null,
                parentNode,
                checkExtension = function (extension) {
                    if (typeof extension.checkState === 'function') {
                        extension.checkState(parentNode);
                    } else if (typeof extension.isActive === 'function' &&
                               typeof extension.isAlreadyApplied === 'function') {
                        if (!extension.isActive() && extension.isAlreadyApplied(parentNode)) {
                            extension.setActive();
                        }
                    }
                };

            if (!this.selectionRange) {
                return;
            }
            parentNode = Selection.getSelectedParentElement(this.selectionRange);

            // Loop through all commands
            this.commands.forEach(function (command) {
                // For those commands where we can use document.queryCommandState(), do so
                if (typeof command.queryCommandState === 'function') {
                    queryState = command.queryCommandState();
                    // If queryCommandState returns a valid value, we can trust the browser
                    // and don't need to do our manual checks
                    if (queryState !== null) {
                        if (queryState) {
                            command.setActive();
                        }
                        return;
                    }
                }
                // We can't use queryCommandState for this command, so add to manualStateChecks
                manualStateChecks.push(command);
            });

            // Climb up the DOM and do manual checks for whether a certain command is currently enabled for this node
            while (parentNode.tagName !== undefined && Util.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                manualStateChecks.forEach(checkExtension.bind(this));

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        setFirstAndLastButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button');
            if (buttons.length > 0) {
                buttons[0].className += ' ' + this.options.firstButtonClass;
                buttons[buttons.length - 1].className += ' ' + this.options.lastButtonClass;
            }
            return this;
        },

        // Wrapper around document.queryCommandState for checking whether an action has already
        // been applied to the current selection
        queryCommandState: function (action) {
            var fullAction = /^full-(.+)$/gi,
                match,
                queryState = null;

            // Actions starting with 'full-' need to be modified since this is a medium-editor concept
            match = fullAction.exec(action);
            if (match) {
                action = match[1];
            }

            try {
                queryState = this.options.ownerDocument.queryCommandState(action);
            } catch (exc) {
                queryState = null;
            }

            return queryState;
        },

        execAction: function (action, opts) {
            /*jslint regexp: true*/
            var fullAction = /^full-(.+)$/gi,
                match,
                result;
            /*jslint regexp: false*/

            // Actions starting with 'full-' should be applied to to the entire contents of the editable element
            // (ie full-bold, full-append-pre, etc.)
            match = fullAction.exec(action);
            if (match) {
                // Store the current selection to be restored after applying the action
                this.saveSelection();
                // Select all of the contents before calling the action
                this.selectAllContents();
                result = this.execActionInternal(match[1], opts);
                // Restore the previous selection
                this.restoreSelection();
            } else {
                result = this.execActionInternal(action, opts);
            }

            this.checkSelection();
            return result;
        },

        execActionInternal: function (action, opts) {
            /*jslint regexp: true*/
            var appendAction = /^append-(.+)$/gi,
                match;
            /*jslint regexp: false*/

            // Actions starting with 'append-' should attempt to format a block of text ('formatBlock') using a specific
            // type of block element (ie append-blockquote, append-h1, append-pre, etc.)
            match = appendAction.exec(action);
            if (match) {
                return this.execFormatBlock(match[1]);
            }

            if (action === 'createLink') {
                return this.createLink(opts);
            }

            if (action === 'image') {
                return this.options.ownerDocument.execCommand('insertImage', false, this.options.contentWindow.getSelection());
            }

            return this.options.ownerDocument.execCommand(action, false, null);
        },

        // TODO: move these two methods to selection.js
        // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
        rangeSelectsSingleNode: function (range) {
            var startNode = range.startContainer;
            return startNode === range.endContainer &&
                startNode.hasChildNodes() &&
                range.endOffset === range.startOffset + 1;
        },

        getSelectedParentElement: function () {
            var selectedParentElement = null,
                range = this.selectionRange;
            if (this.rangeSelectsSingleNode(range) && range.startContainer.childNodes[range.startOffset].nodeType !== 3) {
                selectedParentElement = range.startContainer.childNodes[range.startOffset];
            } else if (range.startContainer.nodeType === 3) {
                selectedParentElement = range.startContainer.parentNode;
            } else {
                selectedParentElement = range.startContainer;
            }
            return selectedParentElement;
        },

        execFormatBlock: function (el) {
            var selectionData = Selection.getSelectionData(this.selection.anchorNode);
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (el === 'blockquote' && selectionData.el &&
                    selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return this.options.ownerDocument.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === el) {
                el = 'p';
            }
            // When IE we need to add <> to heading elements and
            //  blockquote needs to be called as indent
            // http://stackoverflow.com/questions/10741831/execcommand-formatblock-headings-in-ie
            // http://stackoverflow.com/questions/1816223/rich-text-editor-with-blockquote-function/1821777#1821777
            if (Util.isIE) {
                if (el === 'blockquote') {
                    return this.options.ownerDocument.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return this.options.ownerDocument.execCommand('formatBlock', false, el);
        },

        isToolbarDefaultActionsShown: function () {
            return !!this.toolbarActions && this.toolbarActions.style.display === 'block';
        },

        hideToolbarDefaultActions: function () {
            if (this.toolbarActions && this.isToolbarDefaultActionsShown()) {
                this.commands.forEach(function (extension) {
                    if (extension.onHide && typeof extension.onHide === 'function') {
                        extension.onHide();
                    }
                });
                this.toolbarActions.style.display = 'none';
            }
        },

        showToolbarDefaultActions: function () {
            this.hideExtensionForms();

            if (this.toolbarActions && !this.isToolbarDefaultActionsShown()) {
                this.toolbarActions.style.display = 'block';
            }

            this.keepToolbarAlive = false;
            // Using setTimeout + options.delay because:
            // We will actually be displaying the toolbar, which should be controlled by options.delay
            this.delay(function () {
                this.showToolbar();
            }.bind(this));

            return this;
        },

        hideExtensionForms: function () {
            // Hide all extension forms
            this.commands.forEach(function (extension) {
                if (extension.hasForm && extension.isDisplayed()) {
                    extension.hideForm();
                }
            });
        },

        isToolbarShown: function () {
            return this.toolbar && this.toolbar.classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
            if (this.toolbar && !this.isToolbarShown()) {
                this.toolbar.classList.add('medium-editor-toolbar-active');
                if (typeof this.options.onShowToolbar === 'function') {
                    this.options.onShowToolbar();
                }
            }
        },

        hideToolbar: function () {
            if (this.isToolbarShown()) {
                this.toolbar.classList.remove('medium-editor-toolbar-active');
                if (typeof this.options.onHideToolbar === 'function') {
                    this.options.onHideToolbar();
                }
            }
        },

        hideToolbarActions: function () {
            this.commands.forEach(function (extension) {
                if (extension.onHide && typeof extension.onHide === 'function') {
                    extension.onHide();
                }
            });
            this.keepToolbarAlive = false;
            this.hideToolbar();
        },

        selectAllContents: function () {
            var range = this.options.ownerDocument.createRange(),
                sel = this.options.contentWindow.getSelection(),
                currNode = Selection.getSelectionElement(this.options.contentWindow);

            if (currNode) {
                // Move to the lowest descendant node that still selects all of the contents
                while (currNode.children.length === 1) {
                    currNode = currNode.children[0];
                }

                range.selectNodeContents(currNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        saveSelection: function () {
            this.selectionState = null;

            var selection = this.options.contentWindow.getSelection(),
                range,
                preSelectionRange,
                start,
                editableElementIndex = -1;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                preSelectionRange = range.cloneRange();

                // Find element current selection is inside
                this.elements.forEach(function (el, index) {
                    if (el === range.startContainer || Util.isDescendant(el, range.startContainer)) {
                        editableElementIndex = index;
                        return false;
                    }
                });

                if (editableElementIndex > -1) {
                    preSelectionRange.selectNodeContents(this.elements[editableElementIndex]);
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;

                    this.selectionState = {
                        start: start,
                        end: start + range.toString().length,
                        editableElementIndex: editableElementIndex
                    };
                }
            }
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        restoreSelection: function () {
            if (!this.selectionState) {
                return;
            }

            var editableElement = this.elements[this.selectionState.editableElementIndex],
                charIndex = 0,
                range = this.options.ownerDocument.createRange(),
                nodeStack = [editableElement],
                node,
                foundStart = false,
                stop = false,
                i,
                sel,
                nextCharIndex;

            range.setStart(editableElement, 0);
            range.collapse(true);

            node = nodeStack.pop();
            while (!stop && node) {
                if (node.nodeType === 3) {
                    nextCharIndex = charIndex + node.length;
                    if (!foundStart && this.selectionState.start >= charIndex && this.selectionState.start <= nextCharIndex) {
                        range.setStart(node, this.selectionState.start - charIndex);
                        foundStart = true;
                    }
                    if (foundStart && this.selectionState.end >= charIndex && this.selectionState.end <= nextCharIndex) {
                        range.setEnd(node, this.selectionState.end - charIndex);
                        stop = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    i = node.childNodes.length - 1;
                    while (i >= 0) {
                        nodeStack.push(node.childNodes[i]);
                        i -= 1;
                    }
                }
                if (!stop) {
                    node = nodeStack.pop();
                }
            }

            sel = this.options.contentWindow.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },

        hideAnchorPreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        // TODO: break method
        showAnchorPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')
                    || anchorEl.getAttribute('data-disable-preview')) {
                return true;
            }

            var self = this,
                buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft;

            self.anchorPreview.querySelector('i').textContent = anchorEl.attributes.href.value;
            halfOffsetWidth = self.anchorPreview.offsetWidth / 2;
            defaultLeft = self.options.diffLeft - halfOffsetWidth;

            self.observeAnchorPreview(anchorEl);

            self.anchorPreview.classList.add('medium-toolbar-arrow-over');
            self.anchorPreview.classList.remove('medium-toolbar-arrow-under');
            self.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - self.options.diffTop + this.options.contentWindow.pageYOffset - self.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                self.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((this.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                self.anchorPreview.style.left = this.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                self.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }

            if (this.anchorPreview && !this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
            }

            return this;
        },

        // TODO: break method
        observeAnchorPreview: function (anchorEl) {
            var self = this,
                lastOver = (new Date()).getTime(),
                over = true,
                stamp = function () {
                    lastOver = (new Date()).getTime();
                    over = true;
                },
                unstamp = function (e) {
                    if (!e.relatedTarget || !/anchor-preview/.test(e.relatedTarget.className)) {
                        over = false;
                    }
                },
                interval_timer = setInterval(function () {
                    if (over) {
                        return true;
                    }
                    var durr = (new Date()).getTime() - lastOver;
                    if (durr > self.options.anchorPreviewHideDelay) {
                        // hide the preview 1/2 second after mouse leaves the link
                        self.hideAnchorPreview();

                        // cleanup
                        clearInterval(interval_timer);
                        self.off(self.anchorPreview, 'mouseover', stamp);
                        self.off(self.anchorPreview, 'mouseout', unstamp);
                        self.off(anchorEl, 'mouseover', stamp);
                        self.off(anchorEl, 'mouseout', unstamp);

                    }
                }, 200);

            this.on(self.anchorPreview, 'mouseover', stamp);
            this.on(self.anchorPreview, 'mouseout', unstamp);
            this.on(anchorEl, 'mouseover', stamp);
            this.on(anchorEl, 'mouseout', unstamp);
        },

        createAnchorPreview: function () {
            var self = this,
                anchorPreview = this.options.ownerDocument.createElement('div');

            anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
            anchorPreview.className = 'medium-editor-anchor-preview';
            anchorPreview.innerHTML = this.anchorPreviewTemplate();
            this.options.elementsContainer.appendChild(anchorPreview);

            this.on(anchorPreview, 'click', function () {
                self.anchorPreviewClickHandler();
            });

            return anchorPreview;
        },

        anchorPreviewTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
                '</div>';
        },

        anchorPreviewClickHandler: function (event) {
            var range,
                sel,
                anchorExtension = this.getExtensionByName('anchor');

            if (anchorExtension && this.activeAnchor) {
                range = this.options.ownerDocument.createRange();
                range.selectNodeContents(this.activeAnchor);

                sel = this.options.contentWindow.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.delay(function () {
                    if (this.activeAnchor) {
                        anchorExtension.showForm(this.activeAnchor.attributes.href.value);
                    }
                    this.keepToolbarAlive = false;
                }.bind(this));
            }

            this.hideAnchorPreview();
        },

        editorAnchorObserver: function (e) {
            var self = this,
                overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    self.off(self.activeAnchor, 'mouseout', leaveAnchor);
                };

            if (e.target && e.target.tagName.toLowerCase() === 'a') {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as e.targed.href, so check the html
                if (!/href=["']\S+["']/.test(e.target.outerHTML) || /href=["']#\S+["']/.test(e.target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.isToolbarShown()) {
                    // only show when toolbar is not present
                    return true;
                }
                this.activeAnchor = e.target;
                this.on(this.activeAnchor, 'mouseout', leaveAnchor);
                // Using setTimeout + options.delay because:
                // - We're going to show the anchor preview according to the configured delay
                //   if the mouse has not left the anchor tag in that time
                this.delay(function () {
                    if (overAnchor) {
                        self.showAnchorPreview(e.target);
                    }
                });
            }
        },

        bindAnchorPreview: function (index) {
            var i, self = this;
            this.editorAnchorObserverWrapper = function (e) {
                self.editorAnchorObserver(e);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'mouseover', this.editorAnchorObserverWrapper);
            }
            return this;
        },

        createLink: function (opts) {
            var customEvent,
                i;

            if (opts.url && opts.url.trim().length > 0) {
                this.options.ownerDocument.execCommand('createLink', false, opts.url);

                if (this.options.targetBlank || opts.target === '_blank') {
                    Util.setTargetBlank(Selection.getSelectionStart(this.options.ownerDocument));
                }

                if (opts.buttonClass) {
                    this.setButtonClass(opts.buttonClass);
                }
            }

            if (this.options.targetBlank || opts.target === "_blank" || opts.buttonClass) {
                customEvent = this.options.ownerDocument.createEvent("HTMLEvents");
                customEvent.initEvent("input", true, true, this.options.contentWindow);
                for (i = 0; i < this.elements.length; i += 1) {
                    this.elements[i].dispatchEvent(customEvent);
                }
            }
        },

        setButtonClass: function (buttonClass) {
            var el = Selection.getSelectionStart(this.options.ownerDocument),
                classes = buttonClass.split(' '),
                i,
                j;
            if (el.tagName.toLowerCase() === 'a') {
                for (j = 0; j < classes.length; j += 1) {
                    el.classList.add(classes[j]);
                }
            } else {
                el = el.getElementsByTagName('a');
                for (i = 0; i < el.length; i += 1) {
                    for (j = 0; j < classes.length; j += 1) {
                        el[i].classList.add(classes[j]);
                    }
                }
            }
        },

        positionToolbarIfShown: function () {
            if (this.isToolbarShown()) {
                this.setToolbarPosition();
            }
        },

        bindWindowActions: function () {
            var self = this;

            // Add a scroll event for sticky toolbar
            if (this.options.staticToolbar && this.options.stickyToolbar) {
                // On scroll, re-position the toolbar
                this.on(this.options.contentWindow, 'scroll', function () {
                    self.positionToolbarIfShown();
                }, true);
            }

            this.on(this.options.contentWindow, 'resize', function () {
                self.handleResize();
            });

            this.bindBlur();

            return this;
        },

        activate: function () {
            if (this.isActive) {
                return;
            }

            this.setup();
        },

        // TODO: break method
        deactivate: function () {
            var i;
            if (!this.isActive) {
                return;
            }
            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.options.elementsContainer.removeChild(this.anchorPreview);
                this.options.elementsContainer.removeChild(this.toolbar);
                delete this.toolbar;
                delete this.anchorPreview;
            }

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('data-medium-element');
            }

            this.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }.bind(this));

            this.removeAllEvents();
        },

        bindPaste: function () {
            var i, self = this;
            this.pasteWrapper = function (e) {
                pasteHandler.handlePaste(this, e, self.options);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'paste', this.pasteWrapper);
            }
            return this;
        },

        setPlaceholders: function () {
            if (!this.options.disablePlaceholders && this.elements && this.elements.length) {
                this.elements.forEach(function (el) {
                    this.activatePlaceholder(el);
                    this.on(el, 'blur', this.placeholderWrapper.bind(this));
                    this.on(el, 'keypress', this.placeholderWrapper.bind(this));
                }.bind(this));
            }

            return this;
        },

        cleanPaste: function (text) {
            pasteHandler.cleanPaste(text, this.options);
        },

        pasteHTML: function (html) {
            pasteHandler.pasteHTML(html, this.options.ownerDocument);
        }
    };

}());

    return MediumEditor;
}()));
