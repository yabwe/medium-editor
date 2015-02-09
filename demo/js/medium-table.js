/*jslint plusplus: true */
function MediumTable(options) {
    "use strict";
	this.parent = true;
    this.hasForm = true;
	this.options = options;
}

MediumTable.prototype.init = function() {
    "use strict";
    this.createButton();
    this.createForm();
};

MediumTable.prototype.createButton = function() {
    "use strict";
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.textContent = 'T';
    if(this.base.options.buttonLabels === 'fontawesome'){
        this.button.innerHTML = '<i class="fa fa-table"></i>'; 
    }
    this.button.onclick = this.onClick.bind(this);
};

MediumTable.prototype.createForm = function() {
    "use strict";
    this.form = document.createElement('div');
    this.close = document.createElement('a');
    this.save = document.createElement('a');
    this.columnInput = document.createElement('input');
    this.rowInput = document.createElement('input');

    this.close.setAttribute('href', '#');
    this.close.innerHTML = '&times;';
    this.close.onclick = this.onClose.bind(this);

    this.save.setAttribute('href', '#');
    this.save.innerHTML = '&#10003;';
    this.save.onclick = this.onSave.bind(this);

    this.columnInput.setAttribute('type', 'text');
    this.columnInput.className = 'medium-editor-toolbar-input';
    this.columnInput.setAttribute('placeholder', 'Column Count');

    this.rowInput.setAttribute('type', 'text');
    this.rowInput.className = 'medium-editor-toolbar-input';
    this.rowInput.setAttribute('placeholder', 'Row Count');

    this.form.appendChild(this.columnInput);
    this.form.appendChild(this.rowInput);

    this.form.appendChild(this.save);
    this.form.appendChild(this.close);
};

MediumTable.prototype.getButton = function() {
    "use strict";
	return this.button;
};

MediumTable.prototype.getForm = function() {
    "use strict";
    return this.form;
};

MediumTable.prototype.onClick = function() {
    "use strict";
    this.columnInput.value = this.options.defaultColumns;
    this.rowInput.value = this.options.defaultRows;
};

MediumTable.prototype.onClose = function(e) {
    "use strict";
	e.preventDefault();
	this.base.hideForm();
};

MediumTable.prototype.onSave = function(e) {
    "use strict";
    e.preventDefault();
    var columnCount = this.columnInput.value,
    rowCount = this.rowInput.value,
    table = this.createTable(columnCount, rowCount);
    // Restore Medium Editor's selection before pasting HTML
    this.base.restoreSelection();
    // Paste newly created table.
    this.base.pasteHTML(table.innerHTML);
    this.base.hideForm();
};

// Create the table element.
MediumTable.prototype.createTable = function(cols, rows) {
    "use strict";
    var table = document.createElement('table'),
        header = document.createElement('thead'),
        headerRow = document.createElement('tr'),
        body = document.createElement('tbody'),
        wrap = document.createElement('div'),
        h, r, c, headerCol, bodyRow, bodyCol;

    for (h = 1; h <= cols; h++) {
        headerCol = document.createElement('th');
        headerCol.innerHTML = '...';
        headerRow.appendChild(headerCol);   
    }

    header.appendChild(headerRow);

    for (r = 1; r <= rows; r++) {
        bodyRow = document.createElement('tr');
        for (c = 1; c <= this.options.defaultColumns; c++) {
            bodyCol = document.createElement('td');
            bodyCol.innerHTML = '...';
            bodyRow.appendChild(bodyCol);       
        }
        body.appendChild(bodyRow);
    }

    table.appendChild(header);
    table.appendChild(body);
    wrap.appendChild(table);

    return wrap;
};