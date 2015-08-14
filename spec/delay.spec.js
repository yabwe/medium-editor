describe('Delay TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', 'lore ipsum');
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should call function after delay', function () {
        var editor, spy;

        editor = this.newMediumEditor('.editor', { delay: 100 });
        spy = jasmine.createSpy('spy');
        editor.delay(spy);
        jasmine.clock().tick(50);
        expect(spy).not.toHaveBeenCalled();
        jasmine.clock().tick(150);
        expect(spy).toHaveBeenCalled();
    });
    it('should not call function if editor not active', function () {
        var editor, spy;

        editor = this.newMediumEditor('.editor', { delay: 1 });
        spy = jasmine.createSpy('spy');

        editor.destroy();
        editor.delay(spy);
        jasmine.clock().tick(100);
        expect(spy).not.toHaveBeenCalled();
    });
});
