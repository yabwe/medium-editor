/*global mediumEditorUtil */
var meSelection;

(function (window, document) {
    'use strict';

    meSelection = {
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

            return mediumEditorUtil.traverseUp(current, testElementFunction);
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
        }
    };
}(document, window));
