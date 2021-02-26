# AJTE-canvas-editor
Javascript editor which uses konva.js (https://konvajs.org/), pickr(https://github.com/Simonwep/pickr) and font-awesome (https://github.com/FortAwesome/Font-Awesome).
Also you need to use FontFaceObserver if you need to use not standart fonts. (https://fontfaceobserver.com/)

## Getting Started
### Node

Install via npm:
```shell
$ npm install ajjya-ajte-canvas-aditor
```

Install via yarn:
```shell
$ yarn add ajjya-ajte-canvas-aditor
```

Include code and style:
```js

import '@ajjya/ajte-canvas-aditor/ajteditor.scss';

import { AJTEAdminEditor, AJTEUserEditor } from '@ajjya/ajte-canvas-aditor';
```
---
> Please take into consideration to use the modern version and add polyfills later to your final bundle!
> (Or better: give a hint to users that they should use the latest browsers).
> Browsers such as IE are **not supported** (at least not officially).

### Browser

```html

<link rel="stylesheet" href="../node_modules/@simonwep/pickr/dist/themes/classic.min.css"/>
<link rel="stylesheet" href="../node_modules/font-awesome/css/font-awesome.min.css"/>
<link href="../ajteditor.min.css" rel="stylesheet">

<script type="text/javascript" src="../node_modules/konva/konva.min.js"></script>
<script src="../node_modules/@simonwep/pickr/dist/pickr.min.js"></script>
<script type="text/javascript" src="../ajteditor.js"></script>
```

## Usage
There are 2 variants for usage:
####AJTEAdminEditor - this is full editor where you can create template.
####AJTEUserEditor - this is user editor where you can user created template and just allow user change content from created template.

```javascript
import FontFaceObserver from 'fontfaceobserver';
document.addEventListener('DOMContentLoaded', function () {
  var fontA = new FontFaceObserver('Akaya Telivigala');

  var ajteEditor = new AJTEAdminEditor({
    containerOffset: {
        x: 0,
        y: 70
    },
    saveInfo: {
      requestHeaders: [
        {'X-CSRF-TOKEN': csrf}
      ],
      url: "path/to/controllers/which/save/templates",
    },
    scriptUrl: "path/to/module",
    code: code,
    title: title,
    category: category,
    templateId: templateId,
    cb:{
      image_cb: function(){
        console.log('image is loaded then user used Image element')
      },
      after_create_cb: function(templateId){
        console.log('editor elements are loaded')
      },
      success_cb: function(message){
        console.log('success callback')
      },
      error_cb: function(message){
        console.log('error callback')
      },  
      init_cb: function(){
        console.log('editor inited elements')
        afterInit()
      }
    }
  });

  function afterInit(){
    fontA.load().then(function () {
      ajteEditor.addFont('Akaya Telivigala');
    });
  }
});
```
```html
<body>
	<div id="ajte"></div>

	<script type="text/javascript">
	    window.baseUrl = '';
	    window.code = "";
	    window.title = "";
	    window.category = "";
	    window.templateId = 0;
	    window.customFields = {
			description: {
				name: "description",
				label: "Text for Social Media",
				comment: '<span class="comment_text">500 characters max.</span>',
				value: "some value if needed",
				validation: {
					"max": 500
				}
			}
	    }
	</script>
<body>
```

You can use FontFaceObserver only if you are going to load font.

## Properties
All parametrs are not requiered.
* containerOffset - let/top offset of your editor
* saveInfo:
** requestHeaders(array of objects) - you can add any if needed
** url(string): allow you to save template as JSON. You need just give url which get by POST string variable "code" - and save in any convinient Database
* scriptUrl(string) - path to module in order to take images
* code(string) - code of template if you try to load exists template 
* title(string) - title of template
* category(number) - category of your template if your architecture has categogory of each template
* templateId(number) - ID of tempalate saved in your DB
* cb(object) - set of callbacks
** image_cb - fires then image is loaded then user used Image element
** after_create_cb(templateId) - fires then editor elements are loaded
** success_cb - fires then smth success happends, for example after success saving
** error_cb(message) - fires then error happends, for example after error saving
** init_cb - fires after editor inited elements, you can use it for loading fonts.


You can get more information from example https://github.com/Ajjya/AJTE-canvas-editor/example

