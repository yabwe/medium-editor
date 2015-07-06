/*global Util, Extension */
var FileDragging;

(function () {
    'use strict';

    var CLASS_DRAG_OVER = 'medium-editor-dragover';

    function containsDisabledFile(files, disabledTypes) {
        if (!files || !disabledTypes.length) {
            return false;
        }

        return Array.prototype.slice.call(files).some(function (file) {
            return disabledTypes.some(function (fileType) {
                return !!file.type.match(fileType);
            });
        }, this);
    }

    function clearClassNames(element) {
        var editable = Util.getContainerEditorElement(element),
            existing = Array.prototype.slice.call(editable.parentElement.querySelectorAll('.' + CLASS_DRAG_OVER));

        existing.forEach(function (el) {
            el.classList.remove(CLASS_DRAG_OVER);
        });
    }

    FileDragging = Extension.extend({
        name: 'fileDragging',

        disabledTypes: [],

        init: function () {
            Extension.prototype.init.apply(this, arguments);

            this.subscribe('editableDrag', this.handleDrag.bind(this));
            this.subscribe('editableDrop', this.handleDrop.bind(this));
        },

        handleDrag: function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

            var target = event.target.classList ? event.target : event.target.parentElement;

            // Ensure the class gets removed from anything that had it before
            clearClassNames(target);

            if (event.type === 'dragover') {
                target.classList.add(CLASS_DRAG_OVER);
            }
        },

        handleDrop: function (event) {
            event.preventDefault();
            event.stopPropagation();

            // IE9 does not support the File API, so prevent file from opening in a new window
            // but also don't try to actually get the file
            if (event.dataTransfer.files && !containsDisabledFile(event.dataTransfer.files, this.disabledTypes)) {
                Array.prototype.slice.call(event.dataTransfer.files).forEach(function (file) {
                    if (file.type.match('image')) {
                        this.insertImageFile(file);
                    }
                }, this);
            }

            // Make sure we remove our class from everything
            clearClassNames(event.target);
        },

        insertImageFile: function (file) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            var id = 'medium-img-' + (+new Date());
            Util.insertHTMLCommand(this.document, '<img class="medium-editor-image-loading" id="' + id + '" />');

            fileReader.onload = function () {
                var img = this.document.getElementById(id);
                if (img) {
                    img.removeAttribute('id');
                    img.removeAttribute('class');
                    img.src = fileReader.result;
                }
            }.bind(this);
        }
    });
}());
