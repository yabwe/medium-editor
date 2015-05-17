/*global PasteHandler, AutoLink, ImageDragging */

var extensionDefaults;
(function () {
    // for now this is empty because nothing interally uses an Extension default.
    // as they are converted, provide them here.
    extensionDefaults = {
        autoLink: AutoLink,
        imageDragging: ImageDragging,
        paste: PasteHandler
    };
})();
