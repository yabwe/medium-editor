var FormExtension;
(function () {
    'use strict';

    /* global Button */

    var noop = function () {};

    /* Base functionality for an extension whcih will display
     * a 'form' inside the toolbar
     */
    FormExtension = Button.extend({
        // default labels for the form buttons
        formSaveLabel: '&#10003;',
        formCloseLabel: '&times;',

        /* hasForm: [boolean]
         *
         * Setting this to true will cause getForm() to be called
         * when the toolbar is created, so the form can be appended
         * inside the toolbar container
         */
        hasForm: true,

        /* getForm: [function ()]
         *
         * When hasForm is true, this function must be implemented
         * and return a DOM Element which will be appended to
         * the toolbar container. The form should start hidden, and
         * the extension can choose when to hide/show it
         */
        getForm: noop,

        /* isDisplayed: [function ()]
         *
         * This function should return true/false reflecting
         * whether the form is currently displayed
         */
        isDisplayed: noop,

        /* hideForm: [function ()]
         *
         * This function should hide the form element inside
         * the toolbar container
         */
        hideForm: noop
    });
})();