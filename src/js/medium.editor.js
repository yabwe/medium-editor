/*global saveSelection*/
/*global restoreSelection*/
/*global selectElementContents*/
/*global getElementDefaultDisplay*/
/*global console*/

var mediumEditor;

(function (window, document) {
    'use strict';
    mediumEditor = {
        init: function (el) {
            this.root = el;
            this.initToolbar()
                .bindSelect()
                .bindButtons()
                .bindAnchorForm();
        },

        initToolbar: function () {
            this.toolbar = document.getElementById('toolbar');
            this.keepToolbarAlive = false;
            this.anchorForm = document.getElementById('toolbar-form-anchor');
            this.toolbarActions = document.getElementById('toolbar-actions');
            return this;
        },

        bindSelect: function () {
            var self = this;
            document.onmouseup = function (e) {
                self.checkSelection(e);
            };
            document.onkeyup = function (e) {
                self.checkSelection(e);
            };
            return this;
        },

        checkSelection: function (e) {
            var newSelection;
            if (this.keepToolbarAlive !== true) {
                newSelection = window.getSelection();
                if (newSelection.toString().trim() === '') {
                    this.toolbar.style.display = 'none';
                } else {
                    this.selection = newSelection;
                    this.selectionRange = this.selection.getRangeAt(0);
                    this.setToolbarPosition();
                    this.toolbar.style.display = 'block';
                    this.showToolbarActions();
                }
            }
            return this;
        },

        setToolbarPosition: function () {
            var coords = this.getSelectionCoordinates();
            this.toolbar.style.left = (coords[0] + 20) + 'px';
            this.toolbar.style.top = (coords[1] + 20) + 'px';
        },

        getSelectionCoordinates: function () {
            var box,
                posEl = document.createElement('span'),
                range = this.selection.getRangeAt(0);
            range.insertNode(posEl);
            box = posEl.getBoundingClientRect();
            posEl.parentNode.removeChild(posEl);
            this.selection.addRange(range);
            return [box.left, box.top];
        },

        // TODO: break method
        bindButtons: function () {
            var action,
                buttons = this.toolbar.querySelectorAll('a'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    //this.classList.toggle('active');
                    action = this.getAttribute('data-action');
                    if (action.indexOf('append-') > -1) {
                        self.appendEl(action.replace('append-', ''));
                    } else if (action === 'anchor') {
                        if (self.selection.anchorNode.parentNode.tagName.toLowerCase() === 'a') {
                            document.execCommand('unlink', null, false);
                        } else {
                            if (self.anchorForm.style === 'block') {
                                self.showToolbarActions();
                            } else {
                                self.showAnchorForm();
                            }
                        }
                    } else {
                        document.execCommand(action, null, false);
                    }
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].onclick = triggerAction;
            }
            return this;
        },

        appendEl: function (el) {
            var selectionEl = this.selection.anchorNode.parentNode;
            if (selectionEl.tagName.toLowerCase() === el || selectionEl.tagName.toLowerCase() === 'span') {
                el = 'p';
            }
            if (getElementDefaultDisplay(selectionEl.tagName) !== 'block') {
                selectionEl = selectionEl.parentNode;
            }
            el = document.createElement(el);
            el.innerHTML = selectionEl.innerHTML;
            el.setAttribute('contentEditable', true);
            selectionEl.parentNode.replaceChild(el, selectionEl);
            selectElementContents(el);
            this.setToolbarPosition();
        },

        showToolbarActions: function () {
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            document.onclick = '';
        },

        showAnchorForm: function () {
            var input = this.anchorForm.querySelector('input'),
                self = this;
            this.toolbarActions.style.display = 'none';
            this.savedSelection = saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            input.focus();
            input.value = '';
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                document.onclick = function (e) {
                    self.keepToolbarAlive = false;
                    self.toolbar.style.display = 'none';
                    this.onclick = '';
                };
            }, 300);
        },

        bindAnchorForm: function () {
            var input = this.anchorForm.querySelector('input'),
                linkCancel = this.anchorForm.querySelector('a'),
                self = this;

            this.anchorForm.onclick = function (e) {
                e.stopPropagation();
            };

            input.onkeydown = function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.createLink(this);
                }
            };

            linkCancel.onclick = function (e) {
                self.showToolbarActions();
                restoreSelection(self.savedSelection);
            };
        },

        createLink: function (input) {
            restoreSelection(this.savedSelection);
            document.execCommand('CreateLink', false, input.value);
            this.showToolbarActions();
            input.value = '';
        }
    };
}(window, document));
