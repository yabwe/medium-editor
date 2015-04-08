/*global MediumEditor, Util, describe, it, expect, spyOn */

describe('Util', function () {
    'use strict';

    describe('Exposure', function () {

        it("is exposed on the MediumEditor ctor", function () {
            expect(MediumEditor.util).toBeTruthy();
            expect(MediumEditor.util).toEqual(Util);
        });

    });

    describe('Extend', function () {
        it('should overwrite values from right to left', function () {
            var objOne = { one: "one" };
            var objTwo = { one: "two", three: "three" };
            var objThree = { three: "four", five: "six" };
            var objFour;
            var result = MediumEditor.util.extend({}, objOne, objTwo, objThree, objFour);
            // expect(_.isEqual(result, { one: "two", three: "four", five: "six" })).toBe(true);
            expect(result).toEqual({ one: "two", three: "four", five: "six" });
        });
    });

    describe('Defaults', function () {
        it('should overwrite values from left to right', function () {
            var objOne = { one: "one" };
            var objTwo = { one: "two", three: "three" };
            var objThree = { three: "four", five: "six" };
            var objFour;
            var result = MediumEditor.util.defaults({}, objOne, objTwo, objThree, objFour);
            // expect(_.isEqual(result, { one: "one", three: "three", five: "six" })).toBe(true);
            expect(result).toEqual({ one: "one", three: "three", five: "six" });
        });
    });

    describe('Deprecated', function () {
        it('should warn when a method is deprecated', function () {

            var testObj = {
                newMethod: function () {}
            };
            spyOn(testObj, 'newMethod').and.callThrough();
            spyOn(Util, 'warn').and.callThrough();
            Util.deprecatedMethod.call(testObj, 'test', 'newMethod', ['arg1', true]);
            expect(testObj.newMethod).toHaveBeenCalledWith('arg1', true);
            expect(Util.warn).toHaveBeenCalledWith(
                'test is deprecated, please use newMethod instead.'
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
            Util.deprecated("old","new","11tybillion");
            expect(Util.warn).toHaveBeenCalledWith(
                'old is deprecated, please use new instead. Will be removed in 11tybillion'
            );
        });
    });

    describe('getobject', function () {

        it("should get nested objects", function(){
            var obj = { a: { b: { c: { d: 10 } } } };
            expect(Util.getObject("a.b.c.d", false, obj)).toBe(10);
            expect(Util.getObject("a.b.c", false, obj)).toEqual({ d: 10 });
            expect(Util.getObject("a", false, obj)).toEqual({ b: { c: { d: 10 }}});
        });

        it("should create a path if told to", function(){
            var obj = {};
            expect(Util.getObject("a.b.c.d", true, obj)).toEqual({});
            expect(obj.a.b.c.d).toBeTruthy();
        });

        it("should NOT create a path", function() {
            var obj = {};
            expect(Util.getObject("a.b.c.d.e.f.g", false, obj)).toBe(undefined);
            expect(obj.a).toBe(undefined);
        });

    });

    describe('setobject', function () {

        it("sets returns the value", function(){
            var obj = {};
            expect(Util.setObject("a.b.c", 10, obj)).toBe(10);
            expect(obj.a.b.c).toBe(10);
        });

    });

    describe('warn', function () {

        it("exists", function () {
            expect(typeof Util.warn).toBe("function");
        });

        it("ends up calling console.warn", function () {
            // IE9 mock for SauceLabs
            if (window.console === undefined) {
                window.console = {
                    warn: function (msg) {
                        return msg;
                    }
                };
            }

            var spy = spyOn(window.console.warn, "apply").and.callThrough();
            Util.warn("message");
            expect(spy).toHaveBeenCalled();
        });

    });

});

