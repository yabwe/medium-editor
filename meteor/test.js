'use strict';

Tinytest.add('MediumEditor.is', function(test) {
    var div = document.createElement('div');
    div.className = '.editable';
    document.body.appendChild(div);

    var editor = new MediumEditor('.editable');

    test.instanceOf(editor, MediumEditor, 'Instantiation OK');
});
