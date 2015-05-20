/*global Button, FormExtension,
    AnchorForm, AnchorPreview, AutoLink,
    FontSizeForm, ImageDragging, PasteHandler,
    Placeholder */

var extensionDefaults;
(function () {
    // for now this is empty because nothing interally uses an Extension default.
    // as they are converted, provide them here.
    extensionDefaults = {
        button: Button,
        form: FormExtension,

        anchor: AnchorForm,
        anchorPreview: AnchorPreview,
        autoLink: AutoLink,
        fontSize: FontSizeForm,
        imageDragging: ImageDragging,
        paste: PasteHandler,
        placeholder: Placeholder
    };
})();
