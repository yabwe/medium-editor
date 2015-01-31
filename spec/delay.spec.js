/*global MediumEditor, describe, it, expect, spyOn, jasmine, fireEvent,
         afterEach, beforeEach, selectElementContents, runs, waitsFor,
         tearDown */

describe('Delay TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.textContent = 'lore ipsum';
        document.body.appendChild(this.el);
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
        tearDown(this.el);
    });

    it('should call function after delay', function () {
        var editor, spy;

        editor = new MediumEditor('.editor', {delay: 100});
        spy = jasmine.createSpy('spy');
        editor.delay(spy);
        jasmine.clock().tick(50);
        expect(spy).not.toHaveBeenCalled();
        jasmine.clock().tick(150);
        expect(spy).toHaveBeenCalled();
    });
    it('should not call function if editor not active', function () {
        var editor, spy;

        editor = new MediumEditor('.editor', {delay: 1});
        spy = jasmine.createSpy('spy');

        editor.deactivate();
        editor.delay(spy);
        jasmine.clock().tick(100);
        expect(spy).not.toHaveBeenCalled();
    });
});
