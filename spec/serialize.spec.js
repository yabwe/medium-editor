describe('Anchor Button TestCase', function () {
    'use strict';

    beforeEach(function () {
        setupTestHelpers.call(this);
        this.el = this.createElement('div', 'editor', '<p>lorem <strong>ipsum</strong></p>');
        this.el.id = 'medium-editor-test';
    });

    afterEach(function () {
        this.cleanupTest();
    });

    it('should return the editor content as a JSON object', function () {
        var editor = this.newMediumEditor('.editor'),
            json = editor.serialize();
        expect(json).toEqual({
            'medium-editor-test': {
                value: '<p>lorem <strong>ipsum</strong></p>'
            }
        });
    });

    it('should set a custom id when elements have no ids', function () {
        this.el.removeAttribute('id');
        var editor = this.newMediumEditor('.editor'),
            json = editor.serialize();
        expect(json).toEqual({
            'element-0': {
                value: '<p>lorem <strong>ipsum</strong></p>'
            }
        });
    });

});
