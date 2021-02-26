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
AJTEAdminEditor - this is full editor where you can create template.
AJTEUserEditor - this is user editor where you can user created template and just allow user change content from created template.

```javascript
import FontFaceObserver from 'fontfaceobserver';
document.addEventListener('DOMContentLoaded', function () {
  var fontA = new FontFaceObserver('Akaya Telivigala');

  var ajteEditor = new AJTEAdminEditor({
    containerOffset: {
        x: 0,
        y: 70
    },
    saveUrl: base_url + "/templates/save",
    saveInfo: {
      requestHeaders: [
        {'X-CSRF-TOKEN': csrf}
      ],
      // url: baseUrl + "example/templates",
      url: "",
    },
    code: code,
    title: title,
    category: category,
    template_id: template_id,
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
You can get more inormation from example https://github.com/Ajjya/AJTE-canvas-editor/example

