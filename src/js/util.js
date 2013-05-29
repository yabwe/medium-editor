// http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
// by Tim Down
function saveSelection() {
    'use strict';
    var i,
        len,
        ranges,
        sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    return null;
}

function restoreSelection(savedSel) {
    'use strict';
    var i,
        len,
        sel;
    if (savedSel) {
        if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        } else if (document.selection && savedSel.select) {
            savedSel.select();
        }
    }
}

// http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
// by Tim Down
function selectElementContents(el) {
    'use strict';
    var range = document.createRange(),
        sel = window.getSelection();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
}

// http://stackoverflow.com/questions/2880957/detect-inline-block-type-of-a-dom-element
// by Andy E
function getElementDefaultDisplay(tag) {
    'use strict';
    var cStyle,
        t = document.createElement(tag),
        gcs = window.getComputedStyle !== undefined;

    document.body.appendChild(t);
    cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display;
    document.body.removeChild(t);

    return cStyle;
}
