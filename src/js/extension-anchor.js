/*global */
var AnchorExtension = function (instance) {
    'use strict';

    this.base = instance;
};

(function (window, document) {
    'use strict';

    AnchorExtension.prototype = {

        getForm: function () {
            if (!this.anchorForm) {
                this.anchorForm = this.createForm();
            }
            return this.anchorForm;
        },

        createForm: function () {
            var doc = this.base.options.ownerDocument,
                anchor = doc.createElement('div'),
                input = doc.createElement('input'),
                close = doc.createElement('a'),
                save = doc.createElement('a'),
                target,
                target_label,
                button,
                button_label;

            close.setAttribute('href', '#');
            close.className = 'medium-editor-toobar-close';
            close.innerHTML = '&times;';

            save.setAttribute('href', '#');
            save.className = 'medium-editor-toobar-save';
            save.innerHTML = '&#10003;';

            input.setAttribute('type', 'text');
            input.className = 'medium-editor-toolbar-input';
            input.setAttribute('placeholder', this.base.options.anchorInputPlaceholder);

            anchor.className = 'medium-editor-toolbar-form';
            anchor.id = 'medium-editor-toolbar-form-anchor-' + this.base.id;
            anchor.appendChild(input);

            anchor.appendChild(save);
            anchor.appendChild(close);

            if (this.base.options.anchorTarget) {
                target = doc.createElement('input');
                target.setAttribute('type', 'checkbox');
                target.className = 'medium-editor-toolbar-anchor-target';

                target_label = doc.createElement('label');
                target_label.innerHTML = this.base.options.anchorInputCheckboxLabel;
                target_label.insertBefore(target, target_label.firstChild);

                anchor.appendChild(target_label);
            }

            if (this.base.options.anchorButton) {
                button = doc.createElement('input');
                button.setAttribute('type', 'checkbox');
                button.className = 'medium-editor-toolbar-anchor-button';

                button_label = doc.createElement('label');
                button_label.innerHTML = "Button";
                button_label.insertBefore(button, button_label.firstChild);

                anchor.appendChild(button_label);
            }

            return anchor;
        }
    };
}(window, document));