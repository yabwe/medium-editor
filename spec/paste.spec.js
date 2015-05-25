/*global MediumEditor, describe, it, expect, spyOn,
    afterEach, beforeEach, selectElementContents,
    jasmine, setupTestHelpers, selectElementContentsAndFire */

describe('Pasting content', function () {
    'use strict';

    var multiLineTests = [
            {
                source: 'Google docs',
                paste: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b1bb8bfe-f54c-2e1f-72e2-4c7608d2be70"><div dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold</span></div><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Italic</span></p><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold and Italic</span></p><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">A </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="text-decoration:none;"><span style="font-size:15px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">link</span></a><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">.</span></p></b><br class="Apple-interchange-newline">',
                output: '<div><b>Bold</b></div><p><i>Italic</i></p><p><b><i>Bold and Italic</i></b></p><p>A <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">link</a>.</p>'
            },
            {
                source: 'Inside editor',
                paste: '<meta charset=\'utf-8\'><p style="margin-bottom: 40px; color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"><b>Bold</b></p><p style="margin-bottom: 40px; color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"><i>Italic</i></p><p style="margin-bottom: 40px; color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"><b><i>Bold and Italic</i></b></p><p style="margin-bottom: 40px; color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">A<span class="Apple-converted-space"> </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="color: black;">link</a>.</p>',
                output: '<p><b>Bold</b></p><p><i>Italic</i></p><p><b><i>Bold and Italic</i></b></p><p>A <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">link</a>.</p>'
            },
            {
                source: 'Messy paragraphs with spaces',
                paste: '<meta charset=\'utf-8\'><p class="sub_buzz_desc" style="margin: 0px; padding: 0px 0px 12px; border: 0px; outline: 0px; font-size: 18px; background-color: rgb(255, 255, 255); line-height: 26px; font-style: normal; font-variant: normal; font-weight: normal; font-family: cambria, georgia, serif; color: rgb(34, 34, 34); letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-position: initial initial; background-repeat: initial initial;"><b>Bold</b></p><p style="margin: 0px; padding: 6px 0px 12px; border: 0px; outline: 0px; font-size: 18px; background-color: rgb(255, 255, 255); line-height: 26px; font-style: normal; font-variant: normal; font-weight: normal; font-family: cambria, georgia, serif; color: rgb(34, 34, 34); letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-position: initial initial; background-repeat: initial initial;"><i>Italic</i></p><p class="sub_buzz_desc" style="margin: 0px; padding: 0px 0px 12px; border: 0px; outline: 0px; font-size: 18px; background-color: rgb(255, 255, 255); line-height: 26px; font-style: normal; font-variant: normal; font-weight: normal; font-family: cambria, georgia, serif; color: rgb(34, 34, 34); letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-position: initial initial; background-repeat: initial initial;"><b><i>Bold and Italic</i></b></p><p style="margin: 0px; padding: 6px 0px 12px; border: 0px; outline: 0px; font-size: 18px; background-color: rgb(255, 255, 255); line-height: 26px; font-style: normal; font-variant: normal; font-weight: normal; font-family: cambria, georgia, serif; color: rgb(34, 34, 34); letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-position: initial initial; background-repeat: initial initial;">A<span class="Apple-converted-space"> </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 18px; background-color: transparent; color: rgb(0, 119, 238); text-decoration: none; background-position: initial initial; background-repeat: initial initial;">link</a>.</p>',
                output: '<p><b>Bold</b></p><p><i>Italic</i></p><p><b><i>Bold and Italic</i></b></p><p>A <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">link</a>.</p>'
            },
            {
                source: 'Paragraphs with internal linebreaks',
                paste: '<meta charset=\'utf-8\'><p>One<br>Two</p><p>Three<br>Four</p>',
                output: '<p>One<br>Two</p><p>Three<br>Four</p>'
            },
            {
                source: 'Non <p> or <div> with only <br> elements',
                paste: '<p>One</p><div><h1><br /></h1></div><p>Two</p><span><span><br /></span></span><p>Three</p>',
                output: '<p>One</p><p>Two</p><p>Three</p>'
            },
            {
                source: 'Microsoft Word - line breaks',
                paste: '<p>One\nTwo\n</p>\n\n<p>Three Four</p>',
                output: '<p>One Two </p><p>Three Four</p>'
            },
            {
                source: 'Microsoft Word - Proprietary elements',
                paste: '<p>One<o:p></o:p></p><p>Two<o:p></o:p></p>',
                output: '<p>One</p><p>Two</p>'
            }
        ],
        inlineTests = [
            {
                source: 'Google docs',
                paste: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-2f060cc5-1888-a396-af95-bfb31478c7ae"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold,</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic,</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold and italic</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">, and </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="text-decoration:none;"><span style="font-size:15px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">a link</span></a><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">.</span></b>',
                output: '<b>Bold,</b> <i>italic,</i> <b><i>bold and italic</i></b>, and <a href="http://en.wikipedia.org/wiki/Link_\\(The_Legend_of_Zelda\\)">a link</a>\\.'
            },
            {
                source: 'Inside editor',
                paste: '<meta charset=\'utf-8\'><b style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">Bold,</b><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;"> </span><i style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">italic,</i><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;"><span class="Apple-converted-space"> </span></span><b style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"><i>bold and italic</i></b><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;">, and<span class="Apple-converted-space"> </span></span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="color: black; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">a link</a><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;">.</span>',
                output: '<b>Bold,</b> <i>italic,</i> <b><i>bold and italic</i></b>, and <a href="http://en.wikipedia.org/wiki/Link_\\(The_Legend_of_Zelda\\)">a link</a>\\.'
            },
            {
                source: 'Copy and pasted anchor from chrome',
                paste: '<meta charset=\'utf-8\'><a href="http://www.yahoo.com/" style="box-sizing: border-box; color: rgb(8, 158, 0); text-decoration: none; outline: 0px; font-family: \'Open Sans\', HelveticaNeue, Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 26px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(249, 249, 249);">Yahoo</a><span style="color: rgb(62, 67, 62); font-family: \'Open Sans\', HelveticaNeue, Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 26px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none; background-color: rgb(249, 249, 249);"><span class="Apple-converted-space"> </span>has been busy rebuilding its business around<span class="Apple-converted-space"> </span></span><a href="http://www.fastcompany.com/3044281/marissa-mayer" style="box-sizing: border-box; color: rgb(8, 158, 0); text-decoration: none; outline: 0px; font-family: \'Open Sans\', HelveticaNeue, Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 26px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(249, 249, 249);">mobile</a><span style="color: rgb(62, 67, 62); font-family: \'Open Sans\', HelveticaNeue, Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 26px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none; background-color: rgb(249, 249, 249);"> under CEO Marissa Mayer, and soon it could make one of its biggest bets yet on the platform.</span>',
                output: '<a href="http://www.yahoo.com/">Yahoo</a> has been busy rebuilding its business around <a href="http://www.fastcompany.com/3044281/marissa-mayer">mobile</a> under CEO Marissa Mayer, and soon it could make one of its biggest bets yet on the platform.'
            },
            {
                source: 'Copy and pasted span with multiple child nodes',
                paste: '<span>| </span><span><a href="http://www.yahoo.com/">Yahoo</a> | <a href="http://www.google.com/">Google</a></span>',
                output: '\\| <a href="http://www.yahoo.com/">Yahoo</a> \\| <a href="http://www.google.com/">Google</a>'
            }
        ],
        textTests = [
            {
                source: 'Text single word',
                paste: 'supercalifragilisticexpalidocious',
                output: '<div id="editor-inner">supercalifragilisticexpalidocious</div>'
            },
            {
                source: 'Text single word with leading/trailing space',
                paste: ' supercalifragilisticexpalidocious ',
                output: '<div id="editor-inner"> supercalifragilisticexpalidocious </div>'
            },
            {
                source: 'Text multi-word with no line breaks',
                paste: 'Their relationship consisted in discussing if it existed',
                output: '<div id="editor-inner">Their relationship consisted in discussing if it existed</div>'
            },
            {
                source: 'Text with multiple line breaks',
                paste: 'Only one thing made him happy\nAnd now that it was gone\nEverything made him happy\r\n',
                output: '<div id="editor-inner"><p>Only one thing made him happy</p><p>And now that it was gone</p><p>Everything made him happy</p></div>'
            }
        ];

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'hhh');
        this.el.id = 'paste-editor';
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('using cleanPastedHTML option', function () {
        it('should filter multi-line rich-text pastes', function () {
            var i,
                editorEl = this.el,
                editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    paste: {
                        forcePlainText: false,
                        cleanPastedHTML: true
                    }
                }),
                pasteHandler = editor.getExtensionByName('paste'),

                // mock event with clipboardData API
                // test requires creating a function, so can't loop or jslint balks
                evt = {
                    pasteText: null,
                    preventDefault: function () {
                        return;
                    },
                    clipboardData: {
                        getData: function () {
                            // do we need to return different results for the different types? text/plain, text/html
                            return this.pasteText;
                        }
                    }
                };

            for (i = 0; i < multiLineTests.length; i += 1) {

                // move caret to editor
                editorEl.innerHTML = '<span id="editor-inner">&nbsp</span>';

                selectElementContentsAndFire(editorEl);

                evt.clipboardData.pasteText = multiLineTests[i].paste;
                pasteHandler.handlePaste(evt, editorEl);
                jasmine.clock().tick(100);
                expect(editorEl.innerHTML).toEqual(multiLineTests[i].output);
            }
        });

        it('should add paragraphs to pasted plain-text', function () {
            var editorEl = this.el,
                editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    paste: {
                        forcePlainText: false,
                        cleanPastedHTML: true
                    }
                }),
                pasteHandler = editor.getExtensionByName('paste'),

                // mock event with clipboardData API
                // test requires creating a function, so can't loop or jslint balks
                evt = {
                    preventDefault: function () {
                        return;
                    },
                    clipboardData: {
                        getData: function (clipboardType) {
                            if (clipboardType === 'text/plain') {
                                return 'One\n\nTwo\n\nThree';
                            }
                        }
                    }
                };

            // move caret to editor
            editorEl.innerHTML = '<span id="editor-inner">&nbsp</span>';

            selectElementContentsAndFire(editorEl);

            pasteHandler.handlePaste(evt, editorEl);
            jasmine.clock().tick(100);
            expect(editorEl.innerHTML).toEqual('<p>One</p><p>Two</p><p>Three</p>');

        });

        it('should filter multi-line rich-text pastes when "insertHTML" command is not supported', function () {
            var editor = this.newMediumEditor('.editor', {
                paste: {
                    forcePlainText: false,
                    cleanPastedHTML: true
                }
            });

            spyOn(document, 'queryCommandSupported').and.returnValue(false);

            multiLineTests.forEach(function (test) {
                this.el.innerHTML = '<span id="editor-inner">lorem ipsum</span>';

                selectElementContentsAndFire(this.el);

                editor.cleanPaste(test.paste);
                expect(this.el.innerHTML).toEqual(test.output);
            }.bind(this));
        });

        it('should add target="_blank" on anchor', function () {
            var editor = this.newMediumEditor('.editor', {
                targetBlank: true,
                paste: {
                    forcePlainText: false,
                    cleanPastedHTML: true
                }
            });

            spyOn(document, 'queryCommandSupported').and.returnValue(false);

            this.el.innerHTML = '<span id="editor-inner">lorem ipsum</span>';

            selectElementContentsAndFire(this.el);

            editor.cleanPaste('<a href="http://0.0.0.0/bar.html">foo<a>');
            expect(this.el.innerHTML).toContain('target="_blank"');
        });
    });

    describe('using cleanPaste', function () {
        it('should filter inline rich-text by passing deprecated options', function () {
            var i,
                editorEl = this.el,
                editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    forcePlainText: false, // deprecated option
                    cleanPastedHTML: true // deprecated option
                });

            for (i = 0; i < inlineTests.length; i += 1) {

                // move caret to editor
                editorEl.innerHTML = 'Before&nbsp;<span id="editor-inner">&nbsp;</span>&nbsp;after.';

                selectElementContents(document.getElementById('editor-inner'));

                editor.cleanPaste(inlineTests[i].paste);
                jasmine.clock().tick(100);

                // Firefox and IE: doing an insertHTML while this <span> is selected results in the html being inserted inside of the span
                // Firefox replace the &nbsp; other either side of the <span> with a space
                // Webkit: doing an insertHTML while this <span> is selected results in the span being replaced completely
                expect(editorEl.innerHTML).toMatch(new RegExp('^Before(&nbsp;|\\s)(<span id="editor-inner">)?' + inlineTests[i].output + '(</span>)?(&nbsp;|\\s)after\\.$'));
            }
        });

        it('should filter inline rich-text', function () {
            var i,
                editorEl = this.el,
                editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    paste: {
                        forcePlainText: false,
                        cleanPastedHTML: true
                    }
                });

            for (i = 0; i < inlineTests.length; i += 1) {

                // move caret to editor
                editorEl.innerHTML = 'Before&nbsp;<span id="editor-inner">&nbsp;</span>&nbsp;after.';

                selectElementContents(document.getElementById('editor-inner'));

                editor.cleanPaste(inlineTests[i].paste);
                jasmine.clock().tick(100);

                // Firefox and IE: doing an insertHTML while this <span> is selected results in the html being inserted inside of the span
                // Firefox replace the &nbsp; other either side of the <span> with a space
                // Webkit: doing an insertHTML while this <span> is selected results in the span being replaced completely
                expect(editorEl.innerHTML).toMatch(new RegExp('^Before(&nbsp;|\\s)(<span id="editor-inner">)?' + inlineTests[i].output + '(</span>)?(&nbsp;|\\s)after\\.$'));
            }
        });

        it('should filter inline rich-text when "insertHTML" command is not supported', function () {
            var editor = this.newMediumEditor('.editor', {
                    paste: {
                        forcePlainText: false,
                        cleanPastedHTML: true
                    }
                });

            spyOn(document, 'queryCommandSupported').and.returnValue(false);

            inlineTests.forEach(function (test) {
                this.el.innerHTML = 'Before&nbsp;<span id="editor-inner">&nbsp;</span>&nbsp;after.';

                selectElementContents(document.getElementById('editor-inner'));

                editor.cleanPaste(test.paste);

                // Firefox and IE: doing an insertHTML while this <span> is selected results in the html being inserted inside of the span
                // Firefox replace the &nbsp; other either side of the <span> with a space
                // Webkit: doing an insertHTML while this <span> is selected results in the span being replaced completely
                expect(this.el.innerHTML).toMatch(new RegExp('^Before(&nbsp;|\\s)(<span id="editor-inner">)?' + test.output + '(</span>)?(&nbsp;|\\s)after\\.$'));
            }.bind(this));
        });

        it('should respect custom replacments when passed during instantiation', function () {
            var editor = this.newMediumEditor('.editor', {
                paste: {
                    forcePlainText: false,
                    cleanPastedHTML: true,
                    cleanReplacements: [[new RegExp(/<label>/gi), '<sub>'], [new RegExp(/<\/label>/gi), '</sub>']]
                }
            });

            this.el.innerHTML = 'Before&nbsp;<span id="editor-inner">&nbsp;</span>&nbsp;after.';
            selectElementContents(document.getElementById('editor-inner'));

            editor.cleanPaste('<label>div one</label><label>div two</label>');

            expect(this.el.innerHTML).toMatch(new RegExp('^Before(&nbsp;|\\s)(<span id="editor-inner">)?<sub>div one</sub><sub>div two</sub>(</span>)?(&nbsp;|\\s)after\\.$'));
        });
    });

    describe('using pasteHTML', function () {
        it('should remove certain attributes and tags by default', function () {
            var editor = this.newMediumEditor('.editor');
            selectElementContents(this.el.firstChild);
            editor.pasteHTML('<p class="some-class" style="font-weight: bold" dir="ltr"><meta name="description" content="test" />test</p>');
            expect(editor.elements[0].innerHTML).toBe('<p>test</p>');
        });

        it('should accept a list of attrs to clean up', function () {
            var editor = this.newMediumEditor('.editor');
            selectElementContents(this.el.firstChild);
            editor.pasteHTML(
                '<table class="medium-editor-table" dir="ltr" style="border: 1px solid red;"><tbody><tr><td>test</td></tr></tbody></table>',
                { cleanAttrs: ['style', 'dir'] }
            );
            expect(editor.elements[0].innerHTML).toBe('<table class="medium-editor-table"><tbody><tr><td>test</td></tr></tbody></table>');
        });

        it('should accept a list of tags to clean up', function () {
            var editor = this.newMediumEditor('.editor');
            selectElementContents(this.el.firstChild);
            editor.pasteHTML(
                '<div><i>test</i><meta name="description" content="test" /><b>test</b></div>',
                { cleanTags: ['meta', 'b'] }
            );
            expect(editor.elements[0].innerHTML).toBe('<div><i>test</i></div>');
        });

        it('should respect custom clean up options passed during instantiation', function () {
            var editor = this.newMediumEditor('.editor', {
                paste: {
                    cleanAttrs: ['style', 'dir'],
                    cleanTags: ['meta', 'b']
                }
            });
            selectElementContents(this.el.firstChild);
            editor.pasteHTML(
                '<table class="medium-editor-table" dir="ltr" style="border: 1px solid red;"><tbody><tr><td>test</td></tr></tbody></table>' +
                '<div><i>test</i><meta name="description" content="test" /><b>test</b></div>'
            );
            expect(editor.elements[0].innerHTML).toBe(
                '<table class="medium-editor-table"><tbody><tr><td>test</td></tr></tbody></table>' +
                '<div><i>test</i></div>'
            );
        });
    });

    describe('text with/without linebreaks', function () {
        it('should be handled consistantly', function () {
            var range, i,
                editorEl = this.el,
                sel = window.getSelection(),
                editor = this.newMediumEditor('.editor', {
                    delay: 200,
                    disableReturn: false
                }),
                pasteHandler = editor.getExtensionByName('paste'),

                // mock event with clipboardData API
                // test requires creating a function, so can't loop or jslint balks
                evt = {
                    pasteText: null,
                    preventDefault: function () {
                        return;
                    },
                    clipboardData: {
                        getData: function () {
                            // do we need to return different results for the different types? text/plain, text/html
                            return this.pasteText;
                        }
                    }
                };

            for (i = 0; i < textTests.length; i += 1) {
                editorEl.innerHTML = '<div id="editor-inner">&nbsp</div>';

                range = document.createRange();
                range.selectNodeContents(editorEl.firstChild);
                sel.removeAllRanges();
                sel.addRange(range);

                evt.clipboardData.pasteText = textTests[i].paste;
                pasteHandler.handlePaste(evt, editorEl);
                jasmine.clock().tick(100);
                expect(editorEl.innerHTML).toEqual(textTests[i].output);
            }
        });
    });

    describe('using custom paste handler', function () {
        it('should be overrideable via paste options', function () {
            var origInit = spyOn(MediumEditor.extensions.paste.prototype, 'init'),
                newInit = jasmine.createSpy('spy'),
                editor = this.newMediumEditor('.editor', {
                    paste: {
                        forcePlainText: false,
                        cleanPastedHTML: true,
                        init: newInit
                    }
                });
            expect(origInit).not.toHaveBeenCalled();
            expect(newInit).toHaveBeenCalled();

            selectElementContents(this.el.firstChild);
            editor.cleanPaste('<p>One\nTwo\n</p>\n\n<p>Three Four</p>');
            expect(editor.elements[0].innerHTML).toBe('<p>One Two </p><p>Three Four</p>');
        });

        it('should be overrideable via custom extension', function () {
            var origInit = spyOn(MediumEditor.extensions.paste.prototype, 'init'),
                newInit = jasmine.createSpy('spy'),
                origPasteHTML = spyOn(MediumEditor.extensions.paste.prototype, 'pasteHTML'),
                newPasteHTML = jasmine.createSpy('spy'),
                customPasteHandler = {
                    name: 'paste',
                    init: newInit,
                    pasteHTML: newPasteHTML
                },
                editor = this.newMediumEditor('.editor', {
                    extensions: {
                        paste: customPasteHandler
                    }
                }),
                testString = '<p>test</p>';

            expect(origInit).not.toHaveBeenCalled();
            expect(newInit).toHaveBeenCalled();
            expect(editor.getExtensionByName('paste')).toBe(customPasteHandler);

            editor.pasteHTML(testString);
            expect(origPasteHTML).not.toHaveBeenCalled();
            expect(newPasteHTML).toHaveBeenCalledWith(testString, undefined);
        });
    });
});
