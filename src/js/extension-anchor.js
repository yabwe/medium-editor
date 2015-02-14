/*global mediumEditorUtil, meSelection*/
var AnchorExtension;

(function (window, document) {
    'use strict';

    AnchorExtension = {

        createForm: function (id, doc, options) {
            var anchor = doc.createElement('div'),
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
            input.setAttribute('placeholder', options.anchorInputPlaceholder);

            anchor.className = 'medium-editor-toolbar-form';
            anchor.id = 'medium-editor-toolbar-form-anchor-' + id;
            anchor.appendChild(input);

            anchor.appendChild(save);
            anchor.appendChild(close);

            if (options.anchorTarget) {
                target = doc.createElement('input');
                target.setAttribute('type', 'checkbox');
                target.className = 'medium-editor-toolbar-anchor-target';

                target_label = doc.createElement('label');
                target_label.innerHTML = options.anchorInputCheckboxLabel;
                target_label.insertBefore(target, target_label.firstChild);

                anchor.appendChild(target_label);
            }

            if (options.anchorButton) {
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