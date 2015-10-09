(function () {
    'use strict';

    var AnchorForm = MediumEditor.extensions.form.extend({
        /* Anchor Form Options */

        /* customClassOption: [string]  (previously options.anchorButton + options.anchorButtonClass)
         * Custom class name the user can optionally have added to their created links (ie 'button').
         * If passed as a non-empty string, a checkbox will be displayed allowing the user to choose
         * whether to have the class added to the created link or not.
         */
        customClassOption: null,

        /* customClassOptionText: [string]
         * text to be shown in the checkbox when the __customClassOption__ is being used.
         */
        customClassOptionText: 'Button',

        /* linkValidation: [boolean]  (previously options.checkLinkFormat)
         * enables/disables check for common URL protocols on anchor links.
         */
        linkValidation: false,

        /* placeholderText: [string]  (previously options.anchorInputPlaceholder)
         * text to be shown as placeholder of the anchor input.
         */
        placeholderText: 'Paste or type a link',

        /* targetCheckbox: [boolean]  (previously options.anchorTarget)
         * enables/disables displaying a "Open in new window" checkbox, which when checked
         * changes the `target` attribute of the created link.
         */
        targetCheckbox: false,

        /* targetCheckboxText: [string]  (previously options.anchorInputCheckboxLabel)
         * text to be shown in the checkbox enabled via the __targetCheckbox__ option.
         */
        targetCheckboxText: 'Open in new window',

        // Options for the Button base class
        name: 'anchor',
        action: 'createLink',
        aria: 'link',
        tagNames: ['a'],
        contentDefault: '<b>#</b>',
        contentFA: '<i class="fa fa-link"></i>',

        init: function () {
            MediumEditor.extensions.form.prototype.init.apply(this, arguments);

            this.subscribe('editableKeydown', this.handleKeydown.bind(this));
        },

        // Called when the button the toolbar is clicked
        // Overrides ButtonExtension.handleClick
        handleClick: function (event) {
            event.preventDefault();
            event.stopPropagation();

            var range = MediumEditor.selection.getSelectionRange(this.document);

            if (range.startContainer.nodeName.toLowerCase() === 'a' ||
                range.endContainer.nodeName.toLowerCase() === 'a' ||
                MediumEditor.util.getClosestTag(MediumEditor.selection.getSelectedParentElement(range), 'a')) {
                return this.execAction('unlink');
            }

            if (!this.isDisplayed()) {
                this.showForm();
            }

            return false;
        },

        // Called when user hits the defined shortcut (CTRL / COMMAND + K)
        handleKeydown: function (event) {
            if (MediumEditor.util.isKey(event, MediumEditor.util.keyCode.K) && MediumEditor.util.isMetaCtrlKey(event) && !event.shiftKey) {
                this.handleClick(event);
            }
        },

        // Called by medium-editor to append form to the toolbar
        getForm: function () {
            if (!this.form) {
                this.form = this.createForm();
            }
            return this.form;
        },

        getTemplate: function () {
            var template = [
                '<input type="text" class="medium-editor-toolbar-input" placeholder="', this.placeholderText, '">'
            ];

            template.push(
                '<a href="#" class="medium-editor-toolbar-save">',
                this.getEditorOption('buttonLabels') === 'fontawesome' ? '<i class="fa fa-check"></i>' : this.formSaveLabel,
                '</a>'
            );

            template.push('<a href="#" class="medium-editor-toolbar-close">',
                this.getEditorOption('buttonLabels') === 'fontawesome' ? '<i class="fa fa-times"></i>' : this.formCloseLabel,
                '</a>');

            // both of these options are slightly moot with the ability to
            // override the various form buildup/serialize functions.

            if (this.targetCheckbox) {
                // fixme: ideally, this targetCheckboxText would be a formLabel too,
                // figure out how to deprecate? also consider `fa-` icon default implcations.
                template.push(
                    '<div class="medium-editor-toolbar-form-row">',
                    '<input type="checkbox" class="medium-editor-toolbar-anchor-target">',
                    '<label>',
                    this.targetCheckboxText,
                    '</label>',
                    '</div>'
                );
            }

            if (this.customClassOption) {
                // fixme: expose this `Button` text as a formLabel property, too
                // and provide similar access to a `fa-` icon default.
                template.push(
                    '<div class="medium-editor-toolbar-form-row">',
                    '<input type="checkbox" class="medium-editor-toolbar-anchor-button">',
                    '<label>',
                    this.customClassOptionText,
                    '</label>',
                    '</div>'
                );
            }

            return template.join('');

        },

        // Used by medium-editor when the default toolbar is to be displayed
        isDisplayed: function () {
            return this.getForm().style.display === 'block';
        },

        hideForm: function () {
            this.getForm().style.display = 'none';
            this.getInput().value = '';
        },

        showForm: function (opts) {
            var input = this.getInput(),
                targetCheckbox = this.getAnchorTargetCheckbox(),
                buttonCheckbox = this.getAnchorButtonCheckbox();

            opts = opts || { url: '' };
            // TODO: This is for backwards compatability
            // We don't need to support the 'string' argument in 6.0.0
            if (typeof opts === 'string') {
                opts = {
                    url: opts
                };
            }

            this.base.saveSelection();
            this.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.setToolbarPosition();

            input.value = opts.url;
            input.focus();

            // If we have a target checkbox, we want it to be checked/unchecked
            // based on whether the existing link has target=_blank
            if (targetCheckbox) {
                targetCheckbox.checked = opts.target === '_blank';
            }

            // If we have a custom class checkbox, we want it to be checked/unchecked
            // based on whether an existing link already has the class
            if (buttonCheckbox) {
                var classList = opts.buttonClass ? opts.buttonClass.split(' ') : [];
                buttonCheckbox.checked = (classList.indexOf(this.customClassOption) !== -1);
            }
        },

        // Called by core when tearing down medium-editor (destroy)
        destroy: function () {
            if (!this.form) {
                return false;
            }

            if (this.form.parentNode) {
                this.form.parentNode.removeChild(this.form);
            }

            delete this.form;
        },

        // core methods

        getFormOpts: function () {
            // no notion of private functions? wanted `_getFormOpts`
            var targetCheckbox = this.getAnchorTargetCheckbox(),
                buttonCheckbox = this.getAnchorButtonCheckbox(),
                opts = {
                    url: this.getInput().value.trim()
                };

            if (this.linkValidation) {
                opts.url = this.checkLinkFormat(opts.url);
            }

            opts.target = '_self';
            if (targetCheckbox && targetCheckbox.checked) {
                opts.target = '_blank';
            }

            if (buttonCheckbox && buttonCheckbox.checked) {
                opts.buttonClass = this.customClassOption;
            }

            return opts;
        },

        doFormSave: function () {
            var opts = this.getFormOpts();
            this.completeFormSave(opts);
        },

        completeFormSave: function (opts) {
            this.base.restoreSelection();
            this.execAction(this.action, opts);
            this.base.checkSelection();
        },

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        doFormCancel: function () {
            this.base.restoreSelection();
            this.base.checkSelection();
        },

        // form creation and event handling
        attachFormEvents: function (form) {
            var close = form.querySelector('.medium-editor-toolbar-close'),
                save = form.querySelector('.medium-editor-toolbar-save'),
                input = form.querySelector('.medium-editor-toolbar-input');

            // Handle clicks on the form itself
            this.on(form, 'click', this.handleFormClick.bind(this));

            // Handle typing in the textbox
            this.on(input, 'keyup', this.handleTextboxKeyup.bind(this));

            // Handle close button clicks
            this.on(close, 'click', this.handleCloseClick.bind(this));

            // Handle save button clicks (capture)
            this.on(save, 'click', this.handleSaveClick.bind(this), true);

        },

        createForm: function () {
            var doc = this.document,
                form = doc.createElement('div');

            // Anchor Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-anchor-' + this.getEditorId();
            form.innerHTML = this.getTemplate();
            this.attachFormEvents(form);

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        getAnchorTargetCheckbox: function () {
            return this.getForm().querySelector('.medium-editor-toolbar-anchor-target');
        },

        getAnchorButtonCheckbox: function () {
            return this.getForm().querySelector('.medium-editor-toolbar-anchor-button');
        },

        handleTextboxKeyup: function (event) {
            // For ENTER -> create the anchor
            if (event.keyCode === MediumEditor.util.keyCode.ENTER) {
                event.preventDefault();
                this.doFormSave();
                return;
            }

            // For ESCAPE -> close the form
            if (event.keyCode === MediumEditor.util.keyCode.ESCAPE) {
                event.preventDefault();
                this.doFormCancel();
            }
        },

        handleFormClick: function (event) {
            // make sure not to hide form when clicking inside the form
            event.stopPropagation();
        },

        handleSaveClick: function (event) {
            // Clicking Save -> create the anchor
            event.preventDefault();
            this.doFormSave();
        },

        handleCloseClick: function (event) {
            // Click Close -> close the form
            event.preventDefault();
            this.doFormCancel();
        }
    });

    MediumEditor.extensions.anchor = AnchorForm;
}());
