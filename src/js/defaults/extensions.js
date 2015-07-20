/*global Button, FormExtension, AnchorForm,
    AnchorPreview, AutoLink, FileDragging,
    FontSizeForm, KeyboardCommands, ImageDragging,
    PasteHandler, Placeholder, Toolbar */

var extensionDefaults;
(function () {

    extensionDefaults = {
        button: Button,
        form: FormExtension,

        anchor: AnchorForm,
        anchorPreview: AnchorPreview,
        autoLink: AutoLink,
        fileDragging: FileDragging,
        fontSize: FontSizeForm,
        imageDragging: ImageDragging, // deprecated
        keyboardCommands: KeyboardCommands,
        paste: PasteHandler,
        placeholder: Placeholder,
        toolbar: Toolbar
    };
})();
