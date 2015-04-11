/*global atob, unescape, Uint8Array, Blob*/

function isIE9() {
    return navigator.appName.indexOf("Internet Explorer") !== -1 && navigator.appVersion.indexOf("MSIE 9") !== -1;
}

function isIE10() {
    return navigator.appName.indexOf("Internet Explorer") !== -1 && navigator.appVersion.indexOf("MSIE 10") !== -1;
}

function isOldIE() {
    return isIE9() || isIE10();
}

function isIE() {
    return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null)));
}

function isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf("firefox") !== -1;
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString,
        mimeString,
        ia,
        i;

    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
    } else {
        byteString = unescape(dataURI.split(',')[1]);
    }

    // separate out the mime component
    mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    ia = new Uint8Array(byteString.length);
    for (i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type: mimeString});
}

// keyCode, ctrlKey, target, relatedTarget, shiftKey
function fireEvent(element, event, options) {
    var evt;

    options = options || {};

    if (document.createEvent) {
        // dispatch for firefox + others
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type,bubbling,cancelable

        evt.currentTarget = element;

        if (options.keyCode) {
            evt.keyCode = options.keyCode;
            evt.which = options.keyCode;
        }

        if (options.ctrlKey) {
            evt.ctrlKey = true;
        }

        if (options.target) {
            evt.target = options.target;
        }

        if (options.relatedTarget) {
            evt.relatedTarget = options.relatedTarget;
        }

        if (options.shiftKey) {
            evt.shiftKey = true;
        }

        if (event.indexOf('drag') !== -1 || event === 'drop') {
            evt.dataTransfer = {
                dropEffect: ''
            };
            if (!isIE9()) {
                evt.dataTransfer.files = [dataURItoBlob('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')];
            }
        }
        return !element.dispatchEvent(evt);
    }

    // dispatch for IE
    evt = document.createEventObject();
    return element.fireEvent('on' + event, evt);
}

function placeCursorInsideElement(el, index) {
    var selection = window.getSelection(),
        newRange = document.createRange();
    selection.removeAllRanges();
    newRange.setStart(el, index);
    selection.addRange(newRange);
}

function selectElementContents(el, options) {
    options = options || {};

    var range = document.createRange(),
        sel = window.getSelection();
    range.selectNodeContents(el);

    if (options.collapse) {
        range.collapse(options.collapse === true);
    }

    sel.removeAllRanges();
    sel.addRange(range);
}

function selectElementContentsAndFire(el, options) {
    options = options || {};
    selectElementContents(el, options);
    fireEvent(el, options.eventToFire || 'focus');
}

function tearDown(el) {
    var elements = document.querySelectorAll('.medium-editor-toolbar'),
        i,
        sel = window.getSelection();
    for (i = 0; i < elements.length; i += 1) {
        document.body.removeChild(elements[i]);
    }
    elements = document.querySelectorAll('.medium-editor-anchor-preview');
    for (i = 0; i < elements.length; i += 1) {
        document.body.removeChild(elements[i]);
    }
    document.body.removeChild(el);
    sel.removeAllRanges();
}
