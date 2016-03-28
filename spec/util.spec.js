/*global selectElementContents, selectElementContentsAndFire */

describe('MediumEditor.util', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
    });

    afterEach(function () {
        this.cleanupTest();
    });

    describe('Exposure', function () {
        it('is exposed on the MediumEditor ctor', function () {
            expect(MediumEditor.util).toBeTruthy();
        });

    });

    describe('Extend', function () {
        it('should overwrite values from right to left', function () {
            var objOne = { one: 'one' },
                objTwo = { one: 'two', three: 'three' },
                objThree = { three: 'four', five: 'six' },
                objFour,
                result = MediumEditor.util.extend({}, objOne, objTwo, objThree, objFour);
            expect(result).toEqual({ one: 'two', three: 'four', five: 'six' });
        });
    });

    describe('Defaults', function () {
        it('should overwrite values from left to right', function () {
            var objOne = { one: 'one' },
                objTwo = { one: 'two', three: 'three' },
                objThree = { three: 'four', five: 'six' },
                objFour,
                result = MediumEditor.util.defaults({}, objOne, objTwo, objThree, objFour);
            expect(result).toEqual({ one: 'one', three: 'three', five: 'six' });
        });

        it('should overwrite nothing without args', function () {
            var result = MediumEditor.util.defaults();

            expect(result).toEqual({});
        });
    });

    describe('Deprecated', function () {
        it('should warn when a method is deprecated', function () {
            var testObj = {
                newMethod: function () {}
            };
            spyOn(testObj, 'newMethod').and.callThrough();
            spyOn(MediumEditor.util, 'warn').and.callThrough();
            MediumEditor.util.deprecatedMethod.call(testObj, 'test', 'newMethod', ['arg1', true], 'some version');
            expect(testObj.newMethod).toHaveBeenCalledWith('arg1', true);
            expect(MediumEditor.util.warn).toHaveBeenCalledWith(
                'test is deprecated, please use newMethod instead. Will be removed in some version'
            );
        });

        it('should warn when an option is deprecated', function () {
            spyOn(MediumEditor.util, 'warn').and.callThrough();
            MediumEditor.util.deprecated('oldOption', 'sub.newOption');
            expect(MediumEditor.util.warn).toHaveBeenCalledWith(
                'oldOption is deprecated, please use sub.newOption instead.'
            );
        });

        it('should allow passing a version when the removal will happen', function () {
            spyOn(MediumEditor.util, 'warn').and.callThrough();
            MediumEditor.util.deprecated('old', 'new', '11tybillion');
            expect(MediumEditor.util.warn).toHaveBeenCalledWith(
                'old is deprecated, please use new instead. Will be removed in 11tybillion'
            );
        });
    });

    describe('settargetblank', function () {
        it('sets target blank on a A element from a A element', function () {
            var el = this.createElement('a', '', 'lorem ipsum');
            el.attributes.href = 'http://0.0.0.0/bar.html';

            MediumEditor.util.setTargetBlank(el);

            expect(el.target).toBe('_blank');
        });

        it('sets target blank on a A element from a DIV element', function () {
            var el = this.createElement('div', '', '<a href="http://1.1.1.1/foo.html">foo</a> <a href="http://0.0.0.0/bar.html">bar</a>');

            MediumEditor.util.setTargetBlank(el, 'http://0.0.0.0/bar.html');

            var nodes = el.getElementsByTagName('a');

            expect(nodes[0].target).not.toBe('_blank');
            expect(nodes[1].target).toBe('_blank');
        });
    });

    describe('removetargetblank', function () {
        it('removes target blank from a A element', function () {
            var el = this.createElement('a', '', 'lorem ipsum');
            el.attributes.href = 'http://0.0.0.0/bar.html';
            el.attributes.target = '_blank';

            MediumEditor.util.removeTargetBlank(el, 'http://0.0.0.0/bar.html');

            expect(el.target).toBe('');
        });

        it('removes target blank on a A element from a DIV element', function () {
            var el = this.createElement('div', '', '<a href="http://1.1.1.1/foo.html" target="_blank">foo</a> <a href="http://0.0.0.0/bar.html" target="_blank">bar</a>');

            MediumEditor.util.removeTargetBlank(el, 'http://0.0.0.0/bar.html');

            var nodes = el.getElementsByTagName('a');

            expect(nodes[0].target).toBe('_blank');
            expect(nodes[1].target).toBe('');
        });
    });

    describe('addClassToAnchors', function () {
        it('add class to anchors on a A element from a A element', function () {
            var el = this.createElement('a', '', 'lorem ipsum');
            el.attributes.href = 'http://0.0.0.0/bar.html';

            MediumEditor.util.addClassToAnchors(el, 'firstclass');

            expect(el.classList.length).toBe(1);
            expect(el.classList.contains('firstclass')).toBe(true);
        });

        it('add class to anchors on a A element from a DIV element', function () {
            var el = this.createElement('div', '', '<a href="http://1.1.1.1/foo.html">foo</a> <a href="http://0.0.0.0/bar.html">bar</a>');

            MediumEditor.util.addClassToAnchors(el, 'firstclass');

            var nodes = el.getElementsByTagName('a');

            expect(nodes[0].classList.length).toBe(1);
            expect(nodes[1].classList.length).toBe(1);

            expect(nodes[0].classList.contains('firstclass')).toBe(true);
            expect(nodes[1].classList.contains('firstclass')).toBe(true);
        });
    });

    describe('warn', function () {

        it('exists', function () {
            expect(typeof MediumEditor.util.warn).toBe('function');
        });

        it('ends up calling console.warn', function () {
            // IE9 mock for SauceLabs
            if (window.console === undefined) {
                window.console = {
                    warn: function (msg) {
                        return msg;
                    }
                };
            } else if (typeof window.console.warn !== 'function') {
                window.console.warn = function (msg) {
                    return msg;
                };
            }

            var spy = spyOn(window.console.warn, 'apply').and.callThrough();
            MediumEditor.util.warn('message');
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('splitOffDOMTree', function () {
        /* start:
         *
         *         <div>
         *      /    |   \
         *  <span> <span> <span>
         *   / \    / \    / \
         *  1   2  3   4  5   6
         *
         * result:
         *
         *     <div>            <div>'
         *      / \              / \
         * <span> <span>   <span>' <span>
         *   / \    |        |      / \
         *  1   2   3        4     5   6
         */
        it('should split a complex tree correctly when splitting off right part of tree', function () {
            var el = this.createElement('div', '',
                '<span><b>1</b><i>2</i></span><span><b>3</b><u>4</u></span><span><b>5</b><i>6</i></span>'),
                splitOn = el.querySelector('u').firstChild,
                result = MediumEditor.util.splitOffDOMTree(el, splitOn);

            expect(el.outerHTML).toBe('<div><span><b>1</b><i>2</i></span><span><b>3</b></span></div>');
            expect(result.outerHTML).toBe('<div><span><u>4</u></span><span><b>5</b><i>6</i></span></div>');
        });

        /* start:
         *
         *         <div>
         *      /    |   \
         *  <span> <span> <span>
         *   / \    / \    / \
         *  1   2  3   4  5   6
         *
         * result:
         *
         *     <div>'      <div>
         *      / \          |
         * <span> <span>   <span>
         *   /\     /\       /\
         *  1  2   3  4     5  6
         */
        it('should split a complex tree correctly when splitting off left part of tree', function () {
            var el = this.createElement('div', '',
                '<span><b>1</b><i>2</i></span><span><b>3</b><u>4</u></span><span><b>5</b><i>6</i></span>'),
                splitOn = el.querySelector('u').firstChild,
                result = MediumEditor.util.splitOffDOMTree(el, splitOn, true);

            expect(el.outerHTML).toBe('<div><span><b>5</b><i>6</i></span></div>');
            expect(result.outerHTML).toBe('<div><span><b>1</b><i>2</i></span><span><b>3</b><u>4</u></span></div>');
        });
    });

    describe('moveTextRangeIntoElement', function () {
        it('should return false and bail if no elements are passed', function () {
            expect(MediumEditor.util.moveTextRangeIntoElement(null, null)).toBe(false);
        });

        it('should return false and bail if elemenets do not share a root', function () {
            var el = this.createElement('div', '', 'text'),
                elTwo = this.createElement('div', '', 'more text', true),
                temp = this.createElement('div', '');
            expect(MediumEditor.util.moveTextRangeIntoElement(el, elTwo, temp)).toBe(false);
            expect(temp.innerHTML).toBe('');
        });

        it('should create a parent element that spans multiple root elements', function () {
            var el = this.createElement('div', '',
                    '<span>Link = http</span>' +
                    '<span>://</span>' +
                    '<span>www.exam</span>' +
                    '<span>ple.com</span>' +
                    '<span>:443/</span>' +
                    '<span>path/to</span>' +
                    '<span>somewhere#</span>' +
                    '<span>index notLink</span>'),
                firstText = el.firstChild.firstChild.splitText('Link = '.length),
                lastText = el.lastChild.firstChild,
                para = this.createElement('p', '');
            lastText.splitText('index'.length);
            MediumEditor.util.moveTextRangeIntoElement(firstText, lastText, para);
            expect(el.innerHTML).toBe(
                '<span>Link = </span>' +
                '<p>' +
                    '<span>http</span>' +
                    '<span>://</span>' +
                    '<span>www.exam</span>' +
                    '<span>ple.com</span>' +
                    '<span>:443/</span>' +
                    '<span>path/to</span>' +
                    '<span>somewhere#</span>' +
                    '<span>index</span>' +
                '</p>' +
                '<span> notLink</span>'
            );
        });
    });

    describe('getClosestTag', function () {
        it('should get closed tag', function () {
            var el = this.createElement('div', '', '<span>my <b>text</b></span>'),
                tag = el.querySelector('b').firstChild,
                closestTag = MediumEditor.util.getClosestTag(tag, 'span');

            expect(closestTag.nodeName.toLowerCase()).toBe('span');
        });

        it('should not get closed tag with data-medium-editor-element', function () {
            var el = this.createElement('div', '', '<p>youpi<span data-medium-editor-element="true">my <b>text</b></span></p>'),
                tag = el.querySelector('b').firstChild,
                closestTag = MediumEditor.util.getClosestTag(tag, 'p');

            expect(closestTag).toBe(false);
        });

        it('should not get closed tag from empty element', function () {
            var closestTag = MediumEditor.util.getClosestTag(false, 'span');

            expect(closestTag).toBe(false);
        });
    });

    describe('isListItem', function () {
        it('should be a list item but inside a ul', function () {
            var el = this.createElement('ul', '', '<li>test</li>'),
                result = MediumEditor.util.isListItem(el);

            expect(result).toBe(false);
        });

        it('should be a list item', function () {
            var el = this.createElement('ul', '', '<li>test</li>'),
                li = el.querySelector('li'),
                result = MediumEditor.util.isListItem(li);

            expect(result).toBe(true);
        });

        it('should not be a list item', function () {
            var result = MediumEditor.util.isListItem(false);

            expect(result).toBe(false);
        });

        it('should not be a list item', function () {
            var el = this.createElement('p', '', '<b>test</b>'),
                result = MediumEditor.util.isListItem(el);

            expect(result).toBe(false);
        });
    });

    describe('isKey', function () {
        it('should return true no matter how the key associated to the event is defined', function () {
            var event;

            event = {
                which: 13,
                keyCode: null,
                charCode: null
            };
            expect(MediumEditor.util.isKey(event, 13)).toBeTruthy();

            event = {
                which: null,
                keyCode: 13,
                charCode: null
            };
            expect(MediumEditor.util.isKey(event, 13)).toBeTruthy();

            event = {
                which: null,
                keyCode: null,
                charCode: 13
            };
            expect(MediumEditor.util.isKey(event, 13)).toBeTruthy();
        });

        it('should return true when a key associated to event is listed to one we are looking for', function () {
            var event = {
                which: 13
            };

            expect(MediumEditor.util.isKey(event, 13)).toBeTruthy();
            expect(MediumEditor.util.isKey(event, [13])).toBeTruthy();
            expect(MediumEditor.util.isKey(event, [13, 12])).toBeTruthy();
            expect(MediumEditor.util.isKey(event, [12, 13])).toBeTruthy();
        });

        it('should return false when a key associated to event is NOT listed to one we are looking for', function () {
            var event = {
                which: 13
            };

            expect(MediumEditor.util.isKey(event, 65)).toBeFalsy();
            expect(MediumEditor.util.isKey(event, [65])).toBeFalsy();
            expect(MediumEditor.util.isKey(event, [65, 66])).toBeFalsy();
        });
    });

    describe('execFormatBlock', function () {
        it('should execute indent command when called with blockquote when selection is inside a nested block element within a blockquote', function () {
            var el = this.createElement('div', '', '<blockquote><p>Some <b>Text</b></p></blockquote>');
            el.setAttribute('contenteditable', true);
            selectElementContents(el.querySelector('b'));
            spyOn(document, 'execCommand');

            MediumEditor.util.execFormatBlock(document, 'blockquote');
            expect(document.execCommand).toHaveBeenCalledWith('outdent', false, null);
        });

        it('should execute indent command when called with blockquote when isIE is true', function () {
            var origIsIE = MediumEditor.util.isIE,
                el = this.createElement('div', '', '<p>Some <b>Text</b></p>');
            MediumEditor.util.isIE = true;
            el.setAttribute('contenteditable', true);
            selectElementContents(el.querySelector('b'));
            spyOn(document, 'execCommand');

            MediumEditor.util.execFormatBlock(document, 'blockquote');
            expect(document.execCommand).toHaveBeenCalledWith('indent', false, 'blockquote');

            MediumEditor.util.isIE = origIsIE;
        });
    });

    describe('insertHTMLCommand', function () {
        it('should not remove the contenteditable element when calling insert into an empty contenteditable element', function () {
            var el = this.createElement('div', 'editable', ''),
                origQCS = document.queryCommandSupported;
            // Force our custom implementation to run
            spyOn(document, 'queryCommandSupported').and.callFake(function (command) {
                if (command === 'insertHTML') {
                    return false;
                }
                return origQCS.apply(document, arguments);
            });
            // Mimic an editor element
            el.setAttribute('contenteditable', true);
            el.setAttribute('data-medium-editor-element', true);

            // Make sure the element has 0 child nodes
            while (el.firstChild) {
                el.remove(el.firstChild);
            }
            selectElementContents(el);
            MediumEditor.util.insertHTMLCommand(document, '<p>some pasted html</p>', true);

            expect(el.innerHTML).toBe('<p>some pasted html</p>');
            expect(document.body.contains(el)).toBe(true, 'The editor element has been removed from the page');
        });

        // https://github.com/yabwe/medium-editor/issues/992
        it('should trigger editableInput when using custom insertHTML implementation and contenteditable does not support input event', function () {
            // Ensure custom implementation
            var originalInputSupport = MediumEditor.Events.prototype.InputEventOnContenteditableSupported;
            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = false;

            var el = this.createElement('div', 'editable', '<p>orig text</p>'),
                origQCS = document.queryCommandSupported;
            // Force our custom implementation to run
            spyOn(document, 'queryCommandSupported').and.callFake(function (command) {
                if (command === 'insertHTML') {
                    return false;
                }
                return origQCS.apply(document, arguments);
            });

            var editor = this.newMediumEditor('.editable'),
                spy = jasmine.createSpy('handler');

            editor.subscribe('editableInput', spy);
            selectElementContentsAndFire(el.firstChild);
            MediumEditor.util.insertHTMLCommand(document, '<p>some pasted html</p>', true);

            var obj = { target: el, currentTarget: el };
            expect(spy).toHaveBeenCalledWith(obj, el);

            expect(el.innerHTML).toBe('<p>some pasted html</p>');
            expect(document.body.contains(el)).toBe(true, 'The editor element has been removed from the page');

            MediumEditor.Events.prototype.InputEventOnContenteditableSupported = originalInputSupport;
        });
    });

    describe('isDescendant', function () {
        it('should return true for an element which is a descendant of another', function () {
            var parent = this.createElement('div'),
                child = parent.appendChild(document.createTextNode('text'));
            expect(MediumEditor.util.isDescendant(parent, child)).toBe(true);
        });

        it('should return false for an element which is not a descendant of another', function () {
            var parent = this.createElement('div'),
                child = document.createTextNode('text');
            expect(MediumEditor.util.isDescendant(parent, child)).toBe(false);
        });

        it('should return false when checking the same element', function () {
            var parent = this.createElement('div');
            expect(MediumEditor.util.isDescendant(parent, parent)).toBe(false);
        });

        it('should return true when checking the same element but using the equality param', function () {
            var parent = this.createElement('div');
            expect(MediumEditor.util.isDescendant(parent, parent, true)).toBe(true);
        });

        it('should return false when the elements are null', function () {
            var parent = this.createElement('div');
            expect(MediumEditor.util.isDescendant(parent, null)).toBe(false);
            expect(MediumEditor.util.isDescendant(null, parent)).toBe(false);
            expect(MediumEditor.util.isDescendant(null, null)).toBe(false);
        });

        it('should return false when the parent element is a text node', function () {
            var parent = document.createTextNode('text'),
                child = this.createElement('div');
            expect(MediumEditor.util.isDescendant(parent, child)).toBe(false);
        });
    });

    describe('splitByBlockElements', function () {
        it('should return block elements without block elements as children', function () {
            var el = this.createElement('div');
            el.innerHTML = '' +
                '<blockquote><ol>' +
                        '<li><div><table><thead><tr><th>Head</th></tr></thead></table></div></li>' +
                        '<li>List Item</li>' +
                    '</ol>' +
                    '<p>paragraph</p>' +
                '</blockquote>';

            var parts = MediumEditor.util.splitByBlockElements(el);
            expect(parts.length).toBe(3);

            // <th>Head</th>
            expect(parts[0].nodeName.toLowerCase()).toBe('th');
            expect(parts[0].textContent).toBe('Head');
            // <li>List Item</li>
            expect(parts[1].nodeName.toLowerCase()).toBe('li');
            expect(parts[1].textContent).toBe('List Item');
            // <p>paragraph</p>
            expect(parts[2].nodeName.toLowerCase()).toBe('p');
            expect(parts[2].textContent).toBe('paragraph');
        });

        it('should return inline elements and text nodes if they are siblings of blocks', function () {
            var el = this.createElement('div');
            el.innerHTML = '' +
                '<blockquote>' +
                    '<span>Text <b>bold <i>bold + italics</i></b> <u>underlined</u></span>' +
                    '<ol><li>List Item</li></ol>' +
                    'Text Node' +
                '</blockquote>';
            var parts = MediumEditor.util.splitByBlockElements(el);
            expect(parts.length).toBe(3);

            // <span>Text <b>bold <i>bold + italics</i></b> <u>underlined</u></span>
            expect(parts[0].nodeName.toLowerCase()).toBe('span');
            expect(parts[0].textContent).toBe('Text bold bold + italics underlined');
            // <li>List Item</li>
            expect(parts[1].nodeName.toLowerCase()).toBe('li');
            expect(parts[1].textContent).toBe('List Item');
            // Text Node
            expect(parts[2].nodeName.toLowerCase()).toBe('#text');
            expect(parts[2].textContent).toBe('Text Node');
        });

        it('should ignore comments', function () {
            var comment = document.createComment('comment'),
                parts = MediumEditor.util.splitByBlockElements(comment);
            expect(parts.length).toBe(0);
        });

        it('should ignore nested comments', function () {
            var el = this.createElement('div');
            el.innerHTML = '' +
                  '<p>Text</p>' +
                  '<!---->';
            var parts = MediumEditor.util.splitByBlockElements(el);
            expect(parts.length).toBe(1);
        });
    });

    describe('getClosestBlockContainer', function () {
        it('should return the closest block container', function () {
            var el = this.createElement('div', '', '<blockquote><p>paragraph</p><ul><li><span>list item</span></li></ul></blockquote>'),
                span = el.querySelector('span'),
                container = MediumEditor.util.getClosestBlockContainer(span);
            expect(container).toBe(el.querySelector('li'));
        });

        it('should return the parent editable if element is a text node child of the editor', function () {
            var el = this.createElement('div', 'editable', ' <p>text</p>'),
                emptyTextNode = el.firstChild;
            this.newMediumEditor('.editable');
            var container = MediumEditor.util.getClosestBlockContainer(emptyTextNode);
            expect(container).toBe(el);
        });
    });

    describe('getTopBlockContainer', function () {
        it('should return the highest level block container', function () {
            var el = this.createElement('div', '', '<blockquote><p>paragraph</p><ul><li><span>list item</span></li></ul></blockquote>'),
                span = el.querySelector('span'),
                container = MediumEditor.util.getTopBlockContainer(span);
            expect(container).toBe(el.querySelector('blockquote'));
        });

        it('should return the parent editable if element is a text node child of the editor', function () {
            var el = this.createElement('div', 'editable', ' <p>text</p>'),
                emptyTextNode = el.firstChild;
            this.newMediumEditor('.editable');
            var container = MediumEditor.util.getTopBlockContainer(emptyTextNode);
            expect(container).toBe(el);
        });
    });

    describe('findPreviousSibling', function () {
        it('should return the previous sibling of an element if it exists', function () {
            var el = this.createElement('div', '', '<p>first <b>second </b><i>third</i></p><ul><li>fourth</li></ul>'),
                second = el.querySelector('b'),
                third = el.querySelector('i'),
                prevSibling = MediumEditor.util.findPreviousSibling(third);
            expect(prevSibling).toBe(second);
        });

        it('should return the previous sibling on an ancestor if a previous sibling does not exist', function () {
            var el = this.createElement('div', '', '<p>first <b>second </b><i>third</i></p><ul><li>fourth</li></ul>'),
                fourth = el.querySelector('li').firstChild,
                p = el.querySelector('p'),
                prevSibling = MediumEditor.util.findPreviousSibling(fourth);
            expect(prevSibling).toBe(p);
        });

        it('should not find a previous sibling if the element is at the beginning of an editor element', function () {
            var el = this.createElement('div', 'editable', '<p>first <b>second </b><i>third</i></p><ul><li>fourth</li></ul>'),
                first = el.querySelector('p').firstChild;
            this.newMediumEditor('.editable');
            var prevSibling = MediumEditor.util.findPreviousSibling(first);
            expect(prevSibling).toBeFalsy();
        });
    });

    describe('findOrCreateMatchingTextNodes', function () {
        it('should return text nodes within an element', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#">link</a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 0, end: el.textContent.length });
            expect(textNodes.length).toBe(11);
            expect(textNodes[0].nodeValue).toBe('Plain ');
            expect(textNodes[9].nodeValue).toBe('span1 ');
            expect(textNodes[10].nodeValue).toBe('span2');
        });

        it('should return text nodes within an element given a start and end range', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#">link</a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 11, end: 22 });
            expect(textNodes.length).toBe(3);
            expect(textNodes[0].nodeValue).toBe('link');
            expect(textNodes[1].nodeValue).toBe(' ');
            expect(textNodes[2].nodeValue).toBe('italic');
        });

        it('should split text nodes if start and end range are in the middle of a text node', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#">link</a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 13, end: 19 });

            expect(el.querySelector('a').childNodes.length).toBe(2);
            expect(el.querySelector('i').childNodes.length).toBe(2);
            expect(textNodes.length).toBe(3);
            expect(textNodes[0].nodeValue).toBe('nk');
            expect(textNodes[1].nodeValue).toBe(' ');
            expect(textNodes[2].nodeValue).toBe('ita');
        });

        it('should return an image when it falls within the specified range', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#">li<img src="../demo/img/medium-editor.jpg" />nk</a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 11, end: 15 });
            expect(textNodes.length).toBe(3);
            expect(textNodes[0].nodeValue).toBe('li');
            expect(textNodes[1].nodeName.toLowerCase()).toBe('img');
            expect(textNodes[2].nodeValue).toBe('nk');
        });

        it('should return an image when it is at the end of the specified range', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#">link<img src="../demo/img/medium-editor.jpg" /></a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 11, end: 15 });
            expect(textNodes.length).toBe(2);
            expect(textNodes[0].nodeValue).toBe('link');
            expect(textNodes[1].nodeName.toLowerCase()).toBe('img');
        });

        it('should return an image when it is the only content in the specified range', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#"><img src="../demo/img/medium-editor.jpg" /></a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 11, end: 11 });
            expect(textNodes.length).toBe(1);
            expect(textNodes[0].nodeName.toLowerCase()).toBe('img');
        });

        it('should return images when they are at the beginning of the specified range', function () {
            var el = this.createElement('div');
            el.innerHTML = '<p>Plain <b>bold</b> <a href="#"><img src="../demo/img/medium-editor.jpg" /><img src="../demo/img/roman.jpg" />link</a> <i>italic</i> <u>underline</u> <span>span1 <span>span2</span></span></p>';
            var textNodes = MediumEditor.util.findOrCreateMatchingTextNodes(document, el, { start: 11, end: 15 });
            expect(textNodes.length).toBe(3);
            expect(textNodes[0].nodeName.toLowerCase()).toBe('img');
            expect(textNodes[1].nodeName.toLowerCase()).toBe('img');
            expect(textNodes[2].nodeValue).toBe('link');
        });
    });

    // TODO: Remove these tests when getFirstTextNode is deprecated in 6.0.0
    describe('getFirstTextNode', function () {
        it('should find the first text node within an element', function () {
            var el = this.createElement('div', '', '<p><b><i><u><a href="#">First</a> text</u> in</i> editor</b>!</p>'),
                anchorText = el.querySelector('a').firstChild,
                firstText = MediumEditor.util.getFirstTextNode(el);

            expect(firstText).toBe(anchorText);
        });

        it('should return the text node if passed a text node', function () {
            var el = this.createElement('div', '', '<p>text</p>'),
                textNode = el.querySelector('p').firstChild,
                firstText = MediumEditor.util.getFirstTextNode(textNode);

            expect(firstText).toBe(textNode);
        });

        it('should return null if no text node exists in element', function () {
            var el = this.createElement('div'),
                firstText = MediumEditor.util.getFirstTextNode(el);

            expect(firstText).toBeNull();
        });
    });
});
