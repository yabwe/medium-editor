/*global Util, Selection, console*/

var AnchorPreview;

(function (window, document) {
    'use strict';

    AnchorPreview = function () {
        this.parent = true;
        this.name = 'anchor-preview';
    };

    AnchorPreview.prototype = {

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

        hidePreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        showPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')
                    || anchorEl.getAttribute('data-disable-preview')) {
                return true;
            }

            this.anchorPreview.querySelector('i').textContent = anchorEl.attributes.href.value;

            this.anchorPreview.classList.add('medium-toolbar-arrow-over');
            this.anchorPreview.classList.remove('medium-toolbar-arrow-under');

            if (!this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
            }

            this.positionPreview(anchorEl);
            this.attachPreviewHandlers(anchorEl);

            return this;
        },

        positionPreview: function (anchorEl) {
            var buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
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
            this.base.elements.forEach(function (element) {
                this.base.on(element, 'mouseover', this.handleEditableMouseover.bind(this));
            }.bind(this));
        },

        handleEditableMouseover: function (event) {
            var overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    this.base.off(this.activeAnchor, 'mouseout', leaveAnchor);
                }.bind(this);

            if (event.target && event.target.tagName.toLowerCase() === 'a') {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as event.targed.href, so check the html
                if (!/href=["']\S+["']/.test(event.target.outerHTML) || /href=["']#\S+["']/.test(event.target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.base.toolbar && this.base.toolbar.isDisplayed()) {
                    // only show when toolbar is not present
                    return true;
                }
                this.activeAnchor = event.target;
                this.base.on(this.activeAnchor, 'mouseout', leaveAnchor);
                // Using setTimeout + options.delay because:
                // - We're going to show the anchor preview according to the configured delay
                //   if the mouse has not left the anchor tag in that time
                this.base.delay(function () {
                    if (overAnchor) {
                        this.showPreview(this.activeAnchor);
                    }
                }.bind(this));
            }
        },

        handleClick: function (event) {
            var range,
                sel,
                anchorExtension = this.base.getExtensionByName('anchor');

            if (anchorExtension && this.activeAnchor) {
                range = this.base.options.ownerDocument.createRange();
                range.selectNodeContents(this.activeAnchor);

                sel = this.base.options.contentWindow.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.base.delay(function () {
                    if (this.activeAnchor) {
                        anchorExtension.showForm(this.activeAnchor.attributes.href.value);
                    }
                }.bind(this));
            }

            this.hidePreview();
        },

        // TODO: break up method and extract out handlers
        attachPreviewHandlers: function (anchorEl) {
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
                    if (durr > self.base.options.anchorPreviewHideDelay) {
                        // hide the preview 1/2 second after mouse leaves the link
                        self.hidePreview();

                        // cleanup
                        clearInterval(interval_timer);
                        self.base.off(self.anchorPreview, 'mouseover', stamp);
                        self.base.off(self.anchorPreview, 'mouseout', unstamp);
                        self.base.off(anchorEl, 'mouseover', stamp);
                        self.base.off(anchorEl, 'mouseout', unstamp);

                    }
                }, 200);

            this.base.on(self.anchorPreview, 'mouseover', stamp);
            this.base.on(self.anchorPreview, 'mouseout', unstamp);
            this.base.on(anchorEl, 'mouseover', stamp);
            this.base.on(anchorEl, 'mouseout', unstamp);
        }
    };
}(window, document));
