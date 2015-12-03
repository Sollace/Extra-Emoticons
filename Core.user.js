// ==UserScript==
// @name        FimFiction Extra Emoticons Core
// @description Allows additional emoticons to be added to FimFiction.net
// @author      Sollace
// @namespace   fimfiction-sollace
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/Logger.js
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/FimQuery.core.js
// @version     5.5.1
// @grant       none
// ==/UserScript==
//--------------------------------------------------------------------------------------------------
//==================================================================================================
if (isJQuery()) {
  function reverse(me) { return me.split('').reverse().join() }
  function contains(me, it) { return me.indexOf(it) != -1 }
  function endsWith(me, it) { return reverse(me).indexOf(reverse(it)) == 0; }
  function replaceAll(find, replace, str) { return str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace); }
  
  var logger = new Logger('Extra Emoticons', 6);
  //==================================================================================================
  try {
    (function (win) {
      var version = '5.5';
      var siteMapping = SiteMapping();
      siteMapping.registerMapping('fav', true);
      siteMapping.registerMapping('thumb', true);
      siteMapping.registerMapping('Imgur', 'imgur.com');
      siteMapping.registerMapping('Google', 'google.com',true);
      siteMapping.registerMapping('Twitter', 'twitter.com',true);
      siteMapping.registerMapping('Facebook', 'facebook.com',true);
      siteMapping.registerMapping('FimFiction', 'fimfiction.net');
      siteMapping.registerMapping('FanFiction', 'fanfiction.net');
      siteMapping.registerMapping('DeviantArt', 'deviantart.com',['DA']);
      siteMapping.registerMapping('Tumblr', 'tumblr.com',true);
      siteMapping.registerMapping('MyLittleFaceWhen', 'mylittlefacewhen.com');
      siteMapping.registerMapping('Amazon', 'amazon.com', ['Amazonaws']);
      siteMapping.registerMapping('PhotoBucket', 'photobucket.com');
      siteMapping.registerMapping('Disqus', 'disqus.com',true);
      siteMapping.registerMapping('MySpace', '*x.myspacecdn.com/new/common/images/favicons',true);
      siteMapping.registerMapping('Blogger', 'blogger.com',true);
      siteMapping.registerMapping('Pinterist', 'pinterest.com',true);
      siteMapping.registerMapping('Reddit', 'reddit.com',true);
      siteMapping.registerMapping('GitHub', 'github.com');
      siteMapping.registerMapping('EquestriaDaily', 'equestriadaily.com');
      siteMapping.registerMapping('YouTube', true);
      siteMapping.registerMapping('LinkedIn', true);
      siteMapping.registerMapping('WordPress', true);
      siteMapping.registerMapping('IntenseDebate', true);
      siteMapping.registerMapping('DropBox', '*dt8kf6553cww8.cloudfront.net/static/images/favicon-vflk5FiAC.ico*');

      if (typeof (win.ExtraEmotes) === 'undefined') {
        //--------------------------------------------------------------------------------------------------
        //---------------------------------EXTRA EMOTICONS MODULE-------------------------------------------
        //--------------------------------------------------------------------------------------------------
        function ExtraEmoticons(hook) {
          this.region = $(hook);
          this.childGuest;
          this.previewButton;
          this.submitButton;
          this.textArea;
          this.backupText;
          this.toolbar;
          this.emotesTypes;
          this.search;
          this.search_Tag;
          this.panelholder;
        }
        ExtraEmoticons.prototype = {
          'init': function () {
            logger.Log('ExtraEmoticons.init: start', 9);
            this.mod();
            this.setupGUI();
            logger.Log('ExtraEmoticons.init: end', 9);
          },
          'mod': function() {
            if (this.previewButton == null) {
              if (this.region.attr('id') == 'add_comment_box') {
                this.previewButton = $('#preview_comment');
              } else if (this.region.attr('id') == 'edit_story_form') {
                this.previewButton = this.region.find('td').last().find('.fa.fa-save').parent().next();
              }
              if (this.previewButton != null) {
                var me = this;
                this.previewButton.on('mousedown.extraemotes', function () {
                  logger.Log('PREVIEW',20);
                  handleSubmit(me);
                });
                setTimeout(function () {
                  if (emoteExtenderIsRunning()) {
                    me.submitButton.on('mousedown.extraemotes', function () {
                      logger.Log('SUBMIT (EE)',20);
                      handleSubmit(me);
                    });
                    me.previewButton.on('mousedown.extraemotes',function () {
                      logger.Log('PREVIEW (EE)',20);
                      handleSubmit(me);
                    });
                    recordExtraEmotesPanels();
                  }
                }, 1300);
              }
            }
          },
          'setupGUI': function () {
            logger.Log('ExtraEmoticons.setupGUI: start',10);
            var me = this;
            this.region.attr('data-init', 'true');

            this.submitButton = this.getSubmitButton();
            logger.Log('SubmitButton:' + this.submitButton.length, 20);
            this.textArea = this.getTextArea();
            this.childGuest = this.getEmotesButton();
            this.toolbar = this.getToolbar();

            this.submitButton.on('mousedown.extraemotes', function () {
              logger.Log('SUBMIT',20);
              handleSubmit(me);
            });

            if (me.textArea.val() != '') {
              $(document).on('ready', function() {
                me.textArea.val(returnAliases(me.textArea.val()));
              });
            }

            this.backupText = $('<textarea style="display:none;" />');
            this.textArea.parent().append(this.backupText);

            this.emotesTypes = makeToolbar('emotes_type_switch');
            this.toolbar.append(this.emotesTypes);
            this.emotesTypes.append(this.childGuest.parent());

            this.makeSearch('search');

            this.childGuest.attr('data-function', '');
            this.childGuest.attr('data-panel', 'default');
            this.childGuest.addClass('emoticon-expander');
            this.childGuest.on('click', function() {
              var space_left = $(this).offset().left - me.toolbar.offset().left;
              if (space_left < 300) {
                $(this).parent().find('.drop-down').addClass('reverse');
              } else {
                $(this).parent().find('.drop-down').removeClass('reverse');
              }
            });
            var img = $('<img class="emote-button" src="' + getDefaultEmoteUrl('twilightsmile') + '"></img>');
            this.childGuest.find('i').after(img).remove();
            if (!img[0].complete) {
              $(img).css('display', 'none');
              var spin = $('<i class="fa fa-spinner fa-spin emote-loading" />');
              $(img).after(spin);
              $(img).on('load error', function () {
                $(img).css('display', '');
                spin.remove();
              });
            }

            var def = getDefaultEmotes();
            var holder = this.makeEmotesPanel('', 'default', true);

            var button = $(this.childGuest);
            button.one('click', function() {
              me.addImagesToPanel(def.Id, holder, def.Emotes, true);
            });
            var dropTipHolder = this.openEmoticonsPanel(button);
            dropTipHolder.append(holder);
            /*var legacy = $(getLegacyEmotes());
          legacy.css('display', 'none');
          legacy.attr('data-hash', legacy.html().length);
          dropTipHolder.parent().before(legacy);*/

            logger.Log('ExtraEmoticons.setupGUI: end',10);
          },
          'makeDropTip': function(button) {
            var holder = $('<div class="drop-down drop-down-emotes"><div class="arrow" /></div>');
            $(button).after(holder);
            return holder;
          },
          'openEmoticonsPanel': function(button) {
            var holder = $('<div data-id="' + $(button).attr('data-panel') + '" class="extra_emoticons_panel" />');;
            this.makeDropTip(button).append(holder);
            return holder;
          },
          'getTextArea': function () {
            return this.region.find('textarea').first();
          },
          'getEmotesButton': function () {
            return $(this.region).find('.drop-down-expander[data-function="emoticons-picker"]');
          },
          'getSubmitButton': function () {
            if (this.region.hasClass('edit_area') || this.region.attr('id') == 'add_comment_box' || this.region.hasClass('form-send-pm')) {
              return this.region.find('.button-submit').first();// add comment, edit comment, send pm
            } else if (this.region.attr('id') == 'send_pm_form') {
              return $('#message_box_container #popup_accept').first();// popup send pm
            } else if (this.region.attr('id') == 'new_thread') {
              return this.region.find('.add_comment_toolbar button').first();// create thread
            } else if (this.region.hasClass('module_editing_form')) {
              return this.region.find('.drop-down-pop-up-footer button').first();// edit module
            } else if (this.region.attr('id') == 'edit_story_form') {
              return this.region.find('td').last().find('.fa.fa-save').parent();// edit blog post
            } else if (this.region.hasClass('bbcode-editor')) {
              return $('#chapter_edit_form button[data-function="save"]');// edit chapter
            }
            return this.region.find('.form_submitter').first();// default
          },
          'getToolbar': function () {
            return this.region.find('.format-toolbar').first();
          },
          'makeSearch': function (label) {
            logger.Log('ExtraEmoticons.makeSearch: start',8);
            var searchbar = makeToolbar('emotes_search_toolbar');
            $(this.toolbar).append(searchbar);
            var li = $('<li class="button-group" />');
            $(searchbar).append(li);
            var button = $('<button class="emoticon-expander" data-panel="search" style="font-family:FontAwesome;"></button>');
            li.append(button);
            button.click(function(e) {
              e.stopPropagation();
              var a = $(this).parent();
              if (a.hasClass("drop-down-show")) {
                $(document).trigger('click');
                a.removeClass("drop-down-show");
              } else {
                $(document).trigger('click');
                a.addClass("drop-down-show");
                var space_left = $(this).offset().left - me.toolbar.offset().left;
                if (space_left < 300) {
                  a.find('.drop-down').addClass('reverse');
                } else {
                  a.find('.drop-down').removeClass('reverse');
                }
                var c;
                c = function() {
                  $(document).off("click close-dropdown", c);
                  a.removeClass("drop-down-show");
                };
                $(document).on("click close-dropdowns", c);
              }
              e.preventDefault();
            });
            var me = this;
            button.one('click', function() {
              var box = $('<input id="search_emotes_input" placeholder="search emoticons" autocomplete="off" type="text" />');

              me.search_Tag = me.makeDropTip(button);
              me.search_Tag.addClass('drop-up').addClass('hide');
              me.search_Tag.append('<div class="emote-groups" />');

              me.search = me.makeEmotesPanel('', 'search', true);
              var panel = me.openEmoticonsPanel(button);
              panel.append(box);
              panel.append(me.search);

              box.on('input', function (e) {
                if (this.value == '') {
                  me.search_Tag.addClass('hide');
                  me.search.html('');
                } else {
                  me.refreshSearch(this.value);
                }
              });
              box.on('keydown', function(e) {
                if (e.keyCode == 13) {
                  e.preventDefault();
                }
              });
              box.click(function(e) {
                e.stopPropagation();
              });

            });
            logger.Log('ExtraEmoticons.makeSearch: end',8);
          },
          'makeButton': function (name, label, image, callBack) {
            logger.Log('ExtraEmoticons.makeButton: {0}:{1}', 7, name, label);
            var link = $('<button class="drop-down-expander emoticon-expander" data-panel="' + name + '" title="' + label + ' Emoticons" />');
            var me = this;
            link.on('click', function() {
              var space_left = $(this).offset().left - me.toolbar.offset().left;
              if (space_left < 300) {
                $(this).parent().find('.drop-down').addClass('reverse');
              } else {
                $(this).parent().find('.drop-down').removeClass('reverse');
              }
            });
            link.one('click', callBack);
            var img = $('<img class="emote-button" src="' + image.split('|')[0] + '"></img>');
            link.append(img);
            if (!img[0].complete) {
              $(img).css('display', 'none');
              var spin = $('<i style="line-height:18px;" class="fa fa-spinner fa-spin" />');
              $(img).after(spin);
              $(img).on('load error', function () {
                $(img).css('display', '');
                spin.remove();
              });
            }
            var li = $('<li class="button-group" />');
            $(li).append(link);
            $(this.emotesTypes).append(li);
            logger.Log('ExtraEmoticons.makeButton: end', 7);
            return this.openEmoticonsPanel(link);
          },
          'makeEmotesPanel': function (id, name, norma) {
            logger.Log('ExtraEmoticons.makeEmotesPanel: start',5);
            var innerPannel = $('<div domain="' + id + '" extraemotes="' + name + '" />');
            if (norma != false) {
              $(innerPannel).addClass('extra_emoticons_normalized');
            }
            $(this.panelholder).append(innerPannel);
            logger.Log('ExtraEmoticons.makeEmotesPanel: end',5);
            return innerPannel;
          },
          'addRawsToPanel': function (holder, emotes) {
            for (var i = emotes.length - 1; i > -1; i--) {
              this.addRawToPanel(holder, emotes[i]);
            }
          },
          'addRawToPanel': function (holder, item) {
            var title = item;
            if (item.indexOf('|') != -1) {
              var splitten = SplitTitle(item);
              if (splitten[1] != '') {
                item = splitten[0];
                title = item + '\n ' + splitten[1];
              } else if (splitten[0] != '') {
                title = splitten[0];
              }
            }
            if (item.indexOf('\'') != -1) {
              item = item.replace('\'', '\\\'');
            }
            var newA = $('<a data-function="emoticon" data-emoticon="' + item + '" />');
            $(newA).append('<div class="raw_emote" isRaw="true" title="' + title + '">' + item + '</div>');
            $(holder).append(newA);
          },
          'addImagesToPanel': function (id, holder, emotes) {
            if (id != '') {
              id = ':' + id;
            }
            for (var i = emotes.length - 1; i > -1; i--) {
              this.addImageToPanel(id, holder, emotes[i]);
            }
          },
          'addImageToPanel': function (id, holder, item) {
            var title = getTitle(item);
            var mote = $('<div class="extra_emote"></div>');
            var img = $('<img title="' + id + title + '" src="' + CutProto(item).split('|')[0].split('?')[0] + '" />');
            mote.append(img);
            img.on('dragstart', function(event) {
              var data = event.originalEvent.dataTransfer.getData('Text/plain');
              
              if (data && data.trim().indexOf('[') == 0) {
                data = data.split('\n');
                for (var i = 0; i < data.length; i++) {
                  data[i] = data[i].trim().replace(/\[/g, '').replace(/\]/g, '');
                }
                event.originalEvent.dataTransfer.setData('Text/plain', data.join(''));
              } else {
                event.originalEvent.dataTransfer.setData('Text/plain', id + title);
              }

            });
            if (!img[0].complete) {
              img.css('display', 'none');
              var spin = $('<i class="fa fa-spinner fa-spin emote-loading" />');
              mote.append(spin);
              img.on('load error', function () {
                img.css('display', '');
                spin.remove();
              });
            }
            
            var newA = $('<a data-function="emoticon" data-emoticon="' + (id + title) + '" />');
            newA.append(mote);
            $(holder).append(newA);
          },
          'findMatchingEmotes': function (name) {
            var terms = $.grep(name.toLowerCase().split(' '), function (v) {
              return v != '';
            });
            var results = [];

            if (terms.length > 0) {
              var panels = getVirtualEmotes();
              var group = isGroupSearch(terms, panels);

              terms = '(' + terms.join(' ') + ')';
              if (name.indexOf('social') != -1 || name.indexOf('media') != -1) {
                terms += '|(' + siteMapping.getSocial().join(')|(') + ')';
              }

              terms = new RegExp(terms);
              for (var i = 0; i < panels.length; i++) {
                var named = false;
                for (var k = group.title.length - 1; k >= 0; k--) {
                  if (group.title[k] == panels[i].Name) named = true;
                }
                for (var k = panels[i].Emotes.length - 1; k >= 0; k--) {
                  if (named || (!panels[i].IsRaw ? panels[i].Emotes[k].replace('sollace.github.io','www.github.com') + panels[i].EmoteTitles[k].replace(/\:/g,'') : panels[i].EmoteTitles[k]).toLowerCase().match(terms)) {
                    results.push({
                      raw: panels[i].IsRaw,
                      emote: panels[i].Emotes[k] + '|' + (panels[i].Id == null || panels[i].IsRaw ? '' : panels[i].Id) + panels[i].EmoteTitles[k]
                    });
                  }
                }
              }
              if (name.indexOf('social') != -1 || name.indexOf('media') != -1) {
                group.title.push('!autoFilled$social');
                group.type.push('url');
              }
              this.DisplayGroupIcons(group);
            }
            return results;
          },
          'DisplayGroupIcons': function (groups) {
            if (groups.title.length > 0) {
              this.search_Tag.removeClass('hide');
              this.search_Tag.find('.emote-groups').html('');
              for (var i = 0; i < groups.title.length; i++) {
                var g = groups.title[i];
                var tag = $('<div class="search_tag" />');
                tag.append('<img src="' + this.getGroupButtonIcon(g) + '" />');
                tag.children().first().load(function () {
                  $(this).css('height', '15px');
                });
                tag.append('<i class="fa fa-spinner fa-spin" />');

                if (g == '!autoFilled$social') {
                  tag.attr('title', 'Media search\n Icons relating to social networks ');
                } else {
                  if (groups.type[i] == 'url') {
                    tag.attr('title', 'Url search\n Icons hosted by ' + g);
                  } else {
                    tag.attr('title', 'Emoticon search\n Icons from ' + g);
                  }
                }
                this.search_Tag.find('.emote-groups').append(tag);
              }
            } else {
              this.search_Tag.addClass('hide');
            }
          },
          'refreshSearch': function (term) {
            this.search.html('');
            term = cleanse(term);

            var results = this.findMatchingEmotes(term);
            logger.Log('Refresh search: terms="' + term + '" ' + results.length + ' results',4);
            if (results.length > 0) {
              for (var i = 0; i < results.length; i++) {
                logger.Log('raw="' + results[i].raw + '" item="' + results[i].emote + '"');
                if (results[i].raw) {
                  logger.Log('Adding RAW to panel',3);
                  this.addRawToPanel(this.search, results[i].emote);
                } else {
                  logger.Log('Adding IMG to panel',3);
                  this.addImageToPanel('', this.search, results[i].emote);
                }
              }
            } else {
              this.search.html('<span class="extra_emoticons_message">0 results found</span>');
            }
          },
          'getGroupButtonIcon': function (name) {
            if (name == '!autoFilled$social') {
              return 'http://static.fimfiction.net/images/icons/quote.png';
            } else {
              var icon = siteMapping.getFavicon(name);
              if (icon != null) {
                return icon;
              }
            }
            var buttons = this.emotesTypes.children();
            for (var i = 0; i < buttons.length; i++) {
              var link = $(buttons[i]).find('button');
              if (link.attr('data-panel').toLowerCase() == name.toLowerCase()) {
                return link.find('img').attr('src');
              }
            }
          },
          'addEmoticons': function (id, name, title, emotes, normalize, buttonImage) {
            var holder = this.makeEmotesPanel(id, name, normalize);
            var me = this;
            this.makeButton(name, title, buttonImage ? buttonImage : emotes[emotes.length - 1], function() {
              me.addImagesToPanel(id, holder, emotes);
            }).append(holder);
          },
          'addRaw': function (id, name, title, emotes, buttonImage) {
            if (buttonImage == null) {
              buttonImage = 'http://static.fimfiction.net/images/icons/quote.png'
            }
            var holder = this.makeEmotesPanel(id, name, false);
            var me = this;
            this.makeButton(name, title, buttonImage, function() {
              me.addRawsToPanel(holder, emotes);
            }).append(holder);
          }
        };
        
        function ExtraEmotesAPI(hooks) {
          this.modules = [];
          for (var i = 0; i < hooks.length; i++) {
            var module = new ExtraEmoticons(hooks[i]);
            module.init();
            this.modules.push(module);
          }
        }
        ExtraEmotesAPI.prototype = {
        //==API FUNCTION==//
        //Gets the logging object
          'getLogger': function () {
            return logger;
          },
        //==API FUNCTION==//
        //Adds a collection of image emoticons
          //Optional: buttonImage
          'addEmoticons': function (id, name, title, emotes, normalize, buttonImage) {
            for (var i = 0; i < this.modules.length; i++) {
              this.modules[i].addEmoticons(id, name, title, emotes, normalize, buttonImage);
            }
            recordEmotesPanel(false, id, name, title, emotes, buttonImage, normalize);
            logger.Log('addEmoticons: finalizing...',11);
          },
        //==API FUNCTION==//
        //Adds a collection of text emoticons
          'addRaw': function (id, name, title, emotes, buttonImage) {
            for (var i = 0; i < this.modules.length; i++) {
              this.modules[i].addRaw(id, name, title, emotes, buttonImage);
            }
            recordEmotesPanel(true, id, name, title, emotes, buttonImage, false);
            logger.Log('addRaw: finalizing...',11);
          },
        //==API FUNCTION==//
        //Adds a matching function to identify emoticon images by url
          'addUrlMatcher': function(matcher) {
            addMatcher(matcher);
          },
          'getVersion': function() {
            function parseVersion(s) {
              var num = 0;
              var highest = 0;
              var broken = s.split('.');
              for (var i = 0; i < broken.length; i++) {
                broken[i] = parseInt(broken[i]);
                var adjusted = broken[i];
                for (var j = 0; j < i; j++) {
                  adjusted /= 10;
                }
                if (j > highest) highest = j;
                num+= adjusted;
              }
              return {
                number: num,
                raw: broken,
                high: highest
              }
            }
            var parsed = parseVersion(version);
            return {
              number: parsed.number,
              version: version,
              string: 'Extra Emoticons ' + version,
              full: parsed.raw,
              toString: function() {
                return this.string;
              },
              valueOf: function() {
                return parsed.number;
              },
              equals: function(a) {
                if (typeof(a) == 'string') {
                  return this.version == a || this.string == a;
                }
                return this.valueOf() == a.valueOf();
              },
              compare: function(a) {
                if (typeof(a) == 'string') a = parseVersion(a).number;
                return this.valueOf() - a.valueOf();
              }
            };
          },
          'valueOf': function valueOf() { return this.toString(); },
          'toString': function toString() {
            return '[object API] {\n  getLogger() -> [Object Logger]\n  addEmoticons(id, name, title, emotes, normalize [, buttonImage])\n  addRaw(id, name, title, emotes, buttonImage)\n  addUrlMatcher(matcher (url, emoticon) -> Boolean)';
          }
        };
        
        var modules = [];
        var mainHook = $('#add_comment_box, #edit_story_form, .edit_area, #chapter_edit_form .bbcode-editor, .form-send-pm, #new_thread');
        
        if (mainHook.length) {
          logger.Log('mainHook created succesfully',20);
          win.ExtraEmotes = new ExtraEmotesAPI(mainHook);
          finalInit(win.ExtraEmotes);
        } else {
          logger.Log('no mainHook found, creating dummy object',20);
          win.ExtraEmotes = {
            addEmoticons: function (id, name, title, emotes, normalize, buttonImage) {},
            addRaw: function (id, name, title, emotes, buttonImage) { },
            getLogger: function () { return logger; }
          };
        }
        
        lockDown(win.ExtraEmotes);
        logger.Log('setup completed succesfully',20);
      }

      if (win != window) {
        window.ExtraEmotes = lockDown({
          'addEmoticons': function(id, name, title, emotes, normalize, buttonImage) {win.ExtraEmotes.addEmoticons(id, name, title, emotes, normalize, buttonImage);},
          'addRaw': function(id, name, title, emotes, buttonImage) {win.ExtraEmotes.addRaw(id, name, title, emotes, buttonImage);},
          'getLogger': function() {return win.ExtraEmotes.getLogger();},
          'getVersion': function() {return win.ExtraEmotes.getVersion();},
          'valueOf': function valueOf() { return this.toString(); },
          'toString': function toString() {return win.ExtraEmotes.toString();}
        });
        logger.Log('created proxy to unsafeWindow',20);
      }
      
      //--------------------------------------------------------------------------------------------------
      //----------------------------------------FUNCTIONS-------------------------------------------------
      //--------------------------------------------------------------------------------------------------
      
      function lockDown(obj) {
        var result = function toString() {
          return 'function ' + this.name + '() {\n  [native code]\n}';
        }
        result.toString = result;
        for (var i in obj) obj[i].toString = result;
        return obj;
      }
      
      function SiteMapping() {
        var Mapping = {};
        var aliased = {};
        var socialMapping = [];
        return {
          'registerMapping': function(name, domain, aliases, social) {
            if (typeof domain == 'boolean') {
              social = domain;
              domain = null;
            }
            if (typeof aliases == 'boolean') {
              social = aliases;
              aliases = [];
            }
            if (domain != null) {
              Mapping[name] = domain;
              aliased[name.toLowerCase()] = name;
              if (aliases != null) {
                for (var i = 0; i < aliases.length; i++) {
                  aliased[aliases[i].toLowerCase()] = name;
                }
              }
            }
            if (social) socialMapping.push(name.toLowerCase());
          },
          'getMapped': function(id) {
            var name = this.getName(id);
            if (name == null) return null;
            return {'name': name, 'domain': Mapping[name]};
          },
          'getName': function(id) {
            id = aliased[id.toLowerCase()];
            if (id == undefined) return null;
            return id;
          },
          'getDomain': function(id) {
            id = this.getName(id);
            if (id == null) return null;
            return Mapping[id];
          },
          'getIsSite': function(id) {
            return aliased[id.toLowerCase()] != undefined;
          },
          'getFavicon': function (id) {
            id = this.getDomain(id);
            if (id == null) return null;
            if (id.indexOf('*') != 0) id = 'www.' + id;
            return '//' + id.replace(/\*/g, '') + (endsWith(id, '*') ? '' : '/favicon.ico');
          },
          'getSocial': function() {
            return socialMapping;
          }
        }
      }

      function Name(url) {
        url = url.split('?')[0];
        var panels = getVirtualEmotes();
        for (var i = 0; i < panels.length; i++) {
          if (!panels[i].IsRaw) {
            for (var k = 0; k < panels[i].Emotes.length; k++) {
              if (url == panels[i].Emotes[k]) {
                return ':' + panels[i].Id + panels[i].EmoteTitles[k];
              }
            }
          }
        }
        return url;
      }
      
      function returnAliases(txt) {
        txt = replaceAll('?wrap=true', '', txt);
        var vpanels = getVirtualEmotes();
        for (var i = 0; i < vpanels.length; i++) {
          if (vpanels[i].Name != 'default' && !vpanels[i].IsRaw && !vpanels[i].External) {
            for (var k = 0; k < vpanels[i].Emotes.length; k++) {
              var tit = ':' + vpanels[i].Id + vpanels[i].EmoteTitles[k];
              var emote = '[img]' + vpanels[i].Emotes[k] + '[/img]';
              txt = replaceAll(emote, tit, txt);
            }
          }
        }

        return cleanse(txt);
      }

      function replaceAliases(txt) {
        var vpanels = getVirtualEmotes();

        for (var i = 0; i < vpanels.length; i++) {
          if (vpanels[i].Name != 'default' && !vpanels[i].IsRaw && !vpanels[i].External) {
            for (var k = 0; k < vpanels[i].Emotes.length; k++) {
              var tit = ':' + vpanels[i].Id + vpanels[i].EmoteTitles[k];
              var emote = ' [img]' + vpanels[i].Emotes[k] + '[/img]';
              txt = replaceAll('\n' + tit, '\n [img]' + vpanels[i].Emotes[k] + '?wrap=true[/img]', txt);
              txt = replaceAll(tit, emote, txt);
            }
          }
        }

        return cleanse(txt);
      }

      function cleanse(s) {
        while (s.indexOf('  ') != -1) {
          s = s.replace(/  /g, ' ');
        }
        return s;
      }

      function makeToolbar(name) {
        return $('<ul name="' + name + '" class="toolbar_buttons" />');
      }

      function getDefaultEmoteUrl(name) {
        return 'https://static.fimfiction.net/images/emoticons/' + name + '.png';
      }

      var handling = false;
      function handleSubmit(me) {
        if (!handling) {
          handling = true;
          me.backupText.val(me.textArea.val());
          me.backupText.attr('style', me.textArea.attr('style'));
          me.backupText.css('display', 'block');
          me.backupText.scrollTop(me.textArea.scrollTop());
          me.textArea.css('display', 'none');
          logger.Log(me.textArea.val());
          me.textArea.val(replaceAliases(me.textArea.val()));
          logger.Log(me.textArea.val());
          
          $(document).one('mousemove', function () {
            me.textArea.val(me.backupText.val());
            me.textArea.css('display', 'block');
            me.backupText.css('display', 'none');
            me.backupText.val('');
            handling = false;
          });
        }
      }


      //==API FUNCTION==//
      var emoteExtenderIsNull = false;
      var emoteExtenderFF;
      //Returns true if FimFiction Emote extender is running on the current page
      function emoteExtenderIsRunning() {
        if (emoteExtenderFF == null && !emoteExtenderIsNull) {
          emoteExtenderFF = $('span[id="emoteAPI_Table:FF"]');
          emoteExtenderIsNull = emoteExtenderFF.length == 0;
        }
        return !emoteExtenderIsNull;
      }

      function restoreFromRecord(hook) {
        var store = getVirtualEmotes();
        for (var i = 0; i < store.length; i++) {
          if (!store[i].External) {
            restoreEmotes(hook, store[i]);
          }
        }
      }
      
      function restoreEmotes(hook, data) {
        var holder = hook.makeEmotesPanel(data.Id, data.Name, data.Normalized);
        hook.makeButton(data.Name, data.Title, data.Image, function() {
          if (data.IsRaw) {
            hook.addRawsToPanel(holder, data.rawEmotes);
          } else {
            hook.addImagesToPanel(data.id, holder, data.rawEmotes, data.Normalized);
          }
        }).append(holder);
      }

      var AllEmotes = null;
      function EmoteType(url) {
        var mustWrap = false;
        
        if (url != null && url != undefined) {
          var questionStart = url.indexOf('?');
          if (questionStart != -1) {
            var splitten = url.substring(questionStart + 1, url.length);
            if (splitten.indexOf('isEmote=true') != -1) {
              return { result: 2, url: CutProto(url), lim: true, wrap: mustWrap };
            } else if (splitten.indexOf('wrap=true') != -1) {
              url = url.split('?')[0];
              mustWrap = true;
            }
          }
          
          if (AllEmotes == null) {
            AllEmotes = getVirtualEmotes();
          }
          logger.Log('EmoteType: ' + url);
          for (var i = 0; i < AllEmotes.length; i++) {
            if (!AllEmotes[i].External) {
              for (var k = 0; k < AllEmotes[i].Emotes.length; k++) {
                if (matchUrls(url, AllEmotes[i].Emotes[k])) {
                  logger.Log('EmoteType: true');
                  return {
                    result: 1,
                    url: AllEmotes[i].Emotes[k],
                    lim: AllEmotes[i].Normalized,
                    wrap: mustWrap
                  };
                }
              }
            }
          }
        }
        logger.Log('EmoteType: false');
        return { result: 0, lim: true, wrap: false };
      }
      
      function matchUrls(one, two) {
        return one == two || (urlMatcher ? urlMatcher(one, two) : false);
      }
      
      var urlMatcher = null;
      function addMatcher(matcher) {
        var parentMatcher = urlMatcher;
        if (parentMatcher) {
          urlMatcher = function (one, two) {
            return matcher(one, two) || parentMatcher(one, two);
          }
        } else {
          urlMatcher = matcher;
        }
      }
      
      addMatcher(function(url, match) {
        if (url.indexOf('.deviantart.') != -1) {
          url = url.split('-').reverse()[0].split('.')[0];
          match = match.split('/').reverse()[0].split('-').reverse()[0].split('.')[0];
          return url == match;
        }
        return false;
      });
      
      function getAllEmotes() {
        var result = [];
        var panels = getVirtualEmotes();
        for (var i = 0; i < panels.length; i++) {
          for (var j = 0; j < panels[i].Emotes.length; j++) {
            result.push(panels[i].Emotes[j]);
          }
        }
        return result;
      }

      var virtualEmotes;
      var _defaultEmotes;
      function getVirtualEmotes() {
        if (!virtualEmotes) virtualEmotes = [];
        return virtualEmotes;
      }
      function getDefaultEmotes() {
        if (!_defaultEmotes) {
          _defaultEmotes = {
            Name: 'default',
            External: true,
            IsRaw: false,
            Id: '',
            Emotes: [],
            EmoteTitles: []
          }
          var def = ['ajbemused','ajsleepy','ajsmug','applejackconfused','applejackunsure','applecry','eeyup','fluttercry','flutterrage','fluttershbad','fluttershyouch','fluttershysad','yay','heart','pinkiecrazy','pinkiegasp','pinkiehappy','pinkiesad2','pinkiesmile','pinkiesick','twistnerd','rainbowderp','rainbowdetermined2','rainbowhuh','rainbowkiss','rainbowlaugh','rainbowwild','scootangel','raritycry','raritydespair','raritystarry','raritywink','duck','unsuresweetie','coolphoto','twilightangry2','twilightoops','twilightblush','twilightsheepish','twilightsmile','facehoof','moustache','trixieshiftleft','trixieshiftright','derpyderp1','derpyderp2','derpytongue2','trollestia'];
          for (var i = def.length - 1; i >= 0; i--) {
            _defaultEmotes.Emotes.push(getDefaultEmoteUrl(def[i]));
            _defaultEmotes.EmoteTitles.push(':' + def[i] + ':');
          }
          if (virtualEmotes == null) {
            virtualEmotes = [];
          }
          virtualEmotes.push(_defaultEmotes);
        }

        return _defaultEmotes;
      }
      function getLegacyEmotes() {
        return '<div class="drop-down drop-down-emoticons"><div class="arrow"></div><ul><li><a data-function="emoticon" data-emoticon=":ajbemused:"><img src="//static.fimfiction.net/images/emoticons/ajbemused.png"></a></li><li><a data-function="emoticon" data-emoticon=":ajsleepy:"><img src="//static.fimfiction.net/images/emoticons/ajsleepy.png"></a></li><li><a data-function="emoticon" data-emoticon=":ajsmug:"><img src="//static.fimfiction.net/images/emoticons/ajsmug.png"></a></li><li><a data-function="emoticon" data-emoticon=":applecry:"><img src="//static.fimfiction.net/images/emoticons/applecry.png"></a></li><li><a data-function="emoticon" data-emoticon=":applejackconfused:"><img src="//static.fimfiction.net/images/emoticons/applejackconfused.png"></a></li><li><a data-function="emoticon" data-emoticon=":applejackunsure:"><img src="//static.fimfiction.net/images/emoticons/applejackunsure.png"></a></li><li><a data-function="emoticon" data-emoticon=":coolphoto:"><img src="//static.fimfiction.net/images/emoticons/coolphoto.png"></a></li><li><a data-function="emoticon" data-emoticon=":derpyderp1:"><img src="//static.fimfiction.net/images/emoticons/derpyderp1.png"></a></li><li><a data-function="emoticon" data-emoticon=":derpyderp2:"><img src="//static.fimfiction.net/images/emoticons/derpyderp2.png"></a></li><li><a data-function="emoticon" data-emoticon=":derpytongue2:"><img src="//static.fimfiction.net/images/emoticons/derpytongue2.png"></a></li><li><a data-function="emoticon" data-emoticon=":fluttercry:"><img src="//static.fimfiction.net/images/emoticons/fluttercry.png"></a></li><li><a data-function="emoticon" data-emoticon=":flutterrage:"><img src="//static.fimfiction.net/images/emoticons/flutterrage.png"></a></li><li><a data-function="emoticon" data-emoticon=":fluttershbad:"><img src="//static.fimfiction.net/images/emoticons/fluttershbad.png"></a></li><li><a data-function="emoticon" data-emoticon=":fluttershyouch:"><img src="//static.fimfiction.net/images/emoticons/fluttershyouch.png"></a></li><li><a data-function="emoticon" data-emoticon=":fluttershysad:"><img src="//static.fimfiction.net/images/emoticons/fluttershysad.png"></a></li><li><a data-function="emoticon" data-emoticon=":heart:"><img src="//static.fimfiction.net/images/emoticons/heart.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiecrazy:"><img src="//static.fimfiction.net/images/emoticons/pinkiecrazy.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiegasp:"><img src="//static.fimfiction.net/images/emoticons/pinkiegasp.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiehappy:"><img src="//static.fimfiction.net/images/emoticons/pinkiehappy.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiesad2:"><img src="//static.fimfiction.net/images/emoticons/pinkiesad2.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiesick:"><img src="//static.fimfiction.net/images/emoticons/pinkiesick.png"></a></li><li><a data-function="emoticon" data-emoticon=":pinkiesmile:"><img src="//static.fimfiction.net/images/emoticons/pinkiesmile.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowderp:"><img src="//static.fimfiction.net/images/emoticons/rainbowderp.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowdetermined2:"><img src="//static.fimfiction.net/images/emoticons/rainbowdetermined2.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowhuh:"><img src="//static.fimfiction.net/images/emoticons/rainbowhuh.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowkiss:"><img src="//static.fimfiction.net/images/emoticons/rainbowkiss.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowlaugh:"><img src="//static.fimfiction.net/images/emoticons/rainbowlaugh.png"></a></li><li><a data-function="emoticon" data-emoticon=":rainbowwild:"><img src="//static.fimfiction.net/images/emoticons/rainbowwild.png"></a></li><li><a data-function="emoticon" data-emoticon=":raritycry:"><img src="//static.fimfiction.net/images/emoticons/raritycry.png"></a></li><li><a data-function="emoticon" data-emoticon=":raritydespair:"><img src="//static.fimfiction.net/images/emoticons/raritydespair.png"></a></li><li><a data-function="emoticon" data-emoticon=":raritystarry:"><img src="//static.fimfiction.net/images/emoticons/raritystarry.png"></a></li><li><a data-function="emoticon" data-emoticon=":raritywink:"><img src="//static.fimfiction.net/images/emoticons/raritywink.png"></a></li><li><a data-function="emoticon" data-emoticon=":scootangel:"><img src="//static.fimfiction.net/images/emoticons/scootangel.png"></a></li><li><a data-function="emoticon" data-emoticon=":trixieshiftleft:"><img src="//static.fimfiction.net/images/emoticons/trixieshiftleft.png"></a></li><li><a data-function="emoticon" data-emoticon=":trixieshiftright:"><img src="//static.fimfiction.net/images/emoticons/trixieshiftright.png"></a></li><li><a data-function="emoticon" data-emoticon=":twilightangry2:"><img src="//static.fimfiction.net/images/emoticons/twilightangry2.png"></a></li><li><a data-function="emoticon" data-emoticon=":twilightblush:"><img src="//static.fimfiction.net/images/emoticons/twilightblush.png"></a></li><li><a data-function="emoticon" data-emoticon=":twilightoops:"><img src="//static.fimfiction.net/images/emoticons/twilightoops.png"></a></li><li><a data-function="emoticon" data-emoticon=":twilightsheepish:"><img src="//static.fimfiction.net/images/emoticons/twilightsheepish.png"></a></li><li><a data-function="emoticon" data-emoticon=":twilightsmile:"><img src="//static.fimfiction.net/images/emoticons/twilightsmile.png"></a></li><li><a data-function="emoticon" data-emoticon=":twistnerd:"><img src="//static.fimfiction.net/images/emoticons/twistnerd.png"></a></li><li><a data-function="emoticon" data-emoticon=":unsuresweetie:"><img src="//static.fimfiction.net/images/emoticons/unsuresweetie.png"></a></li><li><a data-function="emoticon" data-emoticon=":yay:"><img src="//static.fimfiction.net/images/emoticons/yay.png"></a></li><li><a data-function="emoticon" data-emoticon=":trollestia:"><img src="//static.fimfiction.net/images/emoticons/trollestia.png"></a></li><li><a data-function="emoticon" data-emoticon=":moustache:"><img src="//static.fimfiction.net/images/emoticons/moustache.png"></a></li><li><a data-function="emoticon" data-emoticon=":facehoof:"><img src="//static.fimfiction.net/images/emoticons/facehoof.png"></a></li><li><a data-function="emoticon" data-emoticon=":eeyup:"><img src="//static.fimfiction.net/images/emoticons/eeyup.png"></a></li><li><a data-function="emoticon" data-emoticon=":duck:"><img src="//static.fimfiction.net/images/emoticons/duck.png"></a></li></ul></div>';
      }
      
      function VirtualEmotePanel(israw, id, name, title, emotes, img, norm, ext) {
        this.Normalized = norm != false;
        this.Title = title;
        this.Name = name;
        this.Id = id;
        this.IsRaw = israw;
        this.External = ext == true;
        
        this.Image = this.IsRaw || img ? img : emotes[emotes.length - 1];
        
        this.Emotes = [];
        this.EmoteTitles = [];
        this.rawEmotes = emotes;

        for (var k = 0; k < emotes.length; k++) {
          var emote = emotes[k];
          if (emote.indexOf('http') == 0) emote = CutProto(emote);
          if (emote.indexOf('|') != -1) {
            var item = emote.split('|');
            if (item.length > 2) {
              item[item.length - 1] = '';
              this.Emotes.push(item.join('|'));
            } else {
              this.Emotes.push(item[0]);
            }
          } else {
            this.Emotes.push(emote);
          }
          if (this.IsRaw) {
            this.EmoteTitles.push(SplitTitle(emote)[1]);
          } else {
            this.EmoteTitles.push(getTitle(emote));
          }
        }
      }

      function recordEmotesPanel(isRaw, id, name, title, emotes, img, norm) {
        virtualEmotes.push(new VirtualEmotePanel(isRaw, id, name, title, emotes, img, norm, false));
      }

      function recordExternalEmotesPanel(name, emotes) {
        virtualEmotes.push(new VirtualEmotePanel(false, '', name, '', emotes, '', false, true));
      }

      function recordExtraEmotesPanels() {
        $('.emoteTable').each(function () {
          var name = $(this).attr('id').split(':')[1].split('_Area')[0];
          var emotes = [];
          $(this).find('.customEmote').each(function () {
            emotes.push($(this).attr('id') + '|' + $(this).attr('title'));
          });
          recordExternalEmotesPanel(name, emotes);
        });
      }

      function UnspoilerEmoticons() {
        var comments = $('.comment .data .comment_data');
        if (comments.length == 0) {
          logger.Log("unspoiler: abort", 10);
          return false;
        }
        emotifyImg();
        unspoilerSiblings();
        comments.find('img:not(.done)').each(function () {
          $(this).attr('title', $(this).attr('alt'));
          $(this).addClass('done');
        });

        logger.Log("unspoiler: complete", 10);
        return true;
      }
      
      function emotifyImg() {
        $('.comment .data .comment_data .user_image:not(.done').each(emotify);
      }
      function emotify() {
        var url = CutProto($(this).attr('src'));
        var type = EmoteType(url);
        if (type.result == 1) {
          var tit = Name(type.url);
          $(this).attr('src', type.url);
          $(this).attr('alt', tit);
          $(this).attr('title', tit);
          $(this).addClass('emoticon').removeClass('user_image');
          if (type.lim) {
            $(this).css('max-height', '27px');
          }
        } else {
          $(this).addClass('done');
        }
      }

      function unspoilerSiblings() {
        $('.comment .data .comment_data .user_image_link:not(.dontUnspoiler)').each(unspoilerSibling);
      }
      function unspoilerSibling() {
        var url = CutProto($(this).attr('href'));
        var type = EmoteType(url);
        var img;
        if (type.result > 0) {
          if (type.result == 2) {
            img = $('<img class="user_image" src="' + type.url + '" />');
            $(this).parent().after(img).remove();
          } else {
            var tit = Name(type.url);
            img = $('<img class="emoticon" alt="' + tit + '" title="' + tit + '" src="' + type.url + '" />');
            if (type.lim) $(img).css('max-height', '27px');
            
            var p = $(this).parent().prev();
            if (p.prop('tagName') != 'P') {
              if (p.prop('tagName') == 'BR') {
                p = p.prev();
                p.next().remove();
              }
            }
            if (type.wrap || p.length == 0 || p.prop('tagName') != 'P') {
              $(this).parent().attr('style', 'display: inline;');
              $(this).after(img);
              $(this).remove();
            } else {
              $(this).parent().remove();
              p.append(img);
            }
          }
          img.parent().find('i').remove();
          logger.Log("unspoilerSiblings: " + url);
        } else {
          $(this).addClass('dontUnspoiler');
          $(this).parent().after('<br />');
        }
      }
      function isSpoileredImg(item) {
        return item.tagName == 'DIV' && item.children[0] != undefined && item.children[0].tagName == 'A';
      }

      function finalInit(instance) {
        logger.Log('finalInit: beginning init...');
        setTimeout(function () {
          logger.Log('finalInit: document ready');
          var emoteExtenderOtp = $('a[title="Emote Script Settings"]');
          if (emoteExtenderOtp.length) {
            emoteExtenderOtp = emoteExtenderOtp.parent().parent()[0];
            instance.toolbar.insertBefore(emoteExtenderOtp, ExtraEmotes.emotesTypes)
          }
          logger.Log('refreshComments');
          if (document.location.href.replace(/http(s|):/,'').indexOf('//www.fimfiction.net/manage_user/messages/') != 0) {
            var temp = setInterval(refreshComments, 500);
            var tempb = setInterval(refreshEmotePanels, 1000);
            $.ajaxSetup({catch: true});
            $.getScript("https://github.com/Sollace/UserScripts/raw/master/Internal/Events.user.js", function() {
              clearInterval(tempb);
              FimFicEvents.on('afterpagechange aftercomposepm', refreshEmotePanels);
              if (isMyPage()) FimFicEvents.on('aftereditmodule', function() {
                refreshEmotePanels();
                $('.module_editing_form textarea').each(function() {
                  $(this).val(returnAliases($(this).val()));
                });
              });
              clearInterval(temp);
              FimFicEvents.on('afterpagechange aftereditcomment afteraddcomment afterpreviewcomment', refreshComments);
            });
            $.getScript("https://github.com/Sollace/UserScripts/raw/master/Internal/SpecialTitles.user.js", function() {
              SpecialTitles.setUpSpecialTitles();
              FimFicEvents.on('afterpagechange aftereditcomment afteraddcomment afterpreviewcomment', function() {
                SpecialTitles.setUpSpecialTitles();
              });
            });
          }
        }, 200);
        makeStyle('\
.extra_emoticons_normalized .emote-loading {\
  position: absolute;\
  left: 0px;\
  right: 0px;\
  width: 27px;\
  line-height: 27px;}\
.emote-loading {\
  font-size: 30px;\
  line-height: 18px;\
  width: 100%;\
  color:rgb(200,200,140);}\
.emote-button {\
  width: 18px;\
  height: 18px;\
  margin-bottom: -5px;}\
.extra_emoticons_panel > div > * {\
  display: inline-block;\
  padding: 5px;}\
.extra_emoticons_panel > div > *:hover {\
  background: rgba(0,0,0,0.1);\
  border-radius: 4px;\
  border: 1px solid rgba(0, 0, 0, 0.2);\
  margin: -1px;\
background: none repeat scroll 0% 0% #FFF;}\
.extra_emoticons_normalized img {\
  max-height: 27px;\
  max-width: 27px;\
  position: absolute;\
  margin: auto !important;\
  top: 0 !important;\
  left: 0 !important;\
  bottom: 0 !important;\
  right: 0 !important;}\
.extra_emoticons_normalized .extra_emote {\
  width: 27px !important;\
  height: 27px !important;\
  position: relative;}\
.extra_emoticons_panel {\
  padding: 5px;\
  vertical-align: top;\
  overflow: auto;\
  font-size: 0.8em;\
  font-weight: bold;\
  text-align: center;\
  max-height: 300px;}\
.raw_emote {\
  color: #333;\
  text-shadow: 1px 1px rgba(255, 255, 255, 0.2);\
  font-size: 10px;\
  line-height: 17px;\
  background: rgba(100,100,100,0.1);\
  border: dotted 1px rgba(154,174,192,0.5);\
  border-radius: 4px;\
  padding: 5px;\
  vertical-align: bottom;\
  display: inline-block;}\
#search_emotes_input {\
  margin: 0px;\
  padding: 3px;\
  width: 100%;}\
.hide {\
  display: none !important;}\
.search_tag {\
  overflow: hidden;\
  margin: 5px;\
  width: 15px;\
  height: 15px;\
  display: inline-block;\
  vertical-align: bottom;}\
.search_tag img {\
  height: 0px;\
  vertical-align: 0;}\
.search_tag i {\
  margin: 0px !important;\
  height: 15px;\
  width: 15px;\
  vertical-align: 0;}\
.extra_emoticons_message {\
  text-align: center;\
  line-height: 30px;}\
.extra_emoticons_message:hover {\
  border-color: transparent !important;\
  background: none !important;\
  box-shadow: none !important;}\
.format-toolbar .drop-down-emotes {\
  width: 280px;\
  right: -10px;\
  left: initial;\
  line-height: 0;}\
.format-toolbar .drop-down-emotes .arrow {\
    right: 14px;\
    left: initial;}\
#edit_story_form .drop-down-emotes.reverse,\
#edit_story_form .drop-down-emoticons.reverse {\
  left: 0px;\
  margin-left: 0px;}\
.form-send-pm textarea, #send_pm_form textarea {\
 min-height: 300px;}\
.emoticon-expander ~ .reverse {\
  left: 75px !important;}\
.emoticon-expander ~ .reverse .arrow,\
.emoticon-expander ~ .reverse .arrow {\
  left: 20px;\
  right: initial;}\
#edit_story_form .drop-down-emotes.reverse,\
#edit_story_form .drop-down-emoticons.reverse {\
  left: 5px !important;}\
#edit_story_form .drop-down-emotes.reverse .arrow,\
#edit_story_form .drop-down-emoticons.reverse .arrow {\
  left: 14px;\
  right: initial;}\
.emoticon-expander ~ .drop-down-emotes,\
.emoticon-expander ~ .drop-down-emoticons {\
  right: -5px;}\
.drop-up {\
  top: auto !important;\
  bottom: 36px;}\
.drop-up .arrow:before {\
  border-top: 10px solid #FFF;\
  border-bottom: none !important;\
  top: auto !important;\
  bottom: 2px;}\
.drop-up .arrow {\
  top: auto !important;\
  bottom: -12px;\
  border-top: 12px solid rgba(0, 0, 0, 0.2);\
  border-bottom: none !important;}');
        logger.Log('finalInit: init complete');
      }

      function refreshEmotePanels() {
        $('.edit_area, .module_editing_form, #send_pm_form').each(function() {
          logger.Log('RefreshEmotePanels: .edit_area[data-init="' + $(this).attr('data-init') + '"]');
          if ($(this).attr('data-init') != 'true') {
            var module = new ExtraEmoticons(this);
            module.setupGUI();
            restoreFromRecord(module);
          }
        });
      }

      function refreshComments() {
        try {
          if (UnspoilerEmoticons()) {
            var editComments = getEditCommentButtons();
            if (editComments.length > 0) {
              logger.Log('refreshComments: adding comment editing...', 20);
              editComments.each(function () {
                $(this).on('mousedown', function () {
                  var form = $(this).parents('.comment').find('form');
                  if (form.attr('data-init') != 'true') {
                    form.attr('data-init','true');
                    var ttextArea = form.find('textarea');
                    logger.Log(ttextArea.val());
                    ttextArea.val(returnAliases(ttextArea.val()));
                    logger.Log(ttextArea.val());
                  }
                  refreshEmotePanels();
                });
              });
              logger.Log('refreshComments: Comment editing added succesfully', 20)
            }
          }
        } catch (e) {
          logger.SevereException('Error in refreshing comments: {0}', e);
        }
      }
      
      function getEditCommentButtons() {
        var result = $("a[title='Edit this comment'][extraemotesInit!=true]");
        result.attr('extraemotesInit', 'true');
        return result;
      }

      function isGroupSearch(terms, panels) {
        var result = {'title':[],'type':[]};
        for (var path = 0; path < terms.length; path++) {
          for (var i = 0; i < panels.length; i++) {
            var mat = panels[i].Name;
            if (mat != null) {
              if (terms[path].toLowerCase().indexOf(mat.toLowerCase()) != -1) {
                if (result.title.indexOf(mat) == -1) {
                  result.title.push(mat);
                  result.type.push('panel');
                }
              }
            }
          }
        }
        for (var path = 0; path < terms.length; path++) {
          if (siteMapping.getIsSite(terms[path])) {
            var site = siteMapping.getName(terms[path]);
            if (result.title.indexOf(site) == -1) {
              result.title.push(site);
              result.type.push('url');
            }
          }
        }
        return result;
      }
      
      function getTitle(raw) {
        if (raw.indexOf('|') != -1) {
          var spl = raw.split('|');
          if (spl.length > 0 && spl[spl.length - 1] != '') {
            var result = spl[spl.length - 1];
            if (result.indexOf(':') != 0)
              result = ':' + result;
            if (!endsWith(result, ':'))
              result += ':';
            return result
          }
        }
        raw = replaceAll(' ', '_', raw.split('/').reverse()[0].split('.')[0]);
        if (raw.indexOf('_by_') != -1) {
          raw = raw.split('_by_')[0];
        }
        while (raw.indexOf('__') != -1) {
          raw = raw.replace(/__/g, '_');
        }
        return ':' + raw.replace('clapping_pony_icon_', '') + ':';
      }
      
      function CutProto(url) {
        return url && (url.indexOf('http') == 0) ? url.replace(/http(s|):/,'') : url;
      }

      function SplitTitle(text) {
        var result = ['', ''];
        var name = true;
        if (text.indexOf('|') != -1) {
          for (var i = text.length - 1; i >= 0; i--) {
            if (name) {
              if (text[i] == '|' && (i < text.length - 1 ? text[i + 1] != '|' : true) && (i > 0 ? text[i - 1] != '|' : true)) {
                name = false
              } else {
                result[1] += text[i];
              }
            } else {
              result[0] += text[i];
            }
          }
          result[1].replace('||', '|');
          if (result[0] == '') {
            result = result.reverse();
          }
        }
        var reversed = ['', ''];
        for (var i = 0; i < result.length; i++) {
          for (var c = result[i].length - 1; c >= 0; c--) {
            reversed[i] += result[i][c];
          }
        }
        return reversed;
      }
    })(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);
  } catch (e) {
    logger.SevereException("Unhandled Exception: {0}", e);
  }
}
