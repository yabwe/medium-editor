/*global selectElementContents*/

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
    });
});
