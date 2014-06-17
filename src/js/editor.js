/*global module*/

/**
* This class represents the contenteditable part of Medium Editor
*
* @class MediumEditor
* @constructor
*/
function MediumEditor(elements) {
    'use strict';
    return this.init(elements);
}

if (typeof module === 'object') {
    module.exports = MediumEditor;
}

(function (window, document) {
    'use strict';

    MediumEditor.prototype = {

        /**
        * Initializes the MediumEditor contenteditable area
        *
        * @method init
        * @param elements single elemnt, DOM elements or selector
        * @return {Boolean} Returns false if no elements are found
        */
        init: function init(elements) {
            this.setElements(elements);
            if (this.elements.length === 0) {
                return false;
            }
        },

        /**
        * Sets the elements property on the MediumEditor object
        *
        * @method setElements
        * @param elements single elemnt, DOM elements or selector
        */
        setElements: function setElements(elements) {
            this.elements = (typeof elements === 'string' ?
                                document.querySelectorAll(elements) :
                                elements);

            if (this.elements.nodeType === 1) {
                this.elements = [this.elements];
            }

            this.setContentEditable();
        },

        /**
        * Transforms editor elements into contenteditable enabled elements
        *
        * @method setContentEditable
        */
        setContentEditable: function setContentEditable() {
            var i;

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
            }
        }

    };

}(window, document));
