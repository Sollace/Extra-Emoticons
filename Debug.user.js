﻿// ==UserScript==
// @name        FimFiction Extra Emoticons Core
// @description Allows additional emoticons to be added to FimFiction.net
// @author      Sollace
// @namespace   fimfiction-sollace
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @version     4.6_3
// @grant       none
// ==/UserScript==
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
if (isJQuery())

    $.ajaxSetup({
        catch: true
    });
$.getScript("https://github.com/Sollace/FimFiction-UserScripts/raw/Dev/Internal/SpecialTitles.user.js");

//==================================================================================================

//==================================================================================================

function reverse(me) { return me.split('').reverse().join() }
function contains(me, it) { return me.indexOf(it) != -1 }
function startsWith(me, it) { return me.indexOf(it) == 0 }
function endsWith(me, it) { return startsWith(reverse(me), reverse(it)) }
function replaceAll(find, replace, str) { return str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace); }

var logger = new Logger('Extra Emoticons', 0);
logger.Start();

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


try {
    (function (win) {
        if (typeof (win.ExtraEmotes) === 'undefined') {
            //--------------------------------------------------------------------------------------------------
            //---------------------------------EXTRA EMOTICONS MODULE-------------------------------------------
            //--------------------------------------------------------------------------------------------------
            function ExtraEmoticons(index, hook) {
                this.childGuest = hook;
                this.IsSpecial = index <= 0;

                this.previewButton;
                this.submitButton;
                this.textArea;
                this.backupText;
                this.parentGuest;
                this.toolbar;
                this.emotesTypes;
                this.search;
                this.search_Tag;
                this.buttonFormat;
                this.panelholder;

                if (!this.IsSpecial) {
                    this.buttonFormat = $(this.childGuest).attr('onclick');
                    if (this.buttonFormat != null) {
                        this.buttonFormat = this.buttonFormat.replace(':duck:', '{0}');
                    }
                }
            }
            ExtraEmoticons.prototype.init = function (force) {
                logger.Log('ExtraEmoticons.init: start');
                if (!has_init || force == true) {
                    var me = this;
                    if (this.IsSpecial) {
                        if (this.previewButton == null) {
                            this.previewButton = document.getElementById('preview_comment');
                        }
                        if (this.previewButton != null) {
                            $(this.previewButton).click(function () {
                                handleSubmit(me);
                            });
                        }
                    }
                    if (this.toolbar == null || force == true) {
                        this.toolbar = this.getToolbar()
                    }

                    this.reInit();

                    setTimeout(function () {
                        if (emoteExtenderIsRunning()) {
                            $(me.previewButton).click(function () {
                                handleSubmit(me);
                            });
                            me.submitButton.onmousedown = function () {
                                handleSubmit(me);
                            };
                            recordExtraEmotesPanels();
                        }
                    }, 1300);
                }
                logger.Log('ExtraEmoticons.init: end');
            }
            ExtraEmoticons.prototype.reInit = function () {
                logger.Log('ExtraEmoticons.reInit: start');
                this.submitButton = this.getSubmitButton();

                this.textArea = this.getTextArea();

                var me = this;
                this.submitButton.onmousedown = function () {
                    handleSubmit(me);
                };

                this.textArea.ondrop = handleDrop;

                this.backupText = document.createElement('textarea');
                $(this.backupText).css('display', 'none');

                $(this.textArea.parentNode).append(this.backupText);

                this.parentGuest = this.childGuest.parentNode;

                var oClass = $(this.parentGuest).attr('class');

                $(this.parentGuest).attr('class', 'extra_emoticons_normalized extra_emoticons_shown');
                $(this.parentGuest).attr('extraemotes', 'FimFiction');

                this.panelholder = document.createElement('div');

                $(this.panelholder).attr('tabindex', 0);
                $(this.panelholder).keydown(function (e) {
                    if (e.keyCode == 65 && e.ctrlKey) {
                        selectElementContents($(this).find('.extra_emoticons_shown')[0]);
                        e.preventDefault();
                    }
                });

                $(this.panelholder).addClass('extra_emoticons_panel');


                var parentHolder = document.createElement('div');
                $(parentHolder).append(this.panelholder);

                if ($('span[id="emoteAPI_Table:FF"]').length == 0) {
                    $(parentHolder).addClass('emoticons_panel');
                    $(parentHolder).css('padding', '0px');
                } else {
                    var tmp = $(this.parentGuest).attr('id');
                    $(this.parentGuest).removeAttr('id');
                    $(parentHolder).attr('id', tmp);
                    tmp = $(this.parentGuest).attr('style');
                    $(this.parentGuest).removeAttr('style');
                    $(parentHolder).attr('style', tmp);
                    $(this.parentGuest.parentNode).css('padding', '0px');
                }

                if ($(this.parentGuest.parentNode).hasClass('emoticons_panel')) {
                    $(this.parentGuest.parentNode).after(parentHolder);
                    $(this.parentGuest.parentNode).remove();
                } else {
                    $(this.parentGuest.parentNode).append(parentHolder);
                }

                $(this.panelholder).append(this.parentGuest);
                $(this.parentGuest).css('height', '260px');

                for (var i = 0; i < this.parentGuest.children.length; i++) {
                    var item = this.parentGuest.children[i];
                    var img = item.children[0];
                    if (img != null) {
                        var tit = getTitle($(img).attr('src'));
                        $(img).attr('title', tit);
                        if (!this.IsSpecial) {
                            $(item).attr('href', 'insertEmote:' + tit);
                        }
                    }

                    var newItem = $("<div class='extra_emote' />");
                    $(newItem).append(img);
                    if (!img.complete) {
                        $(img).css('display', 'none');
                        var spin = $('<i style="font-size:30px;color:rgb(200,200,140);" class="fa fa-spinner fa-spin" />');
                        $(newItem).append(spin);
                        $(img).on('load error', function () {
                            $(img).css('display', '');
                            spin.remove();
                        });
                    }
                    $(item).append(newItem);
                }

                this.emotesTypes = makeToolbar('emotes_type_switch');
                $(this.toolbar).append(this.emotesTypes);
                this.search = this.makeEmotesPanel('', 'search', true);
                this.makeSearch('search');
                this.makeButton('FimFiction', 'Default', this.childGuest.children[0].children[0].src);
                logger.Log('ExtraEmoticons.reInit: end');
            }
            ExtraEmoticons.prototype.getTextArea = function () {
                logger.Log('ExtraEmoticons.getTextArea: start');
                var result = null;
                if (this.IsSpecial) {
                    result = document.getElementById('comment_comment');
                } else {
                    var nod = this.childGuest;
                    for (var i = 0; i < 4; i++) {
                        nod = nod.parentNode;
                    }
                    result = nod.children[1].children[0].children[0];
                }
                logger.Log('ExtraEmoticons.getTextArea: end');
                return result;
            }
            ExtraEmoticons.prototype.getSubmitButton = function () {
                logger.Log('ExtraEmoticons.getSubmitButton: start');
                var nod = this.childGuest;
                if (this.IsSpecial) {
                    if (this.previewButton != null) {
                        return this.previewButton.parentNode.children[0];
                    } else {
                        for (var i = 0; i < 3; i++) {
                            nod = nod.parentNode;
                        }
                    }
                } else {
                    for (var i = 0; i < 5; i++) {
                        nod = nod.parentNode;
                    }
                }
                var childs = nod.children;
                childs = childs[childs.length - 1].children[0]
                logger.Log('ExtraEmoticons.getSubmitButton: end');
                return childs;
            }
            ExtraEmoticons.prototype.getToolbar = function () {
                logger.Log('ExtraEmoticons.getToolbar: called');
                if (this.IsSpecial) {
                    var button = document.getElementById('text_sizecomment_comment');
                    return button.parentNode.parentNode;
                } else {
                    var elem = this.childGuest;
                    for (var i = 0; i < 4; i++) {
                        elem = elem.parentNode
                    }
                    var childs = elem.children;
                    for (var i = 0; i < childs.length; i++) {
                        if ($(childs[i]).hasClass('light_toolbar') || $(childs[i]).hasClass('dark_toolbar')) {
                            return childs[i];
                        }
                    }
                }
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
                    var saved = $(this).attr('selected_tab');
                    if (saved == null || saved == '') {
                        saved = $(me.getSelectedTab()).attr('extraemotes');
                        $(this).attr('selected_tab', saved);
                    }
                    if (this.value == '') {
                        me.switc(saved);
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

                $(li).append('<a style="font-family:FontAwesome;" href="javascript:void();"></a>');

                $(li).children()[1].onclick = function () {
                    if (box.value != '') {
                        me.switc(box.id);
                        try {
                            me.refreshSearch(box.value)
                        } catch (e) {
                            alert(e);
                        }
                    }
                }

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
            ExtraEmoticons.prototype.getSelectedTab = function () {
                var tabs = this.panelholder.children;
                for (var i = 0; i < tabs.length; i++) {
                    if ($(tabs[i]).hasClass('extra_emoticons_shown')) {
                        return tabs[i];
                    }
                }
            }
            ExtraEmoticons.prototype.makeButton = function (name, label, image) {
                logger.Log('ExtraEmoticons.makeButton: start');
                var link = $('<a id="' + name + '" style="cursor:pointer;" title="' + label + ' Emoticons" />');
                var img = $('<img class="icon_16" style="width: 18px; height: 18px" src="' + image.split('|')[0] + '"></img>');
                $(link).append(img);

                if (!img[0].complete) {
                    $(img).css('display', 'none');
                    var spin = $('<i style="line-height:18px;" class="fa fa-spinner fa-spin" />');
                    $(img).after(spin);
                    $(img).on('load error', function () {
                        $(img).css('display', '');
                        spin.remove();
                    });
                }

                var me = this;
                $(link).click(function () {
                    me.switc(this.id);
                    $('#search').attr('selected_tab', this.id);
                });
                var li = $('<li style="line-height:0px;" />');
                $(li).append(link);
                $(this.emotesTypes).append(li);
                logger.Log('ExtraEmoticons.makeButton: end');
            }
            ExtraEmoticons.prototype.switc = function (panelName) {
                var panels = this.panelholder.children;
                for (var i = 0; i < panels.length; i++) {
                    var mat = $(panels[i]).attr('extraemotes');
                    if (mat != null || mat == 'search') {
                        if (mat == panelName) {
                            $(panels[i]).addClass('extra_emoticons_shown');
                            $(panels[i]).removeClass('extra_emoticons_hidden');
                        } else {
                            $(panels[i]).addClass('extra_emoticons_hidden');
                            $(panels[i]).removeClass('extra_emoticons_shown');
                        }
                    }
                }
                if (emoteExtenderIsRunning()) {
                    emoteExtenderFF.click();
                }
            }
            ExtraEmoticons.prototype.makeEmotesPanel = function (id, name, norma) {
                logger.Log('ExtraEmoticons.makeEmotesPanel: start');
                var innerPannel = document.createElement('div');
                $(innerPannel).attr('style', 'height: 260px');
                $(innerPannel).addClass('extra_emoticons_hidden');
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
                if (this.IsSpecial) {
                    $(newA).attr('href', 'javascript:smilie(\'' + item.replace('\\', '\\\\\\') + '\');');
                } else {
                    $(newA).attr('onclick', this.buttonFormat.replace('{0}', item));
                    $(newA).attr('href', 'insertemote:' + item);
                }
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
                if (this.IsSpecial) {
                    $(newA).attr('href', 'javascript:smilie(\'' + id + title + '\');');
                } else {
                    $(newA).attr('onclick', this.buttonFormat.replace('{0}', id + title));
                    $(newA).attr('href', 'insertemote:' + id + title);
                }

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

            //==API FUNCTION==//
            //Gets the logging object
            ExtraEmoticons.prototype.getLogger = function () {
                return logger;
            }

            //==API FUNCTION==//
            //Adds a collection of image emoticons
            ExtraEmoticons.prototype.addEmoticons = function (id, name, title, emotes, normalize) {
                var holder = this.makeEmotesPanel(id, name, normalize);
                this.addImagesToPanel(id, holder, emotes);
                this.makeButton(name, title, emotes[emotes.length - 1])
                recordEmotesPanel(false, id, name, title, emotes, emotes[emotes.length - 1], normalize);
                logger.Log('addEmoticons: finalizing...');
            }

            //==API FUNCTION==//
            //Adds a collection of text emoticons
            ExtraEmoticons.prototype.addRaw = function (id, name, title, emotes, buttonImage) {
                if (buttonImage == null) {
                    buttonImage = 'http://www.fimfiction-static.net/images/icons/quote.png'
                }
                var holder = this.makeEmotesPanel(id, name, false);
                this.addRawsToPanel(holder, emotes);
                this.makeButton(name, title, buttonImage);
                recordEmotesPanel(true, id, name, title, emotes, buttonImage, false);
                logger.Log('addRaw: finalizing...');
            }


            var has_init = false;
            var mainHook = getElementByAttributeValue("a", "href", "javascript:smilie(':duck:');");

            if (mainHook != null && mainHook != undefined) {
                win.ExtraEmotes = new ExtraEmoticons(0, mainHook);
                win.ExtraEmotes.init();
                logger.Log('Checkpoint 1: mainHook created succesfully');
                finalInit(win.ExtraEmotes);
            } else {
                win.ExtraEmotes = {
                    addEmoticons: function (id, name, title, emotes, normalize) { },
                    addRaw: function (id, name, title, emotes, buttonImage) { },
                    getLogger: function () { return logger; }
                }
                logger.Log('Checkpoint 1: no mainHook found created dummy object');
            }
            logger.Log('Checkpoint 2: setup completed succesfully');
        }

        if (win != window) {
            window.ExtraEmotes = {
                addEmoticons: function (id, name, title, emotes, normalize) {
                    win.ExtraEmotes.addEmoticons(id, name, title, emotes, normalize);
                },
                addRaw: function (id, name, title, emotes, buttonImage) {
                    win.ExtraEmotes.addRaw(id, name, title, emotes, buttonImage);
                },
                getLogger: function () {
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
                s = replaceAll('  ', ' ', s);
            }
            return s;
        }

        function makeToolbar(name) {
            var bar = document.createElement('ul');
            $(bar).addClass('toolbar_buttons');
            bar.name = name;
            return bar;
        }

        function handleDrop(event) {
            logger.Log(event.dataTransfer.getData('text/plain'));
            var links = event.dataTransfer.getData('text/plain').split('\n');
            var inserted = '';
            for (var i = 0; i < links.length; i++) {
                links[i] = replaceAll(']', '', replaceAll('[', '', links[i].trim()));
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
                me.backupText.value = me.textArea.value;
                $(me.backupText).css('height', $(me.textArea).css('height'));
                $(me.backupText).css('display', 'block');
                me.backupText.scrollTop = me.textArea.scrollTop;
                $(me.textArea).css('display', 'none');
                me.textArea.value = replaceAliases(me.textArea.value);

                document.onmousemove = function () {
                    me.textArea.value = me.backupText.value;
                    $(me.textArea).css('display', 'block');
                    $(me.backupText).css('display', 'none');
                    me.backupText.innerHTML = '';
                    document.onmousemove = function () { }
                    handling = false;
                }
            }
        }


        //==API FUNCTION==//
        var emoteExtenderIsNull = false;
        var emoteExtenderFF;
        //Returns true if FimFiction Emote extender is running on the current page
        function emoteExtenderIsRunning() {
            if (emoteExtenderFF == null && !emoteExtenderIsNull) {
                emoteExtenderFF = getEmoteExtenderFF();
                emoteExtenderIsNull = emoteExtenderFF == null;
            }
            return !emoteExtenderIsNull;
        }
        function getEmoteExtenderFF() {
            return $('span[id="emoteAPI_Table:FF"]');
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
                        hook.makeButton(name, title, store[i].Image);
                    } else {
                        hook.addImagesToPanel(id, holder, emotes, norm);
                        hook.makeButton(name, title, emotes[emotes.length - 1]);
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

                $('.extra_emoticons_normalized[extraemotes="FimFiction"] .extra_emote img').each(function () {
                    _defaultEmotes.Emotes.push($(this).attr('src'));
                    _defaultEmotes.EmoteTitles.push($(this).attr('title'));
                });
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
                var tit = $(this).attr('alt');
                if ($(this).attr('title') != tit) {
                    $(this).attr('title', tit);
                }
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
                    var img = $('<img />');
                    if (type.result == 2) {
                        $(img).css('max-width', '100%');
                    } else {
                        if (type.lim) {
                            $(img).css('max-height', '27px');
                        }
                        var tit = ExtraEmotes.Name(url);
                        $(img).attr('alt', tit);
                        $(img).attr('title', tit);
                    }

                    $(img).attr('src', url);

                    var p = $(this).parent().prev();
                    if (type.wrap || p.length == 0 || p.prop('tagName') != 'P') {
                        $(this).parent().attr('style', 'display: inline;');
                        $(this).after(img);
                        $(this).remove();
                    } else {
                        $(this).parent().remove();
                        p.append(img);
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
                    instance.toolbar.insertBefore(emoteExtenderOtp, ExtraEmotes.emotesTypes);
                }
                logger.Log('refreshComments');
                if (!startsWith(document.location.href, 'http://www.fimfiction.net/manage_user/messages/')) {
                    refreshComments();
                    setInterval(refreshComments, 500);
                }
                if (isMyPage()) {
                    setInterval(refreshEmotePanels, 1000);
                }
            }, 200);
            makeStyle('\
            div[id="emoteAPI_Table:FF_Area"] > .extra_emoticons_panel {\
                display: inline-block;}\
            .extra_emoticons_panel > .extra_emoticons_shown {\
                overflow-y: auto;}\
            .fullOpaque > * {\
                opacity: 1 !important;}\
            .extra_emoticons_panel:focus {\
                background: linear-gradient(to right, rgb(221, 221, 221) 0%, rgb(218, 218, 238) 14px) repeat scroll 0% 0% transparent;}\
            .extra_emoticons_panel:focus:hover {\
                background: linear-gradient(to right, rgb(221, 221, 221) 0%, rgb(218, 218, 258) 14px) repeat scroll 0% 0% transparent;}\
            .extra_emoticons_shown {\
                display: block !important;}\
            .extra_emoticons_shown > * {\
                display: inline-block;\
                padding: 2px;\
                transition: opacity 0.2s linear;}\
            .extra_emoticons_shown:hover > *:not(:hover) {\
                opacity: 0.7;}\
            .extra_emoticons_shown a:not(:hover) {\
                color: rgb(0,10,90) !important;}\
            .extra_emoticons_shown > *:hover {\
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
            .extra_emoticons_hidden {display: none !important;}\
            .extra_emoticons_panel {\
                background: linear-gradient(to right, rgb(221, 221, 221) 0%, rgb(238, 238, 238) 14px) repeat scroll 0% 0% transparent;\
                width: 300px;\
                display: table-cell;\
                vertical-align: top;\
                border-left: 1px solid rgb(204, 204, 204);\
                padding: 10px;\
                overflow: auto;\
                font-size: 0.8em;\
                font-weight: bold;\
                text-align: center;\
                height: auto !important;\
                min-height: 285px !important;\
                padding-top: 15px !important;\
                border: medium none !important;}\
            .raw_emote {\
                border: dotted 1px rgb(154,174,192);\
                border-radius: 4px;\
                margin: 4px;\
                display: inline-block;}\
            .raw_emote:hover {text-decoration: none;}');
            logger.Log('finalInit: init complete');
        }

        function refreshEmotePanels() {
            var edit = document.getElementById('text_post_editor');
            if (edit != null && edit != undefined && $(edit).attr('extraEmotesInit') != 'true') {
                $(edit).attr('extraEmotesInit', 'true');

                var childGuest = edit.parentNode.parentNode.children[1];
                childGuest = childGuest.children[0].children;
                childGuest = childGuest[childGuest.length - 1];

                var engine = new ExtraEmoticons(1, childGuest);
                engine.init(true);
                restoreFromRecord(engine);
            }
        }

        function refreshComments() {
            try {
                if (UnspoilerEmoticons()) {
                    SpecialTitles.setUpSpecialTitles();
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
                                (ttextArea.parentNode.parentNode.children[1]).onmousedown = function () {
                                    logger.Log(ttextArea.value);
                                    ttextArea.value = replaceAliases(ttextArea.value);
                                    logger.Log(ttextArea.value)
                                }
                                ttextArea.ondrop = handleDrop;
                            });
                        });
                        logger.Log('refreshComments: Comment editing added succesfully')
                    }
                }
            } catch (e) {
                logger.SevereException('Error in refreshing comments', e);
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
    logger.SevereException("Unhandled Exception", e);
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
    result.each(function () {
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
function isMyPage() {
    if (document.location.href == ("http://www.fimfiction.net/user/" + getUserNameEncoded())) {
        return true;
    }
    return document.location.href == ("http://www.fimfiction.net/user/" + replaceAll(' ', '+', getUserName()));
}

//==API FUNCTION==//
//Returns true if the given string is recognized as a website
function getBoolIsSite(domain) { return getIsSite(domain) != ''; }

//==API FUNCTION==//
function getUserNameEncoded() { return encodeURIComponent(getUserName()); }

//==API FUNCTION==//
function getUserName() { return $(getUserButton()).attr("href").split("/").reverse()[0]; }

//==API FUNCTION==//
function getUserButton() { return getElementByAttributeValue("div", "class", "user_drop_down_menu").children[0]; }

//==API FUNCTION==//
function makeStyle(input, id) {
    while (contains(input, '  ')) {
        input = replaceAll('  ', ' ', input);
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
        if ($ == undefined) { }
        return true;
    } catch (e) { }
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







ExtraEmotes.addEmoticons("x", "Dropbox", "Extra", ([
"http://fc00.deviantart.net/fs70/f/2014/013/0/2/nerdgasm_by_comeha-d72140i.png",
"http://fc05.deviantart.net/fs70/f/2014/013/8/1/twieww_by_comeha-d72140f.png",
"http://fc09.deviantart.net/fs70/f/2014/014/c/3/fitwi_by_comeha-d7252jt.png",
"http://fc07.deviantart.net/fs71/f/2014/014/6/b/plotpie_by_comeha-d7251q8.png",
"http://fc09.deviantart.net/fs71/f/2014/014/7/3/plotpie2_by_comeha-d7251q5.png",
"http://fc03.deviantart.net/fs70/f/2014/014/f/0/flirtypie_by_comeha-d7251py.png",
"http://fc00.deviantart.net/fs70/f/2014/014/7/8/nompie_by_comeha-d7251pu.png",
"http://fc00.deviantart.net/fs71/f/2014/014/5/1/piegasm_by_comeha-d7251pn.png",
"http://fc02.deviantart.net/fs71/f/2014/014/a/8/hapie_by_comeha-d7251pk.png",
"http://fc07.deviantart.net/fs71/f/2014/014/8/d/pinkieplot_by_comeha-d7251pb.png",
"http://fc08.deviantart.net/fs70/f/2014/014/e/1/meaniepie_by_comeha-d7259oq.png",
"http://fc02.deviantart.net/fs70/f/2014/103/7/3/maud_by_comeha-d7eb0mc.png",
"http://fc04.deviantart.net/fs70/f/2014/103/c/f/loves_rocks_by_comeha-d7eb3je.png",
"http://fc01.deviantart.net/fs71/f/2014/013/d/b/cslyra_by_comeha-d7220ek.png",
"http://fc02.deviantart.net/fs71/f/2014/013/3/6/schmoopie_by_comeha-d7213zs.png",
"http://fc00.deviantart.net/fs70/f/2014/013/3/1/lovelee_by_comeha-d72141j.png",
"http://fc04.deviantart.net/fs71/f/2014/013/d/d/confusedlee_by_comeha-d72141b.png",
"http://fc01.deviantart.net/fs71/f/2014/013/e/f/80slee_by_comeha-d72140p.png",
"http://fc02.deviantart.net/fs70/f/2014/013/0/0/smilee_by_comeha-d72145b.png",
"http://fc09.deviantart.net/fs70/f/2014/013/4/1/cheersilee_by_comeha-d72140d.png",
"http://fc05.deviantart.net/fs70/f/2014/013/8/b/derpilee_by_comeha-d7213zo.png",
"http://fc04.deviantart.net/fs71/f/2014/013/8/f/naughtilee_by_comeha-d7213zj.png",
"http://fc04.deviantart.net/fs70/f/2014/013/c/f/pisst_by_comeha-d7213zv.png",
"http://fc04.deviantart.net/fs71/f/2014/013/7/7/dawwtwist_by_comeha-d72140m.png",
"http://fc04.deviantart.net/fs71/f/2014/013/a/d/thpring_by_comeha-d721404.png",
"http://fc03.deviantart.net/fs70/f/2014/013/f/5/sorrytwist_by_comeha-d721405.png",
"http://fc04.deviantart.net/fs70/f/2014/013/9/0/madtwist_by_comeha-d721409.png",
"http://fc08.deviantart.net/fs71/f/2014/013/2/0/ootwist_by_comeha-d7213zw.png",
"http://fc08.deviantart.net/fs71/f/2014/161/d/b/kissaloo_by_comeha-d7lso4c.png",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDimondMad_zps1373258d.png|dtiara_mad",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Redheart_gasp.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Redheart_smile.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Soarin_Dayum.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_Dayum.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_rape.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sexy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_happy.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_oohh.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra_dealwithit.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Lyra_cry.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_gaze.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_gawk.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_grin.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_OMG_LOVE.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_cake.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_chair.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_something.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_rape.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_plot.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia_O_O.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_glare.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_mad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_sad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Derpy_Hooves.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Derpy_Hooves.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Derpy_Hooves_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Scootaloo.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Sweetie_Belle.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Queen_Chrysalis.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Celestia.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_TwilightWut.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_RageFace.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Pinkie_loool.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Scootaloo_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Sweetie_Belle_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Pinkie_Pie_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Vinyl_Scratch_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Luna_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Twilight_Sparkle_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Rainbow_Dash_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Fluttershy_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Rarity_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Trixie_lolface_2.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Spike_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_rainbowkiss_flip.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_rainbowderp_flip.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Cloudchaser_glasses.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_beam.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_gaze.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Rainbow_Dash.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Luna_apple.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Queen_Chrysalis.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Twilight_Sparkle.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Twilight_crazy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy_umad.png",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxUMad_zps22ef3b78.png|nyx_umad",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxSly_zps98fe4bc2.png|nyx_sly",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxHappy_zpse69a4147.png|nyx_happy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSnowflakeYeah_zps44f65a3f.png|snowflake_yeah",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_YouDontSay2.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/eenope.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Mr_Cake.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/discord.png",
"http://i.imgur.com/J8FwB24.png|twiscepter",
"http://i.imgur.com/CjCo3YR.png|bloomsceptr",
"http://i.imgur.com/IFkl4RG.png|sweetiescepter",
"http://i.imgur.com/j0bYpQa.png|scootscepter",
"http://i453.photobucket.com/albums/qq260/spacewings/EmZecora_zpscd7ac24a.png|zecora",
"http://i453.photobucket.com/albums/qq260/spacewings/ButtonStache_zps2e28ea66.png|button_stache",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTom_zps20851d31.png|tom",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTom2_zps51c59779.png|mandy",
"http://fc02.deviantart.net/fs70/f/2013/357/9/7/hoof_up_by_comeha-d6z0jqb.png|hoof_up",
"http://fc09.deviantart.net/fs71/f/2013/357/3/d/hoof_down_by_comeha-d6z0jqf.png|hoof_down",
"http://fc09.deviantart.net/fs70/f/2013/357/a/1/2_hoofs_up_by_comeha-d6z0lto.png|2_hoofs_up",
"http://fc04.deviantart.net/fs71/f/2013/357/c/0/fave_by_comeha-d6z0jqh.png|faved",
"http://fc07.deviantart.net/fs71/f/2013/357/a/f/later_by_comeha-d6z0jq9.png|read_later",
"http://i.imgur.com/1LNo58W.png|watch",
"http://fc04.deviantart.net/fs70/f/2014/011/1/6/molestia_by_comeha-d71qbk9.png"
]).reverse());

ExtraEmotes.addEmoticons("c", "Clap", "Clap", [
"http://fc06.deviantart.net/fs71/f/2013/354/a/c/clapping_pony_icon___sollace_by_comeha-d6ymjq8.gif",
"http://fc07.deviantart.net/fs71/f/2013/354/6/4/clapping_pony_icon___twiscepter_by_comeha-d6ymjpx.gif",
"http://fc00.deviantart.net/fs71/f/2014/047/c/2/clapping_pony_icon___applejewel_by_comeha-d76qgay.gif",
"http://fc02.deviantart.net/fs71/f/2014/047/e/6/clapping_pony_icon___flutterbat_by_comeha-d76qgbd.gif",
"http://fc02.deviantart.net/fs70/f/2013/349/d/7/clapping_pony_icon___nyx_by_comeha-d6y1o60.gif",
"http://fc09.deviantart.net/fs70/f/2013/346/b/7/clapping_pony_icon___bat_pony_by_comeha-d6xnck7.gif",
"http://fc02.deviantart.net/fs71/f/2013/056/a/3/clapping_pony_icon___braeburn_by_taritoons-d5w65tv.gif",
"http://fc06.deviantart.net/fs70/f/2012/364/d/1/clapping_pony_icon___time_turner_by_travispony-d5pob3v.gif|dr_hooves",
"http://fc09.deviantart.net/fs70/f/2013/177/c/d/flash_sentry__2__by_jamaythemunker-d6arwlb.gif|flash_sentry",
"http://fc07.deviantart.net/fs70/f/2013/343/1/d/z_by_blknblupanther-d6xef1w.gif|zecora",
"http://fc00.deviantart.net/fs71/f/2013/336/5/7/13860064636854_by_blknblupanther-d6whl0i.gif|sunset_shimmer",
"http://fc04.deviantart.net/fs70/f/2013/002/3/a/clapping_pony_icon___minuette_by_travispony-d5q5x0z.gif|colgate",
"http://fc04.deviantart.net/fs71/f/2013/308/0/6/daring_do_clap_clap___by_xingyaru-d6t0c4f.gif|daring_do",
"http://fc08.deviantart.net/fs70/f/2012/365/e/0/clapping_pony_icon___queen_chrysalis_by_taritoons-d5pshyl.gif",
"http://fc05.deviantart.net/fs71/f/2012/365/c/a/clapping_pony_icon___changeling_by_taritoons-d5ps0kg.gif",
"http://fc04.deviantart.net/fs71/f/2013/002/0/3/clapping_pony_icon___spitfire___wonderbolt_uniform_by_taritoons-d5q5mj8.gif",
"http://fc08.deviantart.net/fs71/f/2013/002/7/b/clapping_pony_icon___soarin___wonderbolt_uniform_by_taritoons-d5q6w8j.gif",
"http://fc02.deviantart.net/fs70/f/2013/001/7/e/clapping_pony_icon___nightmare_moon_by_taritoons-d5prx8v.gif",
"http://fc08.deviantart.net/fs71/f/2012/364/3/a/clapping_pony_icon___princess_cadence_by_taritoons-d5pon2h.gif",
"http://fc00.deviantart.net/fs70/f/2013/001/b/5/clapping_pony_icon___princess_luna_by_taritoons-d5prurt.gif",
"http://fc04.deviantart.net/fs70/f/2013/001/c/9/clapping_pony_icon___princess_celestia_by_taritoons-d5pozf0.gif",
"http://fc06.deviantart.net/fs71/f/2013/056/1/8/clapping_pony_icon___babs_seed_by_taritoons-d5w61z0.gif",
"http://fc03.deviantart.net/fs71/f/2013/354/d/d/clapping_pony_icon___dinky_hooves_by_comeha-d6ymjpt.gif",
"http://fc07.deviantart.net/fs71/f/2013/345/b/0/clapping_pony_icon___snowdrop_by_comeha-d6xkrjj.gif",
"http://fc09.deviantart.net/fs71/f/2013/056/7/f/clapping_pony_icon___sweetie_belle_by_taritoons-d5w5zt5.gif",
"http://fc00.deviantart.net/fs71/f/2013/056/8/9/clapping_pony_icon___scootaloo_by_taritoons-d5w610a.gif",
"http://fc04.deviantart.net/fs70/f/2013/003/7/8/clapping_pony_icon___applebloom_by_taritoons-d5q9yfg.gif",
"http://fc01.deviantart.net/fs71/f/2013/354/9/1/clapping_pony_icon___octavia_by_comeha-d6yq9am.gif",
"http://fc05.deviantart.net/fs71/f/2012/366/d/5/clapping_pony_icon___vinyl_scratch_by_taritoons-d5pw0yp.gif",
"http://fc04.deviantart.net/fs70/f/2012/363/0/9/clapping_pony_icon___sweetie_drops_bonbon_by_travispony-d5pll1i.gif",
"http://fc06.deviantart.net/fs71/f/2012/363/4/3/clapping_pony_icon___lyra_heartstrings_by_travispony-d5pl0kc.gif",
"http://fc03.deviantart.net/fs70/f/2012/363/d/4/clapping_derpy_hooves_icon_by_shroomehtehponeh-d5pm8c9.gif",
"http://fc05.deviantart.net/fs70/f/2012/366/8/8/clapping_pony_icon___trixie_by_taritoons-d5pw36r.gif",
"http://fc00.deviantart.net/fs71/f/2013/056/f/4/clapping_pony_icon___shining_armor_by_taritoons-d5w67ti.gif",
"http://fc09.deviantart.net/fs71/f/2014/103/a/1/maud_by_comeha-d7ee4tv.gif",
"http://fc04.deviantart.net/fs70/f/2012/363/f/6/clapping_pony_icon___pinkie_pie_by_taritoons-d5pkuzy.gif",
"http://fc01.deviantart.net/fs71/f/2012/363/c/3/clapping_pony_icon___fluttershy_by_taritoons-d5pl2gh.gif",
"http://fc00.deviantart.net/fs70/f/2012/363/2/f/clapping_pony_icon___rainbow_dash_by_taritoons-d5pkzrg.gif",
"http://fc06.deviantart.net/fs71/f/2012/363/c/f/clapping_pony_icon___applejack_by_taritoons-d5pkxsu.gif",
"http://fc05.deviantart.net/fs70/f/2012/363/7/9/clapping_pony_icon___rarity_by_taritoons-d5pksh9.gif",
"http://fc03.deviantart.net/fs70/f/2012/363/1/e/clapping_pony_icon___twilight_sparkle_by_taritoons-d5pkpl8.gif"
], false);

ExtraEmotes.addEmoticons("s", "Sexy", "Sexy Pony", [
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTwilightWet_zps61ffef2a.png|twilight",
"http://i453.photobucket.com/albums/qq260/spacewings/EmotePinkieWet_zps32fea050.png|pinkie_pie",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteFluttershyWet_zpsea1c8bcc.png|fluttershy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteApplejackWet_zps7c07ac53.png|applejack",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteRarityWet_zpsccdf0ccd.png|rarity",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDashWet_zps24095993.png|rainbow_dash",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteApplebloomWet_zps748a6d82.png|apple_bloom",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteScootalooWet_zps5f2070e9.png|scootaloo",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSweetieWet_zpsdc3945e2.png|sweetie_belle",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxWet_zps8e840827.png|nyx",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDerpyWet_zps033d2371.png|derpy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteOctaviaWet_zps7127dafd.png|octavia",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteVinylWet_zps61262968.png|vinyl_scratch",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteLyraWet_zps22067d40.png|lyra",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteBonBonWet_zps9d8d557f.png|bonbon",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTrixieWet_zps25f2546e.png|trixie",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSpitfireWet_zps4192ddd5.png|spitfire",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteCelestiaWet_zps97a59249.png|celestia",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteLunaWet_zps2a650793.png|luna",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteCadenceWet_zps38b84bee.png|cadence",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteChrysalisWet_zps4d3ac114.png|crysalis",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteBMacWet_zps3058c380.png|b_mac",
"http://i453.photobucket.com/albums/qq260/spacewings/ThunderlaneWet_zpsf0b0d1a5.png|thunderlane",
"http://i453.photobucket.com/albums/qq260/spacewings/Soarin_zps4b9cfb20.png|soaren",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDrWhoovesWet_zps3eb37554.png|dr_hooves",
"http://i453.photobucket.com/albums/qq260/spacewings/ShiningAWet_zps2369479a.png|shining",
"http://i453.photobucket.com/albums/qq260/spacewings/RumbleWet_zps6564ca82.png|rumble",
"http://i453.photobucket.com/albums/qq260/spacewings/SpikeWet_zps1fb14f95.png|spike"
].reverse(), false);