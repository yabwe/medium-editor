/*global Util, Selection*/

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
                toolbar.className += " static-toolbar";
            } else {
                toolbar.className += " stalker-toolbar";
            }

            toolbar.appendChild(this.createToolbarButtons());

            // Add any forms that extensions may have
            this.base.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    toolbar.appendChild(extension.getForm());
                }
            });

            this.attachEventHandlers();
            this.base.subscribe('externalInteraction', this.handleBlur.bind(this));

            return toolbar;
        },

        createToolbarButtons: function () {
            var ul = this.base.options.ownerDocument.createElement('ul'),
                li,
                btn,
                buttons;

            ul.id = 'medium-editor-toolbar-actions' + this.base.id;
            ul.className = 'medium-editor-toolbar-actions clearfix';
            ul.style.display = 'block';

            this.base.commands.forEach(function (extension) {
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
            this.base.on(this.options.ownerDocument.documentElement, 'mousedown', this.handleDocumentMousedown.bind(this));
            // Handle mouseup on document for updating the selection in the toolbar
            this.base.on(this.options.ownerDocument.documentElement, 'mouseup', this.handleDocumentMouseup.bind(this));

            // Add a scroll event for sticky toolbar
            if (this.options.staticToolbar && this.options.stickyToolbar) {
                // On scroll (capture), re-position the toolbar
                this.base.on(this.options.contentWindow, 'scroll', this.handleWindowScroll.bind(this), true);
            }

            // On resize, re-position the toolbar
            this.base.on(this.options.contentWindow, 'resize', this.handleWindowResize.bind(this));

            // Handlers for each contentedtiable element
            this.base.elements.forEach(function (element) {
                // Attach click handler to each contenteditable element
                this.base.on(element, 'click', this.handleEditableClick.bind(this));

                // Attach keyup handler to each contenteditable element
                this.base.on(element, 'keyup', this.handleEditableKeyup.bind(this));

                // Attach blur handler to each contenteditable element
                this.base.on(element, 'blur', this.handleEditableBlur.bind(this));
            }, this);
        },

        handleWindowScroll: function () {
            this.positionToolbarIfShown();
        },

        handleWindowResize: function () {
            this.throttledPositionToolbar();
        },

        handleDocumentMousedown: function (event) {
            this.lastMousedownTarget = event.target;
        },

        handleDocumentMouseup: function (event) {
            this.lastMousedownTarget = null;
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

        handleEditableBlur: function (event) {
            var isRelatedTargetOwnedByThisEditor = false,
                relatedTarget = (event && event.relatedTarget) ? event.relatedTarget : this.lastMousedownTarget;
            // Do not trigger checkState when blurring the editable area and clicking into the toolbar
            if (Util.isDescendant(this.getToolbarElement(), relatedTarget)) {
                return false;
            }
            if (relatedTarget) {
                // Remove all selections before checking state. This is necessary to avoid issues with
                // standardizeSelectionStart 'canceling' the blur event by moving the selection (in Chrome only).
                // In Safari, when you click on a non-button element outside of the contenteditable, the selection
                // is already nulled out by the browser at this point, but remained set in Chrome, Firefox, and IE11.
                // This change will effectively normalize all browsers' behavior to be the same as Safari.
                this.base.elements.forEach(function (el) {
                    isRelatedTargetOwnedByThisEditor = isRelatedTargetOwnedByThisEditor || Util.isDescendant(el, relatedTarget) ||
                        relatedTarget === el;
                }, this);
                // We only remove all the ranges if the user clicked outside the contenteditables managed by this
                // medium-editor instance. Otherwise keep the ranges if they are set, we need the range to be present
                // for various things done by the toolbar to work.
                if (!isRelatedTargetOwnedByThisEditor) {
                    this.options.contentWindow.getSelection().removeAllRanges();
                }
            }
            this.checkState();
        },

        handleBlur: function () {
            // Delay the call to hideToolbar to handle bug with multiple editors on the page at once
            setTimeout(function () {
                this.hideToolbar();
            }.bind(this), 0);
        },

        // Hiding/showing toolbar

        isDisplayed: function () {
            return this.getToolbarElement().classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
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
            this.base.delay(function () {
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

        // TODO: selection and selectionRange should be properties of the
        //       Selection object
        checkSelectionElement: function (newSelection, selectionElement) {
            var i,
                adjacentNode,
                offset = 0,
                newRange,
                selectionRange = newSelection.getRangeAt(0);

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
                adjacentNode = Util.findAdjacentTextNodeWithContent(Selection.getSelectionElement(this.options.contentWindow), selectionRange.startContainer, this.options.ownerDocument);
                if (adjacentNode) {
                    offset = 0;
                    while (adjacentNode.nodeValue.substr(offset, 1).trim().length === 0) {
                        offset = offset + 1;
                    }
                    newRange = this.options.ownerDocument.createRange();
                    newRange.setStart(adjacentNode, offset);
                    newRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
                    newSelection.removeAllRanges();
                    newSelection.addRange(newRange);
                    selectionRange = newRange;
                }
            }

            for (i = 0; i < this.base.elements.length; i += 1) {
                if (this.base.elements[i] === selectionElement) {
                    this.showAndUpdateToolbar();
                    return;
                }
            }

            if (!this.options.staticToolbar) {
                this.hideToolbar();
            }
        },

        checkState: function () {
            var newSelection,
                selectionElement;

            if (!this.base.preventSelectionUpdates) {
                newSelection = this.options.contentWindow.getSelection();
                if ((!this.options.updateOnEmptySelection && newSelection.toString().trim() === '') ||
                        (this.options.allowMultiParagraphSelection === false && this.multipleBlockElementsSelected()) ||
                        Selection.selectionInContentEditableFalse(this.options.contentWindow)) {
                    if (!this.options.staticToolbar) {
                        this.hideToolbar();
                    } else {
                        this.showAndUpdateToolbar();
                    }

                } else {
                    selectionElement = Selection.getSelectionElement(this.options.contentWindow);
                    if (!selectionElement || selectionElement.getAttribute('data-disable-toolbar')) {
                        if (!this.options.staticToolbar) {
                            this.hideToolbar();
                        }
                    } else {
                        this.checkSelectionElement(newSelection, selectionElement);
                    }
                }
            }
        },

        // Updating the toolbar

        showAndUpdateToolbar: function () {
            this.setToolbarButtonStates();
            this.showToolbarDefaultActions();
            this.setToolbarPosition();
        },

        setToolbarButtonStates: function () {
            this.base.commands.forEach(function (extension) {
                if (typeof extension.isActive === 'function') {
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
                               typeof extension.isAlreadyApplied === 'function') {
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
                        if (queryState) {
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
            var container = Selection.getSelectionElement(this.options.contentWindow),
                selection = this.options.contentWindow.getSelection(),
                anchorPreview;

            // If there isn't a valid selection, bail
            if (!container || !this.options.contentWindow.getSelection().focusNode) {
                return this;
            }

            // If the container isn't part of this medium-editor instance, bail
            if (this.base.elements.indexOf(container) === -1) {
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
                    toolbarElement.style.top = "0px";

                // Normal static toolbar position
                } else {
                    toolbarElement.classList.remove('sticky-toolbar');
                    toolbarElement.style.top = containerTop - toolbarHeight + "px";
                }
            } else {
                toolbarElement.style.top = containerTop - toolbarHeight + "px";
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
                targetLeft = windowWidth - toolbarWidth;
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
