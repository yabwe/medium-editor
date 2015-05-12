/*global Extension, Util */

var AutoLinker,
    AutoLinkerStatics = {},
    LINK_REGEXP_TEXT;

LINK_REGEXP_TEXT =
    '(' +
    // Version of Gruber URL Regexp optimized for JS: http://stackoverflow.com/a/17733640
    '((?:[a-z][\\w-]+:(?:\\\/{1,3}|[a-z0-9%])|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}\\\/)\\S+(?:[^\\s`!\\[\\]{};:\'\".,?\u00AB\u00BB\u201C\u201D\u2018\u2019]))' +
    // Addition to above Regexp to support bare domains with common non-i18n TLDs and without www prefix:
    ')|([a-z0-9\\-]+\\.(com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj| Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw))';

(function () {
    'use strict';

    function assignHttpToProtocolLessUrl(url) {
        if (url.indexOf('://') === -1) {
            return 'http://' + url;
        }
        return url;
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

    /**
     * Denormalizes the DOM. The intention here is to create a "column" of elements above each individual text node
     * provided in the descendants argument. For instance, if the original DOM were presented as a DIV, with a SPAN
     * inside it, and three text nodes in the SPAN, this function will modify the DOM to have a DIV with 3 SPANs
     * inside, each span containing one of the text nodes.
     *
     * The concept is that this preserves the styling of all text elements within the targeted region, while allowing
     * wrapping the targeted text nodes (and their accompanying SPAN, STRONG, EM, etc. tags) into a new anchor tag.
     *
     * The transformations performed by this function are reversed by the "simplify" function, excepting the changes
     * that might be made in between calling complexify and simplify - that is, the change to add an anchor wrapping
     * some of the tags.
     */
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

    /**
     * Reverses the DOM transformations performed by the "complexify" function above. Adjacent tags with identical
     * classes and node names will be merged together. This is akin to the Node.normalize function provided by DOM
     * for text nodes, but applies to HTML tags instead.
     */
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
    function depth(inNode) {
        var theDepth = 0,
            node = inNode;
        while (node.parentNode !== null) {
            node = node.parentNode;
            theDepth++;
        }
        return theDepth;
    }

    function findCommonRoot(inNode1, inNode2) {
        var depth1 = depth(inNode1),
            depth2 = depth(inNode2),
            node1 = inNode1,
            node2 = inNode2;

        while (depth1 !== depth2) {
            if (depth1 > depth2) {
                node1 = node1.parentNode;
                depth1 -= 1;
            } else {
                node2 = node2.parentNode;
                depth2 -= 1;
            }
        }

        while (node1 !== node2) {
            node1 = node1.parentNode;
            node2 = node2.parentNode;
        }

        return node1;
    }
    /* END - based on http://stackoverflow.com/a/6183069 */

    AutoLinker = Extension.extend({
        parent: true,

        init: function () {
            this.disableEventHandling = false;
            this.base.subscribe('editableKeypress', this.onKeypress.bind(this));
            // MS IE has it's own auto-URL detect feature but ours is better in some ways. Be consistent.
            this.base.options.ownerDocument.execCommand('AutoUrlDetect', false, false);
        },

        onKeypress: function (keyPressEvent) {
            if (this.disableEventHandling) {
                return;
            }

            if (keyPressEvent.keyCode === Util.keyCode.SPACE ||
                    keyPressEvent.keyCode === Util.keyCode.ENTER ||
                    keyPressEvent.which === Util.keyCode.SPACE) {
                clearTimeout(this.performLinkingTimeout);
                // Saving/restoring the selection in the middle of a keypress doesn't work well...
                this.performLinkingTimeout = setTimeout(function () {
                    try {
                        var sel = this.base.exportSelection();
                        if (this.performLinking(keyPressEvent.target)) {
                            this.base.importSelection(sel);
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
                linkCreated = false;
            for (var i = 0; i < paragraphs.length; i++) {
                linkCreated = this.performLinkingWithinElement(paragraphs[i]) || linkCreated;
            }
            return linkCreated;
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

        findOrCreateMatchingTextNodes: function (element, match) {
            var treeWalker = this.base.options.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT,
                    null, false),
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
            var alreadyLinked = Util.traverseUp(textNodes[0], function (node) {
                return node.nodeName.toLowerCase() === 'a';
            });
            if (alreadyLinked) {
                return false;
            }

            // First, check for an existing common root node.
            var candRoot = findCommonRoot(textNodes[0], textNodes[textNodes.length - 1]),
                document = this.base.options.ownerDocument,
                anchor = document.createElement('a');
            if (candRoot.nodeType === 3) {
                // Link corresponded to a single text node
                candRoot.parentNode.insertBefore(anchor, candRoot);
                anchor.appendChild(candRoot);
            } else {
                // Link is in at least 2 text nodes. It's possible that they are styled differently.
                complexify(candRoot, textNodes);
                this.insertLinkAfterComplexify(candRoot, textNodes, anchor);
                simplify(candRoot, textNodes);
            }

            anchor.setAttribute('href', assignHttpToProtocolLessUrl(href));
            return true;
        },

        insertLinkAfterComplexify: function (candRoot, textNodes, anchor) {
            var startAncestor = textNodes[0],
                endAncestor = textNodes[textNodes.length - 1],
                nextSibling,
                node = null;
            while (startAncestor.parentNode !== candRoot) {
                startAncestor = startAncestor.parentNode;
            }
            while (endAncestor.parentNode !== candRoot) {
                endAncestor = endAncestor.parentNode;
            }

            do {
                node = (node === null) ? startAncestor : nextSibling;
                nextSibling = node.nextSibling;
                anchor.appendChild(node);
            } while (node !== endAncestor);
            candRoot.insertBefore(anchor, nextSibling);
        }

    });
}());