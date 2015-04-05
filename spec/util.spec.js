/*global MediumEditor, Util, describe, it, expect, spyOn, _ */

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
            var result = MediumEditor.util.extend({}, objOne, objTwo, objThree);
            expect(_.isEqual(result, { one: "two", three: "four", five: "six" })).toBe(true);
        });
    });

    describe('Defaults', function () {
        it('should overwrite values from left to right', function () {
            var objOne = { one: "one" };
            var objTwo = { one: "two", three: "three" };
            var objThree = { three: "four", five: "six" };
            var result = MediumEditor.util.defaults({}, objOne, objTwo, objThree);
            expect(_.isEqual(result, { one: "one", three: "three", five: "six" })).toBe(true);
        });
    });

    describe('Deprecated', function () {
        it('should warn when a method is deprecated', function () {
            // IE9 mock for SauceLabs
            if (window.console === undefined) {
                window.console = {
                    warn: function (msg) {
                        return msg;
                    }
                };
            }
            var testObj = {
                newMethod: function () {}
            };
            spyOn(testObj, 'newMethod').and.callThrough();
            spyOn(window.console, 'warn').and.callThrough();
            Util.deprecatedMethod.call(testObj, 'test', 'newMethod', ['arg1', true]);
            expect(testObj.newMethod).toHaveBeenCalledWith('arg1', true);
            expect(window.console.warn).toHaveBeenCalledWith(
                'test is deprecated and will be removed, please use newMethod instead'
            );
        });
    });
});

