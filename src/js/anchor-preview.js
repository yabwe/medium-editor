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

        hideAnchorPreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        showAnchorPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')
                    || anchorEl.getAttribute('data-disable-preview')) {
                return true;
            }

            var buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft;

            this.anchorPreview.querySelector('i').textContent = anchorEl.attributes.href.value;
            halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
            defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

            this.base.observeAnchorPreview(anchorEl);

            this.anchorPreview.classList.add('medium-toolbar-arrow-over');
            this.anchorPreview.classList.remove('medium-toolbar-arrow-under');
            this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                this.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((this.base.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                this.anchorPreview.style.left = this.base.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                this.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }

            if (this.anchorPreview && !this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
            }

            return this;
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

            this.hideAnchorPreview();
        }
    };
}(window, document));
