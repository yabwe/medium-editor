/*global fireEvent, selectElementContents,
         selectElementContentsAndFire, getEdgeVersion */

describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lorem ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Anchor Form', function () {
        it('should add class for visible state and remove it for invisivble', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttonLabels: 'fontawesome'
                }),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar'),
                activeClass = anchorExtension.activeClass;

            selectElementContentsAndFire(editor.elements[0]);
            var button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(anchorExtension.getForm().classList.contains(activeClass)).toBe(true);

            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            expect(anchorExtension.getForm().classList.contains(activeClass)).toBe(false);
        });

        it('should not hide the toolbar when mouseup fires inside the anchor form', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttonLabels: 'fontawesome'
                }),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            var button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);

            fireEvent(anchorExtension.getInput(), 'mouseup');
            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });

        it('should show the form on shortcut', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar'),
                code = 'K'.charCodeAt(0);

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(editor.elements[0], 'keydown', {
                keyCode: code,
                ctrlKey: true,
                metaKey: true
            });

            expect(toolbar.isDisplayed()).toBe(true);
            expect(anchorExtension.isDisplayed()).toBe(true);
        });
    });

    describe('Link Creation', function () {
        it('should create a link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'http://test.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            // A trailing <br> may be added when insertHTML is used to add the link internally.
            expect(this.el.innerHTML.indexOf('<a href="http://test.com">lorem ipsum</a>')).toBe(0);
        });

        it('should remove the extra white spaces in the link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = '    test   ';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            // A trailing <br> may be added when insertHTML is used to add the link internally.
            expect(this.el.innerHTML.indexOf('<a href="test">lorem ipsum</a>')).toBe(0);
        });

        it('should not set any href if all user passes is spaces in the link when user presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = '    ';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            //Since user only passes empty string in the url, there should be no <a> tag created for the element.
            expect(this.el.innerHTML.indexOf('<a href="">lorem ipsum</a>')).toBe(-1);
        });

        it('should create only one anchor tag when the user selects across a boundary', function () {
            this.el.innerHTML = 'Hello world, this <strong>will become a link, but this part won\'t.</strong>';

            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            MediumEditor.selection.select(document, this.el.childNodes[0], 'Hello world, '.length,
                this.el.childNodes[1].childNodes[0], 'will become a link'.length);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'http://test.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            expect(this.el.innerHTML).toMatch(/^Hello world, <a href="http:\/\/test\.com\/?">this <strong>will become a link<\/strong><\/a><strong>, but this part won\'t\.<\/strong>(<br>|<strong><\/strong>)?$/);
        });

        it('should create a link when the user selects text within two paragraphs', function () {
            this.el.innerHTML = '<p>Hello <span>world</span>.</p>' +
                '<p><strong>Let us make a link</strong> across paragraphs.</p>';

            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input;

            MediumEditor.selection.select(document, this.el.querySelector('span'), 0,
                this.el.querySelector('strong'), 1);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'http://test.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();

            var anchors = this.el.querySelectorAll('a');
            // Edge creates 3 links, other browsers create 2
            expect(anchors.length).toBeGreaterThan(1);
            expect(anchors.length).toBeLessThan(4);

            var linkText = '';
            Array.prototype.slice.call(anchors).forEach(function (anchor) {
                linkText += anchor.textContent;
            });
            expect(linkText).toBe('world.Let us make a link');

            var spans = this.el.querySelectorAll('span');
            expect(spans.length).toBe(1);
            expect(spans[0].textContent).toBe('world');

            var strongs = this.el.querySelectorAll('strong');
            expect(strongs.length).toBe(1);
            expect(strongs[0].textContent).toBe('Let us make a link');
        });

        it('shouldn\'t create a link when user presses enter without value', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button,
                input;

            selectElementContents(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = '';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.elements[0].querySelector('a')).toBeNull();
        });

        it('should add http:// if need be and linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe('http://test.com/');
        });

        it('should add tel: if need be and linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('347-999-9999');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe('tel:347-999-9999');
        });

        it('should not change protocol when a valid one is included', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                validUrl = 'mailto:test.com',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl);
        });

        it('should not change protocol when a tel scheme is included', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                // Specifically using a bad phone number to illustrate that what follows tel is not checked
                validUrl = 'tel:abc123!@#',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl);
        });

        it('should not change protocol when a maps scheme is included', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                // Specifically using a non-sensical maps string to illustrate that what follows maps is not checked
                validUrl = 'maps:abc123!@#',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl);
        });

        it('should not change protocol for protocol-relative URLs', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                validUrl = '//test.com/',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(window.location.protocol + validUrl);
        });

        it('should not change protocol for any alphabetic scheme', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: true
                }
            }),
                link,
                validUrl = 'abcDEFgHi://test.com/',
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validUrl);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(validUrl.toLowerCase());
        });

        it('should not change fragment identifier when link begins with hash', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        linkValidation: true
                    }
                }),
                validHashLink = '#!$&\'()*+,;=123abcDEF-._~:@/?',
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(validHashLink);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.getAttribute('href')).toBe(validHashLink);
        });

        it('should change spaces to %20 for a valid url if linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        linkValidation: true
                    }
                }),
                link,
                anchorExtension = editor.getExtensionByName('anchor'),
                expectedOpts = {
                    value: 'http://te%20s%20t.com/',
                    target: '_self'
                };

            spyOn(editor, 'execAction').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('te s t.com/');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            expect(editor.execAction).toHaveBeenCalledWith('createLink', expectedOpts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(expectedOpts.value);
        });

        it('should not encode an encoded URL if linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        linkValidation: true
                    }
                }),
                link,
                anchorExtension = editor.getExtensionByName('anchor'),
                expectedOpts = {
                    value: 'http://a%20b.com/',
                    target: '_self'
                };

            spyOn(editor, 'execAction').and.callThrough();
            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('a%20b.com/');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            expect(editor.execAction).toHaveBeenCalledWith('createLink', expectedOpts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(expectedOpts.value);
        });

        it('should encode query params if linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        linkValidation: true
                    }
                }),
                link,
                anchorExtension = editor.getExtensionByName('anchor'),
                expectedOpts = {
                    value: 'http://a.com/?q=http%3A%2F%2Fb.com&q2=http%3A%2F%2Fc.com',
                    target: '_self'
                };

            spyOn(editor, 'execAction').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('a.com/?q=http://b.com&q2=http://c.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            expect(editor.execAction).toHaveBeenCalledWith('createLink', expectedOpts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(expectedOpts.value);
        });

        it('should not encode an encoded query param if linkValidation option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        linkValidation: true
                    }
                }),
                link,
                anchorExtension = editor.getExtensionByName('anchor'),
                expectedOpts = {
                    value: 'http://a.com/?q=http%3A%2F%2Fb.com&q2=http%3A%2F%2Fc.com',
                    target: '_self'
                };

            spyOn(editor, 'execAction').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('a.com/?q=http%3A%2F%2Fb.com&q2=http://c.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            expect(editor.execAction).toHaveBeenCalledWith('createLink', expectedOpts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.href).toBe(expectedOpts.value);
        });

        it('should not change spaces to %20 if linkValidation is set to false', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    linkValidation: false
                }
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor'),
                expectedOpts = {
                    value: 'http://te s t.com/',
                    target: '_self'
                };

            spyOn(editor, 'execAction').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm(expectedOpts.value);
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            // Chrome, Edge, and IE will automatically escape the href once it's set on the link
            // So for this case, we'll only look at the call to execAction to see what URL it was trying to set
            // since the value of the link's href could be different values
            expect(editor.execAction).toHaveBeenCalledWith('createLink', expectedOpts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
        });

        it('should add target="_blank" when "open in a new window" checkbox is checked', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    targetCheckbox: true
                }
            }),
                anchorExtension = editor.getExtensionByName('anchor'),
                targetCheckbox,
                link;

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            expect(anchorExtension.isDisplayed()).toBe(true);
            targetCheckbox = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
            expect().not.toBeNull(targetCheckbox);
            targetCheckbox.checked = true;
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            expect(anchorExtension.isDisplayed()).toBe(false);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });

        it('should add target="_blank" when respective option is set to true', function () {
            var editor = this.newMediumEditor('.editor', {
                targetBlank: true
            }),
                link,
                anchorExtension = editor.getExtensionByName('anchor');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.target).toBe('_blank');
        });

        it('should create a button when user selects this option and presses enter', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        customClassOption: 'btn btn-default'
                    }
                }),
                save,
                input,
                button,
                link,
                opts,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContents(editor.elements[0]);
            save = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(save, 'click');

            input = anchorExtension.getInput();
            input.value = 'http://test.com';

            button = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-button');
            button.setAttribute('type', 'checkbox');
            button.checked = true;

            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            opts = {
                value: 'http://test.com',
                target: '_self',
                buttonClass: 'btn btn-default'
            };
            expect(editor.createLink).toHaveBeenCalledWith(opts);

            link = editor.elements[0].querySelector('a');
            expect(link).not.toBeNull();
            expect(link.classList.contains('btn')).toBe(true);
            expect(link.classList.contains('btn-default')).toBe(true);
        });

        it('should remove the target _blank from the anchor tag when the open in a new window checkbox,' +
                ' is unchecked and the form is saved', function () {
            var editor = this.newMediumEditor('.editor', {
                anchor: {
                    targetCheckbox: true
                }
            }),
                anchorExtension = editor.getExtensionByName('anchor'),
                targetCheckbox,
                link;

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            expect(anchorExtension.isDisplayed()).toBe(true);
            targetCheckbox = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
            targetCheckbox.checked = true;
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            link = editor.elements[0].querySelector('a');
            expect(link.target).toBe('_blank');

            selectElementContentsAndFire(editor.elements[0]);
            anchorExtension.showForm('http://test.com');
            targetCheckbox = anchorExtension.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
            targetCheckbox.checked = false;
            fireEvent(anchorExtension.getForm().querySelector('a.medium-editor-toolbar-save'), 'click');
            link = editor.elements[0].querySelector('a');
            expect(link.target).toBe('');
        });

        it('should fire editableInput only once when the user creates a link open to a new window,' +
                ' and it should fire at the end of the DOM and selection modifications', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            this.el.innerHTML = '<p>Lorem ipsum et dolitur sunt.</p>';
            var editor = this.newMediumEditor('.editor', {
                    anchor: {
                        targetCheckbox: true
                    }
                }),
                p = this.el.lastChild,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar'),
                selectionWhenEventsFired = [],
                listener = function () {
                    selectionWhenEventsFired.push(window.getSelection().toString());
                };

            MediumEditor.selection.select(document, p.firstChild, 'Lorem '.length, p.firstChild, 'Lorem ipsum'.length);
            fireEvent(editor.elements[0], 'focus');
            jasmine.clock().tick(1);

            // Click the 'anchor' button in the toolbar
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');

            // Input a url and save
            var input = anchorExtension.getInput(),
                checkbox = anchorExtension.getAnchorTargetCheckbox();
            input.value = 'http://www.example.com';
            checkbox.checked = true;
            editor.subscribe('editableInput', listener);
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });

            expect(editor.createLink).toHaveBeenCalledWith({
                value: 'http://www.example.com',
                target: '_blank'
            });
            expect(window.getSelection().toString()).toBe('ipsum', 'selected text should remain selected');
            expect(selectionWhenEventsFired.length).toBe(1, 'only one editableInput event should have been registered');
            expect(selectionWhenEventsFired[0]).toBe('ipsum', 'selected text should have been the same when event fired');
        });

        // https://github.com/yabwe/medium-editor/issues/757
        it('should not select empty paragraphs when link is created at beginning of paragraph after empty paragraphs', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            this.el.innerHTML = '<p>Some text</p><p><br/></p><p><br/></p><p>link text more text</p>';
            var editor = this.newMediumEditor('.editor'),
                lastP = this.el.lastChild,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // Select the text 'link text' in the last paragraph
            MediumEditor.selection.select(document, lastP.firstChild, 0, lastP.firstChild, 'link text'.length);
            fireEvent(editor.elements[0], 'focus');
            jasmine.clock().tick(1);

            // Click the 'anchor' button in the toolbar
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');

            // Input a url and save
            var input = anchorExtension.getInput();
            input.value = 'http://www.example.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });

            expect(editor.createLink).toHaveBeenCalledWith({
                value: 'http://www.example.com',
                target: '_self'
            });

            // Make sure the <p> wasn't removed, and the <a> was added to the end
            expect(this.el.lastChild).toBe(lastP);
            expect(lastP.firstChild.nodeName.toLowerCase()).toBe('a');

            // Make sure selection is only the link
            var range = window.getSelection().getRangeAt(0);
            expect(MediumEditor.util.isDescendant(lastP, range.startContainer, true)).toBe(true, 'The start of the selection is incorrect');
            expect(range.startOffset).toBe(0);
            expect(MediumEditor.util.isDescendant(lastP.firstChild, range.endContainer, true)).toBe(true, 'The end of the selection is not contained within the link');
        });

        // https://github.com/yabwe/medium-editor/issues/757
        it('should not select empty paragraphs when link is created at beginning of paragraph after another paragraph', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            this.el.innerHTML = '<p>Some text</p><p>link text more text</p>';
            var editor = this.newMediumEditor('.editor'),
                lastP = this.el.lastChild,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // Select the text 'link text' in the last paragraph
            MediumEditor.selection.select(document, lastP.firstChild, 0, lastP.firstChild, 'link text'.length);
            fireEvent(editor.elements[0], 'focus');
            jasmine.clock().tick(1);

            // Click the 'anchor' button in the toolbar
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');

            // Input a url and save
            var input = anchorExtension.getInput();
            input.value = 'http://www.example.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });

            expect(editor.createLink).toHaveBeenCalledWith({
                value: 'http://www.example.com',
                target: '_self'
            });

            // Make sure the <p> wasn't removed, and the <a> was added to the end
            expect(this.el.lastChild).toBe(lastP);
            expect(lastP.firstChild.nodeName.toLowerCase()).toBe('a');

            // Make sure selection is only the link
            var range = window.getSelection().getRangeAt(0);
            expect(MediumEditor.util.isDescendant(lastP, range.startContainer, true)).toBe(true, 'The start of the selection is incorrect');
            expect(range.startOffset).toBe(0);
            expect(MediumEditor.util.isDescendant(lastP.firstChild, range.endContainer, true)).toBe(true, 'The end of the selection is not contained within the link');
        });

        it('should not remove the <p> container when adding a link inside a top-level <p> with a single text-node child', function () {
            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            this.el.innerHTML = '<p>Some text</p><p><br/></p><p><br/></p><p>some text link text</p>';
            var editor = this.newMediumEditor('.editor'),
                lastP = this.el.lastChild,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            // Select the text 'link text' in the last paragraph
            MediumEditor.selection.select(document, lastP.firstChild, 'some text '.length, lastP.firstChild, 'some text link text'.length);
            fireEvent(editor.elements[0], 'focus');
            jasmine.clock().tick(1);

            // Click the 'anchor' button in the toolbar
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');

            // Input a url and save
            var input = anchorExtension.getInput();
            input.value = 'http://www.example.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });

            expect(editor.createLink).toHaveBeenCalledWith({
                value: 'http://www.example.com',
                target: '_self'
            });

            // Make sure the <p> wasn't removed, and the <a> was added to the end
            expect(this.el.lastChild).toBe(lastP);
            expect(lastP.lastChild.nodeName.toLowerCase()).toBe('a');

            // Make sure selection is only the link
            var range = window.getSelection().getRangeAt(0);
            if (range.startContainer === lastP.lastChild.firstChild) {
                expect(range.startOffset).toBe(0, 'The start of the selection is not at the front of the link');
            } else {
                expect(range.startContainer).toBe(lastP.firstChild);
                expect(range.startOffset).toBe('some text '.length, 'The start of the selection is not at the front of the link');
            }
            expect(MediumEditor.util.isDescendant(lastP.lastChild, range.endContainer, true)).toBe(true, 'The end of the selection is incorrect');
        });

        // https://github.com/yabwe/medium-editor/issues/803
        it('should update the href of a link containing only an image', function () {
            this.el.innerHTML = '<a href="#"><img src="../demo/img/medium-editor.jpg"></a>';

            spyOn(MediumEditor.prototype, 'createLink').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar'),
                button, input,
                aTag = this.el.childNodes[0];

            selectElementContents(aTag);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            input = editor.getExtensionByName('anchor').getInput();
            input.value = 'http://www.google.com';
            fireEvent(input, 'keyup', {
                keyCode: MediumEditor.util.keyCode.ENTER
            });
            expect(editor.createLink).toHaveBeenCalled();
            // This appears to be broken in Edge < 13, but works correctly in Edge 13 or higher
            // So for the sake of sanity, disabling this check for Edge 12.
            // TODO: Find a better way to fix this issue if Edge 12 is going to matter
            var edgeVersion = getEdgeVersion();
            if (!edgeVersion || edgeVersion >= 13) {
                expect(this.el.innerHTML).toContain('<a href="http://www.google.com"><img src="../demo/img/medium-editor.jpg"></a>');
            }
        });
    });

    describe('Cancel', function () {
        it('should close the link form when user clicks on cancel', function () {
            spyOn(MediumEditor.extensions.toolbar.prototype, 'showAndUpdateToolbar').and.callThrough();
            var editor = this.newMediumEditor('.editor'),
                button,
                cancel,
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            cancel = anchorExtension.getForm().querySelector('a.medium-editor-toolbar-close');
            fireEvent(button, 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(cancel, 'click');
            expect(toolbar.showAndUpdateToolbar).toHaveBeenCalled();
            expect(anchorExtension.isDisplayed()).toBe(false);
        });

        it('should close the link form when user presses escape', function () {
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');
            expect(anchorExtension.isDisplayed()).toBe(true);
            fireEvent(anchorExtension.getInput(), 'keyup', {
                keyCode: MediumEditor.util.keyCode.ESCAPE
            });
            expect(anchorExtension.isDisplayed()).toBe(false);
        });
    });

    describe('Click', function () {
        it('should display the anchor form when toolbar is visible', function () {
            spyOn(MediumEditor.extensions.anchor.prototype, 'showForm').and.callThrough();
            var button,
                editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar');

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(anchorExtension.isDisplayed()).toBe(true);
            expect(anchorExtension.showForm).toHaveBeenCalled();
        });

        it('should unlink when selection is a link', function () {
            this.el.innerHTML = '<a href="#">link</a>';
            var button,
                editor = this.newMediumEditor('.editor'),
                toolbar = editor.getExtensionByName('toolbar');
            spyOn(document, 'execCommand').and.callThrough();

            selectElementContentsAndFire(editor.elements[0]);
            button = toolbar.getToolbarElement().querySelector('[data-action="createLink"]');
            fireEvent(button, 'click');
            expect(this.el.innerHTML).toBe('link');
            expect(document.execCommand).toHaveBeenCalled();
        });

        // https://github.com/yabwe/medium-editor/issues/751
        it('should allow more than one link creation within a paragraph', function () {
            spyOn(MediumEditor.extensions.anchor.prototype, 'showForm').and.callThrough();
            this.el.innerHTML = '<p><a href="#">beginning</a> some text middle some text end</p>';
            var editor = this.newMediumEditor('.editor'),
                anchorExtension = editor.getExtensionByName('anchor'),
                toolbar = editor.getExtensionByName('toolbar'),
                para = this.el.firstChild;

            // Select the text 'middle'
            MediumEditor.selection.select(document, para.childNodes[1], 11, para.childNodes[1], 18);
            fireEvent(editor.elements[0], 'focus');
            jasmine.clock().tick(1);

            // Click the 'anchor' button in the toolbar
            fireEvent(toolbar.getToolbarElement().querySelector('[data-action="createLink"]'), 'click');

            expect(toolbar.getToolbarActionsElement().style.display).toBe('none');
            expect(anchorExtension.isDisplayed()).toBe(true);
            expect(anchorExtension.showForm).toHaveBeenCalled();
            expect(anchorExtension.getInput().value).toBe('');
        });
    });

});
