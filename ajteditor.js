'use strict';
(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    window.Pickr = require('@simonwep/pickr');
    window.Konva = require('konva');
    if (global.document) {
      module.exports = factory(global);
    } else {
      throw new Error('AJTE Editor requires a browser to run.');
    }
  } else if (typeof define === 'function' && define.amd) {
    define('AJTEEditor', [], factory(global));
  } else {
    factory(global);
  }
})(typeof window !== 'undefined' ? window : this, (window) => {
  var ajteMode = 'prod';

  function AJTESwitcher(el, input, cb) {
    this.el = el;
    this.input = input;
    this.children = [];
    this.count = 0;
    this.active = 0;
    this.cb = cb;
    this.init = function () {
      var self = this;
      this.children = el.children;
      this.count = this.children.length;

      this.setInitValue(self);

      for (var i = 0; i < this.count; i++) {
        this.children[i].addEventListener('click', function (e) {
          self.clickEl(self);
          if (cb) {
            cb({
              name: self.input.name,
              value: self.input.value
            });
          }
          e.preventDefault();
        });
      }
    };

    this.init();
  }

  AJTESwitcher.prototype.setInitValue = function (self) {
    var value = self.input.value;

    for (var i = 0; i < this.count; i++) {
      if (self.children[i].dataset.value == value) {
        self.active = i;
        break;
      }
    }

    self.activateElement(self);
  };

  AJTESwitcher.prototype.activateElement = function (self) {
    for (var i = 0; i < this.count; i++) {
      self.children[i].classList.remove('active');
    }

    self.children[self.active].classList.add('active');
    self.input.value = self.children[self.active].dataset.value;
  };

  AJTESwitcher.prototype.clickEl = function (self) {
    var active = self.active + 1;
    if (active >= self.count) active = 0;
    self.active = active;
    self.activateElement(self);
  };

  function AJTEChoose(el, input, cb) {
    this.el = el;
    this.input = input;
    this.active = 0;
    this.cb = cb;
    this.init = function () {
      var self = this;
      self.setInitValue(self);

      self.el.addEventListener('click', function (e) {
        self.clickEl(self);
        if (cb) {
          cb({
            name: self.input.name,
            value: self.input.value
          });
        }
        e.preventDefault();
      });
    };

    this.init();
  }

  AJTEChoose.prototype.setInitValue = function (self) {
    var value = self.input.value;
    self.el.dataset['value'] = value;

    if (value == 'true') {
      self.activateElement(self);
    }
  };

  AJTEChoose.prototype.activateElement = function (self) {
    self.active = 1;
    self.el.classList.add('active');
    self.input.value = true;
  };

  AJTEChoose.prototype.deactivateElement = function (self) {
    self.active = 0;
    self.el.classList.remove('active');
    self.input.value = false;
  };

  AJTEChoose.prototype.clickEl = function (self) {
    if (!self.active) {
      self.activateElement(self);
    } else {
      self.deactivateElement(self);
    }
  };

  /*------------------------------------------------------------------------------------------------------------------*/

  function AJTEBar(args, cb) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:construtor');
    }

    this.container = document.getElementById('ajtebar');
    this.disabler = null;

    if (!this.container) {
      console.error("Container <div id='ajtebar'></div> was not created");
      return;
    }

    if (!args.AJTEEditor) {
      console.error('No parent Instance');
    }

    this.cb = {
      image_cb: cb && cb.image_cb ? cb.image_cb : null
    };

    this.buttons = args.buttons
      ? args.buttons
      : ['text', 'editableText', 'image', 'shape'];

    this.settings = {
      AJTEEditor: args.AJTEEditor,
      colopicker: {
        swatches: [
          '#F44336',
          '#E91E63',
          '#9C27B0',
          '#673AB7',
          '#3F51B5',
          '#2196F3',
          '#03A9F4',
          '#00BCD4',
          '#009688',
          '#4CAF50',
          '#8BC34A',
          '#CDDC39',
          '#FFEB3B',
          '#FFC107'
        ]
      },
      fonts: [
        'Arial',
        'Impact',
        'Tahoma',
        'Times New Roman',
        'Comic Sans MS',
        'Courier New',
        'Georgia',
        'Trebuchet MS',
        'Verdana'
      ]
    };

    this.args = args;

    this.elements = {
      fontFamily: null
    };

    this.init();
  }

  AJTEBar.prototype.init = function () {
    this.addBody();
    this.drawToolbar();
    this.addToolbarEventListeners();
  };

  AJTEBar.prototype.disable = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:disable');
    }

    this.disabler.style.display = 'flex';
  };

  AJTEBar.prototype.enable = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:enable');
    }

    this.disabler.style.display = 'none';
  };

  AJTEBar.prototype.addFont = function (fontFamily) {
    this.settings.fonts.push(fontFamily);
    var fontFamilyOptions = this.generateFontOptions(this.args);
    if (fontFamilyOptions && this.elements.fontFamily) {
      this.elements.fontFamily.innerHTML = fontFamilyOptions;
    }
  };

  AJTEBar.prototype.generateFontOptions = function (args) {
    var fontFamilyOptions = '';
    for (var i = 0; i < this.settings.fonts.length; i++) {
      fontFamilyOptions += '<option';
      if (this.settings.fonts[i] == args.fontFamily) {
        fontFamilyOptions += ' selected ';
      }
      fontFamilyOptions += '>' + this.settings.fonts[i] + '</option>';
    }

    return fontFamilyOptions;
  };

  AJTEBar.prototype.getBarInfo = function (type, args) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:getBarInfo');
    }

    if (!args) {
      switch (type) {
        case 'editableText':
          args = this.args['text'];
          break;
        default:
          args = this.args[type];
      }
    }

    var bar_info = {};
    switch (type) {
      case 'text':
        bar_info = {
          menu: '<li><a href="#" id="ajteText" data-type="text"><i class="fa fa-file-alt"></i><span>Text</span></a></li>',
          content: this.getTextContent(args)
        };
        break;
      case 'editableText':
        bar_info = {
          menu: '<li><a href="#" id="ajteEditableText" data-type="editableText"><i class="fa fa-edit"></i><span>Editable text</span></a></li>',
          content: this.getTextContent(args)
        };
        break;
      case 'image':
        bar_info = {
          menu: '<li><a href="#" id="ajteImage"><i class="fa fa-file-image"></i><span>Image</span></a></li>',
          content: ''
        };
        break;
      case 'shape':
        bar_info = {
          menu: '<li class="ajte-menu-has-children"><a href="#" id="ajteShape"><i class="fa fa-shapes"></i><span>Shapes</span></a>\
                        <ul class="ajte-submenu"> \
                            <li><a href="#" id="ajteRect" data-type="rect"><span>Rectangular</span></a></li>\
                            <li><a href="#" id="ajteCircle" data-type="circle"><span>Circle</span></a></li>\
                            <li><a href="#" id="ajteEllipse" data-type="ellipse"><span>Ellipse</span></a></li>\
                            <li><a href="#" id="ajteLine" data-type="line"><span>Line</span></a></li>\
                        </ul></li>',
          content: ''
        };
        break;
      case 'rect':
        bar_info = {
          menu: '<li><a href="#" id="ajteRect" data-type="rect"><span>Rectangular</span></a></li>',
          content: this.getShapeContent(args, type)
        };
        break;
      case 'circle':
        bar_info = {
          menu: '<li><a href="#" id="ajteCircle" data-type="circle"><span>Circle</span></a></li>',
          content: this.getShapeContent(args, type)
        };
        break;
      case 'ellipse':
        bar_info = {
          menu: '<li><a href="#" id="ajteEllipse" data-type="ellipse"><span>Ellipse</span></a></li>',
          content: this.getShapeContent(args, type)
        };
        break;
      case 'line':
        bar_info = {
          menu: '<li><a href="#" id="ajteLine" data-type="line"><span>Line</span></a></li>',
          content: this.getLineContent(args)
        };
        break;
      default:
        bar_info = {
          menu: '',
          content: ''
        };
    }

    return {
      menu: bar_info.menu,
      content: bar_info.content
    };
  };

  AJTEBar.prototype.getTextContent = function (args) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:getTextContent');
    }

    var fontFamilyOptions = this.generateFontOptions(args);

    return (
      '<li> \
            <div class="ajte-picker-wrap"> \
                <input id="ajte-color1" type="hidden" name="fill" value="' +
      args.fill +
      '" /> \
                <div id="ajte-picker1"></div> \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-size-wrap"> \
                <i class="fa fa-text-height"></i> \
                <input name="fontSize" class="ajte-font-size" type="number" size="20" value="' +
      args.fontSize +
      '" /> \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-size-wrap"> \
                <i class="fa fa-arrows-alt-v"></i> \
                <input name="lineHeight" class="ajte-font-size" type="number" size="20" step="0.1" value="' +
      args.lineHeight +
      '" /> \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-family-wrap"> \
                <i class="fa fa-font"></i> \
                <select id="fontFamily" name="fontFamily"> ' +
      fontFamilyOptions +
      '</select>   \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-align-wrap"> \
                <input type="hidden" name="align" value="left"/> \
                <div class="switcher"> \
                    <div data-value="left"> \
                        <i class="fa fa-align-left"></i> \
                    </div>  \
                    <div data-value="center"> \
                        <i class="fa fa-align-center"></i> \
                    </div>  \
                    <div data-value="right"> \
                        <i class="fa fa-align-right"></i> \
                    </div>  \
                    <div data-value="justify"> \
                        <i class="fa fa-align-justify"></i> \
                    </div>  \
                </div>  \
            </div>  \
        </li> \
        <li> \
            <div class="ajte-font-style-wrap"> \
                <input type="hidden" name="isBold" value="' +
      args.isBold +
      '"/> \
                <div class="ajte-choose"> \
                    <i class="fa fa-bold"></i> \
                </div>  \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-style-wrap"> \
                <input type="hidden" name="isItalic" value="' +
      args.isItalic +
      '"/> \
                <div class="ajte-choose"> \
                    <i class="fa fa-italic"></i> \
                </div>  \
            </div> \
        </li> \
        <li> \
            <div class="ajte-font-style-wrap"> \
                <input type="hidden" name="isUnderline" value="' +
      args.isUnderline +
      '"/> \
                <div class="ajte-choose"> \
                    <i class="fa fa-underline"></i> \
                </div>  \
            </div> \
        </li> \
        <li> \
            <div class="ajte-padding-wrap"> \
                <span>Paddings:</span> \
                <i class="fa fa-arrow-up"></i> \
                <input name="paddingTop" class="ajte-padding" type="text" size="5" value="' +
      args.paddingTop +
      '" /> \
                <i class="fa fa-arrow-right"></i> \
                <input name="paddingRight" class="ajte-padding" type="text" size="5" value="' +
      args.paddingRight +
      '" /> \
                <i class="fa fa-arrow-down"></i> \
                <input name="paddingBottom" class="ajte-padding" type="text" size="5" value="' +
      args.paddingBottom +
      '" /> \
                <i class="fa fa-arrow-left"></i> \
                <input name="paddingLeft" class="ajte-padding" type="text" size="5" value="' +
      args.paddingLeft +
      '" /> \
            </div> \
        </li>'
    );

    this.elements.fontFamily = document.getElementById('fontFamily');
  };

  AJTEBar.prototype.getShapeContent = function (args, type) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:getShapeContent');
    }
    var str =
      '<li> \
                <div class="ajte-picker-wrap"> \
                    <span>Fill:</span>   \
                    <input id="ajte-color2" type="hidden" name="fill" value="' +
      args.fill +
      '" /> \
                    <div id="ajte-picker2"></div> \
                </div> \
            </li> \
            <li> \
                <div class="ajte-picker-wrap"> \
                    <span>Stroke:</span>   \
                    <input id="ajte-color3" type="hidden" name="stroke" value="' +
      args.stroke +
      '" /> \
                    <div id="ajte-picker3"></div> \
                </div> \
            </li>  \
            <li> \
                <div class="ajte-stroke-width-wrap"> \
                    <i class="fa fa-border-style"></i> \
                    <input name="strokeWidth" class="ajte-font-size" type="number" size="20" value="' +
      args.strokeWidth +
      '" /> \
                </div> \
            </li>';

    if (type == 'rect') {
      str +=
        '<li> \
                    <div class="ajte-corner-radius-width-wrap"> \
                        <span>Border radius:</span> \
                        <i class="fa fa-arrow-up"></i> \
                        <input name="borderRadiusTop" class="ajte-padding" type="text" size="5" value="' +
        args.borderRadiusTop +
        '" /> \
                        <i class="fa fa-arrow-right"></i> \
                        <input name="borderRadiusRight" class="ajte-padding" type="text" size="5" value="' +
        args.borderRadiusRight +
        '" /> \
                        <i class="fa fa-arrow-down"></i> \
                        <input name="borderRadiusBottom" class="ajte-padding" type="text" size="5" value="' +
        args.borderRadiusBottom +
        '" /> \
                        <i class="fa fa-arrow-left"></i> \
                        <input name="borderRadiusLeft" class="ajte-padding" type="text" size="5" value="' +
        args.borderRadiusLeft +
        '" /> \
                    </div> \
                </li>';
    }
    return str;
  };

  AJTEBar.prototype.getLineContent = function (args) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:getLineContent');
    }

    return (
      '<li> \
                <div class="ajte-picker-wrap"> \
                    <span>Stroke:</span>   \
                    <input id="ajte-color3" type="hidden" name="stroke" value="' +
      args.stroke +
      '" /> \
                    <div id="ajte-picker3"></div> \
                </div> \
            </li>  \
            <li> \
                <div class="ajte-stroke-width-wrap"> \
                    <i class="fa fa-border-style"></i> \
                    <input name="strokeWidth" class="ajte-font-size" type="number" size="20" value="' +
      args.strokeWidth +
      '" /> \
                </div> \
            </li> '
    );
  };

  AJTEBar.prototype.addBody = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:addBody');
    }

    var htmldata =
      '<div class="ajte-row ajte-barline-border"> \
                    <div class="ajte-container ajte-barcontainer"> \
                        <div class="ajte-leftside"> \
                            <ul id="ajte-tools" class="ajte-list"> \
                            </ul> \
                        </div> \
                        <div class="ajte-middleside"> \
                            <div class="ajte-stage-size"> \
                                <span>X:</span>  \
                                <input type="number" name="stageWidth" class="ajte-stage" value="' +
      this.args.stage.width +
      '" maxlength="4">    \
                                <span>Y:</span>  \
                                <input type="number" name="stageHeight" class="ajte-stage" value="' +
      this.args.stage.height +
      '" maxlength="4">    \
                            </div>  \
                        </div> \
                        <div class="ajte-rightside"> \
                            <ul class="ajte-list"> \
                                <li class="ajte-menu-has-children"> \
                                    <a href="#"><i class="fa fa-arrows-alt"></i><span>Position</span></a>  \
                                    <ul class="ajte-submenu"> \
                                        <li><a href="#" id="ajte-up" data-element-action="up"><i class="fa fa-angle-up"></i><span>Up</span></a></li> \
                                        <li><a href="#" id="ajte-down" data-element-action="down"><i class="fa fa-angle-down"></i><span>Down</span></a></li> \
                                    </ul> \
                                </li> \
                                <li><a href="#" id="ajte-undo" data-action="undo"><i class="fa fa-undo"></i><span>Undo</span></a></li> \
                                <li><a href="#" id="ajte-redo" data-action="redo"><i class="fa fa-redo"></i><span>Redo</span></a></li> \
                                <li><a href="#" id="ajte-trash" data-action="reset"><i class="fa fa-trash"></i><span>Reset</span></a></li> \
                                <li><a href="#" id="ajte-restore" data-action="restore"><i class="fa fa-trash-restore"></i><span>Restore</span></a></li> \
                            </ul> \
                        </div> \
                        <div id="ajte-bar-disabler"> \
                        </div> \
                    </div> \
                </div> \
                <div class="ajte-row ajte-infoline-border"> \
                    <div class="ajte-container ajte-barseccontainer"> \
                        <div class="ajte-leftside"> \
                            <ul class="ajte-list" id="ajtebarcontent"> \
                            </ul> \
                        </div> \
                        <div class="ajte-rightside"> \
                        </div> \
                    </div> \
                </div>';
    this.container.innerHTML = htmldata;
    this.disabler = document.getElementById('ajte-bar-disabler');
  };

  AJTEBar.prototype.addToolbarEventListeners = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:addToolbar');
    }

    var self = this;

    var menuItems = document.querySelectorAll('#ajtebar a[data-type]');
    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener('click', function () {
        self.menuCreateElement(self, this);
        return false;
      });
    }

    var actionElementItems = document.querySelectorAll(
      '#ajtebar a[data-element-action]'
    );
    for (var i = 0; i < actionElementItems.length; i++) {
      actionElementItems[i].addEventListener('click', function () {
        self.menuElementAction(self, this);
        return false;
      });
    }

    var actionItems = document.querySelectorAll('#ajtebar a[data-action]');
    for (var i = 0; i < actionItems.length; i++) {
      actionItems[i].addEventListener('click', function () {
        self.menuAction(self, this);
        return false;
      });
    }

    var ajteStageInputsNumber = document.querySelectorAll(
      '#ajtebar input[type=number].ajte-stage'
    );
    for (var i = 0; i < ajteStageInputsNumber.length; i++) {
      ajteStageInputsNumber[i].addEventListener('click', function (e) {
        var value = e.target.value;
        var name = e.target.name;

        self.settings.AJTEEditor.changeStagePlaceholderStyle({
          name: name,
          value: value
        });
      });
      ajteStageInputsNumber[i].addEventListener('keyup', function (e) {
        var value = e.target.value;
        var name = e.target.name;

        self.settings.AJTEEditor.changeStagePlaceholderStyle({
          name: name,
          value: value
        });
      });
    }

    var ajteImage = document.getElementById('ajteImage');
    if (ajteImage) {
      ajteImage.addEventListener('click', function () {
        self.cb.image_cb();
      });
    }
  };

  AJTEBar.prototype.menuElementAction = function (self, el) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:menuElementAction');
    }

    var action = el.dataset['elementAction'];
    self.settings.AJTEEditor.actElement(action);
  };

  AJTEBar.prototype.menuAction = function (self, el) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:menuAction');
    }

    var action = el.dataset['action'];
    self.settings.AJTEEditor[action]();
  };

  AJTEBar.prototype.menuCreateElement = function (self, el) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:menuCreateElement');
    }

    var type = el.dataset.type;

    self.setToolbarContent(self, type);

    self.settings.AJTEEditor.createElement(self.args[type], type);
  };

  AJTEBar.prototype.drawToolbar = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:drawToolbar');
    }

    var container = document.getElementById('ajte-tools');
    var self = this;
    var htmlmenu = '';

    self.buttons.forEach(function (item, i) {
      htmlmenu += self.getBarInfo(item).menu;
    });

    container.innerHTML = htmlmenu;

    var items = document.querySelectorAll('.ajte-menu-has-children>a');
    for (var i = 0; i < items.length; i++) {
      var icon = document.createElement('i');
      icon.classList.add('fa');
      icon.classList.add('fa-sort-down');
      items[i].append(icon);
    }
  };

  AJTEBar.prototype.activateToolbarContent = function (self) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:activateToolbarContent');
    }

    for (var i = 1; i <= 3; i++) {
      if (document.getElementById('ajte-picker' + i)) {
        var input = document.getElementById(
          'ajte-picker' + i
        ).previousElementSibling;

        var pickr = Pickr.create({
          el: '#ajte-picker' + i,
          default: input.value,
          swatches: self.settings.colopicker.swatches,
          components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
              hex: true,
              rgba: true,
              hsva: true,
              input: true,
              save: true
            }
          }
        });
        pickr.on('save', (color, instance) => {
          var input = instance._root.root.previousElementSibling;
          input.value = color.toHEXA();
          self.settings.AJTEEditor.changeElementStyle({
            name: input.name,
            value: input.value
          });
          instance.hide();
        });
      }
    }

    var switchers = document.getElementsByClassName('switcher');
    for (var i = 0; i < switchers.length; i++) {
      var input = switchers[i].previousElementSibling;
      new AJTESwitcher(
        switchers[i],
        input,
        self.settings.AJTEEditor.changeElementStyle.bind(
          self.settings.AJTEEditor
        )
      );
    }

    var ajteChooses = document.getElementsByClassName('ajte-choose');
    for (var i = 0; i < ajteChooses.length; i++) {
      var input = ajteChooses[i].previousElementSibling;
      new AJTEChoose(
        ajteChooses[i],
        input,
        self.settings.AJTEEditor.changeElementStyle.bind(
          self.settings.AJTEEditor
        )
      );
    }

    var ajteSelects = document.querySelectorAll('#ajtebar select');
    for (var i = 0; i < ajteSelects.length; i++) {
      ajteSelects[i].addEventListener('change', function (e) {
        var value = e.target.value;
        var name = e.target.name;

        self.settings.AJTEEditor.changeElementStyle({
          name: name,
          value: value
        });
      });
    }

    var ajteInputsNumber = document.querySelectorAll(
      '#ajtebar input[type=number]:not(.ajte-stage)'
    );
    for (var i = 0; i < ajteInputsNumber.length; i++) {
      ajteInputsNumber[i].addEventListener('click', function (e) {
        var value = e.target.value;
        var name = e.target.name;

        self.settings.AJTEEditor.changeElementStyle({
          name: name,
          value: value
        });
      });
    }

    var ajteInputsText = document.querySelectorAll('#ajtebar input[type=text]');
    for (var i = 0; i < ajteInputsText.length; i++) {
      ajteInputsText[i].addEventListener('keyup', function (e) {
        if (e.keyCode < 48 || e.keyCode > 123) {
          return;
        }

        var value = e.target.value;
        var name = e.target.name;

        self.settings.AJTEEditor.changeElementStyle({
          name: name,
          value: value
        });
      });
    }
  };

  AJTEBar.prototype.resetToolbarContent = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:resetToolbarContent');
    }

    var container = document.getElementById('ajtebarcontent');
    if (container) container.innerHTML = '';
  };

  AJTEBar.prototype.setToolbarContent = function (self, type, args) {
    if (ajteMode == 'dev') {
      console.info('AJTEBar:setToolbarContent');
    }
    var container = document.getElementById('ajtebarcontent');
    if (container) {
      var htmlcontent = self.getBarInfo(type, args).content;

      container.innerHTML = htmlcontent;

      self.activateToolbarContent(self);
    }
  };

  /*-----------------------------------------------------------------------------------------------------------------------*/

  function AJTESmallBar(args, cb) {
    if (ajteMode == 'dev') {
      console.info('AJTESmallBar:construtor');
    }
    AJTEBar.call(this, args, cb);
  }

  AJTESmallBar.prototype = Object.create(AJTEBar.prototype);

  AJTESmallBar.prototype.init = function () {
    this.addBody();
    this.addToolbarEventListeners();
  };

  AJTESmallBar.prototype.addBody = function () {
    if (ajteMode == 'dev') {
      console.info('AJTESmallBar:addBody');
    }

    var htmldata =
      '<div class="ajte-row ajte-barline-border"> \
                    <div class="ajte-container ajte-barcontainer"> \
                        <div class="ajte-leftside" id="ajte-leftside"> \
                        </div> \
                        <div class="ajte-rightside"> \
                            <ul class="ajte-list"> \
                                <li><a href="#" id="ajte-undo" data-action="undo"><i class="fa fa-undo"></i><span>Undo</span></a></li> \
                                <li><a href="#" id="ajte-redo" data-action="redo"><i class="fa fa-redo"></i><span>Redo</span></a></li> \
                            </ul> \
                        </div> \
                        <div id="ajte-bar-disabler"> \
                        </div> \
                    </div> \
                </div> \
                <div class="ajte-row ajte-infoline-border"> \
                </div>';
    this.container.innerHTML = htmldata;
    this.disabler = document.getElementById('ajte-bar-disabler');

    var asideButtons = document.getElementById('ajte-leftside');
    var btns = document.createElement('div');
    btns.innerHTML =
      '<div> \
            <div class="ajtefirstbtnline">    \
                <a href="#" class="ajte-btn" data-action="save"><span>SAVE AS DRAFT</span></a>  \
                <a href="#" class="ajte-btn ajte-btn-green" data-action="send"><span>SEND</span></a>  \
                <a href="#" class="ajte-btn ajte-btn-dark" data-action="download"><i class="fa fa-download"></i><span>DOWNLOAD</span></a> \
            </div> \
        </div>';
    asideButtons.appendChild(btns);
  };
  /*-----------------------------------------------------------------------------------------------------------------------*/

  function AJTEElement(args, AJTEEditor) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:constructor');
    }

    this.label = args && args.label ? args.label : '';
    this.value = args && args.value ? args.value : '';
    this.el = null;
    this.AJTEEditor = AJTEEditor;
    this.layer = AJTEEditor.layer;
    this.stage = AJTEEditor.stage;
    this.transformer = null;
    this.index = args && args.index ? args.index : 0;
  }

  AJTEElement.prototype = {
    layer: null,
    stage: null,
    transfromer: null,
    AJTEEditor: null
  };

  AJTEElement.prototype.initElement = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:initElement');
    }
    var self = this;

    if (self.AJTEEditor instanceof AJTEUserEditor) {
      self.initInactiveElement();
    } else {
      self.initActiveElement();
    }

    if (this.el.attrs.index != undefined) {
      this.el.zIndex(this.el.attrs.index);
      this.el.index = this.el.attrs.index;
    }

    this.createLabel();

    self.AJTEEditor.enable();
    self.AJTEEditor.activateElement(self, self.type);

    this.layer.draw();
  };

  AJTEElement.prototype.createLabel = function () {};

  AJTEElement.prototype.initInactiveElement = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:initInactiveElement');
    }
    var self = this;

    if (this instanceof AJTEImage) {
      self.transformer = new Konva.Transformer({
        node: self.el
      });

      self.el.setAttrs({
        draggable: true
      });
      self.el.on('mouseover', function () {
        self.elOnDrag(self.el);
      });

      self.el.on('mouseout', function () {
        self.elOnDrop(self.el);
      });

      self.el.on('transformend', function () {
        self.addToHistoryAfterTransform(self);
      });
    } else {
      self.el.setAttrs({
        draggable: false
      });
    }
  };

  AJTEElement.prototype.initActiveElement = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:initActiveElement');
    }
    var self = this;

    if (self instanceof AJTEText) {
      self.transformer = new Konva.Transformer({
        node: self.el,
        enabledAnchors: ['middle-left', 'middle-right'],
        // set minimum width of text
        boundBoxFunc: function (oldBox, newBox) {
          newBox.width = Math.max(30, newBox.width);
          return newBox;
        }
      });

      self.el.on('dblclick', () => {
        self.editText();
      });
    } else {
      self.transformer = new Konva.Transformer({
        node: self.el
      });
    }

    self.el.setAttrs({
      draggable: true
    });

    self.el.on('mouseover', function () {
      self.elOnDrag(self.el);
    });

    self.el.on('mouseout', function () {
      self.elOnDrop(self.el);
    });

    self.el.on('transformend', function () {
      self.addToHistoryAfterTransform(self);
    });

    this.focus();
  };

  AJTEElement.prototype.addToHistoryAfterTransform = function (self) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:addToHistoryAfterTransform');
    }
    self.AJTEEditor.addToHistory();
  };

  AJTEElement.prototype.focus = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:focus');
    }
    if (this.transformer) {
      var self = this;
      this.el.on('transform', function () {
        if (self.onTransform) self.onTransform();
      });

      this.layer.add(this.transformer);
      this.layer.draw();
    }
  };

  AJTEElement.prototype.blur = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:blur');
    }
    if (this.transformer) {
      this.transformer.remove();
      this.layer.draw();
    }
  };

  AJTEElement.prototype.restartTransformer = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:restartTransformer');
    }
    this.blur();
    this.focus();
  };

  AJTEElement.prototype.elOnDrag = function (el) {
    document.body.style.cursor = 'pointer';
  };

  AJTEElement.prototype.elOnDrop = function (el) {
    document.body.style.cursor = 'default';
  };

  AJTEElement.prototype.setIndex = function (index) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:setIndex');
    }

    this.el.zIndex(index);
    this.el.attrs.index = index;
    this.index = index;
  };

  AJTEElement.prototype.up = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:up');
    }
    // var zIndex = this.el.zIndex();
    // zIndex++;
    // this.el.zIndex(zIndex);
    // this.el.setAttrs({
    //     index: zIndex
    // });
    this.el.moveUp();
    this.AJTEEditor.rearrangeIndexes();
    this.layer.batchDraw();
  };

  AJTEElement.prototype.down = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:down');
    }
    // var zIndex = this.el.zIndex();
    // if(zIndex == 0) return;
    // zIndex--;
    // this.el.setAttrs({
    //     index: zIndex
    // });
    // this.el.zIndex(zIndex);
    this.el.moveDown();
    this.AJTEEditor.rearrangeIndexes();
    this.layer.batchDraw();
  };

  AJTEElement.prototype.formatStyleValue = function (stylename, styleval) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:formatStyleValue');
    }
    var intList = [
      'strokeWidth',
      'fontSize',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft'
    ];

    if (intList.indexOf(stylename) > -1) {
      return parseInt(styleval);
    }

    return styleval;
  };

  AJTEElement.prototype.changeStyle = function (stylename, styleval) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:changeStyle');
    }
    var resultval = '';
    this[stylename] = styleval;

    switch (stylename) {
      case 'isBold': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateFontStyle('bold', styleval);
        stylename = 'fontStyle';
        break;
      }
      case 'isItalic': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateFontStyle('italic', styleval);
        stylename = 'fontStyle';
        break;
      }
      case 'isUnderline': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        stylename = 'textDecoration';
        if (styleval == 'true') resultval = 'underline';
        else resultval = 'normal';
        break;
      }
      case 'borderRadiusTop': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateArrStyle('cornerRadius', 'top', styleval);
        stylename = 'cornerRadius';
        break;
      }
      case 'borderRadiusRight': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateArrStyle('cornerRadius', 'right', styleval);
        stylename = 'cornerRadius';
        break;
      }
      case 'borderRadiusBottom': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateArrStyle('cornerRadius', 'bottom', styleval);
        stylename = 'cornerRadius';
        break;
      }
      case 'borderRadiusLeft': {
        this.el.setAttrs({
          [stylename]: styleval
        });
        resultval = this.generateArrStyle('cornerRadius', 'left', styleval);
        stylename = 'cornerRadius';
        break;
      }
      default:
        resultval = styleval;
    }

    resultval = this.formatStyleValue(stylename, resultval);

    this.el.setAttrs({
      [stylename]: resultval
    });

    switch (stylename) {
      case 'paddingTop': {
        this.adjustShape();
        break;
      }
      case 'paddingRight': {
        this.adjustShape();
        break;
      }
      case 'paddingBottom': {
        this.adjustShape();
        break;
      }
      case 'paddingLeft': {
        this.adjustShape();
        break;
      }
    }
    this.AJTEEditor.addToHistory();
    this.layer.batchDraw();
  };

  AJTEElement.prototype.generateArrStyle = function (
    stylename,
    direction,
    styleval
  ) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:generateArrStyle');
    }
    var oldStyle = this.el.getAttr(stylename);
    if (oldStyle.length == 2) {
      oldStyle.push(oldStyle[1]);
      oldStyle.push(oldStyle[1]);
      oldStyle[1] = oldStyle[0];
    }

    styleval = parseInt(styleval);

    switch (direction) {
      case 'top': {
        oldStyle[0] = styleval;
        break;
      }
      case 'right': {
        oldStyle[1] = styleval;
        break;
      }
      case 'bottom': {
        oldStyle[2] = styleval;
        break;
      }
      case 'left': {
        oldStyle[3] = styleval;
        break;
      }
    }

    return oldStyle;
  };

  AJTEElement.prototype.generateFontStyle = function (stylename, styleval) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:generateFontStyle');
    }

    var oldStyle = this.el.getAttr('fontStyle');
    var oldStyleArr = oldStyle.split(' ');
    var oldNormilizefStyleArr = [];
    var newStyleArr = [];
    var newStyle = oldStyle;

    /* remove normal */
    for (var i = 0; i < oldStyleArr.length; i++) {
      if (oldStyleArr[i] !== 'normal') {
        oldNormilizefStyleArr.push(oldStyleArr[i]);
      }
    }
    /*end removal */

    if (styleval == 'true') {
      if (oldStyle.indexOf(stylename) == -1) {
        oldNormilizefStyleArr.push(stylename);
      }
      newStyleArr = oldNormilizefStyleArr;
    } else {
      for (var i = 0; i < oldNormilizefStyleArr.length; i++) {
        if (oldNormilizefStyleArr[i] != stylename) {
          newStyleArr.push(oldNormilizefStyleArr[i]);
        }
      }
    }

    /* add normal */
    if (newStyleArr.length == 0) {
      newStyleArr.push('normal');
    }
    /* end add normal */

    newStyle = newStyleArr.join(' ');

    return newStyle;
  };

  AJTEElement.prototype.deleteElement = function () {
    var input = document.getElementById('input_' + this.el.attrs.id);
    input.parentElement.remove();

    this.AJTEEditor.store.elements[this.el.attrs.id] = null;
    this.AJTEEditor.bar.resetToolbarContent();
    this.blur();
    this.el.destroy();
    this.layer.batchDraw();
  };

  function AJTEText(args, AJTEEditor) {
    if (ajteMode == 'dev') {
      console.info('AJTEText:constructor');
    }

    AJTEElement.call(this, args, AJTEEditor);

    this.text = args && args.text ? args.text : 'simpleText';
    this.fontSize = args && args.fontSize ? args.fontSize : 14;
    this.fontFamily = args && args.fontFamily ? args.fontFamily : 'Helvetica';
    this.fill = args && args.fill ? args.fill : 'black';
    this.x = args && args.x ? args.x : 0;
    this.y = args && args.y ? args.y : 0;
    this.type = this.type ? this.type : 'text';
    this.isBold = args && args.isBold ? args.isBold : false;
    this.isItalic = args && args.isItalic ? args.isItalic : false;
    this.isUnderline = args && args.isUnderline ? args.isUnderline : false;
    this.paddingTop = args && args.paddingTop ? args.paddingTop : 5;
    this.paddingRight = args && args.paddingRight ? args.paddingRight : 5;
    this.paddingBottom = args && args.paddingBottom ? args.paddingBottom : 5;
    this.paddingLeft = args && args.paddingLeft ? args.paddingLeft : 5;
    this.lineHeight = args && args.lineHeight ? args.lineHeight : 1.2;
    this.width =
      args && args.width ? args.width : this.text.length * this.fontSize;
    this.bind_id = args && args.bind_id ? args.bind_id : 0;
    this.align = args && args.align ? args.align : 'left';
    this.id = args && args.id ? args.id : 'text-' + Date.now();

    this.init = function () {
      var textDecoration = this.isUnderline ? 'underline' : 'none';
      var fontStyle = '';
      var fontStyleArr = [];
      if (this.isBold) fontStyleArr.push('bold');
      if (this.isItalic) fontStyleArr.push('italic');
      fontStyle = fontStyleArr.join(' ');

      var self = this;
      self.el = new Konva.Text({
        id: self.id,
        type: self.type,
        text: self.text,
        x: self.x,
        y: self.y,
        fontSize: self.fontSize,
        fontFamily: self.fontFamily,
        fill: self.fill,
        isBold: self.isBold,
        isItalic: self.isItalic,
        isUnderline: self.isUnderline,
        textDecoration: textDecoration,
        fontStyle: fontStyle,
        index: self.index,
        label: self.label,
        value: self.value ? self.value : self.text,
        width: self.width,
        align: self.align,
        paddingTop: self.paddingTop,
        paddingRight: self.paddingRight,
        paddingBottom: self.paddingBottom,
        paddingLeft: self.paddingLeft,
        lineHeight: self.lineHeight,
        bind_id: self.bind_id
      });

      self.layer.add(self.el);

      if (self.AJTEEditor instanceof AJTEUserEditor) {
        self.initInactiveElement();
      } else {
        self.initActiveElement();
      }
      self.initElement();

      self.el.on('dragmove', function () {
        self.elOnDragMove();
      });
    };

    this.init();
  }

  AJTEText.prototype = Object.create(AJTEElement.prototype);

  AJTEText.prototype.editText = function () {
    var stageBox = this.stage.container().getBoundingClientRect();

    var self = this;

    var textPosition = self.el.absolutePosition();

    self.el.hide();
    self.transformer.hide();
    self.layer.draw();

    var areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y
    };

    // create textarea and style it
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = self.el.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = self.el.width() - self.el.padding() * 2 + 'px';
    textarea.style.height = self.el.height() - self.el.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = self.el.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = self.el.lineHeight();
    textarea.style.fontFamily = self.el.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = self.el.align();
    textarea.style.color = self.el.fill();
    var rotation = self.el.rotation();
    var transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    var px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(self.el.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    function removeTextarea() {
      textarea.parentNode.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      self.el.show();
      self.transformer.show();
      self.transformer.forceUpdate();
      self.layer.draw();
    }

    function updateValue() {
      self.el.text(textarea.value);
      self.value = textarea.value;
      self.el.attrs.value = textarea.value;
      self.AJTEEditor.addToHistory();
      self.adjustShape();
    }

    function setTextareaWidth(newWidth) {
      if (!newWidth) {
        // set width for placeholder
        newWidth = self.el.placeholder.length * self.el.fontSize();
      }
      // some extra fixes on different browsers
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }

      var isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
      if (isEdge) {
        newWidth += 1;
      }
      textarea.style.width = newWidth + 'px';
    }

    textarea.addEventListener('keydown', function (e) {
      // hide on enter
      // but don't hide on shift + enter
      if (e.keyCode === 13 && !e.shiftKey) {
        self.el.text(textarea.value);
        removeTextarea();
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textarea.addEventListener('keydown', function (e) {
      var scale = self.el.getAbsoluteScale().x;
      setTextareaWidth(self.el.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + self.el.fontSize() + 'px';
    });

    textarea.addEventListener('blur', function (e) {
      updateValue();
    });

    function handleOutsideClick(e) {
      if (e.target !== textarea) {
        updateValue();
        removeTextarea();
      }
    }

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  AJTEText.prototype.changeValue = function (value) {
    if (ajteMode == 'dev') {
      console.info('AJTEText:changeValue');
    }

    this.el.text(value);
    this.el.attrs.value = value;
    this.adjustShape();
    this.layer.draw();
    this.AJTEEditor.addToHistory();
  };

  AJTEText.prototype.onTransform = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEText:onTransform');
    }

    this.el.setAttrs({
      width: this.el.width() * this.el.scaleX(),
      scaleX: 1
    });
  };

  AJTEText.prototype.elOnDragMove = function (el) {
    this.adjustShape();
  };

  AJTEText.prototype.adjustShape = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEText:adjustShape');
    }

    var bind_id = this.el.attrs.bind_id;
    if (!this.AJTEEditor.store.elements[bind_id]) return;
    var x = this.el.attrs.x - this.el.attrs.paddingLeft;
    var y = this.el.attrs.y - this.el.attrs.paddingTop;
    var width =
      this.el.attrs.width +
      this.el.attrs.paddingLeft +
      this.el.attrs.paddingRight;
    var height =
      this.el.getClientRect().height +
      this.el.attrs.paddingTop +
      this.el.attrs.paddingBottom;
    var bind_el = this.AJTEEditor.store.elements[bind_id].el;

    bind_el.setAttrs({
      x: x,
      y: y,
      width: width,
      height: height
    });

    this.layer.batchDraw();
  };

  function AJTEEditableText(args, AJTEEditor) {
    this.type = 'editableText';
    AJTEText.call(this, args, AJTEEditor);
  }

  AJTEEditableText.prototype = Object.create(AJTEText.prototype);

  function AJTEImage(args, AJTEEditor) {
    AJTEElement.call(this, args, AJTEEditor);
    this.src =
      args && args.src ? args.src : this.AJTEEditor.notAvaliableImageSrc;
    this.x = args && args.x ? args.x : 0;
    this.y = args && args.y ? args.y : 0;
    this.id = args && args.id ? args.id : 'image-' + Date.now();
    this.type = 'image';

    this.init = function () {
      var imageObj = new Image();
      // imageObj.crossOrigin = 'Anonymous';
      var self = this;
      self.AJTEEditor.disable();
      imageObj.src = this.src;
      imageObj.onload = function () {
        self.el = new Konva.Image({
          id: self.id,
          x: self.x,
          y: self.y,
          image: imageObj,
          index: self.index,
          label: self.label,
          value: self.value,
          type: self.type,
          src: self.src
        });

        self.layer.add(self.el);

        if (self.AJTEEditor instanceof AJTEUserEditor) {
          self.initInactiveElement();
        } else {
          self.initActiveElement();
        }
        self.initElement();

        self.el.on('dragmove', function () {
          self.elOnDragMove();
        });
      };
    };

    this.init();
  }

  AJTEImage.prototype = Object.create(AJTEElement.prototype);

  AJTEImage.prototype.createLabel = function () {
    var self = this;
    var el = document.createElement('div');
    el.className = 'ajte-image-change';
    el.id = 'label_' + this.el.attrs.id;
    document.getElementById('ajtemainbar').appendChild(el);
    self.setLabelPosition();

    el.addEventListener('click', () => {
      self.AJTEEditor.chooseElement(self.el.attrs.id);
      self.editImage();
    });
  };

  AJTEImage.prototype.elOnDragMove = function () {
    this.setLabelPosition();
  };

  AJTEImage.prototype.onTransform = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEImage:onTransform');
    }

    if (this.AJTEEditor instanceof AJTEUserEditor) {
      var scale = this.el.scaleX();
      if (scale == 1) scale = this.el.scaleY();
      var width = this.el.width() * scale;
      var height = this.el.height() * scale;

      this.el.setAttrs({
        width: width,
        height: height,
        scaleX: 1,
        scaleY: 1
      });
    }

    this.setLabelPosition();
  };

  AJTEImage.prototype.editImage = function () {
    if (this.AJTEEditor.cb && this.AJTEEditor.cb.image_cb) {
      this.AJTEEditor.cb.image_cb();
    }
  };

  AJTEImage.prototype.setLabelPosition = function () {
    var position = this.el.getClientRect();
    var id = 'label_' + this.el.attrs.id;
    var el = document.getElementById(id);
    el.style.top = position.y + 'px';
    el.style.left = position.x + position.width + 'px';
  };

  AJTEImage.prototype.changeSrc = function (src) {
    if (ajteMode == 'dev') {
      console.info('ajteImage:changeSrc');
    }

    var self = this;
    var position = this.el.getClientRect();
    var imageObj2 = new Image();

    imageObj2.onload = function () {
      var koef = imageObj2.naturalWidth / position.width;
      imageObj2.naturalHeight;
      self.el.image(imageObj2);
      self.el.attrs.src = src;
      self.el.attrs.width = position.width;
      self.el.attrs.height = imageObj2.naturalHeight / koef;
      console.log('test1');
      self.AJTEEditor.addToHistory();
      self.setLabelPosition();
      self.transformer.forceUpdate();
      self.layer.draw();
    };
    imageObj2.src = src;
  };

  function AJTEShape() {}

  function AJTERect(args, AJTEEditor) {
    AJTEElement.call(this, args, AJTEEditor);
    this.fill = args && args.fill ? args.fill : 'blue';
    this.stroke = args && args.stroke ? args.stroke : 'black';
    this.strokeWidth =
      args && args.strokeWidth !== undefined ? args.strokeWidth : 4;
    this.x = args && args.x ? args.x : 0;
    this.y = args && args.y ? args.y : 0;
    this.width = args && args.width ? args.width : 100;
    this.height = args && args.height ? args.height : 50;
    this.borderRadiusTop =
      args && args.borderRadiusTop ? args.borderRadiusTop : 0;
    this.borderRadiusRight =
      args && args.borderRadiusRight ? args.borderRadiusRight : 0;
    this.borderRadiusBottom =
      args && args.borderRadiusBottom ? args.borderRadiusBottom : 0;
    this.borderRadiusLeft =
      args && args.borderRadiusLeft ? args.borderRadiusLeft : 0;
    this.type = 'rect';
    this.id = args && args.id ? args.id : 'rect-' + Date.now();

    this.init = function () {
      var self = this;
      this.el = new Konva.Rect({
        id: self.id,
        x: self.x,
        y: self.y,
        width: self.width,
        height: self.height,
        fill: self.fill,
        stroke: self.stroke,
        strokeWidth: self.strokeWidth,
        cornerRadius: [
          self.borderRadiusTop,
          self.borderRadiusRight,
          self.borderRadiusBottom,
          self.borderRadiusLeft
        ],
        borderRadiusTop: self.borderRadiusTop,
        borderRadiusRight: self.borderRadiusRight,
        borderRadiusBottom: self.borderRadiusBottom,
        borderRadiusLeft: self.borderRadiusLeft,
        index: self.index,
        label: self.label,
        value: self.value,
        type: self.type
      });

      self.layer.add(self.el);

      if (self.AJTEEditor instanceof AJTEUserEditor) {
        self.initInactiveElement();
      } else {
        self.initActiveElement();
      }
      self.initElement();
    };

    this.init();
  }

  AJTERect.prototype.onTransform = function () {
    var self = this;
    var scaleX = this.el.attrs.scaleX;
    var scaleY = this.el.attrs.scaleY;
    var scaledWidth = self.el.attrs.width * scaleX;
    var scaledHeight = self.el.attrs.height * scaleY;
    self.el.setAttrs({
      width: scaledWidth,
      height: scaledHeight,
      scaleX: 1,
      scaleY: 1
    });
  };

  Object.assign(AJTERect.prototype, AJTEElement.prototype);
  Object.assign(AJTERect.prototype, AJTEShape.prototype);

  function AJTECircle(args, AJTEEditor) {
    AJTEElement.call(this, args, AJTEEditor);
    this.fill = args && args.fill ? args.fill : 'blue';
    this.stroke = args && args.stroke ? args.stroke : 'black';
    this.strokeWidth = args && args.strokeWidth ? args.strokeWidth : 4;
    this.radius = args && args.radius ? args.radius : 100;
    this.x = args && args.x ? args.x : 100;
    this.y = args && args.y ? args.y : 100;
    this.type = 'circle';
    this.id = args && args.id ? args.id : 'circle-' + Date.now();

    this.init = function () {
      var self = this;
      this.el = new Konva.Circle({
        id: self.id,
        x: self.x,
        y: self.y,
        radius: self.radius,
        fill: self.fill,
        stroke: self.stroke,
        strokeWidth: self.strokeWidth,
        index: self.index,
        label: self.label,
        value: self.value,
        type: self.type
      });

      self.layer.add(self.el);

      self.initElement();
    };

    this.init();
  }

  AJTECircle.prototype.onTransform = function () {
    var self = this;
    var scaleX = this.el.attrs.scaleX;
    var scaledRadius = self.el.attrs.radius * scaleX;
    self.el.setAttrs({
      radius: scaledRadius,
      scaleX: 1,
      scaleY: 1
    });
  };

  Object.assign(AJTECircle.prototype, AJTEElement.prototype);
  Object.assign(AJTECircle.prototype, AJTEShape.prototype);

  function AJTEEllipse(args, AJTEEditor) {
    AJTEElement.call(this, args, AJTEEditor);
    this.fill = args && args.fill ? args.fill : 'blue';
    this.stroke = args && args.stroke ? args.stroke : 'black';
    this.strokeWidth = args && args.strokeWidth ? args.strokeWidth : 4;
    this.radiusX = args && args.radiusX ? args.radiusX : 100;
    this.radiusY = args && args.radiusY ? args.radiusY : 50;
    this.x = args && args.x ? args.x : 100;
    this.y = args && args.y ? args.y : 100;
    this.type = 'ellipse';
    this.id = args && args.id ? args.id : 'ellipse-' + Date.now();

    this.init = function () {
      var self = this;
      this.el = new Konva.Ellipse({
        id: self.id,
        x: self.x,
        y: self.y,
        radiusX: self.radiusX,
        radiusY: self.radiusY,
        fill: self.fill,
        stroke: self.stroke,
        strokeWidth: self.strokeWidth,
        index: self.index,
        label: self.label,
        value: self.value,
        type: self.type
      });

      self.layer.add(self.el);
      self.initElement();
    };

    this.init();
  }

  AJTEEllipse.prototype.onTransform = function () {
    var self = this;
    var scaleX = this.el.attrs.scaleX;
    var scaleY = this.el.attrs.scaleY;
    var scaledRadiusX = self.el.attrs.radiusX * scaleX;
    var scaledRadiusY = self.el.attrs.radiusY * scaleY;
    self.el.setAttrs({
      radiusX: scaledRadiusX,
      radiusY: scaledRadiusY,
      scaleX: 1,
      scaleY: 1
    });
  };

  Object.assign(AJTEEllipse.prototype, AJTEElement.prototype);
  Object.assign(AJTEEllipse.prototype, AJTEShape.prototype);

  function AJTELine(args, AJTEEditor) {
    AJTEElement.call(this, args, AJTEEditor);
    this.stroke = args && args.stroke ? args.stroke : 'black';
    this.strokeWidth = args && args.strokeWidth ? args.strokeWidth : 4;
    this.radius = args && args.radius ? args.radius : 100;
    (this.points =
      args.line && args.line.points ? args.line.points : [0, 0, 100, 0]),
      (this.lineJoin =
        args.line && args.line.lineJoin ? args.line.lineJoin : 'round');
    this.lineCap = args.line && args.line.lineCap ? args.line.lineCap : 'round';
    this.x = args && args.x ? args.x : 0;
    this.y = args && args.y ? args.y : this.strokeWidth;
    this.type = 'line';
    this.id = args && args.id ? args.id : 'line-' + Date.now();

    this.init = function () {
      var self = this;
      this.el = new Konva.Line({
        id: self.id,
        x: self.x,
        y: self.y,
        points: self.points,
        stroke: self.stroke,
        strokeWidth: self.strokeWidth,
        index: self.index,
        label: self.label,
        value: self.value,
        type: self.type
      });

      self.layer.add(self.el);
      self.initElement();
    };

    this.init();
  }

  Object.assign(AJTELine.prototype, AJTEElement.prototype);
  Object.assign(AJTELine.prototype, AJTEShape.prototype);

  function AJTEEditor(args) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:constructor');
    }

    this.args = {
      stage: {
        width: args.stage && args.stage.width ? args.stage.width : 500,
        height: args.stage && args.stage.height ? args.stage.height : 500
      },
      image: {
        src:
          args.image && args.image.src
            ? args.image.src
            : 'no_image_available.png'
      },
      text: {
        fill: args.font && args.font.fill ? args.font.fill : '#42445A',
        fontSize: args.font && args.font.fontSize ? args.font.fontSize : 14,
        lineHeight:
          args.font && args.font.lineHeight ? args.font.lineHeight : 1.2,
        paddingTop:
          args.font && args.font.paddingTop ? args.font.paddingTop : 5,
        paddingRight:
          args.font && args.font.paddingRight ? args.font.paddingRight : 5,
        paddingBottom:
          args.font && args.font.paddingBottom ? args.font.paddingBottom : 5,
        paddingLeft:
          args.font && args.font.paddingLeft ? args.font.paddingLeft : 5,
        fontFamily:
          args.fontFamily && args.font.fontFamily
            ? args.font.fontFamily
            : 'Verdana',
        isItalic: false,
        isBold: false,
        isUnderline: false
      },
      editableText: {
        fill: args.font && args.font.fill ? args.font.fill : '#42445A',
        fontSize: args.font && args.font.fontSize ? args.font.fontSize : 14,
        lineHeight:
          args.font && args.font.lineHeight ? args.font.lineHeight : 1.2,
        paddingTop:
          args.font && args.font.paddingTop ? args.font.paddingTop : 5,
        paddingRight:
          args.font && args.font.paddingRight ? args.font.paddingRight : 5,
        paddingBottom:
          args.font && args.font.paddingBottom ? args.font.paddingBottom : 5,
        paddingLeft:
          args.font && args.font.paddingLeft ? args.font.paddingLeft : 5,
        fontFamily:
          args.fontFamily && args.font.fontFamily
            ? args.font.fontFamily
            : 'Verdana',
        isItalic: false,
        isBold: false,
        isUnderline: false
      },
      shape: {
        strokeWidth:
          args.shape && args.shape.strokeWidth ? args.shape.strokeWidth : 4,
        fill: args.shape && args.shape.fill ? args.shape.fill : 'green',
        stroke: args.shape && args.shape.stroke ? args.shape.stroke : 'black'
      },
      rect: {
        width: args.rect && args.rect.width ? args.rect.width : 100,
        height: args.rect && args.rect.height ? args.rect.height : 50,
        borderRadiusTop:
          args.rect && args.rect.borderRadiusTop
            ? args.rect.borderRadiusTop
            : 0,
        borderRadiusRight:
          args.rect && args.rect.borderRadiusRight
            ? args.rect.borderRadiusRight
            : 0,
        borderRadiusBottom:
          args.rect && args.rect.borderRadiusBottom
            ? args.rect.borderRadiusBottom
            : 0,
        borderRadiusLeft:
          args.rect && args.rect.borderRadiusLeft
            ? args.rect.borderRadiusLeft
            : 0
      },
      circle: {
        radius: args.circle && args.circle.radius ? args.circle.radius : 70
      },
      ellipse: {
        radiusX:
          args.ellipse && args.ellipse.radiusX ? args.ellipse.radiusX : 100,
        radiusY:
          args.ellipse && args.ellipse.radiusY ? args.ellipse.radiusY : 50
      },
      line: {
        points:
          args.line && args.line.points ? args.line.points : [0, 0, 100, 0],
        lineCap: args.line && args.line.lineCap ? args.line.lineCap : 'round',
        lineJoin: args.line && args.line.lineJoin ? args.line.lineJoin : 'round'
      }
    };

    this.bar = null;
    this.category = args.category ? args.category : '';
    this.cb = args.cb || {
      image_cb: null,
      after_create_cb: null,
      success_cb: null,
      error_cb: null,
      init_cb: null
    };
    this.container = document.getElementById('ajte');
    this.containerOffset = args.containerOffset
      ? args.containerOffset
      : { x: 0, y: 0 };
    this.currentElId = 0;
    this.customFields = args.customFields ? args.customFields : [];
    this.formContainer = null;
    this.history = [];
    this.historyIterator = -1;
    this.historyMaxStep = 10;
    this.historyCountDrawed = 0;
    this.historyStoreCount = 0;
    this.historyAddAfterDraw = false;
    this.isMarkingShape = false;
    this.konvaPlaceholder = null;
    this.layer = null;
    this.loader = null;
    this.saveInfo = {
      url: args.saveInfo && args.saveInfo.url ? args.saveInfo.url : '',
      requestHeaders:
        args.saveInfo && args.saveInfo.requestHeaders
          ? args.saveInfo.requestHeaders
          : []
    };

    this.notAvaliableImageSrc = args.notAvaliableImageSrc
      ? args.notAvaliableImageSrc
      : '';
    this.stage = null;
    this.status = 'history';
    this.store = {
      stage: {
        width: args.stage && args.stage.width ? args.stage.width : 500,
        height: args.stage && args.stage.height ? args.stage.height : 500
      },
      elements: {}
    };

    this.title = args.title ? args.title : 'Artwork title';
    this.templateId = args.templateId ? args.templateId : 0;
    this.translation = {
      save_failed: 'Error of saving',
      save_succesful: 'Saving is successful',
      save_aborted: 'Saving is aborted'
    };
    this.type = false;
    this.ww = window.width;
    this.wh = window.height;

    this.concatShapes();

    if (!this.container) {
      console.error("Container <div id='ajte'></div> is not found");
      return;
    }

    this.init = function () {
      var self = this;
      if (ajteMode == 'dev') {
        console.info('AJTEEditor:init');
      }

      this.args.AJTEEditor = this;

      this.addBody();
      this.addAsideBody();

      this.stage = new Konva.Stage({
        container: 'ajtemainbar',
        width: 500,
        height: 500
      });

      this.layer = new Konva.Layer();
      this.stage.add(this.layer);

      this.fitStageIntoParentContainer();
      this.createKonvaPlaceholder();

      if (!this.templateId) {
        this.save('hidden', this.initMedia);
      } else {
        this.initMedia(this, this.templateId);
      }

      this.addEventListeners();

      if (args.code) this.initDraw(args.code);

      this.addAsideCustomFields();

      if (this.cb.init_cb) this.cb.init_cb();
    };

    this.init();
  }

  AJTEEditor.prototype.initDraw = function (code) {
    this.store = JSON.parse(code);
    this.historyAddAfterDraw = true;
    this.draw(this.store);
  };

  AJTEEditor.prototype.addEventListeners = function () {
    var self = this;

    this.stage.on('dragend', function (e) {
      if (!(e.target instanceof Konva.Transformer)) {
        self.addToHistory();
      }
    });

    document.addEventListener('libraryActiveFileChanged', function (event) {
      if (
        self.store.elements[self.currentElId] &&
        self.store.elements[self.currentElId] instanceof AJTEImage
      ) {
        self.store.elements[self.currentElId].changeSrc(event.detail.src);
      } else {
        self.args['image'].src = event.detail.src;
        self.createElement(self.args['image'], 'image');
      }

      return false;
    });

    var eventsKeysStack = [0, 0];
    document.addEventListener('keydown', function (event) {
      eventsKeysStack.shift();
      eventsKeysStack.push(event.key);

      if (event.code === 'Delete') {
        if (self.store.elements[self.currentElId]) {
          self.store.elements[self.currentElId].deleteElement();
        }
      }

      if (eventsKeysStack[0] == 'Control') {
        switch (eventsKeysStack[1]) {
          case 'z':
            self.undo();
            break;
          case 'y':
            self.redo();
            break;
          default:
            break;
        }
      }
    });
  };

  AJTEEditor.prototype.addFont = function (fontFamily) {
    this.bar.addFont(fontFamily);
    this.layer.draw();
  };

  AJTEEditor.prototype.initMedia = function (self, templateId) {
    if (self.cb.after_create_cb) {
      self.cb.after_create_cb(templateId);
    }
  };

  AJTEEditor.prototype.createKonvaPlaceholder = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:createKonvaPlaceholder');
    }
    var canvas = document.querySelector('canvas');
    var konvaContent = document.querySelector('.konvajs-content');
    this.konvaPlaceholder = document.createElement('div');

    this.konvaPlaceholder.className = 'ajte-konva-placeholder';
    konvaContent.insertBefore(this.konvaPlaceholder, canvas);

    this.setKonvaPlaceholder();
  };

  AJTEEditor.prototype.setKonvaPlaceholder = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:setKonvaPlaceholder');
    }
    this.konvaPlaceholder.style.width = this.args.stage.width + 'px';
    this.konvaPlaceholder.style.height = this.args.stage.height + 'px';

    this.stage.width(this.args.stage.width);
    this.stage.height(this.args.stage.height);
    this.stage.draw();
  };

  AJTEEditor.prototype.changeStagePlaceholderStyle = function (args) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:changeStagePlaceholderStyle');
    }
    if (args.name === undefined || args.value === undefined) {
      console.error('No arguments for changing elements');
      return;
    }

    switch (args.name) {
      case 'stageWidth':
        this.args.stage.width = args.value;
        this.konvaPlaceholder.style.width = args.value + 'px';
        break;
      case 'stageHeight':
        this.args.stage.height = args.value;
        this.konvaPlaceholder.style.height = args.value + 'px';
        break;
    }
  };

  AJTEEditor.prototype.disable = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:disable');
    }
    this.loader.style.display = 'flex';
    if (this.bar) this.bar.disable();
  };

  AJTEEditor.prototype.enable = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:enable');
    }
    this.loader.style.display = 'none';
    if (this.bar) this.bar.enable();
  };

  AJTEEditor.prototype.markShapes = function (id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:markShapes');
    }
    this.isMarkingShape = true;
    var self = this;
    for (var i in this.store.elements) {
      var instance = this.store.elements[i];
      var el = instance.el;

      if (this.store.elements[i] instanceof AJTERect == false) {
        el.hide();
        instance.blur();
      } else {
        el.on('click', function () {
          var bind_id = this.attrs.id;
          self.bindShape(self, id, bind_id);
        });
      }
    }
    this.layer.draw();
  };

  AJTEEditor.prototype.unmarkShapes = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:unmarkShapes');
    }
    this.isMarkingShape = false;
    for (var i in this.store.elements) {
      var el = this.store.elements[i].el;
      el.show();
      el.off('click');
    }
    this.layer.draw();
  };

  AJTEEditor.prototype.rearrangeIndexes = function () {
    for (var i in this.store.elements) {
      var element = this.store.elements[i];
      var native_element = element.el;
      var zIndex = native_element.index;
      native_element.setAttrs({
        index: zIndex
      });
      element.index = zIndex;
    }
  };

  AJTEEditor.prototype.rearrangeBindIndex = function (id, bind_id) {
    if (ajteMode == 'dev') {
      console.info('AJTEElement:rearrangeIndex');
    }

    var self = this;

    var idsArr = [];
    for (var i in self.store.elements) {
      if (i == id || i == bind_id) continue;
      idsArr.push({
        id: i,
        index: self.store.elements[i].index
      });
    }

    idsArr.sort(function (a, b) {
      return a.index - b.index;
    });

    idsArr.push({
      id: bind_id,
      index: Object.keys(self.store.elements).length - 2
    });

    idsArr.push({
      id: id,
      index: Object.keys(self.store.elements).length - 1
    });

    for (var i = 0; i < idsArr.length; i++) {
      self.store.elements[idsArr[i].id].setIndex(idsArr[i].index);
    }
  };

  AJTEEditor.prototype.bindShape = function (self, id, bind_id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:bindShape');
    }

    self.store.elements[id].el.attrs.bind_id = bind_id;
    this.rearrangeBindIndex(id, bind_id);

    self.store.elements[id].adjustShape();
    self.unmarkShapes();
  };

  AJTEEditor.prototype.unbindShape = function (self, id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:unbindShape');
    }
    if (self.store.elements[id].el.attrs.bind_id) {
      self.store.elements[id].el.attrs.bind_id = 0;
    }
  };

  AJTEEditor.prototype.setUpContextMenu = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:setUpContextMenu');
    }
    var menuNode = document.getElementById('ajte-context-menu');
    var textMenuNode = document.getElementById('ajte-text-context-menu');
    var currentElement = null;
    var self = this;

    document.getElementById('delete-button').addEventListener('click', () => {
      self.store.elements[currentElement].deleteElement();
    });

    document.getElementById('delete-button2').addEventListener('click', () => {
      self.store.elements[currentElement].deleteElement();
    });

    document.getElementById('bind-shape').addEventListener('click', () => {
      self.markShapes(currentElement);
    });

    document.getElementById('unbind-shape').addEventListener('click', () => {
      self.unbindShape(currentElement);
    });

    window.addEventListener('click', () => {
      menuNode.style.display = 'none';
      textMenuNode.style.display = 'none';
    });

    self.stage.on('contextmenu', function (e) {
      if (self.isMarkingShape == true) {
        self.unmarkShapes();
      }
      // prevent default behavior
      e.evt.preventDefault();
      if (e.target === self.stage) {
        // if we are on empty place of the stage we will do nothing
        return;
      }

      var shape = e.target;
      currentElement = shape.attrs.id;
      // self.chooseElement(shape.attrs.id);

      var containerRect = self.stage.container().getBoundingClientRect();
      var top =
        containerRect.top + self.stage.getPointerPosition().y + 4 + 'px';
      var left =
        containerRect.left + self.stage.getPointerPosition().x + 4 + 'px';
      if (shape.constructor.name == 'Text') {
        textMenuNode.style.display = 'initial';
        textMenuNode.style.top = top;
        textMenuNode.style.left = left;
      } else {
        // show menu
        menuNode.style.display = 'initial';
        menuNode.style.top = top;
        menuNode.style.left = left;
      }
    });
  };

  AJTEEditor.prototype.concatShapes = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:concatShapes');
    }
    var shapes = ['rect', 'circle', 'line', 'ellipse'];

    var result_data = {};

    for (var i = 0; i < shapes.length; i++) {
      if (!this.args[shapes[i]]) break;
      var one_shape_data = JSON.parse(JSON.stringify(this.args[shapes[i]]));
      result_data = JSON.parse(JSON.stringify(this.args.shape));

      for (var j in one_shape_data) {
        result_data[j] = one_shape_data[j];
      }

      this.args[shapes[i]] = result_data;
    }
  };

  AJTEEditor.prototype.focusElement = function (id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:focusElement');
    }
    var self = this;
    self.currentElId = id;

    for (var i in self.store.elements) {
      self.store.elements[i].blur();
    }

    self.store.elements[self.currentElId].focus();
  };

  AJTEEditor.prototype.fitStageIntoParentContainer = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:fitStageIntoParentContainer');
    }

    var container = document.getElementById('ajtemainbar');
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;
    this.stage.width(containerWidth);
    this.stage.height(containerHeight);

    // //var scale = containerWidth / stageWidth;

    // // this.stage.width(stageWidth * scale);
    // // this.stage.height(stageHeight * scale);
    // // this.stage.scale({ x: scale, y: scale });

    this.stage.draw();
  };

  AJTEEditor.prototype.changeElementStyle = function (args) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:changeElementStyle');
    }
    if (args.name === undefined || args.value === undefined) {
      console.error('No arguments for changing elements');
      return;
    }

    if (this.currentElId && this.store.elements[this.currentElId]) {
      this.store.elements[this.currentElId].changeStyle(args.name, args.value);
    }
  };

  AJTEEditor.prototype.chooseElement = function (id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:chooseElement');
    }

    this.currentElId = id;
    this.focusElement(id);

    var el = this.store.elements[id].el;

    if (this.bar) {
      // this.bar.setBarArgs(el.attrs, this.store[id].type);
      this.bar.setToolbarContent(
        this.bar,
        this.store.elements[id].type,
        el.attrs
      );
    }
  };

  AJTEEditor.prototype.createElement = function (args, type) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:createElement');
    }

    var self = this;
    if (!args) args = {};
    if (args.index == undefined)
      args.index = Object.keys(this.store.elements).length;

    switch (type) {
      case 'text':
        new AJTEText(args, self);
        break;
      case 'editableText':
        new AJTEEditableText(args, self);
        break;
      case 'image':
        new AJTEImage(args, self);
        break;
      case 'rect':
        new AJTERect(args, self);
        break;
      case 'circle':
        new AJTECircle(args, self);
        break;
      case 'ellipse':
        new AJTEEllipse(args, self);
        break;
      case 'line':
        new AJTELine(args, self);
        break;
    }
  };

  AJTEEditor.prototype.undo = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:undo');
    }

    if (this.historyIterator > 0) {
      this.historyIterator--;
      this.draw(this.history[this.historyIterator]);
    }
    // else {
    //     this.reset();
    // }
  };

  AJTEEditor.prototype.redo = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:redo');
    }

    if (this.historyIterator < this.history.length - 1) {
      this.historyIterator++;
      this.draw(this.history[this.historyIterator]);
    }
  };

  AJTEEditor.prototype.draw = function (store) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:draw');
    }

    this.reset();
    this.status = 'no-history';
    this.historyStoreCount = Object.keys(store.elements).length;
    this.historyCountDrawed = 0;

    for (var i in store.elements) {
      var el = JSON.parse(store.elements[i]);
      if (!this.currentElId) this.currentElId = i;
      var args = el.attrs;
      var type = args.type;

      this.createElement(args, type);
    }
    this.args.stage.width =
      store.stage && store.stage.width
        ? store.stage.width
        : this.args.stage.width;
    this.args.stage.height =
      store.stage && store.stage.height
        ? store.stage.height
        : this.args.stage.height;
    this.setKonvaPlaceholder();
  };

  AJTEEditor.prototype.afterDrawCB = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:afterDrawCB');
    }

    this.historyCountDrawed++;

    if (this.historyCountDrawed == this.historyStoreCount) {
      this.status = 'history';
      this.blurAllElements();

      //set correct zIndex
      for (var i in this.store.elements) {
        this.store.elements[i].el.zIndex(this.store.elements[i].index);
      }

      this.layer.draw();

      if (this.historyAddAfterDraw == true) {
        this.addToHistory();
        this.historyAddAfterDraw = false;
      }
    }
  };

  AJTEEditor.prototype.storeToJSON = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:storeToJSON');
    }

    var json = {
      stage: {
        height: this.args.stage.height,
        width: this.args.stage.width
      },
      elements: {}
    };
    for (var i in this.store.elements) {
      json.elements[i] = this.store.elements[i].el;
    }

    return JSON.stringify(json);
  };

  AJTEEditor.prototype.reset = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:reset');
    }

    if (this.bar) {
      this.bar.resetToolbarContent();
    }

    this.layer.destroyChildren();
    this.emptyInputs();
    this.removeLabels();

    this.store = {
      stage: {
        height: this.args.stage.height,
        width: this.args.stage.width
      },
      elements: {}
    };
    this.currentElId = false;

    this.layer.draw();
  };

  AJTEEditor.prototype.restore = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:restore');
    }

    if (this.history.length) {
      this.draw(this.history[this.history.length - 1]);
    }
  };

  AJTEEditor.prototype.beforeSave = function () {
    for (var i in this.store.elements) {
      var el = document.getElementById('input_' + i);
      if (el) {
        el.blur();
      }
    }
  };

  AJTEEditor.prototype.save = function (type = 'visible', cb) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:save');
    }

    this.beforeSave();
    var storejson = JSON.stringify(this.storeToJSON());

    if (this.saveInfo.url) {
      this.sendToServer(storejson, 'draft', type, cb);
    }

    return storejson;
  };

  AJTEEditor.prototype.send = function (type = 'visible', cb) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:send');
    }

    this.beforeSave();
    var storejson = JSON.stringify(this.storeToJSON());

    if (this.saveInfo.url) {
      this.sendToServer(storejson, 'approved', type, cb);
    }

    return storejson;
  };

  AJTEEditor.prototype.createDataUrl = function () {
    this.stage.width(parseInt(this.args.stage.width));
    this.stage.height(parseInt(this.args.stage.height));
    this.blurAllElements();
    this.hideLabels();

    this.stage.draw();
    this.layer.draw();

    var dataURL = this.stage.toDataURL({ pixelRatio: 1 });

    // !!!!!!!!!!!!!!!!!!!! TEMPORARILY DISABLED !!!!!!!!!!!!!!!!!!!!!!!
    // It can be a source of issue when canvas size becomes extra large.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // this.fitStageIntoParentContainer();

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    this.showLabels();

    return dataURL;
  };

  AJTEEditor.prototype.sendToServer = function (storejson, status, type, cb) {
    var self = this;
    var xhr = new XMLHttpRequest();

    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    var dataURL = this.createDataUrl();

    let formData = new FormData();
    formData.append('title', this.title);
    formData.append('code', storejson);
    formData.append('category', this.category);
    formData.append('preview', dataURL);
    formData.append('status', status);

    for (var i in this.customFields) {
      formData.append(this.customFields[i].name, this.customFields[i].value);
    }

    if (this.templateId) {
      formData.append('id', this.templateId);
    }

    xhr.upload.addEventListener(
      'progress',
      function (event) {
        self.__progressHandler(event, self, type);
      },
      false
    );
    xhr.addEventListener(
      'load',
      function (event) {
        self.__completeHandler(event, self, type, cb);
      },
      false
    );
    xhr.addEventListener(
      'error',
      function (event) {
        self.__errorHandler(event, self, type);
      },
      false
    );
    xhr.addEventListener(
      'abort',
      function (event) {
        self.__abortHandler(event, self, type);
      },
      false
    );

    xhr.open('POST', this.saveInfo.url, true);
    if (this.saveInfo.requestHeaders && this.saveInfo.requestHeaders.length) {
      this.saveInfo.requestHeaders.forEach(function (header) {
        for (var key in header) {
          var value = header[key];
          xhr.setRequestHeader(key, value);
        }
      });
    }
    xhr.send(formData);
  };

  AJTEEditor.prototype.hideLabels = function () {
    var elements = document.querySelectorAll('.ajte-image-change');
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.visibility = 'hidden';
    }
  };

  AJTEEditor.prototype.removeLabels = function () {
    var elements = document.querySelectorAll('.ajte-image-change');
    for (var i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  };

  AJTEEditor.prototype.showLabels = function () {
    var elements = document.querySelectorAll('.ajte-image-change');
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.visibility = 'visible';
    }
  };

  AJTEEditor.prototype.__progressHandler = function (event, self, type) {
    if (document.getElementById('AJTEprogressBar') && type == 'visible') {
      var percent = (event.loaded / event.total) * 100;
      document.getElementById('AJTEprogressBar').value = Math.round(percent);
      document.getElementById('AJTEstatus').innerHTML =
        Math.round(percent) + '%';
    }
  };

  AJTEEditor.prototype.__completeHandler = function (event, self, type, cb) {
    var response = event.target;

    if (response.status != 200) {
      this.showError(this.translation.save_failed, type);
    } else {
      this.templateId = parseInt(response.responseText);
      this.showSuccess(this.translation.save_succesful, type);
    }

    if (cb) {
      cb(self, this.templateId);
    }
  };

  AJTEEditor.prototype.__errorHandler = function (event, self, type) {
    this.showError(this.translation.save_failed, type);
  };

  AJTEEditor.prototype.__abortHandler = function (event, self, type) {
    this.showError(this.translation.save_aborted, type);
  };

  AJTEEditor.prototype.showSuccess = function (message, type) {
    if (type == 'hidden') {
      console.log(message);
    } else {
      if (!this.cb || !this.cb.success_cb) {
        alert(message);
      } else {
        this.cb.success_cb(message);
      }
    }
  };

  AJTEEditor.prototype.showError = function (message, type) {
    if (type == 'hidden') {
      console.log(message);
    } else {
      if (!this.cb || !this.cb.error_cb) {
        alert(message);
      } else {
        this.cb.error_cb(message);
      }
    }
  };

  AJTEEditor.prototype.download = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:download');
    }
    var dataURL = this.createDataUrl();

    var link = document.createElement('a');
    link.download = this.title;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link = null;
  };

  AJTEEditor.prototype.activateElement = function (instance, type) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:activateElement');
    }

    var inputTypes = [
      'text',
      'editableText',
      'image',
      'rect',
      'ellipse',
      'line'
    ];
    var el = instance.el;
    var id = el.attrs.id;
    var self = this;

    self.store.elements[el.attrs.id] = instance;

    if (inputTypes.indexOf(type) != -1) {
      self.addInput(type, id);
    }

    if (self.status == 'history') {
      self.addToHistory();
      self.chooseElement(id);
    } else {
      self.afterDrawCB();
    }
  };

  AJTEEditor.prototype.emptyInputs = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:emptyInputs');
    }

    this.formContainer.innerHTML = '';
  };

  AJTEEditor.prototype.addInput = function (type, id) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:addInput');
    }

    var self = this;

    var el = document.createElement('div');
    el.className = 'ajte-input-wrap';
    el.innerHTML =
      '<label>Enter label for your ' +
      type +
      ':</label> \
            <input type="text" id="input_' +
      id +
      '" name="' +
      id +
      '" class="ajte-input" value="' +
      this.store.elements[id].label +
      '"/>';

    this.formContainer.appendChild(el);

    var input = document.getElementById('input_' + id);
    input.addEventListener('blur', function (e) {
      var id = e.target.id;
      var el_id = id.slice(6);
      self.store.elements[el_id].label = e.target.value;
      self.store.elements[el_id].el.attrs.label = e.target.value;
    });
  };

  AJTEEditor.prototype.addToHistory = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:addToHistory');
    }
    if (this.history.length > this.historyMaxStep) {
      this.history.shift();
      this.historyIterator--;
    }

    this.historyIterator++;
    if (this.history.length > this.historyIterator) {
      this.history = this.history.slice(0, this.historyIterator);
    }

    this.history[this.historyIterator] = JSON.parse(this.storeToJSON());
  };

  AJTEEditor.prototype.actElement = function (action) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:actElement');
    }
    this.store.elements[this.currentElId][action]();
  };

  AJTEEditor.prototype.blurAllElements = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:blurAllElements');
    }

    for (var i in this.store.elements) {
      this.store.elements[i].blur();
    }
  };

  AJTEEditor.prototype.addBody = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:addBody');
    }

    var htmldata =
      '<section id="ajteditor"> \
            <div id="ajtebar" class="ajtebar"> \
            </div> \
            <div id="ajtecontent"> \
                <div id="ajteaside"> \
                    <div id="ajteasidetitle"></div> \
                    <div id="ajteasideform"></div> \
                    <div id="ajteasidebuttons"></div> \
                </div> \
                <div id="ajtemainbar">  \
                </div>  \
                <div id="ajteloader">   \
                    <div id="ajteloaderpic"> \
                        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> \
                    </div>  \
                </div>  \
            </div>';

    if (this instanceof AJTEAdminEditor) {
      htmldata +=
        '<div id="ajte-context-menu"> \
                <div> \
                    <button id="delete-button2">Delete</button> \
                </div> \
            </div>  \
            <div id="ajte-text-context-menu"> \
                <div>   \
                    <button id="bind-shape">Bind shape</button>    \
                </div>  \
                <div>   \
                    <button id="unbind-shape">Unbind shape</button>    \
                </div>  \
                <div> \
                    <button id="delete-button">Delete</button> \
                </div> \
            </div>';
    }

    htmldata += '</section>';
    this.container.innerHTML = htmldata;

    this.formContainer = document.getElementById('ajteasideform');
    this.loader = document.getElementById('ajteloader');
  };

  AJTEEditor.prototype.addAsideBody = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:addAsideBody');
    }

    var self = this;
    var asideTitle = document.getElementById('ajteasidetitle');

    var tit = document.createElement('div');
    tit.className = 'ajte-input-wrap';
    tit.innerHTML =
      '<label>Title:</label> \
            <input type="text" id="arttitle" name="arttitle" class="ajte-input" value="' +
      this.title +
      '"/>';
    asideTitle.appendChild(tit);
    var titinput = document.getElementById('arttitle');
    titinput.addEventListener('blur', function (e) {
      self.title = e.target.value;
    });

    var category = document.createElement('div');
    category.className = 'ajte-input-wrap categories-group autocomplete';
    category.innerHTML =
      '<label>Category:</label> \
            <input type="text" id="artcategory" name="artcategory" class="ajte-input" value="' +
      this.category +
      '"/>';
    asideTitle.appendChild(category);
    var catinput = document.getElementById('artcategory');
    catinput.addEventListener('blur', function (e) {
      self.category = e.target.value;
    });

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('one_category')) {
        self.category = e.target.textContent;
      }
    });

    this.actionButtonsDraw();

    this.activateAside();
  };

  AJTEEditor.prototype.actionButtonsDraw = function () {
    var asideButtons = document.getElementById('ajteasidebuttons');
    var btns = document.createElement('div');
    btns.className = 'ajte-input-wrap';
    btns.innerHTML =
      '<ul class="aside-btn-wrap"> \
            <li class="ajtefirstbtnline">    \
                <a href="#" class="ajte-btn" data-action="save"><span>SAVE AS DRAFT</span></a>  \
                <a href="#" class="ajte-btn ajte-btn-green" data-action="send"><span>SAVE</span></a>  \
            </li> \
            <li class="ajtesecondbtnline"><a href="#" class="ajte-btn ajte-btn-dark" data-action="download"><i class="fa fa-download"></i><span>DOWNLOAD</span></a></li> \
        </ul>';
    asideButtons.appendChild(btns);
  };

  AJTEEditor.prototype.activateAside = function () {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:activateAside');
    }

    var self = this;
    var actionItems = document.querySelectorAll(
      '#ajteasidebuttons a[data-action]'
    );
    for (var i = 0; i < actionItems.length; i++) {
      actionItems[i].addEventListener('click', function () {
        self.menuAction(self, this);
        return false;
      });
    }
  };

  AJTEEditor.prototype.menuAction = function (self, el) {
    if (ajteMode == 'dev') {
      console.info('AJTEEditor:menuAction');
    }

    var action = el.dataset['action'];
    self[action]();
  };

  AJTEEditor.prototype.addAsideCustomFields = function () {};

  function AJTEUserEditor(args) {
    AJTEEditor.call(this, args);
    var self = this;
    this.bar = new AJTESmallBar(this.args, this.cb);

    this.layer.on('click', function (evt) {
      var shape = evt.target;
      if (shape.constructor.name == 'Image') {
        self.chooseElement(shape.attrs.id);
      }
    });
  }

  AJTEUserEditor.prototype = Object.create(AJTEEditor.prototype);

  AJTEUserEditor.prototype.addAsideCustomFields = function () {
    var self = this;

    for (var i in this.customFields) {
      var field = this.customFields[i];
      var el = document.createElement('div');
      el.className = 'ajte-input-wrap';
      var content =
        '<label for="' +
        field.name +
        '">' +
        field.label +
        '</label> \
                <textarea id="input_' +
        field.name +
        '" name="' +
        field.name +
        '" class="ajte-input"';

      for (var j = 0; j < field.validation.length; i++) {
        for (var val_key in field.validation[j]) {
          switch (val_key) {
            case 'max':
              content += ' maxlength="' + field.validation[j][val_key] + '" ';
              break;
          }
        }
      }

      content += '>' + field.value + '</textarea>';
      if (field.comment) {
        content += field.comment;
      }

      el.innerHTML = content;

      this.formContainer.appendChild(el);

      var input = document.getElementById('input_' + field.name);
      input.addEventListener('keyup', function (e) {
        var id = e.target.id;
        var el_id = id.slice(6);
        self.customFields[el_id].value = e.target.value;
      });
    }
  };

  AJTEUserEditor.prototype.addInput = function (type, id) {
    if (type != 'editableText') return;
    var self = this;
    var el = document.createElement('div');
    el.className = 'ajte-input-wrap';
    el.innerHTML =
      '<label>' +
      this.store.elements[id].label +
      ':</label> \
            <textarea id="input_' +
      id +
      '" name="' +
      id +
      '" class="ajte-input">' +
      this.store.elements[id].value +
      '</textarea>';

    this.formContainer.appendChild(el);

    var input = document.getElementById('input_' + id);
    input.addEventListener('keyup', function (e) {
      var id = e.target.id;
      var el_id = id.slice(6);
      self.store.elements[el_id].changeValue(e.target.value);
    });
  };

  AJTEUserEditor.prototype.actionButtonsDraw = function () {};

  function AJTEAdminEditor(args) {
    AJTEEditor.call(this, args);
    var self = this;
    this.bar = new AJTEBar(this.args, this.cb);

    this.layer.on('click', function (evt) {
      var shape = evt.target;
      self.chooseElement(shape.attrs.id);
    });

    this.setUpContextMenu();
  }

  AJTEAdminEditor.prototype = Object.create(AJTEEditor.prototype);

  // browser global
  window.AJTEAdminEditor = window.AJTEAdminEditor || AJTEAdminEditor;
  window.AJTEUserEditor = window.AJTEUserEditor || AJTEUserEditor;

  return {
    AJTEAdminEditor: AJTEAdminEditor,
    AJTEUserEditor: AJTEUserEditor
  };
});
