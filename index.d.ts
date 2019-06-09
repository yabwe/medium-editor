// Type definitions for medium-editor 5.0.0
// Project: medium-editor
// Definitions by: Ashinze Ekene <https://github.com/ashinzekene>

export as namespace MediumEditor;

export = MediumEditor;

declare class MediumEditor {
  constructor(element: string | HTMLElement | string[] | NodeList | HTMLCollection, options: MediumEditor.MediumOptions);
}

declare namespace MediumEditor {
  /**
   * Tear down the editor if already setup
   * - Calling the destroy() method on each extension within the editor.
   * This should allow all extension to be torn down and cleaned up, including the toolbar and its elements
   * - Detaching all event listeners from the DOM
   * - Detaching all references to custom event listeners
   * - Remove any custom attributes from the editor **elements**
   * - Unhide any `<textarea>` elements and remove any created `<div>` elements created for `<textarea>` elements
   */
  export const destroy: () => void
  /**
   * Initialize this instance of the editor if it has been destroyed.
   * This will reuse the elements selector and options object passed in when the editor was instantiated
   */
  export const setup: () => void
  
  /**
   * Options to customize medium-editor are passed as the second argument to the MediumEditor constructor.
   */
  export interface MediumOptions {
    /**
     * CSS class added to active buttons in the toolbar.  
     * Default: `'medium-editor-button-active'`
     */
    activeButtonClass: string
    /**
     * Custom content for the toolbar buttons  
     * **NOTE:** Using `fontawesome` as the buttonLabels requires version 4.1.0 of the fontawesome
     * css to be on the page to ensure all icons will be displayed correctly.  
     * Default: `false`
     */
    buttonLabels: false|"fontawesome"
    /**
     * The contentWindow object that contains the contenteditable element.
     * MediumEditor will use this for attaching events, getting selection, etc.  
     * Default: `window`
     */
    contentWindow: object
    /**
     * Time in milliseconds to show the toolbar or anchor tag preview.  
     * Default: `0`
     */
    delay: number
    /**
     * Enables/disables the use of the return-key. You can also set specific element
     * behavior by using setting a data-disable-return attribute.  
     * Default: `false`
     */
    disableReturn: boolean
    /**
     * Allows/disallows two (or more) empty new lines. You can also set specific element
     * behavior by using setting a data-disable-double-return attribute.  
     * Default: `false`
     */
    disableDoubleReturn: boolean
    /**
     * When set to true, it disallows spaces at the beginning and end of the element.
     * Also it disallows entering 2 consecutive spaces between 2 words.  
     * Default: `false`
     */
    disableExtraSpaces: boolean
    /**
     * Enables/disables adding the contenteditable behavior.
     * Useful for using the toolbar with customized buttons/actions.
     * You can also set specific element behavior by using setting a data-disable-editing attribute  
     * Default: `false`
     */
    disableEditing: boolean
    /**
     * Specifies a DOM node to contain MediumEditor's toolbar and anchor preview elements.
     * Default: ownerDocument.body
     */
    elementsContainer: HTMLElement
    /**
     * TODO: Add extension type  
     * Custom extensions to use. See [Custom Buttons and Extensions](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions) for more details on extensions.  
     * Default: `{}`
     */
    extensions: any
    /**
     * The ownerDocument object for the contenteditable element.
     * MediumEditor will use this for creating elements, getting selection, attaching events, etc.  
     * Default: window.document
     */
    ownerDocument: HTMLElement
    /**
     * Enable/disable native contentEditable automatic spellcheck.  
     * Ddfault: `true`
     */
    spellcheck: boolean
    /**
     * Enables/disables automatically adding the `target="_blank"` attribute to anchor tags  
     * Default: false
     */
    targetBlank: boolean
    /**
     * The toolbar for MediumEditor is implemented as a built-in extension which automatically displays
     * whenever the user selects some text. The toolbar can hold any set of defined built-in buttons,
     * but can also hold any custom buttons passed in as extensions  
     * Setting the value to false diables the toolbar
     */
    toolbar: false|MediumEditor.ToolbarOptions
    /**
     * The anchor preview is a built-in extension which automatically displays a 'tooltip' when the user
     * is hovering over a link in the editor. The tooltip will display the href of the link, and when
     * click, will open the anchor editing form in the toolbar.  
     * To disable the anchor preview, set the value of the `anchorPreview` option to `false`:
     */
    anchorPreview: false|MediumEditor.AnchorPreviewOptions
    /**
     * The placeholder handler is a built-in extension which displays placeholder text when the editor is empty.  
     * To disable the placeholder, set the value of the placeholder option to `false`
     */
    placeholder: false|MediumEditor.PlaceholderOptions
    /**
     * The anchor form is a built-in button extension which allows the user to add/edit/remove links from within the editor.
     * When 'anchor' is passed in as a button in the list of buttons, this extension will be enabled
     * and can be triggered by clicking the corresponding button in the toolbar  
     */
    anchor: AnchorFormOptions
    /**
     * The paste handler is a built-in extension which attempts to filter the content when the user pastes.
     * How the paste handler filters is configurable via specific options  
     * To disable MediumEditor manipulating pasted content, set the both the `forcePlainText` and `cleanPastedHTML` options to `false`:
     */
    paste: false
    /**
     * The keyboard commands handler is a built-in extension for mapping key-combinations to actions to execute in the editor  
     * To disable the keyboard commands, set the value of the `keyboardCommands` option to `false`
     */
    keyboardCommands: MediumEditor.KeyboardCommandOptions
    /**
     * The auto-link handler is a built-in extension which automatically turns URLs entered into the text field
     * into HTML anchor tags (similar to the functionality of Markdown).  
     * Default: `false`
     */
    autoLink: boolean
    /**
     * The image dragging handler is a built-in extension for handling dragging & dropping images into the contenteditable  
     * Default: `true`
     */
    imageDragging: boolean
  }
  
  export interface KeyboardCommandOptions {
    /**
     * Array of objects describing each command and the combination of keys that will trigger it.  
     * Default: ```
     *  commands: [  
     *    {  
     *      command: 'bold',  
     *      key: 'b',  
     *      meta: true,  
     *      shift: false  
     *   },  
     *   {  
     *      command: 'italic',  
     *      key: 'i',  
     *      meta: true,  
     *      shift: false  
     *    },  
     *    {  
     *      command: 'underline',  
     *      key: 'u',  
     *      meta: true,  
     *      shift: false  
     *    }
     * ]
     *```
     */
    commands: KeyboardCommmad[]
  }
  
  export interface KeyboardCommmad {
    /**
     * Argument passed to editor.execAction() when key-combination is used
     */
    command: string,
    /**
     * Keyboard character that triggers this command
     */
    key: string,
    /**
     * Whether the ctrl/meta key has to be active or inactive
     */
    meta: boolean,
    /**
     * Whether the shift key has to be active or inactive
     */
    shift: boolean
  }

  /**
   * Options for the pasting
   */
  export interface PasteOptions {
    /**
     * Forces pasting as plain text  
     * Default: `true`
     */
    forcePlainText: boolean
    /**
     * Cleans pasted content from different sources, like google docs etc   
     * Default: `false` 
     */
    cleanPastedHTML: boolean
    /**
     * Custom pairs (2 element arrays) of `RegExp` and replacement text to use during paste when
     * `forcePlainText` or `cleanPastedHTML` are true OR when calling `cleanPaste(text)` helper method  
     * Default: `[]`
     */
    cleanReplacements: string[]
    /**
     * List of element attributes to remove during paste when `cleanPastedHTML` is `true`
     * or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods  
     * Default: `['class', 'style', 'dir']` 
     */
    cleanAttrs: string[]
    /**
     * List of element tag names to remove during paste when `cleanPastedHTML` is `true`
     * or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods  
     * Default: `['meta']`
     */
    cleanTags: string[]
    /**
     * List of element tag names to unwrap (remove the element tag but retain its child elements)
     * during paste when `cleanPastedHTML` is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods  
     * Default: `[]`
     */
    unwrapTags: string[]
  }

  /**
   * Options for the anchor form
   */
  export interface AnchorFormOptions {
    /**
     * Custom class name the user can optionally have added to their created links (ie 'button').
     * If passed as a non-empty string, a checkbox will be displayed allowing the user to
     * choose whether to have the class added to the created link or not
     * Default: `null`
     */
    customClassOption: string
    /**
     * Text to be shown in the checkbox when the **customClassOption** is being used
     * Default: `'Button'`
     */
    customClassOptionText: string
    /**
     * Enables/disables check for common URL protocols on anchor links. Converts invalid url characters (ie spaces) to valid characters using `encodeURI`
     * Default: `false`
     */
    linkValidation: boolean
    /**
     * Default: `'Paste or type a link'`
     */
    placeholderText
    /**
     * Text to be shown as placeholder of the anchor input
     * Default: `false`
     */
    targetCheckbox: string
    /**
     * Text to be shown in the checkbox enabled via the **targetCheckbox** option
     * Default: `'Open in new window'`
     */
    targetCheckboxText: string
  }
  
  /**
   * Options for the placeholder
   */
  export interface PlaceholderOptions {
    /**
     * Defines the default placeholder for empty contenteditables when **placeholder** is not set to false.
     * You can overwrite it by setting a `data-placeholder` attribute on the editor elements  
     * Default: `'Type your text'`
     */
    text: string
    /**
     * Causes the placeholder to disappear as soon as the field gains focus.
     * To hide the placeholder only after starting to type, and to show it
     * again as soon as field is empty, set this option to `false`  
     * Default: true
     */
    hideOnClick: boolean
  }

  /**
   * Options for the anchor preview 'tooltip' 
   */
  export interface AnchorPreviewOptions {
    /**
     * Time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag  
     * Default: 500
     */
    hideDelay: number
    /**
     * The default selector to locate where to put the activeAnchor value in the preview.
     * You should only need to override this if you've modified the way in which the anchor-preview extension renders  
     * Default: `'a'`
     */
    previewValueSelector: string
    /**
     * Determines whether the anchor tag preview shows up on link with href as "" or "#something".
     * You should set this value to false if you do not want the preview to show up in such use cases  
     * Default: `true`
     */
    showOnEmptyLinks: boolean
    /**
     * Determines whether the anchor tag preview shows up when the toolbar is visible.
     * You should set this value to true if the static option for the toolbar is true and
     * you want the preview to show at the same time.  
     * Default: `false`
     */
    showWhenToolbarIsVisible: boolean
  }

  /**
   * Options for the toolbar
   */
  export interface ToolbarOptions {
    /**
     * Enables/disables whether the toolbar should be displayed when selecting multiple paragraphs/block elements  
     * Default: true
     */
    allowMultiParagraphSelection: boolean
    /**
     * The set of buttons to display on the toolbar.  
     * Default: `['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote']`  
     * TODO: Check if there a button list type can be created
     */
    buttons: string[]
    /**
     * Value in pixels to be added to the X axis positioning of the toolbar.  
     * Default: `0`
     */
    diffLeft: number
    /**
     * Value in pixels to be added to the Y axis positioning of the toolbar.  
     * Default: `-10`
     */
    diffTop: number
    /**
     * CSS class added to the first button in the toolbar  
     * Default: `'medium-editor-button-first'`
     */
    firstButtonClass: string
    /**
     * CSS class added to the last button in the toolbar.  
     * Default: `'medium-editor-button-last'`
     */
    lastButtonClass
    /**
     * DOMElement to append the toolbar to instead of the body.
     * When an element is passed the toolbar will also be positioned `relative`
     * instead of `absolute`, which means the editor will not attempt to manually position the toolbar automatically  
     * Default: `null`  
     * **NOTE:** Using this in combination with the static option for toolbar is not
     * explicitly supported and the behavior in this case is not defined
     */
    relativeContainer: HTMLElement
    /**
     * Enables/disables standardizing how the beginning of a range is decided between browsers
     * whenever the selected text is analyzed for updating toolbar buttons status  
     * Default: `false`
     */
    standardizeSelectionStart: boolean
    /**
     * Enable/disable the toolbar always displaying in the same location relative to the medium-editor element.  
     * Default: false
     */
    static: boolean
    /**
     * When the static option is `true`, this aligns the static toolbar relative to the medium-editor element.  
     * Default: `center`
     */
    align: 'left' | 'center' | 'right'
    /**
     * When the static option is `true`, this enables/disables the toolbar "sticking"
     * to the viewport and staying visible on the screen while the page scrolls  
     * Default: false
     */
    sticky: boolean
    /**
     * When the static option is true, this enables/disables updating the state of the
     * toolbar buttons even when the selection is collapsed (there is no selection, just a cursor).  
     * Default: `false`
     */
    updateOnEmptySelection: boolean
  }
  
}