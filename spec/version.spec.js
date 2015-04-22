/*global MediumEditor, describe, it, expect */

describe('Core MediumEditor', function () {

    it('exists', function () {
        expect(MediumEditor).toBeTruthy();
    });

    describe('version', function () {

        it('exists', function () {
            expect(MediumEditor.version).toBeTruthy();
        });

        it('has major/minor/revision ints', function () {
            expect(MediumEditor.version.major).toBeDefined();
            expect(MediumEditor.version.minor).toBeDefined();
            expect(MediumEditor.version.revision).toBeDefined();
        });

        it('exposes the major/minor/revison as a string', function () {
            var v = '' + MediumEditor.version;
            expect(typeof v).toEqual('string');
        });

    });

});
