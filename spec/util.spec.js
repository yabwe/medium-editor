/*global MediumEditor, Util, describe, it, expect, spyOn,
         afterEach, beforeEach, setupTestHelpers */

describe('Util', function () {
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
            expect(MediumEditor.util).toEqual(Util);
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
            spyOn(Util, 'warn').and.callThrough();
            Util.deprecatedMethod.call(testObj, 'test', 'newMethod', ['arg1', true], 'some version');
            expect(testObj.newMethod).toHaveBeenCalledWith('arg1', true);
            expect(Util.warn).toHaveBeenCalledWith(
                'test is deprecated, please use newMethod instead. Will be removed in some version'
            );
        });

        it('should warn when an option is deprecated', function () {
            spyOn(Util, 'warn').and.callThrough();
            Util.deprecated('oldOption', 'sub.newOption');
            expect(Util.warn).toHaveBeenCalledWith(
                'oldOption is deprecated, please use sub.newOption instead.'
            );
        });

        it('should allow passing a version when the removal will happen', function () {
            spyOn(Util, 'warn').and.callThrough();
            Util.deprecated('old', 'new', '11tybillion');
            expect(Util.warn).toHaveBeenCalledWith(
                'old is deprecated, please use new instead. Will be removed in 11tybillion'
            );
        });
    });

    describe('getobject', function () {
        it('should get nested objects', function () {
            var obj = { a: { b: { c: { d: 10 } } } };
            expect(Util.getObject('a.b.c.d', false, obj)).toBe(10);
            expect(Util.getObject('a.b.c.d', false, false)).toBe(undefined);
            expect(Util.getObject(false, false, obj)).toBe(obj);
            expect(Util.getObject('a.b.c', false, obj)).toEqual({ d: 10 });
            expect(Util.getObject('a', false, obj)).toEqual({ b: { c: { d: 10 } } });
        });

        it('should create a path if told to', function () {
            var obj = {};
            expect(Util.getObject('a.b.c.d', true, obj)).toEqual({});
            expect(obj.a.b.c.d).toBeTruthy();
        });

        it('should NOT create a path', function () {
            var obj = {};
            expect(Util.getObject('a.b.c.d.e.f.g', false, obj)).toBe(undefined);
            expect(obj.a).toBe(undefined);
        });
    });

    describe('setobject', function () {
        it('sets returns the value', function () {
            var obj = {};
            expect(Util.setObject('a.b.c', 10, obj)).toBe(10);
            expect(obj.a.b.c).toBe(10);
        });

        it('sets returns undefined because of empty string', function () {
            var obj = {};
            expect(Util.setObject('', 10, obj)).toBe(undefined);
        });
    });

    describe('settargetblank', function () {
        it('sets target blank on a A element from a A element', function () {
            var el = this.createElement('a', '', 'lorem ipsum');
            el.attributes.href = 'http://0.0.0.0/bar.html';

            Util.setTargetBlank(el);

            expect(el.target).toBe('_blank');
        });

        it('sets target blank on a A element from a DIV element', function () {
            var el = this.createElement('div', '', '<a href="http://1.1.1.1/foo.html">foo</a> <a href="http://0.0.0.0/bar.html">bar</a>');

            Util.setTargetBlank(el, 'http://0.0.0.0/bar.html');

            var nodes = el.getElementsByTagName('a');

            expect(nodes[0].target).not.toBe('_blank');
            expect(nodes[1].target).toBe('_blank');
        });
    });

    describe('addClassToAnchors', function () {
        it('add class to anchors on a A element from a A element', function () {
            var el = this.createElement('a', '', 'lorem ipsum');
            el.attributes.href = 'http://0.0.0.0/bar.html';

            Util.addClassToAnchors(el, 'firstclass');

            expect(el.classList.length).toBe(1);
            expect(el.classList.contains('firstclass')).toBe(true);
        });

        it('add class to anchors on a A element from a DIV element', function () {
            var el = this.createElement('div', '', '<a href="http://1.1.1.1/foo.html">foo</a> <a href="http://0.0.0.0/bar.html">bar</a>');

            Util.addClassToAnchors(el, 'firstclass');

            var nodes = el.getElementsByTagName('a');

            expect(nodes[0].classList.length).toBe(1);
            expect(nodes[1].classList.length).toBe(1);

            expect(nodes[0].classList.contains('firstclass')).toBe(true);
            expect(nodes[1].classList.contains('firstclass')).toBe(true);
        });
    });

    describe('warn', function () {

        it('exists', function () {
            expect(typeof Util.warn).toBe('function');
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
            Util.warn('message');
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
                result = Util.splitOffDOMTree(el, splitOn);

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
                result = Util.splitOffDOMTree(el, splitOn, true);

            expect(el.outerHTML).toBe('<div><span><b>5</b><i>6</i></span></div>');
            expect(result.outerHTML).toBe('<div><span><b>1</b><i>2</i></span><span><b>3</b><u>4</u></span></div>');
        });
    });

    describe('moveTextRangeIntoElement', function () {
        it('should return false and bail if no elements are passed', function () {
            expect(Util.moveTextRangeIntoElement(null, null)).toBe(false);
        });

        it('should return false and bail if elemenets do not share a root', function () {
            var el = this.createElement('div', '', 'text'),
                elTwo = this.createElement('div', '', 'more text', true),
                temp = this.createElement('div', '');
            expect(Util.moveTextRangeIntoElement(el, elTwo, temp)).toBe(false);
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
            Util.moveTextRangeIntoElement(firstText, lastText, para);
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
                closestTag = Util.getClosestTag(tag, 'span');

            expect(closestTag.tagName.toLowerCase()).toBe('span');
        });

        it('should not get closed tag with data-medium-element', function () {
            var el = this.createElement('div', '', '<p>youpi<span data-medium-element="true">my <b>text</b></span></p>'),
                tag = el.querySelector('b').firstChild,
                closestTag = Util.getClosestTag(tag, 'p');

            expect(closestTag).toBe(false);
        });

        it('should not get closed tag from empty element', function () {
            var closestTag = Util.getClosestTag(false, 'span');

            expect(closestTag).toBe(false);
        });
    });

    describe('isListItem', function () {
        it('should be a list item but inside a ul', function () {
            var el = this.createElement('ul', '', '<li>test</li>'),
                result = Util.isListItem(el);

            expect(result).toBe(false);
        });

        it('should be a list item', function () {
            var el = this.createElement('ul', '', '<li>test</li>'),
                li = el.querySelector('li'),
                result = Util.isListItem(li);

            expect(result).toBe(true);
        });

        it('should not be a list item', function () {
            var result = Util.isListItem(false);

            expect(result).toBe(false);
        });

        it('should not be a list item', function () {
            var el = this.createElement('p', '', '<b>test</b>'),
                result = Util.isListItem(el);

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
            expect(Util.isKey(event, 13)).toBeTruthy();

            event = {
                which: null,
                keyCode: 13,
                charCode: null
            };
            expect(Util.isKey(event, 13)).toBeTruthy();

            event = {
                which: null,
                keyCode: null,
                charCode: 13
            };
            expect(Util.isKey(event, 13)).toBeTruthy();
        });

        it('should return true when a key associated to event is listed to one we are looking for', function () {
            var event = {
                which: 13
            };

            expect(Util.isKey(event, 13)).toBeTruthy();
            expect(Util.isKey(event, [13])).toBeTruthy();
            expect(Util.isKey(event, [13, 12])).toBeTruthy();
            expect(Util.isKey(event, [12, 13])).toBeTruthy();
        });

        it('should return false when a key associated to event is NOT listed to one we are looking for', function () {
            var event = {
                which: 13
            };

            expect(Util.isKey(event, 65)).toBeFalsy();
            expect(Util.isKey(event, [65])).toBeFalsy();
            expect(Util.isKey(event, [65, 66])).toBeFalsy();
        });
    });
});
