var TableExtension = MediumEditor.extensions.anchor.extend({
  name: 'table',
  action: 'createTable',
  aria: 'table',
  tagNames: ['table'],
  contentDefault: '<b>T</b>',
  contentFA: '<i class="fa fa-table"></i>',

  doFormSave: function () {
    var columnCount = this.getColumnsInput().value,
    rowCount = this.getRowsInput().value,
    table = this.createTable(columnCount, rowCount);

    // Restore Medium Editor's selection before pasting HTML
    this.base.restoreSelection();

    // Paste newly created table.
    this.base.pasteHTML(table.innerHTML);

    // Update toolbar -> hide this form
    this.base.checkSelection();
  },

  createTable: function (cols, rows) {
    var doc = this.base.options.ownerDocument,
    table = doc.createElement('table'),
    header = doc.createElement('thead'),
    headerRow = doc.createElement('tr'),
    body = doc.createElement('tbody'),
    wrap = doc.createElement('div'),
    h, r, c, headerCol, bodyRow, bodyCol;

    for (h = 1; h <= cols; h++) {
      headerCol = doc.createElement('th');
      headerCol.innerHTML = '...';
      headerRow.appendChild(headerCol);
    }

    header.appendChild(headerRow);

    for (r = 1; r <= rows; r++) {
      bodyRow = doc.createElement('tr');
      for (c = 1; c <= cols; c++) {
        bodyCol = doc.createElement('td');
        bodyCol.innerHTML = '...';
        bodyRow.appendChild(bodyCol);
      }
      body.appendChild(bodyRow);
    }

    table.appendChild(header);
    table.appendChild(body);
    wrap.appendChild(table);

    return wrap;
  },

  // Called when the button the toolbar is clicked
  // Overrides DefaultButton.handleClick
  handleClick: function (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (!this.isDisplayed()) {
      this.showForm();
    }

    return false;
  },

  hideForm: function () {
    this.getColumnsInput().value = '';
    this.getRowsInput().value = '';
    this.getForm().style.display = 'none';
  },

  showForm: function () {
    var colsInput = this.getColumnsInput(),
    rowsInput = this.getRowsInput();

    this.base.saveSelection();
    this.hideToolbarDefaultActions();
    this.getForm().style.display = 'block';
    this.setToolbarPosition();

    colsInput.focus();
  },

  createForm: function () {
    var doc = this.base.options.ownerDocument,
    form = doc.createElement('div'),
    close = doc.createElement('a'),
    save = doc.createElement('a'),
    columnInput = doc.createElement('input'),
    rowInput = doc.createElement('input');

    form.className = 'medium-editor-toolbar-form';
    form.id = 'medium-editor-toolbar-form-table-' + this.base.id;

    // Handle clicks on the form itself
    this.base.on(form, 'click', this.handleFormClick.bind(this));

    // Add columns textbox
    columnInput.setAttribute('type', 'text');
    columnInput.className = 'medium-editor-toolbar-input medium-editor-toolbar-input-columns';
    columnInput.setAttribute('placeholder', 'Column Count');
    form.appendChild(columnInput);

    // Add rows textbox
    rowInput.setAttribute('type', 'text');
    rowInput.className = 'medium-editor-toolbar-input medium-editor-toolbar-input-rows';
    rowInput.setAttribute('placeholder', 'Row Count');
    form.appendChild(rowInput);

    // Handle typing in the textboxes
    this.base.on(columnInput, 'keyup', this.handleTextboxKeyup.bind(this));
    this.base.on(rowInput, 'keyup', this.handleTextboxKeyup.bind(this));

    // Add save buton
    save.setAttribute('href', '#');
    save.className = 'medium-editor-toolbar-save';
    save.innerHTML = this.base.options.buttonLabels === 'fontawesome' ?
    '<i class="fa fa-check"></i>' :
    '&#10003;';
    form.appendChild(save);

    // Handle save button clicks (capture)
    this.base.on(save, 'click', this.handleSaveClick.bind(this), true);

    // Add close button
    close.setAttribute('href', '#');
    close.className = 'medium-editor-toolbar-close';
    close.innerHTML = this.base.options.buttonLabels === 'fontawesome' ?
    '<i class="fa fa-times"></i>' :
    '&times;';
    form.appendChild(close);

    // Handle close button clicks
    this.base.on(close, 'click', this.handleCloseClick.bind(this));

    return form;
  },

  getColumnsInput: function () {
    return this.getForm().querySelector('input.medium-editor-toolbar-input-columns');
  },

  getRowsInput: function () {
    return this.getForm().querySelector('input.medium-editor-toolbar-input-rows');
  }
})
