/*global Extension, Util */

var AutoLink,
    KNOWN_TLDS_FRAGMENT,
    LINK_REGEXP_TEXT;

KNOWN_TLDS_FRAGMENT = 'com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|' +
    'xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|' +
    'bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|' +
    'fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|' +
    'is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|' +
    'mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|' +
    'pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|' +
    'tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw';
LINK_REGEXP_TEXT =
    '(' +
    // Version of Gruber URL Regexp optimized for JS: http://stackoverflow.com/a/17733640
    '((?:(https?://|ftps?://|nntp://)|www\\d{0,3}[.]|[a-z0-9.\\-]+[.](' + KNOWN_TLDS_FRAGMENT + ')\\\/)\\S+(?:[^\\s`!\\[\\]{};:\'\".,?\u00AB\u00BB\u201C\u201D\u2018\u2019]))' +
    // Addition to above Regexp to support bare domains/one level subdomains with common non-i18n TLDs and without www prefix:
    ')|(([a-z0-9\\-]+\\.)?[a-z0-9\\-]+\\.(' + KNOWN_TLDS_FRAGMENT + '))';

(function () {
    'use strict';

    var KNOWN_TLDS_REGEXP = new RegExp('^(' + KNOWN_TLDS_FRAGMENT + ')$', 'i');

    function nodeIsNotInsideAnchorTag(node) {
        return !Util.getClosestTag(node, 'a');
    }

    AutoLink = Extension.extend({
        init: function () {
            this.disableEventHandling = false;
            this.subscribe('editableKeypress', this.onKeypress.bind(this));
            this.subscribe('editableBlur', this.onBlur.bind(this));
            // MS IE has it's own auto-URL detect feature but ours is better in some ways. Be consistent.
            this.document.execCommand('AutoUrlDetect', false, false);
        },

        destroy: function () {
            // Turn AutoUrlDetect back on
            if (this.document.queryCommandSupported('AutoUrlDetect')) {
                this.document.execCommand('AutoUrlDetect', false, true);
            }
        },

        onBlur: function (blurEvent, editable) {
            this.performLinking(editable);
        },

        onKeypress: function (keyPressEvent) {
            if (this.disableEventHandling) {
                return;
            }

            if (Util.isKey(keyPressEvent, [Util.keyCode.SPACE, Util.keyCode.ENTER])) {
                clearTimeout(this.performLinkingTimeout);
                // Saving/restoring the selection in the middle of a keypress doesn't work well...
                this.performLinkingTimeout = setTimeout(function () {
                    try {
                        var sel = this.base.exportSelection();
                        if (this.performLinking(keyPressEvent.target)) {
                            // pass true for favorLaterSelectionAnchor - this is needed for links at the end of a
                            // paragraph in MS IE, or MS IE causes the link to be deleted right after adding it.
                            this.base.importSelection(sel, true);
                        }
                    } catch (e) {
                        if (window.console) {
                            window.console.error('Failed to perform linking', e);
                        }
                        this.disableEventHandling = true;
                    }
                }.bind(this), 0);
            }
        },

        performLinking: function (contenteditable) {
            // Perform linking on a paragraph level basis as otherwise the detection can wrongly find the end
            // of one paragraph and the beginning of another paragraph to constitute a link, such as a paragraph ending
            // "link." and the next paragraph beginning with "my" is interpreted into "link.my" and the code tries to create
            // a link across paragraphs - which doesn't work and is terrible.
            // (Medium deletes the spaces/returns between P tags so the textContent ends up without paragraph spacing)
            var paragraphs = contenteditable.querySelectorAll('p'),
                documentModified = false;
            if (paragraphs.length === 0) {
                paragraphs = [contenteditable];
            }
            for (var i = 0; i < paragraphs.length; i++) {
                documentModified = this.removeObsoleteAutoLinkSpans(paragraphs[i]) || documentModified;
                documentModified = this.performLinkingWithinElement(paragraphs[i]) || documentModified;
            }
            return documentModified;
        },

        splitStartNodeIfNeeded: function (currentNode, matchStartIndex, currentTextIndex) {
            if (matchStartIndex !== currentTextIndex) {
                return currentNode.splitText(matchStartIndex - currentTextIndex);
            }
            return null;
        },

        splitEndNodeIfNeeded: function (currentNode, newNode, matchEndIndex, currentTextIndex) {
            var textIndexOfEndOfFarthestNode,
                endSplitPoint;
            textIndexOfEndOfFarthestNode = currentTextIndex + (newNode || currentNode).nodeValue.length +
                    (newNode ? currentNode.nodeValue.length : 0) -
                    1;
            endSplitPoint = (newNode || currentNode).nodeValue.length -
                    (textIndexOfEndOfFarthestNode + 1 - matchEndIndex);
            if (textIndexOfEndOfFarthestNode >= matchEndIndex &&
                    currentTextIndex !== textIndexOfEndOfFarthestNode &&
                    endSplitPoint !== 0) {
                (newNode || currentNode).splitText(endSplitPoint);
            }
        },

        removeObsoleteAutoLinkSpans: function (element) {
            var spans = element.querySelectorAll('span[data-auto-link="true"]'),
                documentModified = false;

            for (var i = 0; i < spans.length; i++) {
                var textContent = spans[i].textContent;
                if (textContent.indexOf('://') === -1) {
                    textContent = Util.ensureUrlHasProtocol(textContent);
                }
                if (spans[i].getAttribute('data-href') !== textContent && nodeIsNotInsideAnchorTag(spans[i])) {
                    documentModified = true;
                    // Some editing has happened to the span, so just remove it entirely. The user can put it back
                    // around just the href content if they need to prevent it from linking
                    while (spans[i].childNodes.length > 0) {
                        spans[i].parentNode.insertBefore(spans[i].firstChild, spans[i]);
                    }
                    spans[i].parentNode.removeChild(spans[i]);
                }
            }
            return documentModified;
        },

        performLinkingWithinElement: function (element) {
            var matches = this.findLinkableText(element),
                linkCreated = false;

            for (var matchIndex = 0; matchIndex < matches.length; matchIndex++) {
                linkCreated = this.createLink(this.findOrCreateMatchingTextNodes(element, matches[matchIndex]),
                    matches[matchIndex].href) || linkCreated;
            }
            return linkCreated;
        },

        findLinkableText: function (contenteditable) {
            var linkRegExp = new RegExp(LINK_REGEXP_TEXT, 'gi'),
                whitespaceChars = [' ', '\t', '\n', '\r', '\u00A0', '\u2000', '\u2001', '\u2002', '\u2003',
                                    '\u2028', '\u2029'],
                textContent = contenteditable.textContent,
                match = null,
                matches = [];

            while ((match = linkRegExp.exec(textContent)) !== null) {
                var matchOk = true,
                    matchEnd = match.index + match[0].length;
                // If the regexp detected something as a link that has text immediately preceding/following it, bail out.
                matchOk = (match.index === 0 || whitespaceChars.indexOf(textContent[match.index - 1]) !== -1) &&
                    (matchEnd === textContent.length || whitespaceChars.indexOf(textContent[matchEnd]) !== -1);
                // If the regexp detected a bare domain that doesn't use one of our expected TLDs, bail out.
                matchOk = matchOk && (match[0].indexOf('/') !== -1 ||
                    KNOWN_TLDS_REGEXP.test(match[0].split('.').pop().split('?').shift()));

                if (matchOk) {
                    matches.push({
                        href: match[0],
                        start: match.index,
                        end: matchEnd
                    });
                }
            }
            return matches;
        },

        findOrCreateMatchingTextNodes: function (element, match) {
            var treeWalker = this.document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false),
                matchedNodes = [],
                currentTextIndex = 0,
                startReached = false,
                currentNode = null,
                newNode = null;

            while ((currentNode = treeWalker.nextNode()) !== null) {
                if (!startReached && match.start < (currentTextIndex + currentNode.nodeValue.length)) {
                    startReached = true;
                    newNode = this.splitStartNodeIfNeeded(currentNode, match.start, currentTextIndex);
                }
                if (startReached) {
                    this.splitEndNodeIfNeeded(currentNode, newNode, match.end, currentTextIndex);
                }
                if (startReached && currentTextIndex === match.end) {
                    break; // Found the node(s) corresponding to the link. Break out and move on to the next.
                } else if (startReached && currentTextIndex > (match.end + 1)) {
                    throw new Error('PerformLinking overshot the target!'); // should never happen...
                }

                if (startReached) {
                    matchedNodes.push(newNode || currentNode);
                }

                currentTextIndex += currentNode.nodeValue.length;
                if (newNode !== null) {
                    currentTextIndex += newNode.nodeValue.length;
                    // Skip the newNode as we'll already have pushed it to the matches
                    treeWalker.nextNode();
                }
                newNode = null;
            }
            return matchedNodes;
        },

        createLink: function (textNodes, href) {
            var shouldNotLink = false;
            for (var i = 0; i < textNodes.length && shouldNotLink === false; i++) {
                // Do not link if the text node is either inside an anchor or inside span[data-auto-link]
                shouldNotLink = !!Util.traverseUp(textNodes[i], function (node) {
                    return node.nodeName.toLowerCase() === 'a' ||
                        (node.getAttribute && node.getAttribute('data-auto-link') === 'true');
                });
            }
            if (shouldNotLink) {
                return false;
            }

            var anchor = this.document.createElement('a'),
                span = this.document.createElement('span'),
                hrefWithProtocol = Util.ensureUrlHasProtocol(href);
            Util.moveTextRangeIntoElement(textNodes[0], textNodes[textNodes.length - 1], span);
            span.setAttribute('data-auto-link', 'true');
            span.setAttribute('data-href', hrefWithProtocol);
            anchor.setAttribute('href', hrefWithProtocol);
            span.parentNode.insertBefore(anchor, span);
            anchor.appendChild(span);
            return true;
        }
    });
}());