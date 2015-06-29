/*global Button, FormExtension,
    AnchorForm, AnchorPreview, AutoLink,
    FontSizeForm, KeyboardCommands, ImageDragging,
    PasteHandler, Placeholder, Toolbar */

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
        keyboardCommands: KeyboardCommands,
        paste: PasteHandler,
        placeholder: Placeholder,
        toolbar: Toolbar
    };
})();
