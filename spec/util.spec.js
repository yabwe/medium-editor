/*global Util, describe, it, expect, spyOn, jasmine*/

describe('Util', function () {
    'use strict';

    describe('Deprecated', function () {
        it('should warn when a method is deprecated', function () {
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

