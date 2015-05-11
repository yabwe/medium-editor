/*global Extension, Util */

var AutoLinker,
    AutoLinkerStatics = {},
    KEY_CODES = {
        SPACE: 32,
        ENTER: 13
    },
    LINK_REGEXP_TEXT;

LINK_REGEXP_TEXT =
    '(' +
    // Version of Gruber URL Regexp optimized for JS: http://stackoverflow.com/a/17733640
    '((?:[a-z][\\w-]+:(?:\\\/{1,3}|[a-z0-9%])|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}\\\/)\\S+(?:[^\\s`!\\[\\]{};:\'\".,?\u00AB\u00BB\u201C\u201D\u2018\u2019]))' +
    // Addition to above Regexp to support bare domains with common non-i18n TLDs and without www prefix:
    ')|([a-z0-9\\-]+\\.(com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj| Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw))';

(function () {
    'use strict';

    var nodeIteratorDetectsNewNodes = true; // this is the behavior in Chrome, FF, Safari...

    // feature test for the behavior of NodeIterator. In IE11 this didn't behave like the other browsers...
    (function () {
        var div = document.createElement('div'),
            node,
            it;
        div.appendChild(document.createTextNode('ab'));
        div.appendChild(document.createTextNode('c'));
        it = document.createNodeIterator(div, NodeFilter.SHOW_TEXT, null, false);
        node = it.nextNode();
        node.splitText(1);
        node = it.nextNode();
        if (node.nodeValue === 'c') {
            nodeIteratorDetectsNewNodes = false;
        } else if (node.nodeValue !== 'b') {
            throw new Error('Unexpected behavior of NodeIterator. Code will not work properly');
        }
    }());
    // end feature test

    function assignHttpToProtocolLessUrl(url) {
        if (url.indexOf('://') === -1) {
            return 'http://' + url;
        } else {
            return url;
        }
    }

    function findTextNodes(el) {
        var n,
            a = [],
            walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while(n = walk.nextNode()) {
            a.push(n);
        }
        return a;
    }

    function sortNodesInDocumentOrder(root, nodes) {
        var lookup = [],
            it = document.createNodeIterator(root,
                NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT|NodeFilter.SHOW_COMMENT,
                null,
                false),
            node;

        while ((node = it.nextNode()) !== null) {
            lookup.push(node);
        }

        nodes.sort(function (a, b) {
            var aIndex = lookup.indexOf(a),
                bIndex = lookup.indexOf(b);

            return aIndex - bIndex;
        });
    }

    function complexify(root, descendants) {
        var rootChildren = [],
            originalRootChildren = [],
            insertBeforeTarget,
            allTextNodes = [];
        descendants = Array.prototype.slice.call(descendants, 0);

        descendants.forEach(function (descendant) {
            var node = descendant;
            while (node.parentNode !== root) {
                node = node.parentNode;
            }

            if (originalRootChildren.indexOf(node) === -1) {
                originalRootChildren.push(node);
            }
        });
        originalRootChildren.forEach(function (originalRootChild) {
            if (originalRootChild.nodeType === 3) {
                allTextNodes = allTextNodes.concat(originalRootChild);
            } else {
                allTextNodes = allTextNodes.concat(findTextNodes(originalRootChild));
            }
        });
        descendants.forEach(function (descendant) {
            // Add text nodes that were direct descendants of the root node.
            if (allTextNodes.indexOf(descendant) === -1) {
                allTextNodes.push(descendant);
            }
        });
        sortNodesInDocumentOrder(root, allTextNodes);

        allTextNodes.forEach(function (descendant) {
            var node = descendant,
                ancestors = [],
                newLineage = [];
            while (node !== root) {
                ancestors.unshift(node);
                node = node.parentNode;
            }

            ancestors.forEach(function (ancestor) {
                var nodeToAppend;
                if (ancestor.nodeType === 3) {
                    nodeToAppend = ancestor;
                } else {
                    nodeToAppend = ancestor.cloneNode(false);
                }
                if (newLineage.length) {
                    newLineage[newLineage.length - 1].appendChild(nodeToAppend);
                }
                newLineage.push(nodeToAppend);
            });

            rootChildren.push(newLineage[0]);
        });

        insertBeforeTarget = originalRootChildren[originalRootChildren.length - 1].nextSibling;
        originalRootChildren.forEach(function (rootChild) {
            root.removeChild(rootChild);
        });
        rootChildren.forEach(function (rootChild) {
            root.insertBefore(rootChild, insertBeforeTarget);
        });
    }

    function simplify(root, descendants) {
        var changesMade,
            descendant,
            i;
        do {
            changesMade = 0;
            for (i = 0; i < descendants.length; i++) {
                descendant = descendants[i];
                var node = descendant.parentNode;
                while (node !== root) {
                    if (node.nextSibling &&
                            node.nextSibling.nodeName === node.nodeName &&
                            node.nextSibling.className === node.className &&
                            node.nextSibling.id === node.id &&
                            (!node.getAttribute ||
                            node.nextSibling.getAttribute('style') === node.getAttribute('style'))) {
                        while (node.nextSibling.childNodes.length !== 0) {
                            node.appendChild(node.nextSibling.firstChild);
                        }
                        node.parentNode.removeChild(node.nextSibling);
                        changesMade += 1;
                    }
                    node = node.parentNode;
                }
            }
        } while (changesMade !== 0);
    }

    // Export for unit test.
    AutoLinkerStatics.complexify = complexify;
    AutoLinkerStatics.simplify = simplify;

    /* based on http://stackoverflow.com/a/6183069 */
    function depth(v) {
        var d = 0,
            vv = v;
        while (vv.parentNode !== null) {
            vv = vv.parentNode;
            d++;
        }
        return d;
    }

    function findCommonRoot(v, w) {
        var depthVv = depth(v),
            depthWw = depth(w),
            vv = v,
            ww = w;

        while (depthVv !== depthWw) {
            if (depthVv > depthWw) {
                vv = vv.parentNode;
                depthVv -= 1;
            } else {
                ww = ww.parentNode;
                depthWw -= 1;
            }
        }

        while (vv !== ww) {
            vv = vv.parentNode;
            ww = ww.parentNode;
        }

        return vv;
    }
    /* END - based on http://stackoverflow.com/a/6183069 */

    function findDescendantTextNodes(node, document) {
        var it = document.createNodeIterator(node, NodeFilter.SHOW_TEXT, null, false),
            nodes = [],
            currentNode;

        while ((currentNode = it.nextNode()) !== null) {
            nodes.push(currentNode);
        }
        return nodes;
    }

    function nodesAreAllChildrenOf(nodes, root) {
        var i,
            rootChildNodes = Array.prototype.slice.call(root.childNodes, 0);
        for (i = 0; i < nodes.length; i++) {
            if (rootChildNodes.indexOf(nodes[i]) === -1) {
                return false;
            }
        }
        return true;
    }

    AutoLinker = Extension.extend({
        parent: true,

        init: function () {
            this.base.subscribe('editableKeypress', this.onKeypress.bind(this));
            // MS IE has it's own auto-URL detect feature but ours is better in some ways. Be consistent.
            this.base.options.ownerDocument.execCommand('AutoUrlDetect', false, false);
        },

        onKeypress: function (keyPressEvent) {
            if (keyPressEvent.keyCode === KEY_CODES.SPACE ||
                    keyPressEvent.keyCode === KEY_CODES.ENTER ||
                    keyPressEvent.which === KEY_CODES.SPACE) {
                clearTimeout(this.performLinkingTimeout);
                // Saving/restoring the selection in the middle of a keypress doesn't work well...
                this.performLinkingTimeout = setTimeout(function () {
                    var sel = this.base.exportSelection();
                    if (this.performLinking(keyPressEvent.target)) {
                        this.base.importSelection(sel);
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
                linkCreated = false;
            for (var i = 0; i < paragraphs.length; i++) {
                linkCreated = this.performLinkingWithinElement(paragraphs[i]) || linkCreated;
            }
            return linkCreated;
        },

        performLinkingWithinElement: function (element) {
            var matches = this.findLinkableText(element),
                matchIndex = 0,
                currentNode = null,
                newNode = null,
                currentTextIndex = 0,
                matchedNodes = [],
                startReached = false,
                commonAncestor = null,
                nodeIterator = null,
                linkCreated = false,
                textIndexOfEndOfFarthestNode;

            while (matches.length > matchIndex) {
                nodeIterator = this.base.options.ownerDocument.createNodeIterator(element, NodeFilter.SHOW_TEXT, null, false);
                while ((currentNode = nodeIterator.nextNode()) !== null) {
                    if (!startReached && matches[matchIndex].start < (currentTextIndex + currentNode.nodeValue.length)) {
                        startReached = true;
                        // Split the text node if needed to align perfectly with the match
                        if (matches[matchIndex].start !== currentTextIndex) {
                            newNode = currentNode.splitText(matches[matchIndex].start - currentTextIndex);
                        }
                    }
                    textIndexOfEndOfFarthestNode = currentTextIndex + (newNode || currentNode).nodeValue.length +
                            (newNode ? currentNode.nodeValue.length : 0) -
                            1;
                    var endSplitPoint = (newNode || currentNode).nodeValue.length -
                            (textIndexOfEndOfFarthestNode + 1 - matches[matchIndex].end);
                    if (startReached && textIndexOfEndOfFarthestNode >= matches[matchIndex].end &&
                            currentTextIndex !== textIndexOfEndOfFarthestNode &&
                            endSplitPoint !== 0) {
                        (newNode || currentNode).splitText(endSplitPoint);
                    }
                    if (startReached && currentTextIndex === matches[matchIndex].end) {
                        break; // Found the node(s) corresponding to the link. Break out and move on to the next.
                    } else if (startReached && currentTextIndex > (matches[matchIndex].end + 1)) {
                        throw new Error('PerformLinking overshot the target!'); // should never happen...
                    }
                    if (startReached) {
                        matchedNodes.push(newNode || currentNode);
                    }
                    currentTextIndex += currentNode.nodeValue.length;
                    if (newNode !== null) {
                        currentTextIndex += newNode.nodeValue.length;
                        if (nodeIteratorDetectsNewNodes) {
                            // Skip the newNode as we'll already have pushed it to the matches
                            // In IE11, the nextNode isn't the newNode so don't skip this.
                            nodeIterator.nextNode();
                        }
                    }
                    newNode = null;
                }

                linkCreated = this.createLink(matchedNodes, matches[matchIndex].href) || linkCreated;

                matchedNodes = [];
                currentNode = null;
                currentTextIndex = 0;
                startReached = false;
                commonAncestor = null;

                matchIndex += 1;
            }
            return linkCreated;
        },

        findLinkableText: function (contenteditable) {
            var linkRegExp = new RegExp(LINK_REGEXP_TEXT, 'gi'),
                textContent = contenteditable.textContent,
                match = null,
                matches = [];

            while ((match = linkRegExp.exec(textContent)) !== null) {
                matches.push({
                    href: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
            return matches;
        },

        createLink: function (textNodes, href) {
            var alreadyLinked = Util.traverseUp(textNodes[0], function (node) {
                return node.nodeName.toLowerCase() === 'a';
            });
            if (alreadyLinked) {
                return false;
            }

            // First, check for an existing common root node.
            var candRoot = findCommonRoot(textNodes[0], textNodes[textNodes.length - 1]),
                document = this.base.options.ownerDocument,
                i,
                anchor = document.createElement('a');
            if (candRoot.nodeType === 3) {
                // Link corresponded to a single text node
                candRoot.parentNode.insertBefore(anchor, candRoot);
                anchor.appendChild(candRoot);
            } else if (findDescendantTextNodes(candRoot, document).length === textNodes.length) {
                // Link corresponded to all the text nodes inside the candidate root
                candRoot.appendChild(anchor);
                while (candRoot.childNodes.length > 1) {
                    anchor.appendChild(candRoot.childNodes[0]);
                }
            } else if (nodesAreAllChildrenOf(textNodes, candRoot)) {
                // Link text nodes are all inside the candidate root, along with non-linkable nodes
                if (candRoot.childNodes[candRoot.childNodes.length - 1] === textNodes[textNodes.length - 1]) {
                    candRoot.appendChild(anchor);
                } else {
                    candRoot.insertBefore(anchor, textNodes[0].previousSibling || textNodes[0]);
                }
                for (i = 0; i < textNodes.length; i++) {
                    anchor.appendChild(textNodes[i]);
                }
            } else {
                complexify(candRoot, textNodes);
                var startAncestor = textNodes[0],
                    endAncestor = textNodes[textNodes.length - 1],
                    node;
                while (startAncestor.parentNode !== candRoot) {
                    startAncestor = startAncestor.parentNode;
                }
                while (endAncestor.parentNode !== candRoot) {
                    endAncestor = endAncestor.parentNode;
                }
                anchor = document.createElement('a');
                node = null;

                var nextSibling;
                do {
                    node = (node === null) ? startAncestor : nextSibling;
                    nextSibling = node.nextSibling;
                    anchor.appendChild(node);
                } while (node !== endAncestor);
                candRoot.insertBefore(anchor, nextSibling);
                simplify(candRoot, textNodes);
            }

            anchor.setAttribute('href', assignHttpToProtocolLessUrl(href));
            return true;
        }

    });
}());