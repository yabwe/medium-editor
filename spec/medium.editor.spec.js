/*global MediumEditor*/
/*global describe*/
/*global it*/
/*global expect*/

describe('Medium Editor TestCase', function () {
    'use strict';
    it('should accept multiple instances', function () {
        var editor1 = new MediumEditor('.test'),
            editor2 = new MediumEditor('.test');
        expect(editor1 === editor2).toBe(false);
    });
});
