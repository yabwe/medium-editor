/*global Button, FormExtension,
    AnchorForm, AutoLink, FontSizeForm, ImageDragging, PasteHandler */

var extensionDefaults;
(function () {
    // for now this is empty because nothing interally uses an Extension default.
    // as they are converted, provide them here.
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
