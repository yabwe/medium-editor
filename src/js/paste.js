/*global mediumEditorUtil, meSelection*/
var pasteHandler;

(function (window, document) {
    'use strict';
    /*jslint regexp: true*/
    /*
        jslint does not allow character negation, because the negation
        will not match any unicode characters. In the regexes in this
        block, negation is used specifically to match the end of an html
        tag, and in fact unicode characters *should* be allowed.
    */
    function createReplacements() {
        return [

            // replace two bogus tags that begin pastes from google docs
            [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
            [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

             // un-html spaces and newlines inserted by OS X
            [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
            [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

            // replace google docs italics+bold with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

            // replace google docs italics with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

            //[replace google docs bolds with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

             // replace manually entered b/i/a tags with real ones
            [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

             // replace manually a tags with real ones, converting smart-quotes from google docs
            [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

        ];
    }
    /*jslint regexp: false*/

    pasteHandler = {
        handlePaste: function (element, evt, options) {
            var paragraphs,
                html = '',
                p,
                dataFormatHTML = 'text/html',
                dataFormatPlain = 'text/plain';

            element.classList.remove('medium-editor-placeholder');
            if (!options.forcePlainText && !options.cleanPastedHTML) {
                return element;
            }

            if (options.contentWindow.clipboardData && evt.clipboardData === undefined) {
                evt.clipboardData = options.contentWindow.clipboardData;
                // If window.clipboardData exists, but e.clipboardData doesn't exist,
                // we're probably in IE. IE only has two possibilities for clipboard
                // data format: 'Text' and 'URL'.
                //
                // Of the two, we want 'Text':
                dataFormatHTML = 'Text';
                dataFormatPlain = 'Text';
            }

            if (evt.clipboardData && evt.clipboardData.getData && !evt.defaultPrevented) {
                evt.preventDefault();

                if (options.cleanPastedHTML && evt.clipboardData.getData(dataFormatHTML)) {
                    return this.cleanPaste(evt.clipboardData.getData(dataFormatHTML), options);
                }
                if (!(options.disableReturn || element.getAttribute('data-disable-return'))) {
                    paragraphs = evt.clipboardData.getData(dataFormatPlain).split(/[\r\n]/g);
                    for (p = 0; p < paragraphs.length; p += 1) {
                        if (paragraphs[p] !== '') {
                            html += '<p>' + mediumEditorUtil.htmlEntities(paragraphs[p]) + '</p>';
                        }
                    }
                    mediumEditorUtil.insertHTMLCommand(options.ownerDocument, html);
                } else {
                    html = mediumEditorUtil.htmlEntities(evt.clipboardData.getData(dataFormatPlain));
                    mediumEditorUtil.insertHTMLCommand(options.ownerDocument, html);
                }
            }
        },

        cleanPaste: function (text, options) {
            var i, elList, workEl,
                el = meSelection.getSelectionElement(options.contentWindow),
                multiline = /<p|<br|<div/.test(text),
                replacements = createReplacements();

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {
                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>', options.ownerDocument);

                try {
                    options.ownerDocument.execCommand('insertText', false, "\n");
                } catch (ignore) { }

                // block element cleanup
                elList = el.querySelectorAll('a,p,div,br');
                for (i = 0; i < elList.length; i += 1) {
                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'a':
                        if (options.targetBlank) {
                            mediumEditorUtil.setTargetBlank(workEl);
                        }
                        break;
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }
                }
            } else {
                this.pasteHTML(text, options.ownerDocument);
            }
        },

        pasteHTML: function (html, ownerDocument) {
            var elList, workEl, i, fragmentBody, pasteBlock = ownerDocument.createDocumentFragment();

            pasteBlock.appendChild(ownerDocument.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody, ownerDocument);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {
                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }
            }
            mediumEditorUtil.insertHTMLCommand(ownerDocument, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {
                // remove stray br's following common block elements
                el.parentNode.removeChild(el);
            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {
                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);
            } else if (el.parentNode.childElementCount === 1 && el.parentNode.textContent === '') {
                // and br's that are the only child of a div/p
                this.removeWithParent(el);
            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el, ownerDocument) {
            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with'),
                isCEF = function (el) {
                    return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
                };

            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];
                new_el = ownerDocument.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {
                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';
                } else {
                    new_el.innerHTML = el.innerHTML;
                }
                el.parentNode.replaceChild(new_el, el);
            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];

                // bail if span is in contenteditable = false
                if (mediumEditorUtil.traverseUp(el, isCEF)) {
                    return false;
                }

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(ownerDocument.createTextNode(el.textContent), el);
                }
            }
        }
    };
}(window, document));
