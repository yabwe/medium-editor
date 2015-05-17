/*global Button, FormExtension,
    AnchorForm, AutoLink, FontSizeForm, ImageDragging, PasteHandler */

var extensionDefaults;
(function () {
    'use strict';

    extensionDefaults = {
        button: Button,
        form: FormExtension,

        anchor: AnchorForm,
        autoLink: AutoLink,
        fontSize: FontSizeForm,
        imageDragging: ImageDragging,
        paste: PasteHandler
    };
})();
