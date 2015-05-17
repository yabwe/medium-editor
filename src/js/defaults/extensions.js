/*global PasteHandler, AutoLinker, ImageDragging */

var extensionDefaults;
(function () {
    // for now this is empty because nothing interally uses an Extension default.
    // as they are converted, provide them here.
    extensionDefaults = {
        autoLink: AutoLinker,
        imageDragging: ImageDragging,
        paste: PasteHandler
    };
})();
