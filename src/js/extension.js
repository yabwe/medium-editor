var Extension;
(function(){

    /* global Util */

    Extension = function (options) {
        Util.extend(this, options);
    };

    Extension.extend = function (protoProps) {
        // magic extender thinger. mostly borrowed from backbone/goog.inherits
        // place this function on some thing you want extend-able.
        //
        // example:
        //
        //      function Thing(args){
        //          this.options = args;
        //      }
        //
        //      Thing.prototype = { foo: "bar" };
        //      Thing.extend = extenderify;
        //
        //      var ThingTwo = Thing.extend({ foo: "baz" });
        //
        //      var thingOne = new Thing(); // foo === bar
        //      var thingTwo = new ThingTwo(); // foo == baz
        //
        //      which seems like some simply shallow copy nonsense
        //      at first, but a lot more is going on there.
        //
        //      passing a `constructor` to the extend props
        //      will cause the instance to instantiate through that
        //      instead of the parent's constructor.

        var parent = this, child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.

        if (protoProps && protoProps.hasOwnProperty("constructor")) {
            child = protoProps.constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }

        // das statics (.extend comes over, so your subclass can have subclasses too)
        Util.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        if (protoProps) { Util.extend(child.prototype, protoProps); }

        // todo: $super?

        return child;
    };

    Extension.prototype = {
        init: function(/* instance */){
            // called when properly decorated and used.
            // has a .base value pointing to the editor
            // owning us. has been given a .name if no
            // name present
        }
        // core API definition for an "extension" follows:
    };

})();