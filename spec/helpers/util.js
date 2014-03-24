function fireEvent (element, event, keyCode, ctrlKey, target, relatedTarget) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       if (keyCode) {
        evt.keyCode = keyCode;
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
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt)
   }
}

function selectElementContents(el) {
    var range = document.createRange(),
        sel = window.getSelection();
    range.selectNodeContents(el);
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
