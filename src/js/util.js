/*global NodeFilter*/

var mediumEditorUtil;

(function (window, document) {
    'use strict';

    mediumEditorUtil = {

        extend: function extend(b, a) {
            var prop;
            if (b === undefined) {
                return a;
            }
            for (prop in a) {
                if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                    b[prop] = a[prop];
                }
            }
            return b;
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

        // https://github.com/jashkenas/underscore
        keyCode: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESCAPE: 27,
            SPACE: 32,
            DELETE: 46
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
                previous = mediumEditorUtil.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            };

            return function () {
                var currNow = mediumEditorUtil.now(),
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

        }
    };
}(window, document));
