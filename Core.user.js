// ==UserScript==
// @name        FimFiction Extra Emoticons Core
// @description Allows additional emoticons to be added to FimFiction.net
// @author      Sollace
// @namespace   fimfiction-sollace
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @version     5.1
// @grant       none
// ==/UserScript==
//--------------------------------------------------------------------------------------------------

//==================================================================================================
function reverse(me) { return me.split('').reverse().join() }
function contains(me, it) { return me.indexOf(it) != -1 }
function startsWith(me, it) { return me.indexOf(it) == 0 }
function endsWith(me, it) { return startsWith(reverse(me), reverse(it)) }
function replaceAll(find, replace, str) { return str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace); }

if (isJQuery()) {
    var logger = new Logger('Extra Emoticons', 0);
    var mapping = {
        'Imgur': 'imgur.com',
        'Google': 'google.com',
        'Twitter': 'twitter.com',
        'Facebook': 'facebook.com',
        'FimFiction': 'fimfiction-static.net',
        'FanFiction': 'fanfiction.net',
        'DeviantArt': 'deviantart.com',
        'Tumblr': 'tumblr.com',
        'MyLittleFaceWhen': 'mylittlefacewhen.com',
        'Amazon': 'amazon.com',
        'Amazonaws': 'amazon.com',
        'PhotoBucket': 'photobucket.com',
        'Disqus': 'disqus.com',
        'MySpace': '*x.myspacecdn.com/new/common/images/favicons',
        'Blogger': 'blogger.com',
        'Pinterist': 'pinterest.com',
        'Reddit': 'reddit.com'
    };
    var socialMapping = ['fav', 'thumb', 'twitter', 'facebook', 'youtube', 'google', 'linkedin', 'intensedebate', 'wordpress', 'tumblr', 'disqus', 'myspace', 'blogger', 'pinterest', 'reddit'];

    //==================================================================================================
    try {
        (function (win) {
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
                ExtraEmoticons.prototype.init = function (force) {
                    logger.Log('ExtraEmoticons.init: start');
                    if (!has_init || force == true) {
                        var me = this;
                        if (this.region.hasClass('.module_editing_form')) {
                            if (this.previewButton == null) {
                                this.previewButton = $('#preview_comment');
                            }
                            if (this.previewButton.length) {
                                this.previewButton.on('click.extraemotes', function () {
                                    handleSubmit(me);
                                });
                            }
                        }

                        this.reInit();

                        setTimeout(function () {
                            if (emoteExtenderIsRunning()) {
                                me.submitButton.on('mousedown.extraemotes', function () {
                                    handleSubmit(me);
                                });
                                me.previewButton.on('click.extraemotes',function () {
                                    handleSubmit(me);
                                });
                                recordExtraEmotesPanels();
                            }
                        }, 1300);
                    }
                    logger.Log('ExtraEmoticons.init: end');
                }
                ExtraEmoticons.prototype.reInit = function () {
                    logger.Log('ExtraEmoticons.reInit: start');
                    this.region.attr('data-init', 'true');
                    var me = this;
                    
                    this.submitButton = this.getSubmitButton();
                    this.textArea = this.getTextArea();
                    this.childGuest = this.getEmotesButton();
                    this.toolbar = this.region.find('.format-toolbar').first();
                    
                    this.submitButton.on('mousedown.extraemotes', function () {
                        handleSubmit(me);
                    });
                    this.textArea.on('drop', handleDrop);

                    this.backupText = $('<textarea style="display:none;" />');
                    this.textArea.parent().append(this.backupText);
                    
                    this.emotesTypes = makeToolbar('emotes_type_switch');
                    this.toolbar.append(this.emotesTypes);
                    this.emotesTypes.append(this.childGuest.parent());
                    
                    /*this.search = this.makeEmotesPanel('', 'search', true);
                    this.makeSearch('search');*/
                    
                    $(this.childGuest).find('i').after('<img class="icon_16" style="width: 18px; height: 18px" src="' + getDefaultEmoteUrl('twilightsmile') + '" />').remove();
                    $(this.childGuest).attr('data-function', '');
                    $(this.childGuest).attr('data-panel', 'default');
                    
                    var def = getDefaultEmotes();
                    var holder = this.makeEmotesPanel('', 'default', true);
                    this.addImagesToPanel(def.Id, holder, def.Emotes, true);
                    this.openEmoticonsPanel($(this.childGuest)).append(holder);
                    
                    logger.Log('ExtraEmoticons.reInit: end');
                }
                ExtraEmoticons.prototype.openEmoticonsPanel = function(button) {
                    var holder = $('<div class="drop-down drop-down-emoticons"><div class="arrow" /><div data-id="' + $(button).attr('data-panel') + '" class="extra_emoticons_panel" />');
                    $(button).after(holder);
                    return holder.find('.extra_emoticons_panel');
                };
                ExtraEmoticons.prototype.getTextArea = function () {
                    return this.region.find('textarea').first();
                }
                ExtraEmoticons.prototype.getEmotesButton = function () {
                    return $(this.region).find('.drop-down-expander[data-function="emoticons-picker"]');
                }
                ExtraEmoticons.prototype.getSubmitButton = function () {
                    if (this.region.hasClass('.module_editing_form')) {
                        return this.region.find('.drop-down-pop-up-footer button').first();
                    } else if (this.region.hasClass('.edit_area')) {
                        return this.region.find('.save_button').first();
                    }
                    return this.region.find('.form_submitter').first();
                }
                ExtraEmoticons.prototype.getToolbar = function () {
                    logger.Log('ExtraEmoticons.getToolbar: called');
                    return this.childGuest.parentNode.parentNode;
                }
                ExtraEmoticons.prototype.makeSearch = function (label) {
                    logger.Log('ExtraEmoticons.makeSearch: start');
                    var box = document.createElement('input');
                    $(box).addClass('left_curved_4');
                    $(box).attr('style', 'margin: 3px; padding: 3px;padding-top:4px;');
                    $(box).attr('type', 'text');
                    $(box).css('width', '50px');
                    $(box).css('transition', 'width 0.5s ease');
                    $(box).attr('placeholder', 'search emoticons');
                    box.id = label;
                    var me = this;
                    box.oninput = function () {
                        if (this.value == '') {
                            $(this).attr('selected_tab', '');
                            $(me.search_Tag).css('display', 'none');
                        }
                    };
                    box.onkeypress = function (e) {
                        if (e.keyCode == 13) {
                            $($(li).children()[1]).click();
                            return false;
                        }
                    };
                    $(box).focus(function () {
                        $(this).css('width', '200px');
                    });
                    $(box).blur(function () {
                        if (this.value == '') {
                            $(this).css('width', '50px');
                        }
                    });
                    var li = $('<li style="padding:0px;" />');
                    $(li).append(box);

                    var searchbar = makeToolbar('emotes_search_toolbar');
                    $(searchbar).append(li);

                    $(li).append('<button style="font-family:FontAwesome;"></button>');
                    $(li).find('button').click(function () {
                        if (box.value != '') {
                            if (!$(this).parent().find('.extra_emoticons_panel[data-id="search"]').length) {
                                me.openEmoticonsPanel(this);
                            }
                            me.refreshSearch(box.value);
                        }
                    });
                    
                    $(searchbar).append(li);

                    $(this.toolbar).append(searchbar);

                    var tagBar = makeToolbar('emotes_search_tagbar');

                    $(this.toolbar).append(tagBar);

                    this.search_Tag = document.createElement('li');
                    this.search_Tag.id = 'emotes_searchTagPreview';
                    $(this.search_Tag).attr('style', 'display:none;background:none;border:none;box-shadow:none;padding-left:5px;');
                    $(tagBar).append(this.search_Tag);
                    logger.Log('ExtraEmoticons.makeSearch: end');
                }
                ExtraEmoticons.prototype.makeButton = function (name, label, image) {
                    logger.Log('ExtraEmoticons.makeButton: start');
                    var link = $('<button class="drop-down-expander" data-panel="' + name + '" title="' + label + ' Emoticons" />');
                    var img = $('<img class="icon_16" style="width: 18px; height: 18px" src="' + image.split('|')[0] + '"></img>');
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
                    logger.Log('ExtraEmoticons.makeButton: end');
                    return this.openEmoticonsPanel(link);
                }
                ExtraEmoticons.prototype.makeEmotesPanel = function (id, name, norma) {
                    logger.Log('ExtraEmoticons.makeEmotesPanel: start');
                    var innerPannel = document.createElement('div');
                    if (norma != false) {
                        $(innerPannel).addClass('extra_emoticons_normalized');
                    }
                    $(innerPannel).attr('domain', id);
                    $(innerPannel).attr('extraemotes', name);
                    $(this.panelholder).append(innerPannel);
                    logger.Log('ExtraEmoticons.makeEmotesPanel: end');
                    return innerPannel;
                }
                ExtraEmoticons.prototype.addRawsToPanel = function (holder, emotes) {
                    for (var i = emotes.length - 1; i > -1; i--) {
                        this.addRawToPanel(holder, emotes[i]);
                    }
                }
                ExtraEmoticons.prototype.addRawToPanel = function (holder, item) {
                    var newA = document.createElement('a');
                    var title = item;
                    if (contains(item, '|')) {
                        var splitten = SplitTitle(item);
                        if (splitten[1] != '') {
                            item = splitten[0];
                            title = item + '\n ' + splitten[1];
                        } else if (splitten[0] != '') {
                            title = splitten[0];
                        }
                    }
                    if (contains(item, '\'')) {
                        item = item.replace('\'', '\\\'');
                    }
                    $(newA).attr('data-function', 'emoticon');
                    $(newA).attr('data-emoticon', item);
                    $(newA).append('<div><div class="raw_emote" isRaw="true" title="' + title + '">' + item + '</div></div>');
                    $(holder).append(newA);
                }
                ExtraEmoticons.prototype.addImagesToPanel = function (id, holder, emotes) {
                    if (id != '') {
                        id = ':' + id;
                    }
                    for (var i = emotes.length - 1; i > -1; i--) {
                        this.addImageToPanel(id, holder, emotes[i]);
                    }
                }
                ExtraEmoticons.prototype.addImageToPanel = function (id, holder, item) {
                    var newA = $('<a />');
                    var title = getTitle(item);
                    $(newA).attr('data-function', 'emoticon');
                    $(newA).attr('data-emoticon', id + title);
                    
                    var img = $('<img title="' + id + title + '" src="' + item.split('|')[0] + '" />');
                    
                    var mote = $('<div class="extra_emote"></div>');
                    $(mote).append(img);

                    if (!img[0].complete) {
                        $(img).css('display', 'none');
                        var spin = $('<i style="font-size:30px;color:rgb(200,200,140);" class="fa fa-spinner fa-spin" />');
                        $(mote).append(spin);

                        $(img).on('load error', function () {
                            $(img).css('display', '');
                            spin.remove();
                        });
                    }

                    $(newA).append(mote);
                    $(holder).append(newA);
                }
                ExtraEmoticons.prototype.Name = function (url) {
                    url = url.split('?')[0];
                    var panels = getDefaultEmotes();
                    for (var k = 0; k < panels.Emotes.length; k++) {
                        if (url == panels.Emotes[k]) {
                            return ':' + panels.Id + panels.EmoteTitles[k];
                        }
                    }

                    panels = getVirtualEmotes();
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
                ExtraEmoticons.prototype.findMatchingEmotes = function (name) {
                    var terms = $.grep(name.replace('_', ' ').split(' '), function (v) {
                        return v != '';
                    });

                    if (contains(name, 'social') || contains(name, 'media')) {
                        for (var i = 0; i < socialMapping.length; i++) {
                            terms.push(socialMapping[i]);
                        }
                    }
                    var results = [];

                    var panels = getVirtualEmotes();
                    var defaultPanel = getDefaultEmotes();
                    var group = isGroupSearch(terms, panels, defaultPanel.Name);

                    for (var k = 0; k < defaultPanel.Emotes.length; k++) {
                        for (var t = 0; t < terms.length; t++) {
                            if (contains((group.length > 0 && !defaultPanel.IsRaw ? defaultPanel.Emotes[k] : defaultPanel.EmoteTitles[k]).toLowerCase(), terms[t].toLowerCase())) {
                                if (defaultPanel.IsRaw) {
                                    defaultPanel.push('RAW,url=' + defaultPanel.Emotes[k] + '|' + defaultPanel.EmoteTitles[k]);
                                } else {
                                    results.push(defaultPanel.Emotes[k] + '|' + (defaultPanel.Id == null ? '' : defaultPanel.Id) + defaultPanel.EmoteTitles[k]);
                                }
                            }
                        }
                    }

                    for (var i = 0; i < panels.length; i++) {
                        for (var k = 0; k < panels[i].Emotes.length; k++) {
                            for (var t = 0; t < terms.length; t++) {
                                if (contains((group.length > 0 && !panels[i].IsRaw ? panels[i].Emotes[k] : panels[i].EmoteTitles[k]).toLowerCase(), terms[t].toLowerCase())) {
                                    if (panels[i].IsRaw) {
                                        results.push('RAW,url=' + panels[i].Emotes[k] + '|' + panels[i].EmoteTitles[k]);
                                    } else {
                                        results.push(panels[i].Emotes[k] + '|' + (panels[i].Id == null ? '' : panels[i].Id) + panels[i].EmoteTitles[k]);
                                    }
                                }
                            }
                        }
                    }

                    if (contains(name, 'social') || contains(name, 'media')) {
                        group.push('!autoFilled$social')
                    }
                    this.DisplayGroupIcons(group);
                    return results;
                }
                ExtraEmoticons.prototype.DisplayGroupIcons = function (groups) {
                    if (groups.length > 0) {
                        $(this.search_Tag).css('display', 'inline-block');
                        this.search_Tag.innerHTML = '';
                        for (var i = 0; i < groups.length; i++) {
                            var g = groups[i];

                            var tag = $('<div style="overflow: hidden; width: 15px; height: 15px; display: inline-block; vertical-align: bottom;" />');
                            $(tag).append('<img src="' + this.getGroupButtonIcon(g) + '" style="height:0px;vertical-align: 0;" />');
                            $($(tag).children()[0]).load(function () {
                                $(this).css('height', '15px');
                            });
                            $(tag).append('<i class="fa fa-spinner fa-spin" style="height: 15px; width: 15px; vertical-align: 0;" />');

                            if (g == '!autoFilled$social') {
                                $(tag).attr('title', 'Media search\n Icons relating to social networks ');
                            } else {
                                $(tag).attr('title', 'Url search\n Icons hosted by ' + g);
                            }
                            $(this.search_Tag).append(tag);
                        }
                    } else {
                        $(this.search_Tag).css('display', 'none');
                    }
                }
                ExtraEmoticons.prototype.refreshSearch = function (term) {
                    this.search.innerHTML = '';
                    while (contains(term, '  ')) {
                        term = term.replace('  ', ' ');
                    }
                    var results = this.findMatchingEmotes(term);
                    logger.Log('Refresh search: terms="' + term + '" ' + results.length + ' results');
                    if (results.length > 0) {
                        for (var i = 0; i < results.length; i++) {
                            var raw = '';
                            var item = results[i];
                            if (contains(item, ',url=')) {
                                raw = item.split(',url=')[0];
                                item = item.split(',url=')[1];
                            }
                            logger.Log('raw="' + raw + '" item="' + item + '"');
                            if (raw == 'RAW') {
                                this.addRawToPanel(this.search, item);
                                logger.Log('Adding RAW to panel');
                            } else {
                                this.addImageToPanel('', this.search, item);
                                logger.Log('Adding IMG to panel');
                            }
                        }
                    } else {
                        this.search.innerHTML = '<div class="extra_emoticons_message" style="opacity:1;">0 results found</div>';
                    }
                }
                ExtraEmoticons.prototype.getGroupButtonIcon = function (name) {
                    if (name == '!autoFilled$social') {
                        return 'http://www.fimfiction-static.net/images/icons/quote.png';
                    } else if (getIsSite(name)) {
                        return getSiteFavicon(name);
                    }
                    var buttons = this.emotesTypes.children;
                    for (var i = 0; i < buttons.length; i++) {
                        var link = buttons[i].getElementsByTagName('a')[0];
                        if (link.id.toLowerCase() == name.toLowerCase()) {
                            return $(link.children[0]).attr('src');
                        }
                    }
                }
                ExtraEmoticons.prototype.addEmoticons = function (id, name, title, emotes, normalize) {
                    var holder = this.makeEmotesPanel(id, name, normalize);
                    this.addImagesToPanel(id, holder, emotes);
                    this.makeButton(name, title, emotes[emotes.length - 1]).append(holder);
                }
                ExtraEmoticons.prototype.addRaw = function (id, name, title, emotes, buttonImage) {
                    if (buttonImage == null) {
                        buttonImage = 'http://www.fimfiction-static.net/images/icons/quote.png'
                    }
                    var holder = this.makeEmotesPanel(id, name, false);
                    this.addRawsToPanel(holder, emotes);
                    this.makeButton(name, title, buttonImage).append(holder);
                }
                
                function ExtraEmotesAPI(special,hooks) {
                    this.modules = [];
                    this.modules.push(new ExtraEmoticons(special));
                    for (var i = 0; i < hooks.length; i++) {
                        this.modules.push(new ExtraEmoticons(hooks[i]));
                    }
                    for (var i = 0; i < this.modules.length; i++) {
                        this.modules[i].init();
                    }
                }
                //==API FUNCTION==//
                //Gets the logging object
                ExtraEmotesAPI.prototype.getLogger = function () {
                    return logger;
                }

                //==API FUNCTION==//
                //Adds a collection of image emoticons
                ExtraEmotesAPI.prototype.addEmoticons = function (id, name, title, emotes, normalize) {
                    for (var i = 0; i < this.modules.length; i++) {
                        this.modules[i].addEmoticons(id, name, title, emotes, normalize);
                    }
                    recordEmotesPanel(false, id, name, title, emotes, emotes[emotes.length - 1], normalize);
                    logger.Log('addEmoticons: finalizing...');
                }

                //==API FUNCTION==//
                //Adds a collection of text emoticons
                ExtraEmotesAPI.prototype.addRaw = function (id, name, title, emotes, buttonImage) {
                    for (var i = 0; i < this.modules.length; i++) {
                        this.modules[i].addRaw(id, name, title, emotes, buttonImage);
                    }
                    recordEmotesPanel(true, id, name, title, emotes, buttonImage, false);
                    logger.Log('addRaw: finalizing...');
                }

                var modules = [];
                var has_init = false;
                var mainHook = $('#add_comment_box');
                
                if (mainHook.length) {
                    win.ExtraEmotes = new ExtraEmotesAPI(mainHook, $('.edit_area'));
                    logger.Log('Checkpoint 1: mainHook created succesfully');
                    finalInit(win.ExtraEmotes);
                } else {
                    logger.Log('no mainHook found, creating dummy object');
                    win.ExtraEmotes = {
                        addEmoticons: function (id, name, title, emotes, normalize) {},
                        addRaw: function (id, name, title, emotes, buttonImage) { },
                        getLogger: function () { return logger; }
                    }
                }
                logger.Log('setup completed succesfully');
            }

            if (win != window) {
                window.ExtraEmotes = {
                    addEmoticons: function (id, name, title, emotes, normalize) {
                        win.ExtraEmotes.addEmoticons(id, name, title, emotes, normalize);
                    },
                    addRaw: function (id, name, title, emotes, buttonImage) {
                        win.ExtraEmotes.addRaw(id, name, title, emotes, buttonImage);
                    },
                    getLogger: function() {
                        return win.ExtraEmotes.getLogger();
                    }
                };
                logger.Log('Checkpoint 3: created proxy to unsafeWindow');
            }

            //--------------------------------------------------------------------------------------------------
            //----------------------------------------FUNCTIONS-------------------------------------------------
            //--------------------------------------------------------------------------------------------------

            function returnAliases(txt) {
                txt = replaceAll('?wrap=true', '', txt);
                var vpanels = getVirtualEmotes();
                for (var i = 0; i < vpanels.length; i++) {
                    if (!vpanels[i].IsRaw && !vpanels[i].External) {
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
                    if (!vpanels[i].IsRaw && !vpanels[i].External) {
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
                while (contains(s, '  ')) {
                    s = s.replace(/  /g, ' ');
                }
                return s;
            }

            function makeToolbar(name) {
                return $('<ul name="' + name + '" class="toolbar_buttons" />');
            }
            
            function getDefaultEmoteUrl(name) {
                return 'https://fimfiction-static.net/images/emoticons/' + name + '.png';
            }

            function handleDrop(event) {
                logger.Log(event.dataTransfer.getData('text/plain'));
                var links = event.dataTransfer.getData('text/plain').split('\n');
                var inserted = '';
                for (var i = 0; i < links.length; i++) {
                    links[i] = links[i].trim().replace(/\[/g, '').replace(/\]/g, '');
                    if (links[i] != '') {
                        var insert = '';
                        if (startsWith(links[i].replace('[', ''), 'javascript:smilie(')) {
                            insert = links[i].replace('javascript:smilie("', '').replace('");', '');
                            insert = insert.replace('javascript:smilie(\'', '').replace('\');', '');
                        } else if (startsWith(links[i].replace('[', ''), 'insertemote:')) {
                            insert = links[i].replace('insertemote:', '');
                        } else if (startsWith(links[i], ':') && endsWith(links[i], ':')) {
                            insert = links[i];
                        }
                    }
                    if (insert != '') {
                        inserted += insert;
                    }
                }
                if (inserted != '') {
                    logger.Log('InsertTextAt: ' + inserted);
                    InsertTextAt(this, decodeURIComponent(inserted));
                    event.preventDefault();
                }
            }

            var handling = false;
            function handleSubmit(me) {
                if (!handling) {
                    handling = true;
                    me.backupText.val(me.textArea.val());
                    me.backupText.css('height', me.textArea.outerHeight());
                    me.backupText.css('display', 'block');
                    me.backupText.scrollTop(me.textArea.scrollTop());
                    me.textArea.css('display', 'none');
                    me.textArea.val(replaceAliases(me.textArea.val()));

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
                    emoteExtenderIsNull = emoteExtenderFF.length > 0;
                }
                return !emoteExtenderIsNull;
            }

            function restoreFromRecord(hook) {
                var store = getVirtualEmotes();
                for (var i = 0; i < store.length; i++) {
                    if (!store[i].External) {
                        var id = store[i].Id;
                        var name = store[i].Name;
                        var title = store[i].Title;
                        var norm = store[i].Normalized;

                        var holder = hook.makeEmotesPanel(id, name, norm);

                        var emotes = store[i].rawEmotes;
                        if (store[i].IsRaw) {
                            hook.addRawsToPanel(holder, emotes);
                            hook.makeButton(name, title, store[i].Image).append(holder);
                        } else {
                            hook.addImagesToPanel(id, holder, emotes, norm);
                            hook.makeButton(name, title, emotes[emotes.length - 1]).append(holder);
                        }
                    }
                }
            }

            var AllEmotes = null;
            function EmoteType(url) {
                var mustWrap = false;

                if (url != null && url != undefined) {
                    var splitten = url.split('?');
                    if (splitten != null && splitten.length == 2) {
                        splitten = splitten[1].split('&');
                        for (var i = 0; i < splitten.length; i++) {
                            if (splitten[i] == 'isEmote=true') {
                                return {
                                    result: 2,
                                    lim: true,
                                    wrap: mustWrap
                                };
                            } else if (splitten[i] == 'wrap=true') {
                                url = url.split('?')[0];
                                mustWrap = true;
                                break;
                            }
                        }
                    }

                    if (AllEmotes == null) {
                        AllEmotes = getVirtualEmotes();
                    }
                    logger.Log('EmoteType: ' + url);
                    for (var i = 0; i < AllEmotes.length; i++) {
                        if (!AllEmotes[i].External) {
                            for (var k = 0; k < AllEmotes[i].Emotes.length; k++) {
                                if (url == AllEmotes[i].Emotes[k]) {
                                    logger.Log('EmoteType: true');
                                    return {
                                        result: 1,
                                        lim: AllEmotes[i].Normalized,
                                        wrap: mustWrap
                                    }
                                }
                            }
                        }
                    }
                }

                logger.Log('EmoteType: false');
                return { result: 0, lim: true, wrap: false };
            }

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

            var virtualEmotes = [];
            function getVirtualEmotes() {
                return virtualEmotes;
            }
            var _defaultEmotes;
            function getDefaultEmotes() {
                if (_defaultEmotes == null) {
                    _defaultEmotes = {
                        External: true,
                        IsRaw: false,
                        Id: '',
                        Emotes: [],
                        EmoteTitles: []
                    }

                    var def = ['ajbemused','ajsleepy','ajsmug','applecry','applejackconfused','applejackunsure','coolphoto','derpyderp1','derpyderp2','derpytongue2','fluttercry','flutterrage','fluttershbad','fluttershyouch','fluttershysad','heart','pinkiecrazy','pinkiegasp','pinkiehappy','pinkiesad2','pinkiesick','pinkiesmile','rainbowderp','rainbowdetermined2','rainbowhuh','rainbowkiss','rainbowlaugh','rainbowwild','raritycry','raritydespair','raritystarry','raritywink','scootangel','trixieshiftleft','trixieshiftright','twilightangry2','twilightblush','twilightoops','twilightsheepish','twilightsmile','twistnerd','unsuresweetie','yay','trollestia','moustache','facehoof','eeyup','duck'];
                    for (var i = 0; i < def.length; i++) {
                        _defaultEmotes.Emotes.push(getDefaultEmoteUrl(def[i]));
                        _defaultEmotes.EmoteTitles.push(':' + def[i] + ':');
                    }
                }

                return _defaultEmotes;
            }

            function VirtualEmotePanel(israw, id, name, title, emotes, img, norm, ext) {
                this.Normalized = norm != false;
                this.Title = title;
                this.Name = name;
                this.Id = id;
                this.IsRaw = israw;
                this.External = ext == true;

                this.Image = null;
                if (this.IsRaw) {
                    this.Image = img;
                }

                this.Emotes = [];
                this.EmoteTitles = [];
                this.rawEmotes = emotes;

                for (var k = 0; k < emotes.length; k++) {
                    if (contains(emotes[k], '|')) {
                        var item = emotes[k].split('|');
                        if (item.length > 2) {
                            item[item.length - 1] = '';
                            this.Emotes.push(item.join('|'));
                        } else {
                            this.Emotes.push(item[0]);
                        }
                    } else {
                        this.Emotes.push(emotes[k]);
                    }
                    if (this.IsRaw) {
                        this.EmoteTitles.push(SplitTitle(emotes[k])[1]);
                    } else {
                        this.EmoteTitles.push(getTitle(emotes[k]));
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
                if (comments.length == 0) return false;
                unspoilerSiblings();
                comments.find('img:not(.done)').each(function () {
                    $(this).attr('title', $(this).attr('alt'));
                    $(this).addClass('done');
                });

                logger.Log("unspoiler: complete");
                return true;
            }

            function unspoilerSiblings() {
                $('.comment .data .comment_data .user_image_link:not(.dontUnspoiler').each(function () {
                    var url = $(this).attr('href').replace('https://', 'http://');
                    var type = EmoteType(url);
                    if (type.result > 0) {
                        if (type.result == 2) {
                            $(this).parent().after('<img class="user_image" src="' + $(this).attr('href') + '" />').remove();
                        } else {
                            var tit = ExtraEmotes.Name(url);
                            var img = $('<img alt="' + tit + '" title="' + tit + '" src="' + url + '" />');
                            if (type.lim) {
                                $(img).css('max-height', '27px');
                            }

                            var p = $(this).parent().prev();
                            if (type.wrap || p.length == 0 || p.prop('tagName') != 'P') {
                                $(this).parent().attr('style', 'display: inline;');
                                $(this).after(img);
                                $(this).remove();
                            } else {
                                $(this).parent().remove();
                                p.append(img);
                            }
                        }
                        logger.Log("unspoilerSiblings: " + url);
                    } else {
                        $(this).addClass('dontUnspoiler');
                        $(this).parent().after('<br />');
                    }
                });
            }
            function isSpoileredImg(item) {
                return item.tagName == 'DIV' && item.children[0] != undefined && item.children[0].tagName == 'A';
            }

            function finalInit(instance) {
                logger.Log('finalInit: beginning init...');
                setTimeout(function () {
                    logger.Log('finalInit: document ready');
                    var emoteExtenderOtp = getElementByAttributeValue('a', 'title', 'Emote Script Settings');
                    if (emoteExtenderOtp != null) {
                        emoteExtenderOtp = emoteExtenderOtp.parentNode.parentNode;
                        instance.toolbar.insertBefore(emoteExtenderOtp, ExtraEmotes.emotesTypes)
                    }
                    logger.Log('refreshComments');
                    if (!startsWith(document.location.href, 'http://www.fimfiction.net/manage_user/messages/')) {
                        var temp = setInterval(refreshComments, 500);
                        var tempb = setInterval(refreshEmotePanels, 1000);
                        $.ajaxSetup({catch: true});
                        $.getScript("https://github.com/Sollace/UserScripts/raw/master/Internal/Events.user.js", function() {
                            clearInterval(tempb);
                            FimFicEvents.on('afterpagechange', refreshEmotePanels);
                            if (isMyPage()) {
                                FimFicEvents.on('aftereditmodule', refreshEmotePanels);
                            }
                            clearInterval(temp);
                            FimFicEvents.on('afterpagechange aftereditcomment afteraddcomment afterpreviewcomment', function() {
                                refreshComments();
                            });
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
.extra_emoticons_panel > div {\
  overflow-y: auto;\
  overflow-x: hidden;}\
.fullOpaque > * {\
  opacity: 1 !important;}\
.extra_emoticons_panel > div > * {\
  display: inline-block;\
  padding: 2px;\
  transition: opacity 0.2s linear;}\
.extra_emoticons_panel a:not(:hover) {\
  color: rgb(0,10,90) !important;}\
.extra_emoticons_panel > div > *:hover {\
  transition: none;\
  background: rgba(0,0,0,0.1);\
  border-radius: 500px;\
  box-shadow: inset rgba(0,0,0,0.1) 4px 4px 4px;}\
.extra_emoticons_message {\
  opacity: 1;\
  transition: none;\
  background: rgba(0,0,0,0.1);\
  border-radius: 500px;\
  box-shadow: inset rgba(0,0,0,0.1) 4px 4px 4px;\
  text-align: center;\
  width: 100%;\
  padding: 5px 0 5px 0;}\
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
  max-height: 300px;\
.raw_emote {\
  border: dotted 1px rgb(154,174,192);\
  border-radius: 4px;\
  margin: 4px;\
  display: inline-block;}\
.raw_emote:hover {text-decoration: none;}');
                logger.Log('finalInit: init complete');
            }

            function refreshEmotePanels() {
                $('.edit_area, .module_editing_form').each(function() {
                    logger.Log('RefreshEmotePanels: .edit_area[data-init="' + $(this).attr('data-init') + '"]');
                    if ($(this).attr('data-init') != 'true') {
                        var module = new ExtraEmoticons(this);
                        module.reInit();
                        restoreFromRecord(module);
                    }
                });
            }
            
            function refreshComments() {
                try {
                    if (UnspoilerEmoticons()) {
                        var editComments = getEditCommentButtons();
                        if (editComments.length > 0) {
                            logger.Log('refreshComments: adding comment editing...');
                            editComments.each(function () {
                                $(this).on('mousedown', function () {
                                    var form = this.parentNode.parentNode.parentNode.children[2];
                                    var ttextArea = form.getElementsByTagName('textarea')[0];
                                    logger.Log(ttextArea.value);
                                    ttextArea.value = returnAliases(ttextArea.value);
                                    logger.Log(ttextArea.value);
                                    ttextArea.parentNode.parentNode.children[1].onmousedown = function () {
                                        logger.Log('Replace Aliases (before): ' + ttextArea.value);
                                        ttextArea.value = replaceAliases(ttextArea.value);
                                        logger.Log('Replace Aliases (after): ' + ttextArea.value)
                                    }
                                    ttextArea.ondrop = handleDrop;
                                });
                            });
                            logger.Log('refreshComments: Comment editing added succesfully')
                        }
                    }
                } catch (e) {
                    logger.SevereException('Error in refreshing comments: {0}', e);
                }
            }

            function isGroupSearch(terms, panels, extra) {
                var result = [];
                for (var path = 0; path < terms.length; path++) {
                    for (var i = 0; i < panels.length; i++) {
                        var mat = panels[i].Name;
                        if (mat != null) {
                            if (contains(terms[path].toLowerCase(), mat.toLowerCase())) {
                                if (result.indexOf(mat) == -1) {
                                    result.push(mat);
                                }
                            }
                        }
                    }
                    if (extra != null) {
                        if (contains(terms[path].toLowerCase(), extra.toLowerCase())) {
                            if (result.indexOf(extra) == -1) {
                                result.push(extra);
                            }
                        }
                    }
                }
                for (var path = 0; path < terms.length; path++) {
                    var site = getIsSite(terms[path]);
                    if (site != '') {
                        if (result.indexOf(site) == -1) {
                            result.push(site);
                        }
                    }
                }
                return result;
            }

            function getTitle(raw) {
                if (contains(raw, '|')) {
                    var spl = raw.split('|');
                    if (spl.length > 0 && spl[spl.length - 1] != '') {
                        var result = spl[spl.length - 1];
                        if (!startsWith(result, ':'))
                            result = ':' + result;
                        if (!endsWith(result, ':'))
                            result += ':';
                        return result
                    }
                }
                raw = replaceAll(' ', '_', raw.split('/').reverse()[0].split('.')[0]);
                if (contains(raw, '_by_')) {
                    raw = raw.split('_by_')[0];
                }
                while (contains(raw, '__')) {
                    raw = raw.replace('__', '_');
                }
                return ':' + raw.replace('clapping_pony_icon_', '') + ':';
            }

            function SplitTitle(text) {
                var result = ['', ''];
                var name = true;
                if (contains(text, '|')) {
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

//--------------------------------------------------------------------------------------------------
//--------------------------------------API FUNCTIONS-----------------------------------------------
//--------------------------------------------------------------------------------------------------

//==API FUNCTION==//
//Returns standard addres for a sites favicon.ico
function getSiteFavicon(domain) {
    var text = mapping[domain];
    if (text == null) return undefined;
    if (!startsWith(text, '*')) {
        text = 'www.' + text
    }
    return 'http://' + text.replace('*', '') + '/favicon.ico';
}

//==API FUNCTION==//
//Returns display name of given site name of an empty string
function getIsSite(domain) {
    domain = domain.toLowerCase();
    for (var i in mapping) {
        if (domain == i.toLowerCase())
            return i;
    }
    return '';
}

//==API FUNCTION==//
//Returns an element with a given tag, and attribute value
function getElementByAttributeValue(tag, attribute, value) {
    return $(tag + '[' + attribute + '="' + value + '"]')[0];
}

//==API FUNCTION==//
function getEditCommentButtons() {
    var result = $("a[title='Edit this comment'][extraemotesInit!=true]");
    result.each(function() {
        $(this).attr('extraemotesInit', 'true');
    });

    return result;
}

//==API FUNCTION==//
function selectElementContents(el) {
    if (window.getSelection && document.createRange) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.select();
    }
}

//==API FUNCTION==//
function getIsLoggedIn() {
    try { return logged_in_user != null;
    } catch (e) {}
    return false;
}

//==API FUNCTION==//
function isMyPage() {
    var locationCheck = document.location.href.replace('http:','').replace('https:','');
    if (locationCheck.indexOf('//www.fimfiction.net/user/' + getUserNameEncoded()) == 0) return true;
    return locationCheck.indexOf('//www.fimfiction.net/user/' + getUserName().replace(/ /g, '+')) == 0;
}

//==API FUNCTION==//
//Returns true if the given string is recognized as a website
function getBoolIsSite(domain) {return getIsSite(domain) != '';}

//==API FUNCTION==//
function getUserNameEncoded() { return encodeURIComponent(getUserName()); }

//==API FUNCTION==//
function getUserName() {return getIsLoggedIn() ? getUserButton().getAttribute("href").split("/").reverse()[0] : 'Anon';}

//==API FUNCTION==//
function getUserButton() {
    return $('.user_toolbar a.button[href^="/user/"]')[0];
}

//==API FUNCTION==//
function makeStyle(input, id) {
    while (contains(input, '  ')) {
        input = replaceAll('  ',' ', input);
    }
    var style = document.createElement('style');
    $(style).attr('type', 'text/css');
    $(style).append(input);
    if (id != undefined && id != null) {
        style.id = id;
    }
    $('head').append(style);
}

//==API FUNCTION==//
function isJQuery() {
    try {
        if ($ === undefined) {}
        return true;
    } catch (e) {}
    return false;
}

//==API FUNCTION==//
function Logger(name, l) {
    var test = null;
    var minLevel = 0;
    var line = 0;
    var paused = false;
    if (typeof (l) == 'number') minLevel = l;
    this.Start = function (level) {
        if (typeof (level) == 'number') minLevel = level;
        test = $('#debug-console')[0];
        paused = false;
        if (test == null || test == undefined) {
            test = $('<div id="debug-console" style="position:fixed;bottom:0px;left:0px;" />');
            $('body').append(test);
            $(test).click(function () {
                $(this).empty();
                this.style.bottom = this.style.left = line = 0;
            });
        }
        Output('===Logging Enabled===', minLevel + 1);
    }
    this.Stop = function () {
        if (test != null) {
            $(test).remove();
            test = null;
        }
        line = 0;
        Output('===Logging Disabled===', minLevel + 1);
    }
    this.Pause = function () {
        Output('===Logging Paused===', minLevel + 1);
        paused = true;
    }
    this.Continue = function () {
        paused = false;
        Output('===Logging Continued===', minLevel + 1);
    }
    this.Log = function (txt) { Output(txt, 0); }
    this.Error = function (txt) { Output(txt, 1); }
    this.SevereException = function (txt, excep) {
        if (excep != 'handled') {
            try {
                var stopped = false;
                if (test == null) {
                    stopped = true;
                    this.Start();
                }
                if (txt.indexOf('{0}') != -1) {
                    SOut(txt.replace('{0}', excep), 2);
                } else {
                    SOut(txt, 2);
                    SOut(excep, 2);
                }
                if (excep.stack != undefined && excep.stack != null) SOut(excep.stack, 2);
                if (stopped) this.Pause();
            } catch (e) {
                alert('Error in displaying Severe: ' + e);
                alert('Severe: ' + txt);
            }
            throw 'handled';
        }
    }
    this.Severe = function (txt) {
        try {
            var stopped = false;
            if (test == null) {
                stopped = true;
                this.Start();
            }
            SOut(txt, 2);
            if (stopped) this.Pause();
        } catch (e) {
            alert('Error in displaying Severe: ' + e);
            alert('Severe: ' + txt);
        }
    }
    function Output(txt, level) {
        if (!paused) SOut(txt, level);
    }
    function SOut(txt, level) {
        if (level == null || level == undefined) level = 0;
        if (test != null && level >= minLevel) {
            if (line > 50) {
                line = 0;
                $(test).empty();
            }
            $(test).append('<p style="background: rgba(' + (line % 2 == 0 ? '155,0' : '0,155') + ',0,0.3);">' + ++line + '):' + name + ') ' + txt + '</p>');
        }
    }
}