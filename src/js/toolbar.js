/*global mediumEditorUtil, AnchorExtension, meSelection, console*/

function Toolbar(editor) {
    'use strict';
    return this.init(editor);
}

(function () {
    'use strict';

    Toolbar.prototype = {
        init: function init(editor) {
            this.base = editor;
            this.options = this.base.options;
            this.id = this.base.id;
            this.createElement()
                .setup();
        },

        createElement: function createElement() {
            this.el = this.options.ownerDocument.createElement('div');
            this.el.id = 'medium-editor-toolbar-' + this.id;
            this.el.className = 'medium-editor-toolbar';

            if (this.options.staticToolbar) {
                this.el.className += " static-toolbar";
            } else {
                this.el.className += " stalker-toolbar";
            }

            this.el.appendChild(this.getButtons());
            if (!this.options.disableAnchorForm) {
                this.base.anchorExtension = new AnchorExtension(this.base);
                this.el.appendChild(this.base.anchorExtension.getForm());
            }
            this.options.elementsContainer.appendChild(this.el);
            return this;
        },

        getButtons: function getButtons() {
            var ul = this.options.ownerDocument.createElement('ul'),
                li,
                btn;

            ul.id = 'medium-editor-toolbar-actions' + this.id;
            ul.className = 'medium-editor-toolbar-actions clearfix';

            this.base.commands.forEach(function (extension) {
                if (typeof extension.getButton === 'function') {
                    btn = extension.getButton(this);
                    li = this.options.ownerDocument.createElement('li');
                    if (mediumEditorUtil.isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }.bind(this));

            return ul;
        },

        setup: function setup() {
            this.keepToolbarAlive = false;
            this.toolbarActions = this.el.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview = this.createAnchorPreview();
            this.bindAnchorPreview();
            this.addExtensionForms();
        },

        setToolbarPosition: function () {
            // document.documentElement for IE 9
            var scrollTop = (this.options.ownerDocument.documentElement && this.options.ownerDocument.documentElement.scrollTop) || this.options.ownerDocument.body.scrollTop,
                container = this.base.elements[0],
                containerRect = container.getBoundingClientRect(),
                containerTop = containerRect.top + scrollTop,
                buttonHeight = 50,
                selection = this.options.contentWindow.getSelection(),
                range,
                boundary,
                middleBoundary,
                defaultLeft = (this.options.diffLeft) - (this.el.offsetWidth / 2),
                halfOffsetWidth = this.el.offsetWidth / 2,
                containerCenter = (containerRect.left + (containerRect.width / 2));

            if (selection.focusNode === null) {
                return this;
            }

            this.showToolbar();

            if (this.options.staticToolbar) {

                if (this.options.stickyToolbar) {

                    // If it's beyond the height of the editor, position it at the bottom of the editor
                    if (scrollTop > (containerTop + this.base.elements[0].offsetHeight - this.el.offsetHeight)) {
                        this.el.style.top = (containerTop + this.base.elements[0].offsetHeight) + 'px';

                    // Stick the toolbar to the top of the window
                    } else if (scrollTop > (containerTop - this.el.offsetHeight)) {
                        this.el.classList.add('sticky-toolbar');
                        this.el.style.top = "0px";
                    // Normal static toolbar position
                    } else {
                        this.el.classList.remove('sticky-toolbar');
                        this.el.style.top = containerTop - this.el.offsetHeight + "px";
                    }

                } else {
                    this.el.style.top = containerTop - this.el.offsetHeight + "px";
                }

                if (this.options.toolbarAlign) {
                    if (this.options.toolbarAlign === 'left') {
                        this.el.style.left = containerRect.left + "px";
                    } else if (this.options.toolbarAlign === 'center') {
                        this.el.style.left = (containerCenter - halfOffsetWidth) + "px";
                    } else {
                        this.el.style.left = (containerRect.right - this.el.offsetWidth) + "px";
                    }
                } else {
                    this.el.style.left = (containerCenter - halfOffsetWidth) + "px";
                }

            } else if (!selection.isCollapsed) {
                range = selection.getRangeAt(0);
                boundary = range.getBoundingClientRect();
                middleBoundary = (boundary.left + boundary.right) / 2;

                if (boundary.top < buttonHeight) {
                    this.el.classList.add('medium-toolbar-arrow-over');
                    this.el.classList.remove('medium-toolbar-arrow-under');
                    this.el.style.top = buttonHeight + boundary.bottom - this.options.diffTop + this.options.contentWindow.pageYOffset - this.el.offsetHeight + 'px';
                } else {
                    this.el.classList.add('medium-toolbar-arrow-under');
                    this.el.classList.remove('medium-toolbar-arrow-over');
                    this.el.style.top = boundary.top + this.options.diffTop + this.options.contentWindow.pageYOffset - this.el.offsetHeight + 'px';
                }
                if (middleBoundary < halfOffsetWidth) {
                    this.el.style.left = defaultLeft + halfOffsetWidth + 'px';
                } else if ((this.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                    this.el.style.left = this.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
                } else {
                    this.el.style.left = defaultLeft + middleBoundary + 'px';
                }
            }

            this.hideAnchorPreview();

            return this;
        },

        setToolbarButtonStates: function () {
            this.base.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }.bind(this));
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                manualStateChecks = [],
                queryState = null,
                parentNode = meSelection.getSelectedParentElement(this.base.selectionRange),
                checkExtension = function (extension) {
                    if (typeof extension.checkState === 'function') {
                        extension.checkState(parentNode);
                    } else if (typeof extension.isActive === 'function') {
                        if (!extension.isActive() && extension.shouldActivate(parentNode)) {
                            extension.activate();
                        }
                    }
                };

            // Loop through all commands
            this.base.commands.forEach(function (command) {
                // For those commands where we can use document.queryCommandState(), do so
                if (typeof command.queryCommandState === 'function') {
                    queryState = command.queryCommandState();
                    // If queryCommandState returns a valid value, we can trust the browser
                    // and don't need to do our manual checks
                    if (queryState !== null) {
                        if (queryState) {
                            command.activate();
                        }
                        return;
                    }
                }
                // We can't use queryCommandState for this command, so add to manualStateChecks
                manualStateChecks.push(command);
            });

            // Climb up the DOM and do manual checks for whether a certain command is currently enabled for this node
            while (parentNode.tagName !== undefined && mediumEditorUtil.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                manualStateChecks.forEach(checkExtension.bind(this));

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.el.querySelector('[data-element="' + tag + '"]');
            if (el !== null && !el.classList.contains(this.options.activeButtonClass)) {
                el.classList.add(this.options.activeButtonClass);
            }
        },

        bindButtons: function () {
            this.setFirstAndLastItems(this.el.querySelectorAll('button'));
            return this;
        },

        setFirstAndLastItems: function (buttons) {
            if (buttons.length > 0) {

                buttons[0].className += ' ' + this.options.firstButtonClass;
                buttons[buttons.length - 1].className += ' ' + this.options.lastButtonClass;
            }
            return this;
        },

        isToolbarShown: function () {
            return this.el && this.el.classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
            if (this.toolbar && !this.isToolbarShown()) {
                this.el.classList.add('medium-editor-toolbar-active');
                if (this.onShowToolbar) {
                    this.onShowToolbar();
                }
            }
        },

        hideToolbar: function () {
            if (this.isToolbarShown()) {
                this.el.classList.remove('medium-editor-toolbar-active');
                // TODO: this should be an option?
                if (this.onHideToolbar) {
                    this.onHideToolbar();
                }
            }
        },

        hideToolbarActions: function () {
            this.base.commands.forEach(function (extension) {
                if (extension.onHide && typeof extension.onHide === 'function') {
                    extension.onHide();
                }
            });
            this.keepToolbarAlive = false;
            this.hideToolbar();
        },

        showToolbarActions: function () {
            var self = this;
            if (this.base.anchorExtension) {
                this.base.anchorExtension.hideForm();
            }
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            // Using setTimeout + options.delay because:
            // We will actually be displaying the toolbar, which should be controlled by options.delay
            this.delay(function () {
                self.showToolbar();
            });
        },

        positionToolbarIfShown: function () {
            if (this.isToolbarShown()) {
                this.setToolbarPosition();
            }
        },

        addExtensionForms: function () {
            var form,
                id;

            this.base.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    form = (typeof extension.getForm === 'function') ?
                            extension.getForm() :
                            null;
                }
                if (form) {
                    id = 'medium-editor-toolbar-form-' + extension.name + '-' + this.id;
                    form.className += ' medium-editor-toolbar-form';
                    form.id = id;
                    this.el.appendChild(form);
                }
            }.bind(this));
        },

        // TODO: create an anchor preview extension
        createAnchorPreview: function () {
            var self = this,
                anchorPreview = this.options.ownerDocument.createElement('div');

            anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
            anchorPreview.className = 'medium-editor-anchor-preview';
            anchorPreview.innerHTML = this.anchorPreviewTemplate();
            this.options.elementsContainer.appendChild(anchorPreview);

            this.base.on(anchorPreview, 'click', function () {
                self.anchorPreviewClickHandler();
            });

            return anchorPreview;
        },

        anchorPreviewTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
                '</div>';
        },

        anchorPreviewClickHandler: function (e) {
            if (!this.options.disableAnchorForm && this.activeAnchor) {

                var self = this,
                    range = this.options.ownerDocument.createRange(),
                    sel = this.options.contentWindow.getSelection();

                range.selectNodeContents(self.activeAnchor);
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.base.delay(function () {
                    if (self.activeAnchor) {
                        self.showAnchorForm(self.activeAnchor.attributes.href.value);
                    }
                    self.keepToolbarAlive = false;
                });

            }

            this.hideAnchorPreview();
        },

        showAnchorForm: function (link_value) {
            if (!this.base.anchorExtension) {
                return;
            }

            this.toolbarActions.style.display = 'none';
            this.base.saveSelection();
            this.base.anchorExtension.showForm();
            this.setToolbarPosition();
            this.keepToolbarAlive = true;
            this.base.anchorExtension.focus(link_value);
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
        },

        editorAnchorObserver: function (e) {
            var self = this,
                overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    self.base.off(self.activeAnchor, 'mouseout', leaveAnchor);
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
                this.base.on(this.activeAnchor, 'mouseout', leaveAnchor);
                // Using setTimeout + options.delay because:
                // - We're going to show the anchor preview according to the configured delay
                //   if the mouse has not left the anchor tag in that time
                this.base.delay(function () {
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
            for (i = 0; i < this.base.elements.length; i += 1) {
                this.base.on(this.base.elements[i], 'mouseover', this.editorAnchorObserverWrapper);
            }
            return this;
        },

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?)\:\/\/|mailto\:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        triggerAnchorAction: function () {
            if (!this.base.selection) {
                this.base.checkSelection();
            }
            var selectedParentElement = meSelection.getSelectedParentElement(this.base.selectionRange);
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                return this.options.ownerDocument.execCommand('unlink', false, null);
            }

            if (this.base.anchorExtension) {
                if (this.base.anchorExtension.isDisplayed()) {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return false;
        },

        destroy: function () {
            this.options.elementsContainer.removeChild(this.anchorPreview);
            this.options.elementsContainer.removeChild(this.el);
            delete this.anchorPreview;
        }
    };
}());
