/*global module*/

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

        init: function init(elements) {
            this.setElements(elements);
            if (this.elements.length === 0) {
                return false;
            }
        },

        setElements: function setElements(elements) {
            this.elements = (typeof elements === 'string' ?
                                document.querySelectorAll(elements) :
                                elements);

            if (this.elements.nodeType === 1) {
                this.elements = [this.elements];
            }

            this.setContentEditable();
        },

        setContentEditable: function setContentEditable() {
            var i;

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
            }
        }

    };

}(window, document));
