document.addEventListener('DOMContentLoaded', function () {
  /*CSRF for example for laravel*/
  //var csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  var csrf = 'fasdf4';

  var ajteEditor = new AJTEAdminEditor({
    containerOffset: {
      x: 0,
      y: 70
    },
    //there is path to root of this script in order to take assets
    scriptUrl: baseUrl,
    code: code,
    title: title,
    category: category,
    templateId: templateId,
    saveInfo: {
      requestHeaders: [
        {'X-CSRF-TOKEN': csrf}
      ],
      // url: baseUrl + "example/templates",
      url: "",
    },
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
      }
    }
  });

  // var ajteEditor = new AJTEUserEditor({
  //   containerOffset: {
  //     x: 0,
  //     y: 70
  //   },
  //   saveUrl: baseUrl + "example/artworks",
  //   scriptUrl: baseUrl,
  //   code: code,
  //   title: title,
  //   category: category,
  //   templateId: templateId,
  //   save: {
  //     requestHeaders: [
  //       {'X-CSRF-TOKEN': csrf}
  //     ],
  //     // url: baseUrl + "example/templates",
  //     url: "",
  //   },
  //   cb:{
  //     image_cb: function(){
  //       console.log('image is loaded then user used Image element')
  //     },
  //     after_create_cb: function(templateId){
  //       console.log('editor elements are loaded')
  //     },
  //     success_cb: function(message){
  //       console.log('success callback')
  //     },
  //     error_cb: function(message){
  //       console.log('error callback')
  //     },  
  //     init_cb: function(){
  //       console.log('editor inited elements')
  //     }
  //   },
  //   customFields: customFields
  // });
 
});