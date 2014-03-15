/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent, console, tearDown*/

describe('Clean pasted HTML', function () {
    'use strict';

    beforeEach(function () {
        jasmine.clock().install();
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.id = 'paste-editor';
        this.el.innerHTML = 'hhh';
        document.body.appendChild(this.el);
    });

    afterEach(function () {
        tearDown(this.el);
        jasmine.clock().uninstall();
    });

    it('Multi-line rich-text pastes', function () {
        var i, range,
            editorEl = this.el,
            sel = window.getSelection(),
            editor = new MediumEditor('.editor', {
                delay: 200,
                forcePlainText: false,
                cleanPastedHTML: true
            }),
            tests = [
                {
                    source: 'Google docs',
                    paste: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b1bb8bfe-f54c-2e1f-72e2-4c7608d2be70"><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold</span></p><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Italic</span></p><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold and Italic</span></p><br><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"></span><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">A </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="text-decoration:none;"><span style="font-size:15px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">link</span></a><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">.</span></p></b><br class="Apple-interchange-newline">',
                    output: '<p><b>Bold</b></p><p><i>Italic</i></p><p><b><i>Bold and Italic</i></b></p><p>A <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">link</a>.</p>'
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
                }
            ];

        for (i = 0; i < tests.length; i += 1) {

            // move caret to editor
            editorEl.innerHTML = '<span id="editor-inner">&nbsp</span>';

            range = document.createRange();
            range.selectNodeContents(document.getElementById('editor-inner'));
            sel.removeAllRanges();
            sel.addRange(range);

            editor.cleanPaste(tests[i].paste);
            jasmine.clock().tick(100);
            expect(editorEl.innerHTML).toEqual(tests[i].output);
        }

    });

    it('Inline rich-text pastes', function () {
        var i, range,
            editorEl = this.el,
            sel = window.getSelection(),
            editor = new MediumEditor('.editor', {
                delay: 200,
                forcePlainText: false,
                cleanPastedHTML: true
            }),
            tests = [
                {
                    source: 'Google docs',
                    paste: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-2f060cc5-1888-a396-af95-bfb31478c7ae"><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold,</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic,</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:bold;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold and italic</span><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">, and </span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="text-decoration:none;"><span style="font-size:15px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">a link</span></a><span style="font-size:15px;font-family:Arial;color:#000000;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">.</span></b>',
                    output: '<b>Bold,</b> <i>italic,</i> <b><i>bold and italic</i></b>, and <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">a link</a>.'
                },
                {
                    source: 'Inside editor',
                    paste: '<meta charset=\'utf-8\'><b style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">Bold,</b><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;"> </span><i style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">italic,</i><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;"><span class="Apple-converted-space"> </span></span><b style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"><i>bold and italic</i></b><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;">, and<span class="Apple-converted-space"> </span></span><a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)" style="color: black; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;">a link</a><span style="color: rgb(0, 0, 0); font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 22.22222328186035px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 30px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px; display: inline !important; float: none;">.</span>',
                    output: '<b>Bold,</b> <i>italic,</i> <b><i>bold and italic</i></b>, and <a href="http://en.wikipedia.org/wiki/Link_(The_Legend_of_Zelda)">a link</a>.'
                }
            ];

        for (i = 0; i < tests.length; i += 1) {

            // move caret to editor
            editorEl.innerHTML = 'Before <span id="editor-inner">&nbsp</span> after.';

            range = document.createRange();
            range.selectNodeContents(document.getElementById('editor-inner'));
            sel.removeAllRanges();
            sel.addRange(range);

            editor.cleanPaste(tests[i].paste);
            jasmine.clock().tick(100);
            expect(editorEl.innerHTML).toEqual('Before&nbsp;' + tests[i].output + '&nbsp;after.');
        }

    });
});
