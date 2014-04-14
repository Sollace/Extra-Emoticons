// ==UserScript==
// @name        FimFiction Extra Emoticons Core
// @namespace   fimfiction
// @description Allows additional emoticons to be added to FimFiction.net
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @version     4.4.1
// @grant       none
// ==/UserScript==
//--------------------------------------------------------------------------------------------------
if (isJQuery())
//==================================================================================================
var logger = new Logger('Extra Emoticons', 1);
//==================================================================================================
//--------------------------------------------------------------------------------------------------
//---------------------------------EXTRA EMOTICONS MODULE-------------------------------------------
//--------------------------------------------------------------------------------------------------
function ExtraEmoticons(index, hook) {
    this.hookIndex = index;
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
            if (!getInit() && this.previewButton != null) {
                $(this.previewButton).click(function() {
                    handleSubmit(me);
                });
            }
        }
        if (this.toolbar == null || force == true) {
            this.toolbar = this.getToolbar()
        }
        
        if (!getInit() || force == true) {
            this.reInit();
        } else {
            this.getHookins();
        }
        
        setTimeout(function() {
            if (emoteExtenderIsRunning()) {
                $(me.previewButton).click(function() {
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
ExtraEmoticons.prototype.getHookins = function() {
    this.backupText = getElementByAttributeValue('textarea', 'emoteId', 'backupText' + this.hookIndex);
    this.panelholder = getElementByAttributeValue('div', 'emoteId', 'panelholder' + this.hookIndex);
    this.parentGuest = this.panelholder.children[0];
    this.emotesTypes = getElementByAttributeValue('ul', 'emoteId', 'emotesType' + this.hookIndex);
    this.search = getElementByAttributeValue('div', 'emoteId', 'search' + this.hookIndex);
}
ExtraEmoticons.prototype.reInit = function() {
    logger.Log('ExtraEmoticons.reInit: start');
    this.submitButton = this.getSubmitButton();
    
    this.textArea = this.getTextArea();
    
    var me = this;
    this.submitButton.onmousedown = function () {
        handleSubmit(me);
    };
    
    this.textArea.ondrop = handleDrop;
    
    this.backupText = document.createElement('textarea');
    $(this.backupText).attr('emoteId', 'backupText' + this.hookIndex);
    $(this.backupText).css('display', 'none');
    
    $(this.textArea.parentNode).append(this.backupText);
    
    this.parentGuest = this.childGuest.parentNode;
    
    var oClass = $(this.parentGuest).attr('class');
    
    $(this.parentGuest).attr('class', 'extra_emoticons_normalized extra_emoticons_shown');
    $(this.parentGuest).attr('extraemotes', 'FimFiction');
    
    this.panelholder = document.createElement('div');
    
    $(this.panelholder).attr('tabindex', 0);
    $(this.panelholder).keydown(function(e) {
        if (e.keyCode == 65 && e.ctrlKey) {
            selectElementContents($(this).find('.extra_emoticons_shown')[0]);
            e.preventDefault();
        }
    });
        
    $(this.panelholder).attr('emoteId', 'panelholder' + this.hookIndex);
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
            var spin = $('<i style="font-size:30px;color:rgb(200,200,140);" class="fa fa-spinner fa-spin" />');
            $(newItem).append(spin);
            $(img).load(function() {
                spin.remove();
            });
        }
        $(item).append(newItem);
    }
    
    this.emotesTypes = makeToolbar('emotes_type_switch');
    $(this.emotesTypes).attr('emoteId', 'emotesType' + this.hookIndex);
    $(this.toolbar).append(this.emotesTypes);
    this.search = this.makeEmotesPanel('', 'search', true);
    $(this.search).attr('emoteId', 'search' + this.hookIndex);
    this.makeSearch('search');
    this.makeButton('FimFiction', 'Default', this.childGuest.children[0].children[0].src);
    logger.Log('ExtraEmoticons.reInit: end');
}
ExtraEmoticons.prototype.getTextArea = function() {
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
ExtraEmoticons.prototype.getSubmitButton = function() {
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
ExtraEmoticons.prototype.getToolbar = function() {
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
ExtraEmoticons.prototype.makeSearch = function(label) {
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
    box.onkeypress = function(e) {
        if (e.keyCode == 13) {
            $($(li).children()[1]).click();
            return false;
        }
    };
    $(box).focus(function() {
        $(this).css('width', '200px');
    });
    $(box).blur(function() {
        if (this.value == '') {
            $(this).css('width', '50px');
        }
    });
    var li = $('<li style="padding:0px;" />');
    $(li).append(box);
    
    var searchbar = makeToolbar('emotes_search_toolbar');
    $(searchbar).append(li);
    
    $(li).append('<a style="font-family:FontAwesome;" href="javascript:void();"></a>');
    
    $(li).children()[1].onclick = function() {
        if (box.value != '') {
            me.switc(box.id);
            me.refreshSearch(box.value)
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
ExtraEmoticons.prototype.getSelectedTab = function() {
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
    $(link).append('<img class="icon_16" style="width: 18px; height: 18px" src="' + image.split('|')[0] + '"></img>');
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
ExtraEmoticons.prototype.switc = function(panelName) {
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
ExtraEmoticons.prototype.addRawToPanel = function(holder, item) {
    var newA = document.createElement('a');
    var title = item;
    if (contains(item, '|')) {
        var splitten = SplitTitle(item);
        if (splitten[1] != '') {
            item = splitten[0];
            title = item + '\n ' + splitten[1]
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
ExtraEmoticons.prototype.addImageToPanel = function(id, holder, item) {
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
        var spin = $('<i style="font-size:30px;color:rgb(200,200,140);" class="fa fa-spinner fa-spin" />');
        $(mote).append(spin);
        
        $(img).load(function() {
            spin.remove();
        });
    }
    
    $(newA).append(mote);
    $(holder).append(newA);
}
ExtraEmoticons.prototype.Name = function (url) {
    var panels = this.panelholder.children;
    for (var i = 0; i < panels.length; i++) {
        for (var k = 0; k < panels[i].children.length; k++) {
            var path = panels[i].children[k].children[0].children[0];
            if (path != null) {
                if ($(path).attr('src') == url) {
                    return $(path).attr('title').split('\n')[0]
                }
            }
        }
    }
    return url;
}
ExtraEmoticons.prototype.findMatchingEmotes = function(name) {
    var panels = getVirtualEmotes();
    panels.unshift(getDefaultEmotes());
    
    var terms = $.grep(name.replace('_', ' ').split(' '), function (v) {
        return v != '';
    });
    
    var group = isGroupSearch(terms, panels);
    if (contains(name, 'social') || contains(name, 'media')) {
        for (var i = 0; i < socialMapping.length; i++) {
            terms.push(socialMapping[i]);
        }
    }
    var results = [];
    for (var i = 0; i < panels.length; i++) {
        for (var k = 0; k < panels[i].Emotes.length; k++) {
             for (var t = 0; t < terms.length; t++) {
                 if (contains((group.length > 0 && !panels[i].IsRaw ? panels[i].Emotes[k] : panels[i].EmoteTitles[k]).toLowerCase(), terms[t].toLowerCase())) {
                     if (panels[i].IsRaw) {
                         results.push('RAW,url=' + panels[i].EmoteTitles[k].split('\n ').join('|'));
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
ExtraEmoticons.prototype.DisplayGroupIcons = function(groups) {
    if (groups.length > 0) {
        $(this.search_Tag).css('display', 'inline-block');
        this.search_Tag.innerHTML = '';
        for (var i = 0; i < groups.length; i++) {
            var g = groups[i];
            
            var tag = $('<div style="overflow: hidden; width: 15px; height: 15px; display: inline-block; vertical-align: bottom;" />');
            $(tag).append('<img src="' + this.getGroupButtonIcon(g) + '" style="height:0px;vertical-align: 0;" />');
            $($(tag).children()[0]).load(function() {
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
ExtraEmoticons.prototype.refreshSearch = function(term) {
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
ExtraEmoticons.prototype.getGroupButtonIcon = function(name) {
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
//--------------------------------------------------------------------------------------------------
//----------------------------------------SCRIPT START----------------------------------------------
//--------------------------------------------------------------------------------------------------
try {//---------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

function reverse(me) {return me.split('').reverse().join()}
function contains(me, it) {return me.indexOf(it) != -1}
function startsWith(me, it) {return me.indexOf(it) == 0}
function endsWith(me, it) {return startsWith(reverse(me), reverse(it))}

logger.Log('Checkpoint 1: setup string functions succesfully');

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
        'Reddit': 'reddit.com'};
var socialMapping = [
        'fav',
        'thumb',
        'twitter',
        'facebook',
        'youtube',
        'google',
        'linkedin',
        'intensedebate',
        'wordpress',
        'tumblr',
        'disqus',
        'myspace',
        'blogger',
        'pinterest',
        'reddit'];

var has_init = false;
var mainHook = getElementByAttributeValue("a", "href", "javascript:smilie(':duck:');");

if (mainHook != null && mainHook != undefined) {
    mainHook = new ExtraEmoticons(0, mainHook);
    mainHook.init();
    logger.Log('Checkpoint 2: mainHook created succesfully');
    finalInit();
} else {
    mainHook = null;
}

logger.Log('Checkpoint 3: setup completed succesfully');

//--------------------------------------------------------------------------------------------------
} catch (e) {logger.SevereException('unhandledException: {0}', e);}//-------------------------------
//--------------------------------------------------------------------------------------------------
//----------------------------------------FUNCTIONS-------------------------------------------------
//--------------------------------------------------------------------------------------------------

function returnAliases(txt) {
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
            document.onmousemove = function () {}
            handling = false;
        }
    }
}

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

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

//==API FUNCTION==//
//Adds a collection of text emoticons
function addRaw(id, name, title, emotes, buttonImage) {
    if (mainHook != null) {
        if (buttonImage == null) {
            buttonImage = 'http://www.fimfiction-static.net/images/icons/quote.png'
        }
        var holder = mainHook.makeEmotesPanel(id, name, false);
        mainHook.addRawsToPanel(holder, emotes);
        mainHook.makeButton(name, title, buttonImage);
        recordEmotesPanel(true, id, name, title, emotes, buttonImage, false);
        logger.Log('addRaw: finalizing...');
    }
}

//==API FUNCTION==//
//Adds a collection of image emoticons
function addEmoticons(id, name, title, emotes, normalize) {
    if (mainHook != null) {
        var holder = mainHook.makeEmotesPanel(id, name, normalize);
        mainHook.addImagesToPanel(id, holder, emotes);
        mainHook.makeButton(name, title, emotes[emotes.length - 1])
        recordEmotesPanel(false, id, name, title, emotes, emotes[emotes.length - 1], normalize);
        logger.Log('addEmoticons: finalizing...');
    }
}

function setUpSpecialTitles() {
    setSpecialTitle([138711, 10539, 27165],"FimFiction Modder");
    setSpecialTitle([129122],"Emote Contributor");
}

function restoreFromRecord(hook) {
    var store = $('div#extraemoticons_loaded')[0];
    for (var i = 0; i < store.children.length; i++) {
        var items = store.children[i];
        if ($(items).attr('data_external') != 'true') {
            var id = $(items).attr('data_id');
            var name = $(items).attr('data_name');
            var title = $(items).attr('data_title');
            var norm = $(items).attr('data_norm') == "true";
            
            var holder = hook.makeEmotesPanel(id, name, norm);
            
            var emotes = items.innerHTML.split('\n');
            if ($(items).attr('data_raw') == 'true') {
                var buttonImage = $(items).attr('data_img');
                hook.addRawsToPanel(holder, emotes);
                hook.makeButton(name, title, buttonImage);
            } else {
                hook.addImagesToPanel(id, holder, emotes, norm);
                hook.makeButton(name, title, emotes[emotes.length - 1]);
            }
        }
    }
}

var AllEmotes = null;
function isEmote(url) {
    if (AllEmotes == null) {
        AllEmotes = getAllEmotes();
    }
    if (url != null && url != undefined) {
        logger.Log('isEmote: ' + url);
        var splitten = url.split('?');
        if (splitten != null && splitten.length == 2) {
            splitten = splitten[1].split('&');
            for (var i = 0; i < splitten.length; i++) {
                if (splitten[i] == 'isEmote=true') {
                    return 2;
                }
            }
        }
        for (var i = 0; i < AllEmotes.length; i++) {
            if (url == AllEmotes[i]) {
                logger.Log('isEmote: true');
                return 1;
            }
        }
    }
    logger.Log('isEmote: false');
    return 0;
}

function EmoteType(url) {
    if (url != null && url != undefined) {
        var splitten = url.split('?');
        if (splitten != null && splitten.length == 2) {
            splitten = splitten[1].split('&');
            for (var i = 0; i < splitten.length; i++) {
                if (splitten[i] == 'isEmote=true') {
                    return {
                        result: 2,
                        lim: true
                    };
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
                         lim: AllEmotes[i].Normalized
                        }
                    }
                }
            }
        }
    }
    
    logger.Log('EmoteType: false');
    return { result: 0, lim: true };
}

function getAllEmotes() {
    var result = [];
    var store = $('#extraemoticons_loaded');
    for (var i = 0; i < store.children().length; i++) {
        var panel = store.children()[i];
        
        panel = panel.innerHTML.split('\n');
        
        for (var k = 0; k < panel.length; k++) {
            if (contains(panel[k], '|')) {
                var item = panel[k].split('|');
                if (item.length > 2) {
                    item[item.length - 1] = '';
                    result.push(item.join('|'));
                } else {
                    result.push(item[0]);
                }
            } else {
                result.push(panel[k]);
            }
        }
    }
    return result;
}

function getVirtualEmotes() {
    var result = [];
    var store = $('#extraemoticons_loaded');
    for (var i = 0; i < store.children().length; i++) {
        result.push(new VirtualEmotePanel(store.children()[i]));
    }
    return result;
}
var _defaultEmotes;
function getDefaultEmotes() {
    if (_defaultEmotes == null) {
        _defaultEmotes = {
           IsRaw: false,
           Id: '',
           Emotes: [],
           EmoteTitles: []
        }
        
        $('.extra_emoticons_normalized[extraemotes="FimFiction"] .extra_emote img').each(function() {
            _defaultEmotes.Emotes.push($(this).attr('src'));
            _defaultEmotes.EmoteTitles.push($(this).attr('title'));
        });
    }
    
    return _defaultEmotes;
}

function VirtualEmotePanel(panel) {
    this.Normalized = $(panel).attr('data_norm') == 'true';
    this.Title = $(panel).attr('data_title');
    this.Name = $(panel).attr('data_name');
    this.Id = $(panel).attr('data_id');
    this.IsRaw = $(panel).attr('data_raw') == 'true';
    this.External = $(panel).attr('data_external') == 'true';
    
    this.Image = null;
    if (this.IsRaw) {
        this.Image = $(panel).attr('data_img');
    }
    
    this.Emotes = [];
    this.EmoteTitles = [];
    
    panel = $(panel).html().split('\n');
    for (var k = 0; k < panel.length; k++) {
        if (contains(panel[k], '|')) {
            var item = panel[k].split('|');
            if (item.length > 2) {
                item[item.length - 1] = '';
                this.Emotes.push(item.join('|'));
            } else {
                this.Emotes.push(item[0]);
            }
        } else {
            this.Emotes.push(panel[k]);
        }
        this.EmoteTitles.push(getTitle(panel[k]));
    }
}

function recordEmotesPanel(isRaw, id, name, title, emotes, img, norm) {
    var store = $('#extraemoticons_loaded');
    var item = $('<div style="display:none" data_id="' + id + '" data_name="' + name + '" data_title="' + title + '" data_norm="' + (norm == false ? false : true) + '" />');
    if (isRaw) {
        $(item).attr('data_raw', 'true');
        $(item).attr('data_img', img)
    }
    $(item).append(emotes.join('\n'));
    $(store).append(item);
}

function recordExternalEmotesPanel(name, emotes) {
    var store = $('#extraemoticons_loaded');
    var item = $('<div style="display:none" data_name="' + name + '" data_external="true" data_norm="false" />');
    $(item).append(emotes.join('\n'));
    $(store).append(item);
}

function recordExtraEmotesPanels() {
    $('.emoteTable').each(function() {
        var name = $(this).attr('id').split(':')[1].split('_Area')[0];
        var emotes = [];
        $(this).find('.customEmote').each(function() {
            emotes.push($(this).attr('id') + '|' + $(this).attr('title'));
        });
        recordExternalEmotesPanel(name, emotes);
    });
}

function UnspoilerEmoticons() {
    var comments = $('.comment .data .comment_data');
    if (comments.length == 0) return false;
    unspoilerSiblings();
    for (var i = 0; i < comments.length; i++) {
        $(comments[i]).find('img[title=""]:not([alt=""])').each(function() {
            var tit = $(this).attr('alt');
            if ($(this).attr('title') != tit) {
                $(this).attr('title', tit);
            }
        });
    }
    
    logger.Log("unspoiler: complete");
    return true;
}

function unspoilerSiblings() {
    $('.comment .data .comment_data .user_image_link:not(.dontUnspoiler').each(function() {
        var type = EmoteType($(this).attr('href'));
        if (type.result > 0) {
            var url = $(this).attr('href');
            var img = $('<img />');
            
            if (type.result == 2) {
                $(img).css('max-width', '100%');
            } else {
                if (type.lim) {
                    $(img).css('max-height', '27px');
                }
                var tit = mainHook.Name(url);
                $(img).attr('alt', tit);
                $(img).attr('title', tit);
            }
            
            $(img).attr('src', url);
            $(this).parent().attr('style', 'display: inline;');
            $(this).after(img);
            $(this).remove();
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

function finalInit() {
    logger.Log('finalInit: beginning init...');
    if (!getInit()) {
        setInit();
        if (!has_init) {
            window.setTimeout(function () {
                logger.Log('finalInit: document ready');
                var emoteExtenderOtp = getElementByAttributeValue('a', 'title', 'Emote Script Settings');
                if (emoteExtenderOtp != null) {
                    emoteExtenderOtp = emoteExtenderOtp.parentNode.parentNode;
                    mainHook.toolbar.insertBefore(emoteExtenderOtp, mainHook.emotesTypes)
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
        }
    } else {
        logger.Log('finalInit: init already done')
    }
    has_init = true;
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
    if (UnspoilerEmoticons()) {
        setUpSpecialTitles();
        var editComments = getEditCommentButtons();
        if (editComments.length > 0) {
            logger.Log('refreshComments: adding comment editing...');
            editComments.each(function() {
                $(this).on('mousedown', function() {
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
}

function isGroupSearch(terms, panels) {
    var result = [];
    for (var i = 0; i < panels.length; i++) {
        for (var path = 0; path < terms.length; path++) {
            var mat = panels[i].Name;
            if (mat != null) {
                if (contains(terms[path].toLowerCase(), mat.toLowerCase())) {
                    if (result.indexOf(mat) == -1) {
                        result.push(mat);
                    }
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
    var result = ['',''];
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
    var reversed = ['',''];
    for (var i = 0; i < result.length; i++) {
        for (var c = result[i].length - 1; c >= 0; c--) {
            reversed[i] += result[i][c];
        }
    }
    return reversed;
}

//--------------------------------------------------------------------------------------------------
//--------------------------------------API FUNCTIONS-----------------------------------------------
//--------------------------------------------------------------------------------------------------

//==API FUNCTION==//
//Returns standard addres for a sites favicon.ico
function getSiteFavicon(domain) {
    var text = mapping[domain];
    if (text == null)
        return undefined;
    if (!startsWith(text, '*')) {
        text = 'www.' + text
    }
    return 'http://' + text.replace('*', '') + '/favicon.ico';
}

//==API FUNCTION==//
function setSpecialTitle(userIds, title) {
    for (var  i = 0; i < userIds.length; i++) {
        $(".author > .avatar > img[src^='//www.fimfiction-static.net/images/avatars/" + userIds[i] + "']").each(function(item) {
            var prev = this.parentNode.previousSibling;
            if (prev != null && prev != undefined && prev.innerHTML != title) {
                $(this.parentNode).before("<div class=\"author-badge\" >" + title + "</div>");
            }
        });
    }
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
//Returns true if Extra emticos have already been initialized on this page
function getInit() {
    var result = $('div#extraemoticons_loaded').length > 0;
    logger.Log('getInit: ' + result);
    return result;
}

function setInit() {
    logger.Log('Notifying Init complete');
    $('body').append('<div id=\'extraemoticons_loaded\'></div>')
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
function isMyPage() {
    if (document.location.href == ("http://www.fimfiction.net/user/" + getUserNameEncoded())) {
        return true;
    }
    return document.location.href == ("http://www.fimfiction.net/user/" + replaceAll(' ', '+', getUserName()));
}

//==API FUNCTION==//
//Returns true if the given string is recognized as a website
function getBoolIsSite(domain) {return getIsSite(domain) != '';}

//==API FUNCTION==//
function replaceAll(find, replace, str) {return str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace);}

//==API FUNCTION==//
function getUserNameEncoded() { return encodeURIComponent(getUserName()); }

//==API FUNCTION==//
function getUserName() {return $(getUserButton()).attr("href").split("/").reverse()[0];}

//==API FUNCTION==//
function getUserButton() {return getElementByAttributeValue("div", "class", "user_drop_down_menu").children[0];}

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
        if ($ == undefined) {}
        return true;
    } catch (e) {}
    return false;
}

//==API FUNCTION==//
function Logger(name,l) {
    var test=null;
    var minLevel=0;
    var line=0;
    var paused=false;
    if(typeof(l)=='number')minLevel=l;
    this.Start=function(level){
        if(typeof(level)=='number')minLevel=level;
        test=$('#debug-console')[0];        
        paused=false;
        if(test==null||test==undefined){
            test = $('<div id="debug-console" style="position:fixed;bottom:0px;left:0px;" />');
            $('body').append(test);
            $(test).click(function(){
                $(this).empty();
                this.style.bottom=this.style.left=line=0;});}
        Output('===Logging Enabled===',minLevel+1);}
    this.Stop=function(){
        if(test!=null){
            $(test).remove();
            test=null;}
        line=0;
        Output('===Logging Disabled===',minLevel+1);}
    this.Pause=function(){
        Output('===Logging Paused===',minLevel+1);
        paused=true;}
    this.Continue=function(){
        paused=false;
        Output('===Logging Continued===',minLevel+1);}
    this.Log=function(txt){Output(txt,0);}
    this.Error=function(txt){Output(txt,1);}
    this.SevereException=function(txt,excep){
        if(excep!='handled'){
            try{
                var stopped=false;
                if(test==null){
                    stopped=true;
                    this.Start();}
                SOut(txt.replace('{0}',excep),2);
                if(excep.stack!=undefined&&excep.stack!=null)SOut(excep.stack,2);
                if(stopped)this.Pause();
            }catch(e){
                alert('Error in displaying Severe: '+e);
                alert('Severe: '+txt);}
            throw'handled';}}
    this.Severe=function(txt){
        try{
            var stopped=false;
            if(test==null){
                stopped=true;
                this.Start();}
            SOut(txt,2);
            if(stopped)this.Pause();
        }catch(e){
            alert('Error in displaying Severe: '+e);
            alert('Severe: '+txt);}}
    function Output(txt,level){
        if(!paused)SOut(txt,level);}
    function SOut(txt, level) {
        if(level==null||level==undefined)level=0;
        if(test!=null&&level>=minLevel){
            if (line>50){
                line=0;
                $(test).empty();}
            $(test).append('<p style="background: rgba('+(line%2==0?'155,0':'0,155')+',0,0.3);">'+ ++line +'):'+name+') '+txt+'</p>');}}
}

