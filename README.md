# Medium Editor

This is a clone of [medium.com](medium.com) inline editor toolbar. 

Since I always had problems with bloated editors and I loved the simplicity of medium.com solution I've tried to implement their WYSIWYG approach with this script.

Medium Editor has been written using vanilla JavaScript, no additional frameworks required.

It was tested only on Google Chrome and Firefox most recent versions.

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

## development

Medium Editor development tasks are managed by Grunt. To install all the necessary packages, just invoke:

	npm install

These are the available grunt tasks:

* __js__: runs jslint and jasmine tests and creates minified and concatenated versions of the script;
* __css__: runs compass and csslint
* __test__: runs jasmine tests, jslint and csslint
* __watch__: watch for modifications on script/scss files

The source files are located inside the __src__ directory. Medium Editor stylesheet was created using sass/compass, make sure you have the compass gem installed on your system.