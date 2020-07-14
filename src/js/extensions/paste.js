(function () {
    'use strict';

    /* Helpers and internal variables that don't need to be members of actual paste handler */

    var pasteBinDefaultContent = '%ME_PASTEBIN%',
        lastRange = null,
        keyboardPasteEditable = null,
        stopProp = function (event) {
            event.stopPropagation();
        };

    /*jslint regexp: true*/
    /**
        jslint does not allow character negation, because the negation
        will not match any unicode characters. In the regexes in this
        block, negation is used specifically to match the end of an html
        tag, and in fact unicode characters *should* be allowed.
    */
    function createReplacements() {
        return [
            // Remove anything but the contents within the BODY element
            [new RegExp(/^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/g), ''],

            // cleanup comments added by Chrome when pasting html
            [new RegExp(/<!--StartFragment-->|<!--EndFragment-->/g), ''],

            // Trailing BR elements
            [new RegExp(/<br>$/i), ''],

            // replace two bogus tags that begin pastes from google docs
            [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ''],
            [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ''],

             // un-html spaces and newlines inserted by OS X
            [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
            [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

            // replace google docs italics+bold with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*(font-style:italic;font-weight:(bold|700)|font-weight:(bold|700);font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

            // replace google docs italics with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

            //[replace google docs bolds with a span to be replaced once the html is inserted
            [new RegExp(/<span[^>]*font-weight:(bold|700)[^>]*>/gi), '<span class="replace-with bold">'],

             // replace manually entered b/i/a tags with real ones
            [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

             // replace manually a tags with real ones, converting smart-quotes from google docs
            [new RegExp(/&lt;a(?:(?!href).)+href=(?:&quot;|&rdquo;|&ldquo;|"|“|”)(((?!&quot;|&rdquo;|&ldquo;|"|“|”).)*)(?:&quot;|&rdquo;|&ldquo;|"|“|”)(?:(?!&gt;).)*&gt;/gi), '<a href="$1">'],

            // Newlines between paragraphs in html have no syntactic value,
            // but then have a tendency to accidentally become additional paragraphs down the line
            [new RegExp(/<\/p>\n+/gi), '</p>'],
            [new RegExp(/\n+<p/gi), '<p'],

            // Microsoft Word makes these odd tags, like <o:p></o:p>
            [new RegExp(/<\/?o:[a-z]*>/gi), ''],

            // Microsoft Word adds some special elements around list items
            [new RegExp(/<!\[if !supportLists\]>(((?!<!).)*)<!\[endif]\>/gi), '$1']
        ];
    }
    /*jslint regexp: false*/

    /**
     * Gets various content types out of the Clipboard API. It will also get the
     * plain text using older IE and WebKit API.
     *
     * @param {event} event Event fired on paste.
     * @param {win} reference to window
     * @param {doc} reference to document
     * @return {Object} Object with mime types and data for those mime types.
     */
    function getClipboardContent(event, win, doc) {
        var dataTransfer = event.clipboardData || win.clipboardData || doc.dataTransfer,
            data = {};

        if (!dataTransfer) {
            return data;
        }

        // Use old WebKit/IE API
        if (dataTransfer.getData) {
            var legacyText = dataTransfer.getData('Text');
            if (legacyText && legacyText.length > 0) {
                data['text/plain'] = legacyText;
            }
        }

        if (dataTransfer.types) {
            for (var i = 0; i < dataTransfer.types.length; i++) {
                var contentType = dataTransfer.types[i];
                data[contentType] = dataTransfer.getData(contentType);
            }
        }

        return data;
    }

    var PasteHandler = MediumEditor.Extension.extend({
        /* Paste Options */

        /* forcePlainText: [boolean]
         * Forces pasting as plain text.
         */
        forcePlainText: true,

        /* cleanPastedHTML: [boolean]
         * cleans pasted content from different sources, like google docs etc.
         */
        cleanPastedHTML: false,

        /* preCleanReplacements: [Array]
         * custom pairs (2 element arrays) of RegExp and replacement text to use during past when
         * __forcePlainText__ or __cleanPastedHTML__ are `true` OR when calling `cleanPaste(text)` helper method.
         * These replacements are executed before any medium editor defined replacements.
         */
        preCleanReplacements: [],

        /* cleanReplacements: [Array]
         * custom pairs (2 element arrays) of RegExp and replacement text to use during paste when
         * __forcePlainText__ or __cleanPastedHTML__ are `true` OR when calling `cleanPaste(text)` helper method.
         * These replacements are executed after any medium editor defined replacements.
         */
        cleanReplacements: [],

        /* cleanAttrs:: [Array]
         * list of element attributes to remove during paste when __cleanPastedHTML__ is `true` or when
         * calling `cleanPaste(text)` or `pasteHTML(html, options)` helper methods.
         */
        cleanAttrs: ['class', 'style', 'dir'],

        /* cleanTags: [Array]
         * list of element tag names to remove during paste when __cleanPastedHTML__ is `true` or when
         * calling `cleanPaste(text)` or `pasteHTML(html, options)` helper methods.
         */
        cleanTags: ['meta'],

        /* unwrapTags: [Array]
         * list of element tag names to unwrap (remove the element tag but retain its child elements)
         * during paste when __cleanPastedHTML__ is `true` or when
         * calling `cleanPaste(text)` or `pasteHTML(html, options)` helper methods.
         */
        unwrapTags: [],

        init: function () {
            MediumEditor.Extension.prototype.init.apply(this, arguments);

            if (this.forcePlainText || this.cleanPastedHTML) {
                this.subscribe('editableKeydown', this.handleKeydown.bind(this));
                // We need access to the full event data in paste
                // so we can't use the editablePaste event here
                this.getEditorElements().forEach(function (element) {
                    this.on(element, 'paste', this.handlePaste.bind(this));
                }, this);
                this.subscribe('addElement', this.handleAddElement.bind(this));
            }
        },

        handleAddElement: function (event, editable) {
            this.on(editable, 'paste', this.handlePaste.bind(this));
        },

        destroy: function () {
            // Make sure pastebin is destroyed in case it's still around for some reason
            if (this.forcePlainText || this.cleanPastedHTML) {
                this.removePasteBin();
            }
        },

        handlePaste: function (event, editable) {
            if (event.defaultPrevented) {
                return;
            }

            var clipboardContent = getClipboardContent(event, this.window, this.document),
                pastedHTML = clipboardContent['text/html'],
                pastedPlain = clipboardContent['text/plain'];

            if (this.window.clipboardData && event.clipboardData === undefined && !pastedHTML) {
                // If window.clipboardData exists, but event.clipboardData doesn't exist,
                // we're probably in IE. IE only has two possibilities for clipboard
                // data format: 'Text' and 'URL'.
                //
                // For IE, we'll fallback to 'Text' for text/html
                pastedHTML = pastedPlain;
            }

            if (pastedHTML || pastedPlain) {
                event.preventDefault();

                this.doPaste(pastedHTML, pastedPlain, editable);
            }
        },

        doPaste: function (pastedHTML, pastedPlain, editable) {
            var paragraphs,
                html = '',
                p;

            if (this.cleanPastedHTML && pastedHTML) {
                return this.cleanPaste(pastedHTML);
            }

            if (!pastedPlain) {
                return;
            }

            if (!(this.getEditorOption('disableReturn') || (editable && editable.getAttribute('data-disable-return')))) {
                paragraphs = pastedPlain.split(/[\r\n]+/g);
                // If there are no \r\n in data, don't wrap in <p>
                if (paragraphs.length > 1) {
                    for (p = 0; p < paragraphs.length; p += 1) {
                        if (paragraphs[p] !== '') {
                            html += '<p>' + MediumEditor.util.htmlEntities(paragraphs[p]) + '</p>';
                        }
                    }
                } else {
                    html = MediumEditor.util.htmlEntities(paragraphs[0]);
                }
            } else {
                html = MediumEditor.util.htmlEntities(pastedPlain);
            }
            MediumEditor.util.insertHTMLCommand(this.document, html);
        },

        handlePasteBinPaste: function (event) {
            if (event.defaultPrevented) {
                this.removePasteBin();
                return;
            }

            var clipboardContent = getClipboardContent(event, this.window, this.document),
                pastedHTML = clipboardContent['text/html'],
                pastedPlain = clipboardContent['text/plain'],
                editable = keyboardPasteEditable;

            // If we have valid html already, or we're not in cleanPastedHTML mode
            // we can ignore the paste bin and just paste now
            if (!this.cleanPastedHTML || pastedHTML) {
                event.preventDefault();
                this.removePasteBin();
                this.doPaste(pastedHTML, pastedPlain, editable);

                // The event handling code listens for paste on the editable element
                // in order to trigger the editablePaste event.  Since this paste event
                // is happening on the pastebin, the event handling code never knows about it
                // So, we have to trigger editablePaste manually
                this.trigger('editablePaste', { currentTarget: editable, target: editable }, editable);
                return;
            }

            // We need to look at the paste bin, so do a setTimeout to let the paste
            // fall through into the paste bin
            setTimeout(function () {
                // Only look for HTML if we're in cleanPastedHTML mode
                if (this.cleanPastedHTML) {
                    // If clipboard didn't have HTML, try the paste bin
                    pastedHTML = this.getPasteBinHtml();
                }

                // If we needed the paste bin, we're done with it now, remove it
                this.removePasteBin();

                // Handle the paste with the html from the paste bin
                this.doPaste(pastedHTML, pastedPlain, editable);

                // The event handling code listens for paste on the editable element
                // in order to trigger the editablePaste event.  Since this paste event
                // is happening on the pastebin, the event handling code never knows about it
                // So, we have to trigger editablePaste manually
                this.trigger('editablePaste', { currentTarget: editable, target: editable }, editable);
            }.bind(this), 0);
        },

        handleKeydown: function (event, editable) {
            // if it's not Ctrl+V, do nothing
            if (!(MediumEditor.util.isKey(event, MediumEditor.util.keyCode.V) && MediumEditor.util.isMetaCtrlKey(event))) {
                return;
            }

            event.stopImmediatePropagation();

            this.removePasteBin();
            this.createPasteBin(editable);
        },

        createPasteBin: function (editable) {
            var rects,
                range = MediumEditor.selection.getSelectionRange(this.document),
                top = this.window.pageYOffset;

            keyboardPasteEditable = editable;

            if (range) {
                rects = range.getClientRects();

                // on empty line, rects is empty so we grab information from the first container of the range
                if (rects.length) {
                    top += rects[0].top;
                } else if (range.startContainer.getBoundingClientRect !== undefined) {
                    top += range.startContainer.getBoundingClientRect().top;
                } else {
                    top += range.getBoundingClientRect().top;
                }
            }

            lastRange = range;

            var pasteBinElm = this.document.createElement('div');
            pasteBinElm.id = this.pasteBinId = 'medium-editor-pastebin-' + (+Date.now());
            pasteBinElm.setAttribute('style', 'border: 1px red solid; position: absolute; top: ' + top + 'px; width: 10px; height: 10px; overflow: hidden; opacity: 0');
            pasteBinElm.setAttribute('contentEditable', true);
            pasteBinElm.innerHTML = pasteBinDefaultContent;

            this.document.body.appendChild(pasteBinElm);

            // avoid .focus() to stop other event (actually the paste event)
            this.on(pasteBinElm, 'focus', stopProp);
            this.on(pasteBinElm, 'focusin', stopProp);
            this.on(pasteBinElm, 'focusout', stopProp);

            pasteBinElm.focus();

            MediumEditor.selection.selectNode(pasteBinElm, this.document);

            if (!this.boundHandlePaste) {
                this.boundHandlePaste = this.handlePasteBinPaste.bind(this);
            }

            this.on(pasteBinElm, 'paste', this.boundHandlePaste);
        },

        removePasteBin: function () {
            if (null !== lastRange) {
                MediumEditor.selection.selectRange(this.document, lastRange);
                lastRange = null;
            }

            if (null !== keyboardPasteEditable) {
                keyboardPasteEditable = null;
            }

            var pasteBinElm = this.getPasteBin();
            if (!pasteBinElm) {
                return;
            }

            if (pasteBinElm) {
                this.off(pasteBinElm, 'focus', stopProp);
                this.off(pasteBinElm, 'focusin', stopProp);
                this.off(pasteBinElm, 'focusout', stopProp);
                this.off(pasteBinElm, 'paste', this.boundHandlePaste);
                pasteBinElm.parentElement.removeChild(pasteBinElm);
            }
        },

        getPasteBin: function () {
            return this.document.getElementById(this.pasteBinId);
        },

        getPasteBinHtml: function () {
            var pasteBinElm = this.getPasteBin();

            if (!pasteBinElm) {
                return false;
            }

            // WebKit has a nice bug where it clones the paste bin if you paste from for example notepad
            // so we need to force plain text mode in this case
            if (pasteBinElm.firstChild && pasteBinElm.firstChild.id === 'mcepastebin') {
                return false;
            }

            var pasteBinHtml = pasteBinElm.innerHTML;

            // If paste bin is empty try using plain text mode
            // since that is better than nothing right
            if (!pasteBinHtml || pasteBinHtml === pasteBinDefaultContent) {
                return false;
            }

            return pasteBinHtml;
        },

        cleanPaste: function (text) {
            var i, elList, tmp, workEl,
                multiline = /<p|<br|<div/.test(text),
                replacements = [].concat(
                    this.preCleanReplacements || [],
                    createReplacements(),
                    this.cleanReplacements || []);

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (!multiline) {
                return this.pasteHTML(text);
            }

            // create a temporary div to cleanup block elements
            tmp = this.document.createElement('div');

            // double br's aren't converted to p tags, but we want paragraphs.
            tmp.innerHTML = '<p>' + text.split('<br><br>').join('</p><p>') + '</p>';

            // block element cleanup
            elList = tmp.querySelectorAll('a,p,div,br');
            for (i = 0; i < elList.length; i += 1) {
                workEl = elList[i];

                // Microsoft Word replaces some spaces with newlines.
                // While newlines between block elements are meaningless, newlines within
                // elements are sometimes actually spaces.
                workEl.innerHTML = workEl.innerHTML.replace(/\n/gi, ' ');

                switch (workEl.nodeName.toLowerCase()) {
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                }
            }

            this.pasteHTML(tmp.innerHTML);
        },

        pasteHTML: function (html, options) {
            options = MediumEditor.util.defaults({}, options, {
                cleanAttrs: this.cleanAttrs,
                cleanTags: this.cleanTags,
                unwrapTags: this.unwrapTags
            });

            var elList, workEl, i, fragmentBody, pasteBlock = this.document.createDocumentFragment();

            pasteBlock.appendChild(this.document.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {
                workEl = elList[i];

                if ('a' === workEl.nodeName.toLowerCase() && this.getEditorOption('targetBlank')) {
                    MediumEditor.util.setTargetBlank(workEl);
                }

                MediumEditor.util.cleanupAttrs(workEl, options.cleanAttrs);
                MediumEditor.util.cleanupTags(workEl, options.cleanTags);
                MediumEditor.util.unwrapTags(workEl, options.unwrapTags);
            }

            MediumEditor.util.insertHTMLCommand(this.document, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },

        // TODO (6.0): Make this an internal helper instead of member of paste handler
        isCommonBlock: function (el) {
            return (el && (el.nodeName.toLowerCase() === 'p' || el.nodeName.toLowerCase() === 'div'));
        },

        // TODO (6.0): Make this an internal helper instead of member of paste handler
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent) && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },

        // TODO (6.0): Make this an internal helper instead of member of paste handler
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {
                // remove stray br's following common block elements
                this.removeWithParent(el);
            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {
                // remove br's just inside open or close tags of a div/p
                this.removeWithParent(el);
            } else if (el.parentNode && el.parentNode.childElementCount === 1 && el.parentNode.textContent === '') {
                // and br's that are the only child of elements other than div/p
                this.removeWithParent(el);
            }
        },

        // TODO (6.0): Make this an internal helper instead of member of paste handler
        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el);
                }
            }
        },

        // TODO (6.0): Make this an internal helper instead of member of paste handler
        cleanupSpans: function (containerEl) {
            var i,
                el,
                newEl,
                spans = containerEl.querySelectorAll('.replace-with'),
                isCEF = function (el) {
                    return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
                };

            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];
                newEl = this.document.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {
                    // add an i tag as well if this has both italics and bold
                    newEl.innerHTML = '<i>' + el.innerHTML + '</i>';
                } else {
                    newEl.innerHTML = el.innerHTML;
                }
                el.parentNode.replaceChild(newEl, el);
            }

            spans = containerEl.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {
                el = spans[i];

                // bail if span is in contenteditable = false
                if (MediumEditor.util.traverseUp(el, isCEF)) {
                    return false;
                }

                // remove empty spans, replace others with their contents
                MediumEditor.util.unwrap(el, this.document);
            }
        }
    });

    MediumEditor.extensions.paste = PasteHandler;
}());
