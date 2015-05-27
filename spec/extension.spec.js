/*global MediumEditor, describe, it, expect, spyOn,
    afterEach, beforeEach, jasmine, setupTestHelpers,
    selectElementContentsAndFire, Extension */

describe('Extensions TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Editor', function () {

        it('should accept a number of extensions as parameter', function () {
            var extensions = {
                'extension1': {},
                'extension2': {}
            },
                editor = this.newMediumEditor('.editor', {
                    extensions: extensions
                });
            expect(editor.options.extensions).toBe(extensions);
        });

        it('should call methods on all extensions with callExtensions is used', function () {

            var Extension = function () {

            },
                ext1 = new Extension(),
                ext2 = new Extension(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'one': ext1,
                        'two': ext2
                    }
                });

            Extension.prototype.aMethod = function () {
                // just a stub function
            };

            spyOn(ext1, 'aMethod');
            spyOn(ext2, 'aMethod');

            editor.callExtensions('aMethod', 'theParam');
            expect(ext1.aMethod).toHaveBeenCalledWith('theParam');
            expect(ext2.aMethod).toHaveBeenCalledWith('theParam');
        });

        it('should call init (and pass the deprecated instance of itself) on extensions if the method exists', function () {
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

            editor = this.newMediumEditor('.editor', {
                extensions: {
                    'one': ext1,
                    'two': ext2
                }
            });

            expect(ext1.me instanceof MediumEditor).toBeTruthy();
            expect(ext2.me instanceof MediumEditor).toBeTruthy();
        });

        it('should set the base property to an instance of MediumEditor', function () {
            var extOne = new MediumEditor.Extension(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'one': extOne
                    }
                });

            expect(editor instanceof MediumEditor).toBeTruthy();
            expect(extOne.base instanceof MediumEditor).toBeTruthy();
        });

        it('should not set the base property when deprecated parent attribute is set to false', function () {
            var TempExtension = MediumEditor.Extension.extend({
                    parent: false
                }),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'temp': new TempExtension()
                    }
                });

            expect(editor instanceof MediumEditor).toBeTruthy();
            expect(editor.getExtensionByName('temp').base).toBeUndefined();
        });

        it('should not override the base or name properties of an extension if overriden', function () {
            var TempExtension = MediumEditor.Extension.extend({
                    name: 'tempExtension',
                    base: 'something'
                }),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'one': new TempExtension()
                    }
                });

            expect(editor.getExtensionByName('one')).toBeUndefined();
            expect(editor.getExtensionByName('tempExtension').base).toBe('something');
        });

        it('should set the name of property of extensions', function () {
            var ExtensionOne = function () {},
                ExtensionTwo = function () {},
                extOne = new ExtensionOne(),
                extTwo = new ExtensionTwo(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'one': extOne,
                        'two': extTwo
                    }
                });

            expect(extOne.name).toBe('one');
            expect(extTwo.name).toBe('two');

            expect(editor.getExtensionByName('one')).toBe(extOne);
            expect(editor.getExtensionByName('two')).toBe(extTwo);
        });

        it('should set window and document properties on each extension', function () {
            var TempExtension = MediumEditor.Extension.extend({}),
                extInstance = new TempExtension(),
                fakeDocument = {
                    body: document.body,
                    documentElement: document.documentElement,
                    querySelectorAll: function () {
                        return document.querySelectorAll.apply(document, arguments);
                    },
                    createElement: function () {
                        return document.createElement.apply(document, arguments);
                    }
                },
                fakeWindow = {
                    addEventListener: function () {
                        return window.addEventListener.apply(window, arguments);
                    },
                    removeEventListener: function () {
                        return window.removeEventListener.apply(window, arguments);
                    }
                };
            this.newMediumEditor('.editor', {
                ownerDocument: fakeDocument,
                contentWindow: fakeWindow,
                extensions: {
                    'temp-extension': extInstance
                }
            });

            expect(extInstance.window).toBe(fakeWindow);
            expect(extInstance.document).toBe(fakeDocument);
        });

        it('should call destroy on extensions when being destroyed', function () {
            var TempExtension = MediumEditor.Extension.extend({
                    destroy: function () {}
                }),
                extInstance = new TempExtension();
            spyOn(extInstance, 'destroy');
            var editor = this.newMediumEditor('.editor', {
                extensions: {
                    'temp-extension': extInstance
                }
            });
            editor.destroy();
            expect(extInstance.destroy).toHaveBeenCalled();
        });

        it('should call deprecated deactivate on extensions when being destroyed if destroy is not implemented', function () {
            var TempExtension = MediumEditor.Extension.extend({
                    deactivate: function () {}
                }),
                extInstance = new TempExtension();
            spyOn(extInstance, 'deactivate');
            var editor = this.newMediumEditor('.editor', {
                extensions: {
                    'temp-extension': extInstance
                }
            });
            editor.destroy();
            expect(extInstance.deactivate).toHaveBeenCalled();
        });
    });

    describe('Core Extension', function () {

        it('exists', function () {
            expect(MediumEditor.Extension).toBeTruthy();
            expect(MediumEditor.Extension).toBe(Extension);
        });

        it('provides an .extend method', function () {

            expect(Extension.extend).toBeTruthy();
            var Extended = Extension.extend({
                foo: 'bar'
            });
            expect(Extended.prototype.foo).toBe('bar');
            expect(Extended.extend).toBe(Extension.extend);
        });

        it('can be passed as an extension', function () {

            var Sub, editor, e1, e2;

            Sub = Extension.extend({
                y: 10
            });

            e1 = new Sub();
            e2 = new Sub({ y: 20 });

            spyOn(e1, 'init');

            editor = this.newMediumEditor('.editor', {
                extensions: {
                    'foo': e1,
                    'bar': e2
                }
            });

            expect(e1.y).toBe(10);
            expect(e2.y).toBe(20);

            expect(e1.init).toHaveBeenCalledWith(editor);

        });

    });

    describe('All extensions', function () {
        it('should get helper methods to call into base instance methods', function () {
            var noop = function () {},
                helpers = {
                    'on': [document, 'click', noop, false],
                    'off': [document, 'click', noop, false],
                    'subscribe': ['editableClick', noop],
                    'execAction': ['bold']
                },
                tempExtension = new MediumEditor.Extension(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'temp-extension': tempExtension
                    }
                });

            Object.keys(helpers).forEach(function (helper) {
                spyOn(editor, helper);
            });

            Object.keys(helpers).forEach(function (helper) {
                tempExtension[helper].apply(tempExtension, helpers[helper]);
                expect((editor[helper]).calls.count()).toBe(1);
            });
        });

        it('should be able to access the editor id via getEditorId()', function () {
            var tempExtension = new MediumEditor.Extension(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'temp-extension': tempExtension
                    }
                });
            expect(tempExtension.getEditorId()).toBe(editor.id);
        });

        it('should be able to access elements in this editor via getEditorElements()', function () {
            var tempExtension = new MediumEditor.Extension(),
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        'temp-extension': tempExtension
                    }
                });
            expect(tempExtension.getEditorElements()).toBe(editor.elements);
        });

        it('should be able to access editor options via getEditorOption()', function () {
            var tempExtension = new MediumEditor.Extension(),
                editor = this.newMediumEditor('.editor', {
                    disableReturn: true,
                    extensions: {
                        'temp-extension': tempExtension
                    }
                });
            expect(tempExtension.getEditorOption('disableReturn')).toBe(true);
            expect(tempExtension.getEditorOption('spellcheck')).toBe(editor.options.spellcheck);
        });
    });

    describe('Button integration', function () {

        var ExtensionWithElement = {
            getButton: function () {
                var button = document.createElement('button');
                button.className = 'extension-button';
                button.innerText = 'XXX';
                return button;
            },
            checkState: function () {}
        },
            ExtensionWithString = {
                getButton: function () {
                    return '<button class="extension-button">XXX</button>';
                }
            },
            ExtensionWithNoButton = function () {
                this.init = function () {};
            };

        it('should include extensions button into toolbar', function () {
            var editor = this.newMediumEditor('.editor', {
                buttons: ['dummy'],
                extensions: {
                    'dummy': ExtensionWithElement
                }
            });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('.extension-button').length).toBe(1);
        });

        it('should call checkState on extensions when toolbar selection updates', function () {
            var editor = this.newMediumEditor('.editor', {
                    buttons: ['dummy'],
                    extensions: {
                        'dummy': ExtensionWithElement
                    }
                });
            selectElementContentsAndFire(editor.elements[0].firstChild);
            spyOn(ExtensionWithElement, 'checkState').and.callThrough();
            editor.checkSelection();
            jasmine.clock().tick(51);
            expect(ExtensionWithElement.checkState.calls.count()).toEqual(1);
            jasmine.clock().uninstall();
        });

        it('should include extensions button by string into the toolbar', function () {
            var editor = this.newMediumEditor('.editor', {
                buttons: ['dummy'],
                extensions: {
                    'dummy': ExtensionWithString
                }
            });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('.extension-button').length).toBe(1);
        });

        it('should not include extensions button into toolbar that are not in "buttons"', function () {
            var editor = this.newMediumEditor('.editor', {
                buttons: ['bold'],
                extensions: {
                    'dummy': ExtensionWithElement
                }
            });
            expect(editor.toolbar.getToolbarElement().querySelectorAll('.extension-button').length).toBe(0);
        });

        it('should not include buttons into the toolbar when an overriding extension is present', function () {
            var ext = new ExtensionWithNoButton(),
                editor;

            spyOn(ext, 'init');
            editor = this.newMediumEditor('.editor', {
                buttons: ['bold', 'italic'],
                extensions: {
                    'bold': ext
                }
            });

            expect(editor.toolbar.getToolbarElement().querySelectorAll('button').length).toBe(1);
            expect(editor.toolbar.getToolbarElement().querySelectorAll('button[data-action="italic"]').length).toBe(1);
            expect(editor.toolbar.getToolbarElement().querySelectorAll('button[data-action="bold"]').length).toBe(0);
            expect(ext.init).toHaveBeenCalled();
        });
    });
});
