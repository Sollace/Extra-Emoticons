// ==UserScript==
// @icon        http://sollace.github.io/emoticons/default/rainbowexcited.png
// @name        Derpibooru Emoticons
// @description Adds emoticons to derpibooru.org.
// @namespace   sollace
// @include     /^http?[s]://(derpi|trixie)boo(\.ru|ru\.org).*/
// @version     1
// @grant       none
// ==/UserScript==

var version = '1';
var emoticons = [];
var emote_configs = [
  {
    url: '//sollace.github.io/emoticons/default/{name}.png',
    emotes: ['ajbemused','ajsleepy','ajsmug','applejackconfused','applejackunsure','applecry','eeyup','fluttercry','flutterrage','fluttershbad','fluttershyouch','fluttershysad','yay','heart','pinkiecrazy','pinkiegasp','pinkiehappy','pinkiesad2','pinkiesmile','pinkiesick','twistnerd','twistoo','rainbowderp','rainbowdetermined2','rainbowhuh','rainbowkiss','rainbowlaugh','rainbowwild','rainbowexcited','scootangel','raritycry','raritydespair','raritystarry','raritywink','duck','unsuresweetie','coolphoto','twilightangry2','twilightoops','twilightblush','twilightsheepish','twilightsmile','facehoof','moustache','trixie','trixieshiftleft','trixieshiftright','derpyderp1','derpyderp2','derpytongue2','trollestia','cheericonfused','cheerismile','cheeriderp','redheartgasp','zecora']
  }
]

var div = document.createElement('DIV');
function make(htm) {
  div.innerHTML = htm;
  return div.childNodes;
}
function each(arr, func) {
  for (var i = arr.length; i--;) func.apply(arr[i], [arr]);
}

function Emoticon(htm, item, name, id) {
  var name_d = ':' + (id ? id + ':' : '') + name + ':';
  htm.push('<a class="emote" title="' + name_d + '"><img title=":' + name + ':" src="' + item.split('|')[0] + '"></img></a>');
  this.from = name_d;
  this.to = '!' + item.split('|')[0] + '!';
  emoticons.push(this);
}
Emoticon.prototype = {
  returnAlias: function(s) {
    return s.replace(new RegExp(this.to, 'gi'), this.from);
  },
  replaceAlias: function(s) {
    return s.replace(new RegExp(this.from, 'gi'), this.to);
  }
}

function populatePanel(panel, config) {
  var htm = [];
  if (config.length) {
    each(config, function() {
      new Emoticon(htm, this, this.split('|').reverse()[0].split(/[^a-zA-Z0-9]/)[0]);
    });
  } else {
    each(config.emotes, function() {
      new Emoticon(htm, config.url.replace('{name}', this), this, config.id);
    });
  }
  var els = make(htm.join(''));
  each(els, function() {
    this.addEventListener('click', insertEmote);
    this.childNodes[0].addEventListener('dragstart', dragStart);
    panel.appendChild(this);
  });
}

function dragStart(event) {
  var data = event.dataTransfer.getData('Text/plain');
  if (data && data.trim().indexOf('[') == 0) {
    data = data.split(/\n| /g);
    for (var i = data.length; i--;) {
      data[i] = data[i].trim().replace(/\[/g, '').replace(/\]/g, '');
    }
    event.dataTransfer.setData('Text/plain', data.join(''));
  } else {
    event.dataTransfer.setData('Text/plain', this.getAttribute('title'));
  }
}
function insertEmote(e) {
  insertTags(comment_box.dom, this.getAttribute('title'), '');
  e.preventDefault();
}
function insertTags(textarea, open, close) {
  var start = textarea.selectionStart;
  if (start || start == 0) {
    var end = textarea.selectionEnd;
    var before = textarea.value.substring(0, start);
    var after = textarea.value.substring(end, textarea.value.length);
    var selected = end - start > 0 ? textarea.value.substring(start, end) : '';
    if (selected.indexOf(open) != -1 || (selected.indexOf(close) != -1 && close)) {
      selected = selected.replace(open, '').replace(close, '');
    } else {
      selected = open + selected + close;
    }
    textarea.value = before + selected + after;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + selected.length;
    textarea.focus();
  }
}

var focused_el = null;

function focusable(el) {
  if (el && !el.hasFocus) {
    el.addEventListener('focus', function() {
      if (focused_el != this) focused_el = this;
    });
    el.addEventListener('blur', function() {
      if (focused_el == this) focused_el = null;
    });
    el.hasFocus = function() {
      return focused_el == this;
    };
    el._focus = el.focus;
    el.focus = function() {
      if (focused_el != this) focused_el = this;
      this._focus();
    };
    el._blur = el.blur;
    el.blur = function() {
      if (focused_el == this) focused_el = null;
      this._blur();
    };
  }
  return el;
}

function CommentBox() {
  this.dom = focusable(document.querySelector('#comment_body, #post_body'));
  this.dum = focusable(make('<textarea class="dummy ' + this.dom.getAttribute('class').replace(' js-preview-input', '') + '" placeholder="' + this.dom.getAttribute('placeholder') + '" />')[0]);
  this.dom.parentNode.appendChild(this.dum);
  if (!this.dom) return;
  this.dom.className += ' comment_box';
  this.returnAliases(this.dom);
  this.ready = true;
  var me = this;
  this.form = this.dom.form;
  this.form.addEventListener('submit', function(e) {
    me.submit();
  });
  this.dum.addEventListener('mouseenter', function() {
    me.unsubmit();
  });
  this.pane = make('<div id="comment_emotes"></div>')[0];
  this.dom.parentNode.appendChild(this.pane);
  this.preview = document.querySelector('a[data-click-tab="preview"]');
  this.preview.addEventListener('mouseenter', function() {
    me.submit();
  });
  this.preview.addEventListener('mouseleave', function() {
    me.unsubmit();
  });
}
CommentBox.prototype = {
  submit: function() {
    if (this.form.getAttribute('data-submitting') !== 'true') {
      this.form.setAttribute('data-submitting', 'true');
      this.dum.value = this.replaceAliases(this.dom);
      this.dum.style.width = this.dom.style.width;
      this.dum.style.height = this.dom.style.height;
      this.dum.selectionStart = this.dom.selectionStart;
      this.dum.selectionEnd = this.dom.selectionEnd;
      if (this.dom.hasFocus()) {
        this.dom.blur();
        this.dum.focus();
      }
      this.returnAliases(this.dum);
      return false;
    }
    return true;
  },
  unsubmit: function() {
    if (this.dum.value) {
      this.form.setAttribute('data-submitting', 'false');
      this.dom.value = this.returnAliases(this.dum);
      this.dom.selectionStart = this.dum.selectionStart;
      this.dom.selectionEnd = this.dum.selectionEnd;
      if (this.dum.hasFocus()) {
        this.dum.blur();
        this.dom.focus();
      }
    }
  },
  replaceAliases: function(dom) {
    var string = dom.value;
    if (string) {
      each(emoticons, function() {
        string = this.replaceAlias(string);
      });
      dom.value = string;
    }
    return dom.value || '';
  },
  returnAliases: function(dom) {
    var string = dom.value;
    if (string) {
      each(emoticons, function() {
        string = this.returnAlias(string);
      });
      dom.value = string;
    }
    return dom.value || '';
  }
};

var comment_box = (function(win) {
  win.ExtraEmotes = ExtraEmotes = {
    addEmoticons: function(id, name, title, emotes, normalize, buttonImage) {
      if (comment_box.ready) {
        populatePanel(comment_box.pane, {
          id: id, emotes: emotes
        });
      }
    },
    addRaw: function(is, name, title, emotes, buttonImage) { },
    addUrlMatcher: function() {},
    getLogger: function() {
      return console;
    },
    getVersion: function() {
      return version;
    },
    valueOf: function valueOf() {
      return this.toString();
    },
    toString: function toString() {
      return '[object API] {\n  getLogger() -> [Object Logger]\n  addEmoticons(id, name, title, emotes, normalize [, buttonImage])\n  addRaw(id, name, title, emotes, buttonImage)\n  addUrlMatcher(matcher (url, emoticon) -> Boolean)';
    }
  };
  return win.comment_box = new CommentBox();
})(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);

if (comment_box.ready) {
  document.head.appendChild(make('<style type="text/css">\
#comment_emotes {\
  box-sizing: border-box;\
  display: inline-block;\
  overflow-y: auto;\
  width: 36.666%;\
  height: 300px;\
  vertical-align: top;\
  border: 1px solid #cdcdcd;\
  border-left: none;\
  text-align: center;\
  padding: 5px;\
}\
.comment_box, .comment_box + textarea {\
  display: inline-block;\
  max-width: 60%;\
  min-height: 300px;\
}\
form[data-submitting="true"] .comment_box,\
.comment_box + textarea {\
  display: none;\
}\
.comment_box:-moz-ui-invalid:not(output) + textarea,\
.comment_box:-moz-ui-invalid:not(output) ~ #comment_emotes {\
  box-shadow: 0 0 1.5px 1px red;\
}\
form[data-submitting="true"] .comment_box + textarea {\
  display: inline-block;\
}\
a.emote {\
  display: inline-block;\
  padding: 6px;\
  border-radius: 100%;\
  width: 27px;\
  height: 27px;\
  transition: background 0.2s ease, transform 0.1s ease;\
  transform: scale(1,1) rotate(0);\
}\
a.emote:hover {\
  background: rgba(220,220,220,0.4);\
  transform: scale(1.1,1.1) rotate(10deg);\
}\
a.emote:nth-child(odd):hover {\
  transform: scale(1.1,1.1) rotate(-10deg);\
}</style>')[0]);
  
  each(emote_configs, function() {
    populatePanel(comment_box.pane, this);
  });
}