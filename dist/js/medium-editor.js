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

/* Blob.js
 * A Blob implementation.
 * 2014-07-24
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: X11/MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

(function (view) {
  "use strict";

  view.URL = view.URL || view.webkitURL;

  if (view.Blob && view.URL) {
    try {
      new Blob;
      return;
    } catch (e) {}
  }

  // Internally we use a BlobBuilder implementation to base Blob off of
  // in order to support older browsers that only have BlobBuilder
  var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
    var
        get_class = function(object) {
        return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
      }
      , FakeBlobBuilder = function BlobBuilder() {
        this.data = [];
      }
      , FakeBlob = function Blob(data, type, encoding) {
        this.data = data;
        this.size = data.length;
        this.type = type;
        this.encoding = encoding;
      }
      , FBB_proto = FakeBlobBuilder.prototype
      , FB_proto = FakeBlob.prototype
      , FileReaderSync = view.FileReaderSync
      , FileException = function(type) {
        this.code = this[this.name = type];
      }
      , file_ex_codes = (
          "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
        + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
      ).split(" ")
      , file_ex_code = file_ex_codes.length
      , real_URL = view.URL || view.webkitURL || view
      , real_create_object_URL = real_URL.createObjectURL
      , real_revoke_object_URL = real_URL.revokeObjectURL
      , URL = real_URL
      , btoa = view.btoa
      , atob = view.atob

      , ArrayBuffer = view.ArrayBuffer
      , Uint8Array = view.Uint8Array

      , origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
    ;
    FakeBlob.fake = FB_proto.fake = true;
    while (file_ex_code--) {
      FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
    }
    // Polyfill URL
    if (!real_URL.createObjectURL) {
      URL = view.URL = function(uri) {
        var
            uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
          , uri_origin
        ;
        uri_info.href = uri;
        if (!("origin" in uri_info)) {
          if (uri_info.protocol.toLowerCase() === "data:") {
            uri_info.origin = null;
          } else {
            uri_origin = uri.match(origin);
            uri_info.origin = uri_origin && uri_origin[1];
          }
        }
        return uri_info;
      };
    }
    URL.createObjectURL = function(blob) {
      var
          type = blob.type
        , data_URI_header
      ;
      if (type === null) {
        type = "application/octet-stream";
      }
      if (blob instanceof FakeBlob) {
        data_URI_header = "data:" + type;
        if (blob.encoding === "base64") {
          return data_URI_header + ";base64," + blob.data;
        } else if (blob.encoding === "URI") {
          return data_URI_header + "," + decodeURIComponent(blob.data);
        } if (btoa) {
          return data_URI_header + ";base64," + btoa(blob.data);
        } else {
          return data_URI_header + "," + encodeURIComponent(blob.data);
        }
      } else if (real_create_object_URL) {
        return real_create_object_URL.call(real_URL, blob);
      }
    };
    URL.revokeObjectURL = function(object_URL) {
      if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
        real_revoke_object_URL.call(real_URL, object_URL);
      }
    };
    FBB_proto.append = function(data/*, endings*/) {
      var bb = this.data;
      // decode data to a binary string
      if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
        var
            str = ""
          , buf = new Uint8Array(data)
          , i = 0
          , buf_len = buf.length
        ;
        for (; i < buf_len; i++) {
          str += String.fromCharCode(buf[i]);
        }
        bb.push(str);
      } else if (get_class(data) === "Blob" || get_class(data) === "File") {
        if (FileReaderSync) {
          var fr = new FileReaderSync;
          bb.push(fr.readAsBinaryString(data));
        } else {
          // async FileReader won't work as BlobBuilder is sync
          throw new FileException("NOT_READABLE_ERR");
        }
      } else if (data instanceof FakeBlob) {
        if (data.encoding === "base64" && atob) {
          bb.push(atob(data.data));
        } else if (data.encoding === "URI") {
          bb.push(decodeURIComponent(data.data));
        } else if (data.encoding === "raw") {
          bb.push(data.data);
        }
      } else {
        if (typeof data !== "string") {
          data += ""; // convert unsupported types to strings
        }
        // decode UTF-16 to binary string
        bb.push(unescape(encodeURIComponent(data)));
      }
    };
    FBB_proto.getBlob = function(type) {
      if (!arguments.length) {
        type = null;
      }
      return new FakeBlob(this.data.join(""), type, "raw");
    };
    FBB_proto.toString = function() {
      return "[object BlobBuilder]";
    };
    FB_proto.slice = function(start, end, type) {
      var args = arguments.length;
      if (args < 3) {
        type = null;
      }
      return new FakeBlob(
          this.data.slice(start, args > 1 ? end : this.data.length)
        , type
        , this.encoding
      );
    };
    FB_proto.toString = function() {
      return "[object Blob]";
    };
    FB_proto.close = function() {
      this.size = 0;
      delete this.data;
    };
    return FakeBlobBuilder;
  }(view));

  view.Blob = function(blobParts, options) {
    var type = options ? (options.type || "") : "";
    var builder = new BlobBuilder();
    if (blobParts) {
      for (var i = 0, len = blobParts.length; i < len; i++) {
        if (Uint8Array && blobParts[i] instanceof Uint8Array) {
          builder.append(blobParts[i].buffer);
        }
        else {
          builder.append(blobParts[i]);
        }
      }
    }
    var blob = builder.getBlob(type);
    if (!blob.slice && blob.webkitSlice) {
      blob.slice = blob.webkitSlice;
    }
    return blob;
  };

  var getPrototypeOf = Object.getPrototypeOf || function(object) {
    return object.__proto__;
  };
  view.Blob.prototype = getPrototypeOf(new view.Blob());
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));

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

(function (window) {
    'use strict';

    // Params: Array, Boolean, Object
    function getProp(parts, create, context) {
        if (!context) {
            context = window;
        }

        try {
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                if (!(p in context)) {
                    if (create) {
                        context[p] = {};
                    } else {
                        return;
                    }
                }
                context = context[p];
            }
            return context;
        } catch (e) {
            // 'p in context' throws an exception when context is a number, boolean, etc. rather than an object,
            // so in that corner case just return undefined (by having no return statement)
        }
    }

    function copyInto(overwrite, dest) {
        var prop,
            sources = Array.prototype.slice.call(arguments, 2);
        dest = dest || {};
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source) {
                for (prop in source) {
                    if (source.hasOwnProperty(prop) &&
                        typeof source[prop] !== 'undefined' &&
                        (overwrite || dest.hasOwnProperty(prop) === false)) {
                        dest[prop] = source[prop];
                    }
                }
            }
        }
        return dest;
    }

    Util = {

        // http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
        // by rg89
        isIE: ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))),

        // http://stackoverflow.com/a/11752084/569101
        isMac: (window.navigator.platform.toUpperCase().indexOf('MAC') >= 0),

        // https://github.com/jashkenas/underscore
        keyCode: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESCAPE: 27,
            SPACE: 32,
            DELETE: 46
        },

        /**
         * Returns true if it's metaKey on Mac, or ctrlKey on non-Mac.
         * See #591
         */
        isMetaCtrlKey: function (event) {
            if ((this.isMac && event.metaKey) || (!this.isMac && event.ctrlKey)) {
                return true;
            }

            return false;
        },

        parentElements: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'],

        extend: function extend(/* dest, source1, source2, ...*/) {
            var args = [true].concat(Array.prototype.slice.call(arguments));
            return copyInto.apply(this, args);
        },

        defaults: function defaults(/*dest, source1, source2, ...*/) {
            var args = [false].concat(Array.prototype.slice.call(arguments));
            return copyInto.apply(this, args);
        },

        derives: function derives(base, derived) {
            var origPrototype = derived.prototype;
            function Proto() { }
            Proto.prototype = base.prototype;
            derived.prototype = new Proto();
            derived.prototype.constructor = base;
            derived.prototype = copyInto(false, derived.prototype, origPrototype);
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

        isDescendant: function isDescendant(parent, child, checkEquality) {
            if (!parent || !child) {
                return false;
            }
            if (checkEquality && parent === child) {
                return true;
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

        now: Date.now,

        // https://github.com/jashkenas/underscore
        throttle: function (func, wait) {
            var THROTTLE_INTERVAL = 50,
                context,
                args,
                result,
                timeout = null,
                previous = 0,
                later = function () {
                    previous = Date.now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                };

            if (!wait && wait !== 0) {
                wait = THROTTLE_INTERVAL;
            }

            return function () {
                var now = Date.now(),
                    remaining = wait - (now - previous);

                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
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
            if (!current) {
                return false;
            }

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
            var selection, range, el, fragment, node, lastNode, toReplace;

            if (doc.queryCommandSupported('insertHTML')) {
                try {
                    return doc.execCommand('insertHTML', false, html);
                } catch (ignore) {}
            }

            selection = doc.defaultView.getSelection();
            if (selection.getRangeAt && selection.rangeCount) {
                range = selection.getRangeAt(0);
                toReplace = range.commonAncestorContainer;
                // Ensure range covers maximum amount of nodes as possible
                // By moving up the DOM and selecting ancestors whose only child is the range
                if ((toReplace.nodeType === 3 && toReplace.nodeValue === range.toString()) ||
                        (toReplace.nodeType !== 3 && toReplace.innerHTML === range.toString())) {
                    while (toReplace.parentNode &&
                            toReplace.parentNode.childNodes.length === 1 &&
                            !toReplace.parentNode.getAttribute('data-medium-element')) {
                        toReplace = toReplace.parentNode;
                    }
                    range.selectNode(toReplace);
                }
                range.deleteContents();

                el = doc.createElement('div');
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

        getSelectionRange: function (ownerDocument) {
            var selection = ownerDocument.getSelection();
            if (selection.rangeCount === 0) {
                return null;
            }
            return selection.getRangeAt(0);
        },

        // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
        // by You
        getSelectionStart: function (ownerDocument) {
            var node = ownerDocument.getSelection().anchorNode,
                startNode = (node && node.nodeType === 3 ? node.parentNode : node);
            return startNode;
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && this.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        },

        execFormatBlock: function (doc, tagName) {
            var selectionData = this.getSelectionData(this.getSelectionStart(doc));
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (tagName === 'blockquote' && selectionData.el &&
                    selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return doc.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === tagName) {
                tagName = 'p';
            }
            // When IE we need to add <> to heading elements and
            //  blockquote needs to be called as indent
            // http://stackoverflow.com/questions/10741831/execcommand-formatblock-headings-in-ie
            // http://stackoverflow.com/questions/1816223/rich-text-editor-with-blockquote-function/1821777#1821777
            if (this.isIE) {
                if (tagName === 'blockquote') {
                    return doc.execCommand('indent', false, tagName);
                }
                tagName = '<' + tagName + '>';
            }
            return doc.execCommand('formatBlock', false, tagName);
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

        addClassToAnchors: function (el, buttonClass) {
            var classes = buttonClass.split(' '),
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

        isListItem: function (node) {
            if (!node) {
                return false;
            }
            if (node.tagName.toLowerCase() === 'li') {
                return true;
            }

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
        },

        cleanListDOM: function (element) {
            if (element.tagName.toLowerCase() === 'li') {
                var list = element.parentElement;
                if (list.parentElement.tagName.toLowerCase() === 'p') { // yes we need to clean up
                    this.unwrapElement(list.parentElement);
                }
            }
        },

        unwrapElement: function (element) {
            var parent = element.parentNode,
                current = element.firstChild,
                next;
            do {
                next = current.nextSibling;
                parent.insertBefore(current, element);
                current = next;
            } while (current);
            parent.removeChild(element);
        },

        warn: function () {
            if (window.console !== undefined && typeof window.console.warn === 'function') {
                window.console.warn.apply(console, arguments);
            }
        },

        deprecated: function (oldName, newName, version) {
            // simple deprecation warning mechanism.
            var m = oldName + ' is deprecated, please use ' + newName + ' instead.';
            if (version) {
                m += ' Will be removed in ' + version;
            }
            Util.warn(m);
        },

        deprecatedMethod: function (oldName, newName, args, version) {
            // run the replacement and warn when someone calls a deprecated method
            Util.deprecated(oldName, newName, version);
            if (typeof this[newName] === 'function') {
                this[newName].apply(this, args);
            }
        },

        cleanupAttrs: function (el, attrs) {
            attrs.forEach(function (attr) {
                el.removeAttribute(attr);
            });
        },

        cleanupTags: function (el, tags) {
            tags.forEach(function (tag) {
                if (el.tagName.toLowerCase() === tag) {
                    el.parentNode.removeChild(el);
                }
            }, this);
        },

        getClosestTag: function (el, tag) { // get the closest parent
            return Util.traverseUp(el, function (element) {
                return element.tagName.toLowerCase() === tag.toLowerCase();
            });
        },

        unwrap: function (el, doc) {
            var fragment = doc.createDocumentFragment(),
                nodes = Array.prototype.slice.call(el.childNodes);

            // cast nodeList to array since appending child
            // to a different node will alter length of el.childNodes
            for (var i = 0; i < nodes.length; i++) {
                fragment.appendChild(nodes[i]);
            }

            if (fragment.childNodes.length) {
                el.parentNode.replaceChild(fragment, el);
            } else {
                el.parentNode.removeChild(el);
            }
        },

        setObject: function (name, value, context) {
            // summary:
            //      Set a property from a dot-separated string, such as 'A.B.C'
            var parts = name.split('.'),
                p = parts.pop(),
                obj = getProp(parts, true, context);
            return obj && p ? (obj[p] = value) : undefined; // Object
        },

        getObject: function (name, create, context) {
            // summary:
            //      Get a property from a dot-separated string, such as 'A.B.C'
            return getProp(name ? name.split('.') : [], create, context); // Object
        }

    };
}(window));

var ButtonsData;
(function () {
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
        },
        // Known inline elements that are not removed, or not removed consistantly across browsers:
        // <span>, <label>, <br>
        'removeFormat': {
            name: 'removeFormat',
            aria: 'remove formatting',
            action: 'removeFormat',
            contentDefault: '<b>X</b>',
            contentFA: '<i class="fa fa-eraser"></i>'
        }
    };

})();
var editorDefaults;
(function () {

    // summary: The default options hash used by the Editor

    editorDefaults = {

        allowMultiParagraphSelection: true,
        anchorInputPlaceholder: 'Paste or type a link',
        anchorInputCheckboxLabel: 'Open in new window',
        anchorPreviewHideDelay: 500,
        buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
        buttonLabels: false,
        checkLinkFormat: false,
        delay: 0,
        diffLeft: 0,
        diffTop: -10,
        disableReturn: false,
        disableDoubleReturn: false,
        disableToolbar: false,
        disableAnchorPreview: false,
        disableEditing: false,
        disablePlaceholders: false,
        toolbarAlign: 'center',
        elementsContainer: false,
        imageDragging: true,
        standardizeSelectionStart: false,
        contentWindow: window,
        ownerDocument: document,
        firstHeader: 'h3',
        placeholder: 'Type your text',
        secondHeader: 'h4',
        targetBlank: false,
        anchorTarget: false,
        anchorButton: false,
        anchorButtonClass: 'btn',
        extensions: {},
        activeButtonClass: 'medium-editor-button-active',
        firstButtonClass: 'medium-editor-button-first',
        lastButtonClass: 'medium-editor-button-last',
        spellcheck: true,

        paste: {
            forcePlainText: true,
            cleanPastedHTML: false,
            cleanAttrs: ['class', 'style', 'dir'],
            cleanTags: ['meta']
        }

    };

})();

var Extension;

(function () {
    Extension = function (options) {
        Util.extend(this, options);
    };

    Extension.extend = function (protoProps) {
        // magic extender thinger. mostly borrowed from backbone/goog.inherits
        // place this function on some thing you want extend-able.
        //
        // example:
        //
        //      function Thing(args){
        //          this.options = args;
        //      }
        //
        //      Thing.prototype = { foo: "bar" };
        //      Thing.extend = extenderify;
        //
        //      var ThingTwo = Thing.extend({ foo: "baz" });
        //
        //      var thingOne = new Thing(); // foo === bar
        //      var thingTwo = new ThingTwo(); // foo == baz
        //
        //      which seems like some simply shallow copy nonsense
        //      at first, but a lot more is going on there.
        //
        //      passing a `constructor` to the extend props
        //      will cause the instance to instantiate through that
        //      instead of the parent's constructor.

        var parent = this,
            child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.

        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }

        // das statics (.extend comes over, so your subclass can have subclasses too)
        Util.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        if (protoProps) {
            Util.extend(child.prototype, protoProps);
        }

        // todo: $super?

        return child;
    };

    Extension.prototype = {
        init: function (/* instance */) {
            // called when properly decorated and used.
            // has a .base value pointing to the editor
            // owning us. has been given a .name if no
            // name present
        },

        /* parent: [boolean]
         *
         * setting this to true will set the .base property
         * of the extension to be a reference to the
         * medium-editor instance that is using the extension
         */
        parent: false,

        /* base: [MediumEditor instance]
         *
         * If .parent is set to true, this will be set to the
         * current MediumEditor instance before init() is called
         */
        base: null,

        /* name: [string]
         *
         * 'name' of the extension, used for retrieving the extension.
         * If not set, MediumEditor will set this to be the key
         * used when passing the extension into MediumEditor via the
         * 'extensions' option
         */
        name: null,

        /* checkState: [function (node)]
         *
         * If implemented, this function will be called one or more times
         * the state of the editor & toolbar are updated.
         * When the state is updated, the editor does the following:
         *
         * 1) Find the parent node containing the current selection
         * 2) Call checkState on the extension, passing the node as an argument
         * 3) Get tha parent node of the previous node
         * 4) Repeat steps #2 and #3 until we move outside the parent contenteditable
         */
        checkState: null,

        /* getButton: [function ()]
         *
         * If implemented, this function will be called when
         * the toolbar is being created.  The DOM Element returned
         * by this function will be appended to the toolbar along
         * with any other buttons.
         */
        getButton: null,

        /* As alternatives to checkState, these functions provide a more structured
         * path to updating the state of an extension (usually a button) whenever
         * the state of the editor & toolbar are updated.
         */

        /* queryCommandState: [function ()]
         *
         * If implemented, this function will be called once on each extension
         * when the state of the editor/toolbar is being updated.
         *
         * If this function returns a non-null value, the exntesion will
         * be ignored as the code climbs the dom tree.
         *
         * If this function returns true, and the setActive() function is defined
         * setActive() will be called
         */
        queryCommandState: null,

        /* isActive: [function ()]
         *
         * If implemented, this function will be called when MediumEditor
         * has determined that this extension is 'active' for the current selection.
         * This may be called when the editor & toolbar are being updated,
         * but only if queryCommandState() or isAlreadyApplied() functions
         * are implemented, and when called, return true.
         */
        isActive: null,

        /* isAlreadyApplied: [function (node)]
         *
         * If implemented, this function is similar to checkState() in
         * that it will be calle repeatedly as MediumEditor moves up
         * the DOM to update the editor & toolbar after a state change.
         *
         * NOTE: This function will NOT be called if checkState() has
         * been implemented. This function will NOT be called if
         * queryCommandState() is implemented and returns a non-null
         * value when called
         */
        isAlreadyApplied: null,

        /* setActive: [function ()]
         *
         * If implemented, this function is called when MediumEditor knows
         * that this extension is currently enabled.  Currently, this
         * function is called when updating the editor & toolbar, and
         * only if queryCommandState() or isAlreadyApplied(node) return
         * true when called
         */
        setActive: null,

        /* setInactive: [function ()]
         *
         * If implemented, this function is called when MediumEditor knows
         * that this extension is currently disabled.  Curently, this
         * is called at the beginning of each state change for
         * the editor & toolbar. After calling this, MediumEditor
         * will attempt to update the extension, either via checkState()
         * or the combination of queryCommandState(), isAlreadyApplied(node),
         * isActive(), and setActive()
         */
        setInactive: null,

        /* onHide: [function ()]
         *
         * If implemented, this function is called each time the
         * toolbar is hidden
         */
        onHide: null
    };
})();

var Selection;

(function () {
    'use strict';

    Selection = {
        findMatchingSelectionParent: function (testElementFunction, contentWindow) {
            var selection = contentWindow.getSelection(),
                range,
                current;

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
                sel = this.options.contentWindow.getSelection(),
                len,
                container;
            if (sel.rangeCount) {
                container = this.options.ownerDocument.createElement('div');
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
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

        getSelectedElements: function (doc) {
            var selection = doc.getSelection(),
                range,
                toRet,
                currNode;

            if (!selection.rangeCount ||
                    !selection.getRangeAt(0).commonAncestorContainer) {
                return [];
            }

            range = selection.getRangeAt(0);

            if (range.commonAncestorContainer.nodeType === 3) {
                toRet = [];
                currNode = range.commonAncestorContainer;
                while (currNode.parentNode && currNode.parentNode.childNodes.length === 1) {
                    toRet.push(currNode.parentNode);
                    currNode = currNode.parentNode;
                }

                return toRet;
            }

            return [].filter.call(range.commonAncestorContainer.getElementsByTagName('*'), function (el) {
                return (typeof selection.containsNode === 'function') ? selection.containsNode(el, true) : true;
            });
        },

        selectNode: function (node, doc) {
            var range = doc.createRange(),
                sel = doc.getSelection();

            range.selectNodeContents(node);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };
}());

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
        attachCustomEvent: function (event, listener) {
            this.setupListener(event);
            // If we don't suppot this custom event, don't do anything
            if (this.listeners[event]) {
                if (!this.customEvents[event]) {
                    this.customEvents[event] = [];
                }
                this.customEvents[event].push(listener);
            }
        },

        detachCustomEvent: function (event, listener) {
            var index = this.indexOfCustomListener(event, listener);
            if (index !== -1) {
                this.customEvents[event].splice(index, 1);
                // TODO: If array is empty, should detach internal listeners via destoryListener()
            }
        },

        indexOfCustomListener: function (event, listener) {
            if (!this.customEvents[event] || !this.customEvents[event].length) {
                return -1;
            }

            return this.customEvents[event].indexOf(listener);
        },

        detachAllCustomEvents: function () {
            this.customEvents = {};
            // TODO: Should detach internal listeners here via destroyListener()
        },

        triggerCustomEvent: function (name, data, editable) {
            if (this.customEvents[name]) {
                this.customEvents[name].forEach(function (listener) {
                    listener(data, editable);
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
                this.attachDOMEvent(this.options.ownerDocument.body, 'mousedown', this.handleBodyMousedown.bind(this), true);
                this.attachDOMEvent(this.options.ownerDocument.body, 'click', this.handleBodyClick.bind(this), true);
                this.attachDOMEvent(this.options.ownerDocument.body, 'focus', this.handleBodyFocus.bind(this), true);
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

        updateFocus: function (target, eventObj) {
            var toolbarEl = this.base.toolbar ? this.base.toolbar.getToolbarElement() : null,
                anchorPreview = this.base.getExtensionByName('anchor-preview'),
                previewEl = (anchorPreview && anchorPreview.getPreviewElement) ? anchorPreview.getPreviewElement() : null,
                hadFocus,
                toFocus;

            this.base.elements.some(function (element) {
                // Find the element that has focus
                if (!hadFocus && element.getAttribute('data-medium-focused')) {
                    hadFocus = element;
                }

                // bail if we found the element that had focus
                return !!hadFocus;
            }, this);

            // For clicks, we need to know if the mousedown that caused the click happened inside the existing focused element.
            // If so, we don't want to focus another element
            if (hadFocus &&
                    eventObj.type === 'click' &&
                    this.lastMousedownTarget &&
                    (Util.isDescendant(hadFocus, this.lastMousedownTarget, true) ||
                     Util.isDescendant(toolbarEl, this.lastMousedownTarget, true) ||
                     Util.isDescendant(previewEl, this.lastMousedownTarget, true))) {
                toFocus = hadFocus;
            }

            if (!toFocus) {
                this.base.elements.some(function (element) {
                    // If the target is part of an editor element, this is the element getting focus
                    if (!toFocus && (Util.isDescendant(element, target, true))) {
                        toFocus = element;
                    }

                    // bail if we found an element that's getting focus
                    return !!toFocus;
                }, this);
            }

            // Check if the target is external (not part of the editor, toolbar, or anchorpreview)
            var externalEvent = !Util.isDescendant(hadFocus, target, true) &&
                                !Util.isDescendant(toolbarEl, target, true) &&
                                !Util.isDescendant(previewEl, target, true);

            if (toFocus !== hadFocus) {
                // If element has focus, and focus is going outside of editor
                // Don't blur focused element if clicking on editor, toolbar, or anchorpreview
                if (hadFocus && externalEvent) {
                    // Trigger blur on the editable that has lost focus
                    hadFocus.removeAttribute('data-medium-focused');
                    this.triggerCustomEvent('blur', eventObj, hadFocus);
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

        handleBodyClick: function (event) {
            this.updateFocus(event.target, event);
        },

        handleBodyFocus: function (event) {
            this.updateFocus(event.target, event);
        },

        handleBodyMousedown: function (event) {
            this.lastMousedownTarget = event.target;
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

var DefaultButton;

(function () {
    'use strict';

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

var PasteHandler;

(function () {
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
            [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ''],
            [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ''],

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
            [new RegExp(/&lt;a(?:(?!href).)+href=(?:&quot;|&rdquo;|&ldquo;|"|“|”)(((?!&quot;|&rdquo;|&ldquo;|"|“|”).)*)(?:&quot;|&rdquo;|&ldquo;|"|“|”)(?:(?!&gt;).)*&gt;/gi), '<a href="$1">'],

            // Newlines between paragraphs in html have no syntactic value,
            // but then have a tendency to accidentally become additional paragraphs down the line
            [new RegExp(/<\/p>\n+/gi), '</p>'],
            [new RegExp(/\n+<p/gi), '<p'],

            // Microsoft Word makes these odd tags, like <o:p></o:p>
            [new RegExp(/<\/?o:[a-z]*>/gi), '']
        ];
    }
    /*jslint regexp: false*/

    PasteHandler = Extension.extend({

        /* Paste Options */

        /* forcePlainText: [boolean]
         * Forces pasting as plain text.
         */
        forcePlainText: true,

        /* cleanPastedHTML: [boolean]
         * cleans pasted content from different sources, like google docs etc.
         */
        cleanPastedHTML: false,

        /* cleanReplacements: [Array]
         * custom pairs (2 element arrays) of RegExp and replacement text to use during paste when
         * __forcePlainText__ or __cleanPastedHTML__ are `true` OR when calling `cleanPaste(text)` helper method.
         */
        cleanReplacements: [],

        /* cleanAttrs:: [Array]
         * list of element attributes to remove during paste when __cleanPastedHTML__ is `true` or when
         * calling `cleanPaste(text)` or `pasteHTML(html, options)` helper methods.
         */
        cleanAttrs: ['class', 'style', 'dir'],

        /* cleanTags: [Array]
         * list of element tag names to remove during paste when __cleanPastedHTML__ is `true` or when
         * calling `cleanPaste(text)` or `pasteHTML(html, options)` helper methods.
         */
        cleanTags: ['meta'],

        /* ----- internal options needed from base ----- */
        'window': window,
        'document': document,
        targetBlank: false,
        disableReturn: false,

        // Need a reference to MediumEditor (this.base)
        parent: true,

        init: function () {
            if (this.forcePlainText || this.cleanPastedHTML) {
                this.base.subscribe('editablePaste', this.handlePaste.bind(this));
            }
        },

        handlePaste: function (event, element) {
            var paragraphs,
                html = '',
                p,
                dataFormatHTML = 'text/html',
                dataFormatPlain = 'text/plain',
                pastedHTML,
                pastedPlain;

            if (this.window.clipboardData && event.clipboardData === undefined) {
                event.clipboardData = this.window.clipboardData;
                // If window.clipboardData exists, but event.clipboardData doesn't exist,
                // we're probably in IE. IE only has two possibilities for clipboard
                // data format: 'Text' and 'URL'.
                //
                // Of the two, we want 'Text':
                dataFormatHTML = 'Text';
                dataFormatPlain = 'Text';
            }

            if (event.clipboardData &&
                    event.clipboardData.getData &&
                    !event.defaultPrevented) {
                event.preventDefault();

                pastedHTML = event.clipboardData.getData(dataFormatHTML);
                pastedPlain = event.clipboardData.getData(dataFormatPlain);

                if (!pastedHTML) {
                    pastedHTML = pastedPlain;
                }

                if (this.cleanPastedHTML && pastedHTML) {
                    return this.cleanPaste(pastedHTML);
                }

                if (!(this.disableReturn || element.getAttribute('data-disable-return'))) {
                    paragraphs = pastedPlain.split(/[\r\n]+/g);
                    // If there are no \r\n in data, don't wrap in <p>
                    if (paragraphs.length > 1) {
                        for (p = 0; p < paragraphs.length; p += 1) {
                            if (paragraphs[p] !== '') {
                                html += '<p>' + Util.htmlEntities(paragraphs[p]) + '</p>';
                            }
                        }
                    } else {
                        html = Util.htmlEntities(paragraphs[0]);
                    }
                } else {
                    html = Util.htmlEntities(pastedPlain);
                }
                Util.insertHTMLCommand(this.document, html);
            }
        },

        cleanPaste: function (text) {
            var i, elList, workEl,
                el = Selection.getSelectionElement(this.window),
                multiline = /<p|<br|<div/.test(text),
                replacements = createReplacements().concat(this.cleanReplacements || []);

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {
                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>');

                try {
                    this.document.execCommand('insertText', false, '\n');
                } catch (ignore) { }

                // block element cleanup
                elList = el.querySelectorAll('a,p,div,br');
                for (i = 0; i < elList.length; i += 1) {
                    workEl = elList[i];

                    // Microsoft Word replaces some spaces with newlines.
                    // While newlines between block elements are meaningless, newlines within
                    // elements are sometimes actually spaces.
                    workEl.innerHTML = workEl.innerHTML.replace(/\n/gi, ' ');

                    switch (workEl.tagName.toLowerCase()) {
                    case 'a':
                        if (this.targetBlank) {
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
                this.pasteHTML(text);
            }
        },

        pasteHTML: function (html, options) {
            options = Util.defaults({}, options, {
                cleanAttrs: this.cleanAttrs,
                cleanTags: this.cleanTags
            });

            var elList, workEl, i, fragmentBody, pasteBlock = this.document.createDocumentFragment();

            pasteBlock.appendChild(this.document.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');

            for (i = 0; i < elList.length; i += 1) {
                workEl = elList[i];
                Util.cleanupAttrs(workEl, options.cleanAttrs);
                Util.cleanupTags(workEl, options.cleanTags);
            }

            Util.insertHTMLCommand(this.document, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },

        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },

        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent) && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },

        filterLineBreak: function (el) {

            if (this.isCommonBlock(el.previousElementSibling)) {
                // remove stray br's following common block elements
                this.removeWithParent(el);
            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {
                // remove br's just inside open or close tags of a div/p
                this.removeWithParent(el);
            } else if (el.parentNode && el.parentNode.childElementCount === 1 && el.parentNode.textContent === '') {
                // and br's that are the only child of elements other than div/p
                this.removeWithParent(el);
            }
        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el);
                }
            }
        },

        cleanupSpans: function (containerEl) {
            var i,
                el,
                newEl,
                spans = containerEl.querySelectorAll('.replace-with'),
                isCEF = function (el) {
                    return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
                };

            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];
                newEl = this.document.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {
                    // add an i tag as well if this has both italics and bold
                    newEl.innerHTML = '<i>' + el.innerHTML + '</i>';
                } else {
                    newEl.innerHTML = el.innerHTML;
                }
                el.parentNode.replaceChild(newEl, el);
            }

            spans = containerEl.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];

                // bail if span is in contenteditable = false
                if (Util.traverseUp(el, isCEF)) {
                    return false;
                }

                // remove empty spans, replace others with their contents
                Util.unwrap(el, this.document);
            }
        }
    });

}());

var AnchorExtension;

(function () {
    'use strict';

    function AnchorDerived() {
        this.parent = true;
        this.options = {
            name: 'anchor',
            action: 'createLink',
            aria: 'link',
            tagNames: ['a'],
            contentDefault: '<b>#</b>',
            contentFA: '<i class="fa fa-link"></i>',
            key: 'k'
        };
        this.name = 'anchor';
        this.hasForm = true;
    }

    AnchorDerived.prototype = {

        // Button and Extension handling

        // labels for the anchor-edit form buttons
        formSaveLabel: '&#10003;',
        formCloseLabel: '&times;',

        // Called when the button the toolbar is clicked
        // Overrides DefaultButton.handleClick
        handleClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var selectedParentElement = Selection.getSelectedParentElement(Util.getSelectionRange(this.base.options.ownerDocument));
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                return this.base.execAction('unlink');
            }

            if (!this.isDisplayed()) {
                this.showForm();
            }

            return false;
        },

        // Called when user hits the defined shortcut (CTRL / COMMAND + K)
        // Overrides DefaultButton.handleKeydown
        handleKeydown: function (evt) {
            var key = String.fromCharCode(evt.which || evt.keyCode).toLowerCase();

            if (this.options.key === key && Util.isMetaCtrlKey(evt)) {
                evt.preventDefault();
                evt.stopPropagation();

                this.handleClick(evt);
            }
        },

        // Called by medium-editor to append form to the toolbar
        getForm: function () {
            if (!this.form) {
                this.form = this.createForm();
            }
            return this.form;
        },

        getTemplate: function () {

            var template = [
                '<input type="text" class="medium-editor-toolbar-input" placeholder="', this.base.options.anchorInputPlaceholder, '">'
            ];

            template.push(
                '<a href="#" class="medium-editor-toolbar-save">',
                this.base.options.buttonLabels === 'fontawesome' ? '<i class="fa fa-check"></i>' : this.formSaveLabel,
                '</a>'
            );

            template.push('<a href="#" class="medium-editor-toolbar-close">',
                this.base.options.buttonLabels === 'fontawesome' ? '<i class="fa fa-times"></i>' : this.formCloseLabel,
                '</a>');

            // both of these options are slightly moot with the ability to
            // override the various form buildup/serialize functions.

            if (this.base.options.anchorTarget) {
                // fixme: ideally, this options.anchorInputCheckboxLabel would be a formLabel too,
                // figure out how to deprecate? also consider `fa-` icon default implcations.
                template.push(
                    '<input type="checkbox" class="medium-editor-toolbar-anchor-target">',
                    '<label>',
                    this.base.options.anchorInputCheckboxLabel,
                    '</label>'
                );
            }

            if (this.base.options.anchorButton) {
                // fixme: expose this `Button` text as a formLabel property, too
                // and provide similar access to a `fa-` icon default.
                template.push(
                    '<input type="checkbox" class="medium-editor-toolbar-anchor-button">',
                    '<label>Button</label>'
                );
            }

            return template.join('');

        },

        // Used by medium-editor when the default toolbar is to be displayed
        isDisplayed: function () {
            return this.getForm().style.display === 'block';
        },

        hideForm: function () {
            this.getForm().style.display = 'none';
            this.getInput().value = '';
        },

        showForm: function (linkValue) {
            var input = this.getInput();

            this.base.saveSelection();
            this.base.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.base.setToolbarPosition();

            input.value = linkValue || '';
            input.focus();
        },

        // Called by core when tearing down medium-editor (deactivate)
        deactivate: function () {
            if (!this.form) {
                return false;
            }

            if (this.form.parentNode) {
                this.form.parentNode.removeChild(this.form);
            }

            delete this.form;
        },

        // core methods

        getFormOpts: function () {
            // no notion of private functions? wanted `_getFormOpts`
            var targetCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-target'),
                buttonCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-button'),
                opts = {
                    url: this.getInput().value
                };

            if (this.base.options.checkLinkFormat) {
                opts.url = this.checkLinkFormat(opts.url);
            }

            if (targetCheckbox && targetCheckbox.checked) {
                opts.target = '_blank';
            } else {
                opts.target = '_self';
            }

            if (buttonCheckbox && buttonCheckbox.checked) {
                opts.buttonClass = this.base.options.anchorButtonClass;
            }

            return opts;
        },

        doFormSave: function () {
            var opts = this.getFormOpts();
            this.completeFormSave(opts);
        },

        completeFormSave: function (opts) {
            this.base.restoreSelection();
            this.base.createLink(opts);
            this.base.checkSelection();
        },

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        doFormCancel: function () {
            this.base.restoreSelection();
            this.base.checkSelection();
        },

        // form creation and event handling

        attachFormEvents: function (form) {
            var close = form.querySelector('.medium-editor-toolbar-close'),
                save = form.querySelector('.medium-editor-toolbar-save'),
                input = form.querySelector('.medium-editor-toolbar-input');

            // Handle clicks on the form itself
            this.base.on(form, 'click', this.handleFormClick.bind(this));

            // Handle typing in the textbox
            this.base.on(input, 'keyup', this.handleTextboxKeyup.bind(this));

            // Handle close button clicks
            this.base.on(close, 'click', this.handleCloseClick.bind(this));

            // Handle save button clicks (capture)
            this.base.on(save, 'click', this.handleSaveClick.bind(this), true);

        },

        createForm: function () {
            var doc = this.base.options.ownerDocument,
                form = doc.createElement('div');

            // Anchor Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-anchor-' + this.base.id;
            form.innerHTML = this.getTemplate();
            this.attachFormEvents(form);

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        handleTextboxKeyup: function (event) {
            // For ENTER -> create the anchor
            if (event.keyCode === Util.keyCode.ENTER) {
                event.preventDefault();
                this.doFormSave();
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
        },

        handleSaveClick: function (event) {
            // Clicking Save -> create the anchor
            event.preventDefault();
            this.doFormSave();
        },

        handleCloseClick: function (event) {
            // Click Close -> close the form
            event.preventDefault();
            this.doFormCancel();
        }
    };

    AnchorExtension = Util.derives(DefaultButton, AnchorDerived);

}());

var AnchorPreview;

(function () {
    'use strict';

    AnchorPreview = function () {
        this.parent = true;
        this.name = 'anchor-preview';
    };

    AnchorPreview.prototype = {

        // the default selector to locate where to
        // put the activeAnchor value in the preview
        previewValueSelector: 'a',

        init: function (instance) {

            this.base = instance;
            this.anchorPreview = this.createPreview();
            this.base.options.elementsContainer.appendChild(this.anchorPreview);

            this.attachToEditables();
        },

        getPreviewElement: function () {
            return this.anchorPreview;
        },

        createPreview: function () {
            var el = this.base.options.ownerDocument.createElement('div');

            el.id = 'medium-editor-anchor-preview-' + this.base.id;
            el.className = 'medium-editor-anchor-preview';
            el.innerHTML = this.getTemplate();

            this.base.on(el, 'click', this.handleClick.bind(this));

            return el;
        },

        getTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <a class="medium-editor-toolbar-anchor-preview-inner"></a>' +
                '</div>';
        },

        deactivate: function () {
            if (this.anchorPreview) {
                if (this.anchorPreview.parentNode) {
                    this.anchorPreview.parentNode.removeChild(this.anchorPreview);
                }
                delete this.anchorPreview;
            }
        },

        hidePreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
            this.activeAnchor = null;
        },

        showPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active') ||
                    anchorEl.getAttribute('data-disable-preview')) {
                return true;
            }

            if (this.previewValueSelector) {
                this.anchorPreview.querySelector(this.previewValueSelector).textContent = anchorEl.attributes.href.value;
                this.anchorPreview.querySelector(this.previewValueSelector).href = anchorEl.attributes.href.value;
            }

            this.anchorPreview.classList.add('medium-toolbar-arrow-over');
            this.anchorPreview.classList.remove('medium-toolbar-arrow-under');

            if (!this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
            }

            this.activeAnchor = anchorEl;

            this.positionPreview();
            this.attachPreviewHandlers();

            return this;
        },

        positionPreview: function () {
            var buttonHeight = this.anchorPreview.offsetHeight,
                boundary = this.activeAnchor.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft;

            halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
            defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

            this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                this.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((this.base.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                this.anchorPreview.style.left = this.base.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                this.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }
        },

        attachToEditables: function () {
            this.base.subscribe('editableMouseover', this.handleEditableMouseover.bind(this));
        },

        handleClick: function (event) {
            var anchorExtension = this.base.getExtensionByName('anchor'),
                activeAnchor = this.activeAnchor;

            if (anchorExtension && activeAnchor) {
                event.preventDefault();

                this.base.selectElement(this.activeAnchor);

                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.base.delay(function () {
                    if (activeAnchor) {
                        anchorExtension.showForm(activeAnchor.attributes.href.value);
                        activeAnchor = null;
                    }
                }.bind(this));
            }

            this.hidePreview();
        },

        handleAnchorMouseout: function () {
            this.anchorToPreview = null;
            this.base.off(this.activeAnchor, 'mouseout', this.instanceHandleAnchorMouseout);
            this.instanceHandleAnchorMouseout = null;
        },

        handleEditableMouseover: function (event) {
            var target = Util.getClosestTag(event.target, 'a');

            if (target) {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as event.targed.href, so check the html
                if (!/href=["']\S+["']/.test(target.outerHTML) || /href=["']#\S+["']/.test(target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.base.toolbar && this.base.toolbar.isDisplayed()) {
                    // only show when toolbar is not present
                    return true;
                }

                // detach handler for other anchor in case we hovered multiple anchors quickly
                if (this.activeAnchor && this.activeAnchor !== target) {
                    this.detachPreviewHandlers();
                }

                this.anchorToPreview = target;

                this.instanceHandleAnchorMouseout = this.handleAnchorMouseout.bind(this);
                this.base.on(this.anchorToPreview, 'mouseout', this.instanceHandleAnchorMouseout);
                // Using setTimeout + options.delay because:
                // - We're going to show the anchor preview according to the configured delay
                //   if the mouse has not left the anchor tag in that time
                this.base.delay(function () {
                    if (this.anchorToPreview) {
                        //this.activeAnchor = this.anchorToPreview;
                        this.showPreview(this.anchorToPreview);
                    }
                }.bind(this));
            }
        },

        handlePreviewMouseover: function () {
            this.lastOver = (new Date()).getTime();
            this.hovering = true;
        },

        handlePreviewMouseout: function (event) {
            if (!event.relatedTarget || !/anchor-preview/.test(event.relatedTarget.className)) {
                this.hovering = false;
            }
        },

        updatePreview: function () {
            if (this.hovering) {
                return true;
            }
            var durr = (new Date()).getTime() - this.lastOver;
            if (durr > this.base.options.anchorPreviewHideDelay) {
                // hide the preview 1/2 second after mouse leaves the link
                this.detachPreviewHandlers();
            }
        },

        detachPreviewHandlers: function () {
            // cleanup
            clearInterval(this.intervalTimer);
            if (this.instanceHandlePreviewMouseover) {
                this.base.off(this.anchorPreview, 'mouseover', this.instanceHandlePreviewMouseover);
                this.base.off(this.anchorPreview, 'mouseout', this.instanceHandlePreviewMouseout);
                if (this.activeAnchor) {
                    this.base.off(this.activeAnchor, 'mouseover', this.instanceHandlePreviewMouseover);
                    this.base.off(this.activeAnchor, 'mouseout', this.instanceHandlePreviewMouseout);
                }
            }

            this.hidePreview();

            this.hovering = this.instanceHandlePreviewMouseover = this.instanceHandlePreviewMouseout = null;
        },

        // TODO: break up method and extract out handlers
        attachPreviewHandlers: function () {
            this.lastOver = (new Date()).getTime();
            this.hovering = true;

            this.instanceHandlePreviewMouseover = this.handlePreviewMouseover.bind(this);
            this.instanceHandlePreviewMouseout = this.handlePreviewMouseout.bind(this);

            this.intervalTimer = setInterval(this.updatePreview.bind(this), 200);

            this.base.on(this.anchorPreview, 'mouseover', this.instanceHandlePreviewMouseover);
            this.base.on(this.anchorPreview, 'mouseout', this.instanceHandlePreviewMouseout);
            this.base.on(this.activeAnchor, 'mouseover', this.instanceHandlePreviewMouseover);
            this.base.on(this.activeAnchor, 'mouseout', this.instanceHandlePreviewMouseout);
        }
    };
}());

var FontSizeExtension;

(function () {
    'use strict';

    function FontSizeDerived() {
        this.parent = true;
        this.options = {
            name: 'fontsize',
            action: 'fontSize',
            aria: 'increase/decrease font size',
            contentDefault: '&#xB1;', // ±
            contentFA: '<i class="fa fa-text-height"></i>'
        };
        this.name = 'fontsize';
        this.hasForm = true;
    }

    FontSizeDerived.prototype = {

        // Button and Extension handling

        // Called when the button the toolbar is clicked
        // Overrides DefaultButton.handleClick
        handleClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            if (!this.isDisplayed()) {
                // Get fontsize of current selection (convert to string since IE returns this as number)
                var fontSize = this.base.options.ownerDocument.queryCommandValue('fontSize') + '';
                this.showForm(fontSize);
            }

            return false;
        },

        // Called by medium-editor to append form to the toolbar
        getForm: function () {
            if (!this.form) {
                this.form = this.createForm();
            }
            return this.form;
        },

        // Used by medium-editor when the default toolbar is to be displayed
        isDisplayed: function () {
            return this.getForm().style.display === 'block';
        },

        hideForm: function () {
            this.getForm().style.display = 'none';
            this.getInput().value = '';
        },

        showForm: function (fontSize) {
            var input = this.getInput();

            this.base.saveSelection();
            this.base.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.base.setToolbarPosition();

            input.value = fontSize || '';
            input.focus();
        },

        // Called by core when tearing down medium-editor (deactivate)
        deactivate: function () {
            if (!this.form) {
                return false;
            }

            if (this.form.parentNode) {
                this.form.parentNode.removeChild(this.form);
            }

            delete this.form;
        },

        // core methods

        doFormSave: function () {
            this.base.restoreSelection();
            this.base.checkSelection();
        },

        doFormCancel: function () {
            this.base.restoreSelection();
            this.clearFontSize();
            this.base.checkSelection();
        },

        // form creation and event handling

        createForm: function () {
            var doc = this.base.options.ownerDocument,
                form = doc.createElement('div'),
                input = doc.createElement('input'),
                close = doc.createElement('a'),
                save = doc.createElement('a');

            // Font Size Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-fontsize-' + this.base.id;

            // Handle clicks on the form itself
            this.base.on(form, 'click', this.handleFormClick.bind(this));

            // Add font size slider
            input.setAttribute('type', 'range');
            input.setAttribute('min', '1');
            input.setAttribute('max', '7');
            input.className = 'medium-editor-toolbar-input';
            form.appendChild(input);

            // Handle typing in the textbox
            this.base.on(input, 'change', this.handleSliderChange.bind(this));

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

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        clearFontSize: function () {
            Selection.getSelectedElements(this.base.options.ownerDocument).forEach(function (el) {
                if (el.tagName === 'FONT' && el.hasAttribute('size')) {
                    el.removeAttribute('size');
                }
            });
        },

        handleSliderChange: function () {
            var size = this.getInput().value;
            if (size === '4') {
                this.clearFontSize();
            } else {
                this.base.execAction('fontSize', { size: size });
            }
        },

        handleFormClick: function (event) {
            // make sure not to hide form when clicking inside the form
            event.stopPropagation();
        },

        handleSaveClick: function (event) {
            // Clicking Save -> create the font size
            event.preventDefault();
            this.doFormSave();
        },

        handleCloseClick: function (event) {
            // Click Close -> close the form
            event.preventDefault();
            this.doFormCancel();
        }
    };

    FontSizeExtension = Util.derives(DefaultButton, FontSizeDerived);
}());

var Toolbar;

(function () {
    'use strict';

    Toolbar = function Toolbar(instance) {
        this.base = instance;
        this.options = instance.options;
        this.initThrottledMethods();
    };

    Toolbar.prototype = {

        // Toolbar creation/deletion

        createToolbar: function () {
            var toolbar = this.base.options.ownerDocument.createElement('div');

            toolbar.id = 'medium-editor-toolbar-' + this.base.id;
            toolbar.className = 'medium-editor-toolbar';

            if (this.options.staticToolbar) {
                toolbar.className += ' static-toolbar';
            } else {
                toolbar.className += ' stalker-toolbar';
            }

            toolbar.appendChild(this.createToolbarButtons());

            // Add any forms that extensions may have
            this.base.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    toolbar.appendChild(extension.getForm());
                }
            });

            this.attachEventHandlers();

            return toolbar;
        },

        createToolbarButtons: function () {
            var ul = this.base.options.ownerDocument.createElement('ul'),
                li,
                btn,
                buttons,
                extension;

            ul.id = 'medium-editor-toolbar-actions' + this.base.id;
            ul.className = 'medium-editor-toolbar-actions clearfix';
            ul.style.display = 'block';

            this.base.options.buttons.forEach(function (button) {
                extension = this.base.getExtensionByName(button);
                if (typeof extension.getButton === 'function') {
                    btn = extension.getButton(this.base);
                    li = this.base.options.ownerDocument.createElement('li');
                    if (Util.isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }.bind(this));

            buttons = ul.querySelectorAll('button');
            if (buttons.length > 0) {
                buttons[0].classList.add(this.options.firstButtonClass);
                buttons[buttons.length - 1].classList.add(this.options.lastButtonClass);
            }

            return ul;
        },

        deactivate: function () {
            if (this.toolbar) {
                if (this.toolbar.parentNode) {
                    this.toolbar.parentNode.removeChild(this.toolbar);
                }
                delete this.toolbar;
            }
        },

        // Toolbar accessors

        getToolbarElement: function () {
            if (!this.toolbar) {
                this.toolbar = this.createToolbar();
            }

            return this.toolbar;
        },

        getToolbarActionsElement: function () {
            return this.getToolbarElement().querySelector('.medium-editor-toolbar-actions');
        },

        // Toolbar event handlers

        initThrottledMethods: function () {
            // throttledPositionToolbar is throttled because:
            // - It will be called when the browser is resizing, which can fire many times very quickly
            // - For some event (like resize) a slight lag in UI responsiveness is OK and provides performance benefits
            this.throttledPositionToolbar = Util.throttle(function () {
                if (this.base.isActive) {
                    this.positionToolbarIfShown();
                }
            }.bind(this));
        },

        attachEventHandlers: function () {

            // MediumEditor custom events for when user beings and ends interaction with a contenteditable and its elements
            this.base.subscribe('blur', this.handleBlur.bind(this));
            this.base.subscribe('focus', this.handleFocus.bind(this));

            // Updating the state of the toolbar as things change
            this.base.subscribe('editableClick', this.handleEditableClick.bind(this));
            this.base.subscribe('editableKeyup', this.handleEditableKeyup.bind(this));

            // Handle mouseup on document for updating the selection in the toolbar
            this.base.on(this.options.ownerDocument.documentElement, 'mouseup', this.handleDocumentMouseup.bind(this));

            // Add a scroll event for sticky toolbar
            if (this.options.staticToolbar && this.options.stickyToolbar) {
                // On scroll (capture), re-position the toolbar
                this.base.on(this.options.contentWindow, 'scroll', this.handleWindowScroll.bind(this), true);
            }

            // On resize, re-position the toolbar
            this.base.on(this.options.contentWindow, 'resize', this.handleWindowResize.bind(this));
        },

        handleWindowScroll: function () {
            this.positionToolbarIfShown();
        },

        handleWindowResize: function () {
            this.throttledPositionToolbar();
        },

        handleDocumentMouseup: function (event) {
            // Do not trigger checkState when mouseup fires over the toolbar
            if (event &&
                    event.target &&
                    Util.isDescendant(this.getToolbarElement(), event.target)) {
                return false;
            }
            this.checkState();
        },

        handleEditableClick: function () {
            // Delay the call to checkState to handle bug where selection is empty
            // immediately after clicking inside a pre-existing selection
            setTimeout(function () {
                this.checkState();
            }.bind(this), 0);
        },

        handleEditableKeyup: function () {
            this.checkState();
        },

        handleBlur: function () {
            // Kill any previously delayed calls to hide the toolbar
            clearTimeout(this.hideTimeout);

            // Blur may fire even if we have a selection, so we want to prevent any delayed showToolbar
            // calls from happening in this specific case
            clearTimeout(this.delayShowTimeout);

            // Delay the call to hideToolbar to handle bug with multiple editors on the page at once
            this.hideTimeout = setTimeout(function () {
                this.hideToolbar();
            }.bind(this), 1);
        },

        handleFocus: function () {
            this.checkState();
        },

        // Hiding/showing toolbar

        isDisplayed: function () {
            return this.getToolbarElement().classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
            clearTimeout(this.hideTimeout);
            if (!this.isDisplayed()) {
                this.getToolbarElement().classList.add('medium-editor-toolbar-active');
                if (typeof this.options.onShowToolbar === 'function') {
                    this.options.onShowToolbar();
                }
            }
        },

        hideToolbar: function () {
            if (this.isDisplayed()) {
                this.base.commands.forEach(function (extension) {
                    if (typeof extension.onHide === 'function') {
                        extension.onHide();
                    }
                });

                this.getToolbarElement().classList.remove('medium-editor-toolbar-active');
                if (typeof this.options.onHideToolbar === 'function') {
                    this.options.onHideToolbar();
                }
            }
        },

        isToolbarDefaultActionsDisplayed: function () {
            return this.getToolbarActionsElement().style.display === 'block';
        },

        hideToolbarDefaultActions: function () {
            if (this.isToolbarDefaultActionsDisplayed()) {
                this.getToolbarActionsElement().style.display = 'none';
            }
        },

        showToolbarDefaultActions: function () {
            this.hideExtensionForms();

            if (!this.isToolbarDefaultActionsDisplayed()) {
                this.getToolbarActionsElement().style.display = 'block';
            }

            // Using setTimeout + options.delay because:
            // We will actually be displaying the toolbar, which should be controlled by options.delay
            this.delayShowTimeout = this.base.delay(function () {
                this.showToolbar();
            }.bind(this));
        },

        hideExtensionForms: function () {
            // Hide all extension forms
            this.base.commands.forEach(function (extension) {
                if (extension.hasForm && extension.isDisplayed()) {
                    extension.hideForm();
                }
            });
        },

        // Responding to changes in user selection

        // Checks for existance of multiple block elements in the current selection
        multipleBlockElementsSelected: function () {
            /*jslint regexp: true*/
            var selectionHtml = Selection.getSelectionHtml.call(this).replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[1-6]|blockquote)[^>]*>/g);
            /*jslint regexp: false*/

            return !!hasMultiParagraphs && hasMultiParagraphs.length > 1;
        },

        modifySelection: function () {
            var selection = this.options.contentWindow.getSelection(),
                selectionRange = selection.getRangeAt(0);

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
                    selectionRange.startContainer.nodeValue &&
                    (selectionRange.startOffset === selectionRange.startContainer.nodeValue.length)) {
                var adjacentNode = Util.findAdjacentTextNodeWithContent(Selection.getSelectionElement(this.options.contentWindow), selectionRange.startContainer, this.options.ownerDocument);
                if (adjacentNode) {
                    var offset = 0;
                    while (adjacentNode.nodeValue.substr(offset, 1).trim().length === 0) {
                        offset = offset + 1;
                    }
                    var newRange = this.options.ownerDocument.createRange();
                    newRange.setStart(adjacentNode, offset);
                    newRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    selectionRange = newRange;
                }
            }
        },

        checkState: function () {

            if (!this.base.preventSelectionUpdates) {

                // If no editable has focus OR selection is inside contenteditable = false
                // hide toolbar
                if (!this.getFocusedElement() ||
                        Selection.selectionInContentEditableFalse(this.options.contentWindow)) {
                    this.hideToolbar();
                    return;
                }

                // If there's no selection element, selection element doesn't belong to this editor
                // or toolbar is disabled for this selection element
                // hide toolbar
                var selectionElement = Selection.getSelectionElement(this.options.contentWindow);
                if (!selectionElement ||
                        this.base.elements.indexOf(selectionElement) === -1 ||
                        selectionElement.getAttribute('data-disable-toolbar')) {
                    this.hideToolbar();
                    return;
                }

                // Now we know there's a focused editable with a selection

                // If the updateOnEmptySelection option is true, show the toolbar
                if (this.options.updateOnEmptySelection && this.options.staticToolbar) {
                    this.showAndUpdateToolbar();
                    return;
                }

                // If we don't have a 'valid' selection -> hide toolbar
                if (this.options.contentWindow.getSelection().toString().trim() === '' ||
                    (this.options.allowMultiParagraphSelection === false && this.multipleBlockElementsSelected())) {
                    this.hideToolbar();
                } else {
                    this.showAndUpdateToolbar();
                }
            }
        },

        getFocusedElement: function () {
            for (var i = 0; i < this.base.elements.length; i += 1) {
                if (this.base.elements[i].getAttribute('data-medium-focused')) {
                    return this.base.elements[i];
                }
            }
            return null;
        },

        // Updating the toolbar

        showAndUpdateToolbar: function () {
            this.modifySelection();
            this.setToolbarButtonStates();
            this.showToolbarDefaultActions();
            this.setToolbarPosition();
        },

        setToolbarButtonStates: function () {
            this.base.commands.forEach(function (extension) {
                if (typeof extension.isActive === 'function' &&
                    typeof extension.setInactive === 'function') {
                    extension.setInactive();
                }
            }.bind(this));
            this.checkActiveButtons();
        },

        checkActiveButtons: function () {
            var manualStateChecks = [],
                queryState = null,
                selectionRange = Util.getSelectionRange(this.options.ownerDocument),
                parentNode,
                updateExtensionState = function (extension) {
                    if (typeof extension.checkState === 'function') {
                        extension.checkState(parentNode);
                    } else if (typeof extension.isActive === 'function' &&
                               typeof extension.isAlreadyApplied === 'function' &&
                               typeof extension.setActive === 'function') {
                        if (!extension.isActive() && extension.isAlreadyApplied(parentNode)) {
                            extension.setActive();
                        }
                    }
                };

            if (!selectionRange) {
                return;
            }

            parentNode = Selection.getSelectedParentElement(selectionRange);

            // Loop through all commands
            this.base.commands.forEach(function (command) {
                // For those commands where we can use document.queryCommandState(), do so
                if (typeof command.queryCommandState === 'function') {
                    queryState = command.queryCommandState();
                    // If queryCommandState returns a valid value, we can trust the browser
                    // and don't need to do our manual checks
                    if (queryState !== null) {
                        if (queryState && typeof command.setActive === 'function') {
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
                manualStateChecks.forEach(updateExtensionState);

                // we can abort the search upwards if we leave the contentEditable element
                if (this.base.elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        // Positioning toolbar

        positionToolbarIfShown: function () {
            if (this.isDisplayed()) {
                this.setToolbarPosition();
            }
        },

        setToolbarPosition: function () {
            var container = this.getFocusedElement(),
                selection = this.options.contentWindow.getSelection(),
                anchorPreview;

            // If there isn't a valid selection, bail
            if (!container) {
                return this;
            }

            if (this.options.staticToolbar) {
                this.showToolbar();
                this.positionStaticToolbar(container);

            } else if (!selection.isCollapsed) {
                this.showToolbar();
                this.positionToolbar(selection);
            }

            anchorPreview = this.base.getExtensionByName('anchor-preview');

            if (anchorPreview && typeof anchorPreview.hidePreview === 'function') {
                anchorPreview.hidePreview();
            }
        },

        positionStaticToolbar: function (container) {
            // position the toolbar at left 0, so we can get the real width of the toolbar
            this.getToolbarElement().style.left = '0';

            // document.documentElement for IE 9
            var scrollTop = (this.options.ownerDocument.documentElement && this.options.ownerDocument.documentElement.scrollTop) || this.options.ownerDocument.body.scrollTop,
                windowWidth = this.options.contentWindow.innerWidth,
                toolbarElement = this.getToolbarElement(),
                containerRect = container.getBoundingClientRect(),
                containerTop = containerRect.top + scrollTop,
                containerCenter = (containerRect.left + (containerRect.width / 2)),
                toolbarHeight = toolbarElement.offsetHeight,
                toolbarWidth = toolbarElement.offsetWidth,
                halfOffsetWidth = toolbarWidth / 2,
                targetLeft;

            if (this.options.stickyToolbar) {
                // If it's beyond the height of the editor, position it at the bottom of the editor
                if (scrollTop > (containerTop + container.offsetHeight - toolbarHeight)) {
                    toolbarElement.style.top = (containerTop + container.offsetHeight - toolbarHeight) + 'px';
                    toolbarElement.classList.remove('sticky-toolbar');

                // Stick the toolbar to the top of the window
                } else if (scrollTop > (containerTop - toolbarHeight)) {
                    toolbarElement.classList.add('sticky-toolbar');
                    toolbarElement.style.top = '0px';

                // Normal static toolbar position
                } else {
                    toolbarElement.classList.remove('sticky-toolbar');
                    toolbarElement.style.top = containerTop - toolbarHeight + 'px';
                }
            } else {
                toolbarElement.style.top = containerTop - toolbarHeight + 'px';
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
                targetLeft = (windowWidth - Math.ceil(toolbarWidth) - 1);
            }

            toolbarElement.style.left = targetLeft + 'px';
        },

        positionToolbar: function (selection) {
            // position the toolbar at left 0, so we can get the real width of the toolbar
            this.getToolbarElement().style.left = '0';

            var windowWidth = this.options.contentWindow.innerWidth,
                range = selection.getRangeAt(0),
                boundary = range.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                toolbarElement = this.getToolbarElement(),
                toolbarHeight = toolbarElement.offsetHeight,
                toolbarWidth = toolbarElement.offsetWidth,
                halfOffsetWidth = toolbarWidth / 2,
                buttonHeight = 50,
                defaultLeft = this.options.diffLeft - halfOffsetWidth;

            if (boundary.top < buttonHeight) {
                toolbarElement.classList.add('medium-toolbar-arrow-over');
                toolbarElement.classList.remove('medium-toolbar-arrow-under');
                toolbarElement.style.top = buttonHeight + boundary.bottom - this.options.diffTop + this.options.contentWindow.pageYOffset - toolbarHeight + 'px';
            } else {
                toolbarElement.classList.add('medium-toolbar-arrow-under');
                toolbarElement.classList.remove('medium-toolbar-arrow-over');
                toolbarElement.style.top = boundary.top + this.options.diffTop + this.options.contentWindow.pageYOffset - toolbarHeight + 'px';
            }
            if (middleBoundary < halfOffsetWidth) {
                toolbarElement.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((windowWidth - middleBoundary) < halfOffsetWidth) {
                toolbarElement.style.left = windowWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                toolbarElement.style.left = defaultLeft + middleBoundary + 'px';
            }
        }
    };
}());

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

var extensionDefaults;
(function () {
    // for now this is empty because nothing interally uses an Extension default.
    // as they are converted, provide them here.
    extensionDefaults = {
        paste: PasteHandler
    };
})();

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

(function () {
    'use strict';

    // Event handlers that shouldn't be exposed externally

    function handleDisabledEnterKeydown(event, element) {
        if (this.options.disableReturn || element.getAttribute('data-disable-return')) {
            event.preventDefault();
        } else if (this.options.disableDoubleReturn || element.getAttribute('data-disable-double-return')) {
            var node = Util.getSelectionStart(this.options.ownerDocument);
            if (node && node.textContent.trim() === '') {
                event.preventDefault();
            }
        }
    }

    function handleTabKeydown(event) {
        // Override tab only for pre nodes
        var node = Util.getSelectionStart(this.options.ownerDocument),
            tag = node && node.tagName.toLowerCase();

        if (tag === 'pre') {
            event.preventDefault();
            Util.insertHTMLCommand(this.options.ownerDocument, '    ');
        }

        // Tab to indent list structures!
        if (Util.isListItem(node)) {
            event.preventDefault();

            // If Shift is down, outdent, otherwise indent
            if (event.shiftKey) {
                this.options.ownerDocument.execCommand('outdent', false, null);
            } else {
                this.options.ownerDocument.execCommand('indent', false, null);
            }
        }
    }

    function handleBlockDeleteKeydowns(event) {
        var range, sel, p, node = Util.getSelectionStart(this.options.ownerDocument),
            tagName = node.tagName.toLowerCase(),
            isEmpty = /^(\s+|<br\/?>)?$/i,
            isHeader = /h\d/i;

        if ((event.which === Util.keyCode.BACKSPACE || event.which === Util.keyCode.ENTER) &&
                // has a preceeding sibling
                node.previousElementSibling &&
                // in a header
                isHeader.test(tagName) &&
                // at the very end of the block
                Selection.getCaretOffsets(node).left === 0) {
            if (event.which === Util.keyCode.BACKSPACE && isEmpty.test(node.previousElementSibling.innerHTML)) {
                // backspacing the begining of a header into an empty previous element will
                // change the tagName of the current node to prevent one
                // instead delete previous node and cancel the event.
                node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);
                event.preventDefault();
            } else if (event.which === Util.keyCode.ENTER) {
                // hitting return in the begining of a header will create empty header elements before the current one
                // instead, make "<p><br></p>" element, which are what happens if you hit return in an empty paragraph
                p = this.options.ownerDocument.createElement('p');
                p.innerHTML = '<br>';
                node.previousElementSibling.parentNode.insertBefore(p, node);
                event.preventDefault();
            }
        } else if (event.which === Util.keyCode.DELETE &&
                    // between two sibling elements
                    node.nextElementSibling &&
                    node.previousElementSibling &&
                    // not in a header
                    !isHeader.test(tagName) &&
                    // in an empty tag
                    isEmpty.test(node.innerHTML) &&
                    // when the next tag *is* a header
                    isHeader.test(node.nextElementSibling.tagName)) {
            // hitting delete in an empty element preceding a header, ex:
            //  <p>[CURSOR]</p><h1>Header</h1>
            // Will cause the h1 to become a paragraph.
            // Instead, delete the paragraph node and move the cursor to the begining of the h1

            // remove node and move cursor to start of header
            range = this.options.ownerDocument.createRange();
            sel = this.options.ownerDocument.getSelection();

            range.setStart(node.nextElementSibling, 0);
            range.collapse(true);

            sel.removeAllRanges();
            sel.addRange(range);

            node.previousElementSibling.parentNode.removeChild(node);

            event.preventDefault();
        } else if (event.which === Util.keyCode.BACKSPACE &&
                tagName === 'li' &&
                // hitting backspace inside an empty li
                isEmpty.test(node.innerHTML) &&
                // is first element (no preceeding siblings)
                !node.previousElementSibling &&
                // parent also does not have a sibling
                !node.parentElement.previousElementSibling &&
                // is not the only li in a list
                node.nextElementSibling.tagName.toLowerCase() === 'li') {
            // backspacing in an empty first list element in the first list (with more elements) ex:
            //  <ul><li>[CURSOR]</li><li>List Item 2</li></ul>
            // will remove the first <li> but add some extra element before (varies based on browser)
            // Instead, this will:
            // 1) remove the list element
            // 2) create a paragraph before the list
            // 3) move the cursor into the paragraph

            // create a paragraph before the list
            p = this.options.ownerDocument.createElement('p');
            p.innerHTML = '<br>';
            node.parentElement.parentElement.insertBefore(p, node.parentElement);

            // move the cursor into the new paragraph
            range = this.options.ownerDocument.createRange();
            sel = this.options.ownerDocument.getSelection();
            range.setStart(p, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // remove the list element
            node.parentElement.removeChild(node);

            event.preventDefault();
        }
    }

    function handleDrag(event) {
        var className = 'medium-editor-dragover';
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

        if (event.type === 'dragover') {
            event.target.classList.add(className);
        } else if (event.type === 'dragleave') {
            event.target.classList.remove(className);
        }
    }

    function handleDrop(event) {
        var className = 'medium-editor-dragover',
            files;
        event.preventDefault();
        event.stopPropagation();

        // IE9 does not support the File API, so prevent file from opening in a new window
        // but also don't try to actually get the file
        if (event.dataTransfer.files) {
            files = Array.prototype.slice.call(event.dataTransfer.files, 0);
            files.some(function (file) {
                if (file.type.match('image')) {
                    var fileReader, id;
                    fileReader = new FileReader();
                    fileReader.readAsDataURL(file);

                    id = 'medium-img-' + (+new Date());
                    Util.insertHTMLCommand(this.options.ownerDocument, '<img class="medium-image-loading" id="' + id + '" />');

                    fileReader.onload = function () {
                        var img = this.options.ownerDocument.getElementById(id);
                        if (img) {
                            img.removeAttribute('id');
                            img.removeAttribute('class');
                            img.src = fileReader.result;
                        }
                    }.bind(this);
                }
            }.bind(this));
        }
        event.target.classList.remove(className);
    }

    function handleKeyup(event) {
        var node = Util.getSelectionStart(this.options.ownerDocument),
            tagName;

        if (!node) {
            return;
        }

        if (node.getAttribute('data-medium-element') && node.children.length === 0) {
            this.options.ownerDocument.execCommand('formatBlock', false, 'p');
        }

        if (event.which === Util.keyCode.ENTER && !Util.isListItem(node)) {
            tagName = node.tagName.toLowerCase();
            // For anchor tags, unlink
            if (tagName === 'a') {
                this.options.ownerDocument.execCommand('unlink', false, null);
            } else if (!event.shiftKey) {
                // only format block if this is not a header tag
                if (!/h\d/.test(tagName)) {
                    this.options.ownerDocument.execCommand('formatBlock', false, 'p');
                }
            }
        }
    }

    // Internal helper methods which shouldn't be exposed externally

    function createElementsArray(selector) {
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
        var elements = Array.prototype.slice.apply(selector);

        // Loop through elements and convert textarea's into divs
        this.elements = [];
        elements.forEach(function (element) {
            if (element.tagName.toLowerCase() === 'textarea') {
                this.elements.push(createContentEditable.call(this, element));
            } else {
                this.elements.push(element);
            }
        }, this);
    }

    function initExtension(extension, name, instance) {
        if (extension.parent) {
            extension.base = instance;
        }
        if (typeof extension.init === 'function') {
            extension.init(instance);
        }
        if (!extension.name) {
            extension.name = name;
        }
        return extension;
    }

    function shouldAddDefaultAnchorPreview() {
        var i,
            shouldAdd = false;

        // If anchor-preview is disabled, don't add
        if (this.options.disableAnchorPreview) {
            return false;
        }
        // If anchor-preview extension has been overriden, don't add
        if (this.options.extensions['anchor-preview']) {
            return false;
        }
        // If toolbar is disabled, don't add
        if (this.options.disableToolbar) {
            return false;
        }
        // If all elements have 'data-disable-toolbar' attribute, don't add
        for (i = 0; i < this.elements.length; i += 1) {
            if (!this.elements[i].getAttribute('data-disable-toolbar')) {
                shouldAdd = true;
                break;
            }
        }

        return shouldAdd;
    }

    function createContentEditable(textarea) {
        var div = this.options.ownerDocument.createElement('div'),
            id = (+new Date()),
            attributesToClone = [
                'data-disable-editing',
                'data-disable-toolbar',
                'data-placeholder',
                'data-disable-return',
                'data-disable-double-return',
                'data-disable-preview',
                'spellcheck'
            ];

        div.className = textarea.className;
        div.id = id;
        div.innerHTML = textarea.value;
        div.setAttribute('medium-editor-textarea-id', id);
        attributesToClone.forEach(function (attr) {
            if (textarea.hasAttribute(attr)) {
                div.setAttribute(attr, textarea.getAttribute(attr));
            }
        });

        textarea.classList.add('medium-editor-hidden');
        textarea.setAttribute('medium-editor-textarea-id', id);
        textarea.parentNode.insertBefore(
            div,
            textarea
        );

        return div;
    }

    function initElements() {
        this.elements.forEach(function (element) {
            if (!this.options.disableEditing && !element.getAttribute('data-disable-editing')) {
                element.setAttribute('contentEditable', true);
                element.setAttribute('spellcheck', this.options.spellcheck);
            }
            if (!element.getAttribute('data-placeholder')) {
                element.setAttribute('data-placeholder', this.options.placeholder);
            }
            element.setAttribute('data-medium-element', true);
            element.setAttribute('role', 'textbox');
            element.setAttribute('aria-multiline', true);

            if (element.hasAttribute('medium-editor-textarea-id')) {
                this.on(element, 'input', function (event) {
                    var target = event.target,
                        textarea = target.parentNode.querySelector('textarea[medium-editor-textarea-id="' + target.getAttribute('medium-editor-textarea-id') + '"]');
                    if (textarea) {
                        textarea.value = this.serialize()[target.id].value;
                    }
                }.bind(this));
            }
        }, this);
    }

    function initToolbar() {
        if (this.toolbar || this.options.disableToolbar) {
            return false;
        }

        var addToolbar = this.elements.some(function (element) {
            return !element.getAttribute('data-disable-toolbar');
        });

        if (addToolbar) {
            this.toolbar = new Toolbar(this);
            this.options.elementsContainer.appendChild(this.toolbar.getToolbarElement());
        }
    }

    function attachHandlers() {
        var i;

        // attach to tabs
        this.subscribe('editableKeydownTab', handleTabKeydown.bind(this));

        // Bind keys which can create or destroy a block element: backspace, delete, return
        this.subscribe('editableKeydownDelete', handleBlockDeleteKeydowns.bind(this));
        this.subscribe('editableKeydownEnter', handleBlockDeleteKeydowns.bind(this));

        // disabling return or double return
        if (this.options.disableReturn || this.options.disableDoubleReturn) {
            this.subscribe('editableKeydownEnter', handleDisabledEnterKeydown.bind(this));
        } else {
            for (i = 0; i < this.elements.length; i += 1) {
                if (this.elements[i].getAttribute('data-disable-return') || this.elements[i].getAttribute('data-disable-double-return')) {
                    this.subscribe('editableKeydownEnter', handleDisabledEnterKeydown.bind(this));
                    break;
                }
            }
        }

        // if we're not disabling return, add a handler to help handle cleanup
        // for certain cases when enter is pressed
        if (!this.options.disableReturn) {
            this.elements.forEach(function (element) {
                if (!element.getAttribute('data-disable-return')) {
                    this.on(element, 'keyup', handleKeyup.bind(this));
                }
            }, this);
        }

        // drag and drop of images
        if (this.options.imageDragging) {
            this.subscribe('editableDrag', handleDrag.bind(this));
            this.subscribe('editableDrop', handleDrop.bind(this));
        }
    }

    function initPasteHandler(options) {
        // Backwards compatability
        var defaultsBC = {
            forcePlainText: this.options.forcePlainText, // deprecated
            cleanPastedHTML: this.options.cleanPastedHTML, // deprecated
            disableReturn: this.options.disableReturn,
            targetBlank: this.options.targetBlank,
            'window': this.options.contentWindow,
            'document': this.options.ownerDocument
        };

        return new MediumEditor.extensions.paste(
            Util.extend({}, options, defaultsBC)
        );
    }

    function initCommands() {
        var buttons = this.options.buttons,
            extensions = this.options.extensions,
            ext,
            name;
        this.commands = [];

        buttons.forEach(function (buttonName) {
            if (extensions[buttonName]) {
                ext = initExtension(extensions[buttonName], buttonName, this);
                this.commands.push(ext);
            } else if (buttonName === 'anchor') {
                ext = initExtension(new AnchorExtension(), buttonName, this);
                this.commands.push(ext);
            } else if (buttonName === 'fontsize') {
                ext = initExtension(new FontSizeExtension(), buttonName, this);
                this.commands.push(ext);
            } else if (ButtonsData.hasOwnProperty(buttonName)) {
                ext = new DefaultButton(ButtonsData[buttonName], this);
                this.commands.push(ext);
            }
        }, this);

        for (name in extensions) {
            if (extensions.hasOwnProperty(name) && buttons.indexOf(name) === -1) {
                ext = initExtension(extensions[name], name, this);
                this.commands.push(ext);
            }
        }

        // Only add default paste extension if it wasn't overriden
        if (!this.options.extensions['paste']) {
            this.commands.push(initExtension(initPasteHandler.call(this, this.options.paste), 'paste', this));
        }

        // Add AnchorPreview as extension if needed
        if (shouldAddDefaultAnchorPreview.call(this)) {
            this.commands.push(initExtension(new AnchorPreview(), 'anchor-preview', this));
        }
    }

    function mergeOptions(defaults, options) {
        // warn about using deprecated properties
        if (options) {
            [['forcePlainText', 'paste.forcePlainText'],
             ['cleanPastedHTML', 'paste.cleanPastedHTML']].forEach(function (pair) {
                if (options.hasOwnProperty(pair[0]) && options[pair[0]] !== undefined) {
                    Util.deprecated(pair[0], pair[1], 'v5.0.0');
                }
            });
        }

        var nestedMerges = ['paste'],
            tempOpts = Util.extend({}, options);

        nestedMerges.forEach(function (toMerge) {
            if (!tempOpts[toMerge]) {
                tempOpts[toMerge] = defaults[toMerge];
            } else {
                tempOpts[toMerge] = Util.defaults({}, tempOpts[toMerge], defaults[toMerge]);
            }
        });

        return Util.defaults(tempOpts, defaults);
    }

    function execActionInternal(action, opts) {
        /*jslint regexp: true*/
        var appendAction = /^append-(.+)$/gi,
            match;
        /*jslint regexp: false*/

        // Actions starting with 'append-' should attempt to format a block of text ('formatBlock') using a specific
        // type of block element (ie append-blockquote, append-h1, append-pre, etc.)
        match = appendAction.exec(action);
        if (match) {
            return Util.execFormatBlock(this.options.ownerDocument, match[1]);
        }

        if (action === 'fontSize') {
            return this.options.ownerDocument.execCommand('fontSize', false, opts.size);
        }

        if (action === 'createLink') {
            return this.createLink(opts);
        }

        if (action === 'image') {
            return this.options.ownerDocument.execCommand('insertImage', false, this.options.contentWindow.getSelection());
        }

        return this.options.ownerDocument.execCommand(action, false, null);
    }

    // deprecate
    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton,
        AnchorExtension: AnchorExtension,
        FontSizeExtension: FontSizeExtension,
        Toolbar: Toolbar,
        AnchorPreview: AnchorPreview
    };

    MediumEditor.Extension = Extension;

    MediumEditor.extensions = extensionDefaults;
    MediumEditor.util = Util;
    MediumEditor.selection = Selection;

    MediumEditor.prototype = {

        defaults: editorDefaults,

        // NOT DOCUMENTED - exposed for backwards compatability
        init: function (elements, options) {
            var uniqueId = 1;

            this.options = mergeOptions.call(this, this.defaults, options);
            createElementsArray.call(this, elements);
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
            if (this.isActive) {
                return;
            }

            this.events = new Events(this);
            this.isActive = true;

            // Call initialization helpers
            initElements.call(this);
            initCommands.call(this);
            initToolbar.call(this);
            attachHandlers.call(this);

            if (!this.options.disablePlaceholders) {
                this.placeholders = new Placeholders(this);
            }
        },

        destroy: function () {
            if (!this.isActive) {
                return;
            }

            var i;

            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.toolbar.deactivate();
                delete this.toolbar;
            }

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('spellcheck');
                this.elements[i].removeAttribute('data-medium-element');
            }

            this.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }, this);

            this.events.detachAllDOMEvents();
            this.events.detachAllCustomEvents();
        },

        on: function (target, event, listener, useCapture) {
            this.events.attachDOMEvent(target, event, listener, useCapture);
        },

        off: function (target, event, listener, useCapture) {
            this.events.detachDOMEvent(target, event, listener, useCapture);
        },

        subscribe: function (event, listener) {
            this.events.attachCustomEvent(event, listener);
        },

        unsubscribe: function (event, listener) {
            this.events.detachCustomEvent(event, listener);
        },

        delay: function (fn) {
            var self = this;
            return setTimeout(function () {
                if (self.isActive) {
                    fn();
                }
            }, this.options.delay);
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

        getExtensionByName: function (name) {
            var extension;
            if (this.commands && this.commands.length) {
                this.commands.some(function (ext) {
                    if (ext.name === name) {
                        extension = ext;
                        return true;
                    }
                    return false;
                });
            }
            return extension;
        },

        /**
         * NOT DOCUMENTED - exposed for backwards compatability
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

        stopSelectionUpdates: function () {
            this.preventSelectionUpdates = true;
        },

        startSelectionUpdates: function () {
            this.preventSelectionUpdates = false;
        },

        // NOT DOCUMENTED - exposed as extension helper and for backwards compatability
        checkSelection: function () {
            if (this.toolbar) {
                this.toolbar.checkState();
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
                result = execActionInternal.call(this, match[1], opts);
                // Restore the previous selection
                this.restoreSelection();
            } else {
                result = execActionInternal.call(this, action, opts);
            }

            // do some DOM clean-up for known browser issues after the action
            if (action === 'insertunorderedlist' || action === 'insertorderedlist') {
                Util.cleanListDOM(this.getSelectedParentElement());
            }

            this.checkSelection();
            return result;
        },

        getSelectedParentElement: function (range) {
            if (range === undefined) {
                range = this.options.contentWindow.getSelection().getRangeAt(0);
            }
            return Selection.getSelectedParentElement(range);
        },

        // NOT DOCUMENTED - exposed as extension helper
        hideToolbarDefaultActions: function () {
            if (this.toolbar) {
                this.toolbar.hideToolbarDefaultActions();
            }
            return this;
        },

        // NOT DOCUMENTED - exposed as extension helper and for backwards compatability
        setToolbarPosition: function () {
            if (this.toolbar) {
                this.toolbar.setToolbarPosition();
            }
        },

        selectAllContents: function () {
            var currNode = Selection.getSelectionElement(this.options.contentWindow);

            if (currNode) {
                // Move to the lowest descendant node that still selects all of the contents
                while (currNode.children.length === 1) {
                    currNode = currNode.children[0];
                }

                this.selectElement(currNode);
            }
        },

        selectElement: function (element) {
            Selection.selectNode(element, this.options.ownerDocument);

            var selElement = Selection.getSelectionElement(this.options.contentWindow);
            if (selElement) {
                this.events.focusElement(selElement);
            }
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        exportSelection: function () {
            var selectionState = null,
                selection = this.options.contentWindow.getSelection(),
                range,
                preSelectionRange,
                start,
                editableElementIndex = -1;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                preSelectionRange = range.cloneRange();

                // Find element current selection is inside
                this.elements.some(function (el, index) {
                    if (el === range.startContainer || Util.isDescendant(el, range.startContainer)) {
                        editableElementIndex = index;
                        return true;
                    }
                    return false;
                });

                if (editableElementIndex > -1) {
                    preSelectionRange.selectNodeContents(this.elements[editableElementIndex]);
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;

                    selectionState = {
                        start: start,
                        end: start + range.toString().length,
                        editableElementIndex: editableElementIndex
                    };
                }
            }

            if (selectionState !== null && selectionState.editableElementIndex === 0) {
                delete selectionState.editableElementIndex;
            }

            return selectionState;
        },

        saveSelection: function () {
            this.selectionState = this.exportSelection();
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        importSelection: function (inSelectionState) {
            if (!inSelectionState) {
                return;
            }

            var editableElementIndex = inSelectionState.editableElementIndex === undefined ?
                                                0 : inSelectionState.editableElementIndex,
                selectionState = {
                    editableElementIndex: editableElementIndex,
                    start: inSelectionState.start,
                    end: inSelectionState.end
                },
                editableElement = this.elements[selectionState.editableElementIndex],
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
                    if (!foundStart && selectionState.start >= charIndex && selectionState.start <= nextCharIndex) {
                        range.setStart(node, selectionState.start - charIndex);
                        foundStart = true;
                    }
                    if (foundStart && selectionState.end >= charIndex && selectionState.end <= nextCharIndex) {
                        range.setEnd(node, selectionState.end - charIndex);
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

        restoreSelection: function () {
            this.importSelection(this.selectionState);
        },

        createLink: function (opts) {
            var customEvent,
                i;

            if (opts.url && opts.url.trim().length > 0) {
                this.options.ownerDocument.execCommand('createLink', false, opts.url);

                if (this.options.targetBlank || opts.target === '_blank') {
                    Util.setTargetBlank(Util.getSelectionStart(this.options.ownerDocument));
                }

                if (opts.buttonClass) {
                    Util.addClassToAnchors(Util.getSelectionStart(this.options.ownerDocument), opts.buttonClass);
                }
            }

            if (this.options.targetBlank || opts.target === '_blank' || opts.buttonClass) {
                customEvent = this.options.ownerDocument.createEvent('HTMLEvents');
                customEvent.initEvent('input', true, true, this.options.contentWindow);
                for (i = 0; i < this.elements.length; i += 1) {
                    this.elements[i].dispatchEvent(customEvent);
                }
            }
        },

        // alias for setup - keeping for backwards compatability
        activate: function () {
            Util.deprecatedMethod.call(this, 'activate', 'setup', arguments, 'v5.0.0');
        },

        // alias for destroy - keeping for backwards compatability
        deactivate: function () {
            Util.deprecatedMethod.call(this, 'deactivate', 'destroy', arguments, 'v5.0.0');
        },

        cleanPaste: function (text) {
            this.getExtensionByName('paste').cleanPaste(text);
        },

        pasteHTML: function (html, options) {
            this.getExtensionByName('paste').pasteHTML(html, options);
        }
    };
}());

MediumEditor.version = (function (major, minor, revision) {
    return {
        major: parseInt(major, 10),
        minor: parseInt(minor, 10),
        revision: parseInt(revision, 10),
        toString: function () {
            return [major, minor, revision].join('.');
        }
    };
}).apply(this, ({
    // grunt-bump looks for this:
    'version': '4.7.3'
}).version.split('.'));

    return MediumEditor;
}()));
