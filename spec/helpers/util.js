function fireEvent (element, event, keyCode, ctrlKey, target, relatedTarget, shiftKey) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       if (keyCode) {
        evt.keyCode = keyCode;
        evt.which = keyCode;
       }
       if (ctrlKey) {
        evt.ctrlKey = true;
       }
       if (target) {
        evt.target = target;
       }
       if (relatedTarget) {
        evt.relatedTarget = relatedTarget;
       }
       if (shiftKey) {
        evt.shiftKey = true;
       }
       element.dispatchEvent(evt);
       return evt;
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       element.fireEvent('on'+event,evt);
       return evt;
   }
}

function selectElementContentsAndFire(el, options) {
    options = options || {};
    selectElementContents(el, options);
    fireEvent(el, options.eventToFire || 'mouseup');
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

function isOldIE() {
    return (
        navigator.appName.indexOf("Internet Explorer") != -1
        && (navigator.appVersion.indexOf("MSIE 9") != -1 || navigator.appVersion.indexOf("MSIE 10") != -1)
    );
}
