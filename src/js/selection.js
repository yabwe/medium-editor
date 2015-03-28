/*global Util */
var Selection;

(function () {
    'use strict';

    Selection = {
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
        }
    };
}());
