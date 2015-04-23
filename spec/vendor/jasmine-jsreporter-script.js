(function () {
    jasmine.getEnv().addReporter(new jasmine.JSReporter2());                   //< for jsreporter

    var oldFunc = window.jasmine.getJSReport;

    window.jasmine.getJSReport = function () {
     var results = oldFunc();
     return removePassing(results);
    };

    function removePassing(results) {
      if (typeof results === "undefined") {
        return false;
      }

      var suites = [];

      for (var i = 0; i < results.length; i++) {
        if (!results.suites[i].passed) {
          suites.push(results.suites[i]);
        }
      }

      results.suites = suites;

      return results;
    }
})();
