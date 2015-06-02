var KeyboardCommands;
(function () {
    'use strict';

    /*global Extension, Util */

    KeyboardCommands = Extension.extend({
        name: 'keyboard-commands',

        /* KeyboardCommands Options */

        /* commands: [Array]
         * Array of objects describing each command and the combination of keys that will trigger it
         * Required for each object:
         *   command [String] (argument passed to editor.execAction())
         *   key [String] (keyboard character that triggers this command)
         *   meta [boolean] (whether the ctrl/meta key has to be active or inactive)
         *   shift [boolean] (whether the shift key has to be active or inactive)
         */
        commands: [
            {
                command: 'bold',
                key: 'b',
                meta: true,
                shift: false
            },
            {
                command: 'italic',
                key: 'i',
                meta: true,
                shift: false
            },
            {
                command: 'underline',
                key: 'u',
                meta: true,
                shift: false
            }
        ],

        init: function () {
            Extension.prototype.init.apply(this, arguments);

            this.subscribe('editableKeydown', this.handleKeydown.bind(this));
            this.keys = {};
            this.commands.forEach(function (command) {
                var keyCode = command.key.charCodeAt(0);
                if (!this.keys[keyCode]) {
                    this.keys[keyCode] = [];
                }
                this.keys[keyCode].push(command);
            }, this);
        },

        handleKeydown: function (event) {
            var keyCode = Util.getKeyCode(event);
            if (this.keys[keyCode]) {
                var isMeta = Util.isMetaCtrlKey(event),
                    isShift = !!event.shiftKey;
                this.keys[keyCode].forEach(function (data) {
                    if (data.meta === isMeta &&
                        data.shift === isShift) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.execAction(data.command);
                    }
                }, this);
            }
        }
    });
}());
