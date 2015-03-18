/*global Util, describe, it, expect, spyOn, jasmine*/

describe('Util', function () {
    'use strict';

    describe('Deprecated', function () {
        it('should warn when a method is deprecated', function () {
            var callback = jasmine.createSpy();
            spyOn(window.console, 'warn').and.callThrough();
            Util.deprecatedMethod('test', 'new', callback);
            expect(callback).toHaveBeenCalled();
            expect(window.console.warn).toHaveBeenCalledWith(
                'test is deprecated and will be removed, please use new instead'
            );
        });
    });
});

