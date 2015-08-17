describe('Core MediumEditor', function () {

    it('exists', function () {
        expect(MediumEditor).toBeTruthy();
    });

    describe('MediumEditor.version', function () {

        it('exists', function () {
            expect(MediumEditor.version).toBeTruthy();
        });

        it('has major/minor/revision ints', function () {
            expect(MediumEditor.version.major).toBeDefined();
            expect(MediumEditor.version.minor).toBeDefined();
            expect(MediumEditor.version.revision).toBeDefined();
            expect(MediumEditor.version.preRelease).toBeDefined();
        });

        it('exposes the major/minor/revison as a string', function () {
            var v = '' + MediumEditor.version;
            expect(typeof v).toEqual('string');
        });
    });

    describe('MediumEditor.parseVersionString', function () {

        it('exists', function () {
            expect(MediumEditor.parseVersionString).toBeTruthy();
        });

        it('parses a normal version string', function () {
            var info = MediumEditor.parseVersionString('1.2.3');

            expect(info.major).toBe(1);
            expect(info.minor).toBe(2);
            expect(info.revision).toBe(3);
            expect(info.preRelease).toBe('');
            expect(info.toString()).toBe('1.2.3');
        });

        it('parses pre-release versions', function () {
            var info = MediumEditor.parseVersionString('5.0.0-alpha.1');

            expect(info.major).toBe(5);
            expect(info.minor).toBe(0);
            expect(info.revision).toBe(0);
            expect(info.preRelease).toBe('alpha.1');
            expect(info.toString()).toBe('5.0.0-alpha.1');
        });
    });

});
