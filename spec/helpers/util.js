/*global atob, unescape, Uint8Array, Blob*/

function setupTestHelpers() {
    jasmine.clock().install();
    this.elements = [];
    this.editors = [];

    this.createElement = function (tag, className, html, dontAppend) {
        var el = document.createElement(tag);
        el.innerHTML = html || '';
        if (className) {
            el.className = className;
        }
        this.elements.push(el);
        if (!dontAppend) {
            document.body.appendChild(el);
        }
        return el;
    };

    this.newMediumEditor = function (selector, options) {
        var editor = new MediumEditor(selector, options);
        this.editors.push(editor);
        return editor;
    };

    this.cleanupTest = function () {
        this.editors.forEach(function (editor) {
            editor.destroy();
        });
        this.elements.forEach(function (element) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        jasmine.clock().uninstall();

        delete this.createElement;
        delete this.createMedium;
        delete this.elements;
        delete this.editors;
        delete this.cleanupTest;
    }
}

function isIE9() {
    return navigator.appName.indexOf('Internet Explorer') !== -1 && navigator.appVersion.indexOf("MSIE 9") !== -1;
}

function isIE10() {
    return navigator.appName.indexOf('Internet Explorer') !== -1 && navigator.appVersion.indexOf("MSIE 10") !== -1;
}

function isOldIE() {
    return isIE9() || isIE10();
}

function isIE() {
    return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null)));
}

function isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
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

// keyCode, ctrlKey, target, relatedTarget, shiftKey, altKey
function fireEvent(element, eventName, options) {
    var evt = prepareEvent(
        element,
        eventName,
        options
    );

    return firePreparedEvent(evt, element, eventName);
}

/**
 * prepareEvent works with firePreparedEvent.
 *
 * It allows test to:
 *     - create the event
 *     - spy a method on this event
 *     - fire the event
 *
 * Example:
 *     var p = document.querySelector('p');
 *     var evt = prepareEvent(p, 'keydown', { keyCode: Util.keyCode.ENTER });
 *     spyOn(evt, 'preventDefault').and.callThrough();
 *     firePreparedEvent(evt, p, 'keydown');
 *     expect(evt.preventDefault).toHaveBeenCalled();
 *
 * You can see a live example for tests related to `disableDoubleReturn`
 */
function prepareEvent (element, eventName, options) {
    var evt;

    options = options || {};

    if (document.createEvent) {
        // dispatch for firefox + others
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, true); // event type,bubbling,cancelable

        evt.currentTarget = options.currentTarget ? options.currentTarget : element;

        if (options.keyCode) {
            evt.keyCode = options.keyCode;
            evt.which = options.keyCode;
        }

        if (options.ctrlKey) {
            evt.ctrlKey = true;
        }

        if (options.metaKey) {
            evt.metaKey = true;
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

        if (options.altKey) {
          evt.altKey = true;
        }

        if (eventName.indexOf('drag') !== -1 || eventName === 'drop') {
            evt.dataTransfer = {
                dropEffect: ''
            };
            // File API only allows access to 'files' on drop, not on any other event
            if (!isIE9() && eventName === 'drop') {
                var file = dataURItoBlob('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
                if (!file.type) {
                    file.type = 'image/gif';
                }
                evt.dataTransfer.files = [file];
            }
        }
    } else {
        // dispatch for IE
        evt = document.createEventObject();
    }

    return evt;
}

/**
 * @see prepareEvent
 */
function firePreparedEvent (event, element, eventName) {
    if (document.createEvent) {
        return !element.dispatchEvent(event);
    }

    return element.fireEvent('on' + eventName, event);
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
