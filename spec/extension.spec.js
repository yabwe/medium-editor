/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, tearDown*/

describe('Extensions TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = 'lorem ipsum';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
    });

    describe('Editor', function () {

        it('should accept a number of extensions as parameter', function () {
            var extensions = {
                'extension1': {},
                'extension2': {}
            },
                editor = new MediumEditor('.editor', {
                    extensions: extensions
                });
            expect(editor.options.extensions).toBe(extensions);
        });

        it('should call methods on all extensions with callExtensions is used', function () {

            var Extension = function () {

            },
                ext1 = new Extension(),
                ext2 = new Extension(),
                editor = new MediumEditor('.editor', {
                    extensions: {
                        'one': ext1,
                        'two': ext2
                    }
                });

            Extension.prototype.aMethod = function (param) {

            };

            spyOn(ext1, 'aMethod');
            spyOn(ext2, 'aMethod');

            editor.callExtensions('aMethod', 'theParam');
            expect(ext1.aMethod).toHaveBeenCalledWith('theParam');
            expect(ext2.aMethod).toHaveBeenCalledWith('theParam');
        });

        it('should call init (and pass the instance of itself) on extensions if the method exists', function () {
            var ExtensionOne = function () {
                this.init = function (me) {
                    this.me = me;
                };
            },
                ExtensionTwo = function () {},
                ext1,
                ext2,
                editor;

            ExtensionTwo.prototype.init = function (me) {
                this.me = me;
            };

            ext1 = new ExtensionOne();
            ext2 = new ExtensionTwo();

            editor = new MediumEditor('.editor', {
                extensions: {
                    'one': ext1,
                    'two': ext2
                }
            });

            expect(ext1.me instanceof MediumEditor).toBeTruthy();
            expect(ext2.me instanceof MediumEditor).toBeTruthy();
            editor.deactivate();
        });
    });

    describe('Button integration', function () {

        var ExtensionWithElement = {
            getButton: function () {
                var button = document.createElement('button');
                button.className = 'extension-button';
                button.innerText = 'XXX';
                return button;
            }
        },
            ExtensionWithString = {
                getButton: function () {
                    return '<button class="extension-button">XXX</button>';
                }
            },
            ExtensionWithNoButton = function () {
                this.init = function (me) {};
            };

        it('should include extensions button into toolbar', function () {
            var editor = new MediumEditor('.editor', {
                buttons: ['dummy'],
                extensions: {
                    'dummy': ExtensionWithElement
                }
            });
            expect(editor.toolbar.querySelectorAll('.extension-button').length).toBe(1);
        });

        it('should include extensions button by string into the toolbar', function () {
            var editor = new MediumEditor('.editor', {
                buttons: ['dummy'],
                extensions: {
                    'dummy': ExtensionWithString
                }
            });
            expect(editor.toolbar.querySelectorAll('.extension-button').length).toBe(1);
        });

        it('should not include extensions button into toolbar that are not in "buttons"', function () {
            var editor = new MediumEditor('.editor', {
                buttons: ['bold'],
                extensions: {
                    'dummy': ExtensionWithElement
                }
            });
            expect(editor.toolbar.querySelectorAll('.extension-button').length).toBe(0);
        });

        it('should not include buttons into the toolbar when an overriding extension is present', function () {
            var ext = new ExtensionWithNoButton(),
                editor;

            spyOn(ext, 'init');
            editor = new MediumEditor('.editor', {
                buttons: ['bold', 'italic'],
                extensions: {
                    'bold': ext
                }
            });

            expect(editor.toolbar.querySelectorAll('button[data-action="italic"]').length).toBe(1);
            expect(editor.toolbar.querySelectorAll('button[data-action="bold"]').length).toBe(0);
            expect(ext.init).toHaveBeenCalled();
            expect(editor.commands.length).toBe(2);
        });
    });

    describe('Set data in extensions', function () {
        var ExtensionOne = function () {
                this.parent = true;
            },
            ExtensionTwo = function () {},
            extOne = new ExtensionOne(),
            extTwo = new ExtensionTwo();

        it('should check if extension class has parent attribute', function () {
            var editor = new MediumEditor('.editor', {
                extensions: {
                    'one': extOne,
                    'two': extTwo
                }
            });

            expect(editor instanceof MediumEditor).toBeTruthy();
            expect(extOne.parent).toBeTruthy();
            expect(extTwo.parent).toBeUndefined();
        });

        it('should set the base attribute to be an instance of editor', function () {
            var editor = new MediumEditor('.editor', {
                extensions: {
                    'one': extOne,
                    'two': extTwo
                }
            });

            expect(editor instanceof MediumEditor).toBeTruthy();
            expect(extOne.base instanceof MediumEditor).toBeTruthy();
            expect(extTwo.base).toBeUndefined();
        });

        it('should set the name of the extension', function () {
            var editor = new MediumEditor('.editor', {
                extensions: {
                    'one': extOne,
                    'two': extTwo
                }
            });

            expect(extOne.name).toBe('one');
            expect(extTwo.name).toBe('two');
            editor.deactivate();
        });
    });
});
