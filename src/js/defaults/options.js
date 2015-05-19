var editorDefaults;
(function () {

    // summary: The default options hash used by the Editor

    editorDefaults = {

        allowMultiParagraphSelection: true,
        anchorPreviewHideDelay: 500,
        buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
        buttonLabels: false,
        delay: 0,
        diffLeft: 0,
        diffTop: -10,
        disableReturn: false,
        disableDoubleReturn: false,
        disableToolbar: false,
        disableAnchorPreview: false,
        disableEditing: false,
        disablePlaceholders: false,
        autoLink: false,
        toolbarAlign: 'center',
        elementsContainer: false,
        imageDragging: true,
        standardizeSelectionStart: false,
        contentWindow: window,
        ownerDocument: document,
        firstHeader: 'h3',
        placeholder: 'Type your text',
        secondHeader: 'h4',
        targetBlank: false,
        extensions: {},
        activeButtonClass: 'medium-editor-button-active',
        firstButtonClass: 'medium-editor-button-first',
        lastButtonClass: 'medium-editor-button-last',
        spellcheck: true,

        paste: {
            forcePlainText: true,
            cleanPastedHTML: false,
            cleanAttrs: ['class', 'style', 'dir'],
            cleanTags: ['meta']
        }

    };

})();
