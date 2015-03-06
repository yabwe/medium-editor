/*global Util, Selection, console*/

var AnchorPreview;

(function (window, document) {
    'use strict';

    AnchorPreview = function () {};

    AnchorPreview.prototype = {

        init: function (instance) {
            this.base = instance;
            this.anchorPreview = this.createAnchorPreview();
            this.base.options.elementsContainer.appendChild(this.anchorPreview);
        },

        createAnchorPreview: function () {
            var el = this.base.options.ownerDocument.createElement('div');

            el.id = 'medium-editor-anchor-preview-' + this.base.id;
            el.className = 'medium-editor-anchor-preview';
            el.innerHTML = this.getTemplate();

            this.base.on(el, 'click', this.handleClick.bind(this));

            return el;
        },

        getTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
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

        handleClick: function (event) {
            var range,
                sel,
                anchorExtension = this.base.getExtensionByName('anchor');

            if (anchorExtension && this.base.activeAnchor) {
                range = this.base.options.ownerDocument.createRange();
                range.selectNodeContents(this.base.activeAnchor);

                sel = this.base.options.contentWindow.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.base.delay(function () {
                    if (this.base.activeAnchor) {
                        anchorExtension.showForm(this.base.activeAnchor.attributes.href.value);
                    }
                }.bind(this));
            }

            this.base.hideAnchorPreview();
        }
    };
}(window, document));
