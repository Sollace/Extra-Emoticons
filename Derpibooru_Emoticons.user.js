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
var taken = [];
var emoticons = [];

var make = (function() {
  var div = document.createElement('DIV');
  return function make(htm) {
    div.innerHTML = htm;
    return div.childNodes;
  };
})();
function each(arr, func) {
  for (var i = arr.length; i--;) func.apply(arr[i], [arr, i]);
  return arr;
}
function timeoutOn(sender, func, time) {
  return setTimeout(function() {
    return func.apply(sender, arguments);
  }, time);
}

function Emoticon(htm, item, name, id) {
  var name_d = ':' + Emoticon.resolve((id ? id + ':' : '') + name) + ':';
  taken.push(name_d);
  this.html = '<a class="emote" title="' + name_d + '" style="background-image:url(' + item.split('|')[0] + ');" ><img title=":' + name + ':" src="' + item.split('|')[0] + '"></img></a>'
  this.from = name_d;
  this.to = '!' + item.split('|')[0] + '!';
  htm.push(this.html);
  emoticons.push(this);
}
Emoticon.resolve = function(name_d) {
  if (taken.indexOf(name_d) != -1) {
    var mix = 1;
    while (taken.indexOf(name_d + '_' + mix) != -1) mix++;
    return name_d + '_' + mix;
  }
  return name_d;
};
Emoticon.prototype = {
  returnAlias: function(s) {
    return s.replace(new RegExp(this.to, 'gi'), this.from);
  },
  replaceAlias: function(s) {
    return s.replace(new RegExp(this.from, 'gi'), this.to);
  }
}

function transformText(text, func) {
  var mode = false;
  return each(text.split(/(==|@)/), function(arr, index) {
    if (!mode) {
      if (this == '==' || this == '@') {
        return mode = this.toString();
      }
      arr[index] = func(this);
    } else {
      if (this == mode) {
        mode = false;
      }
    }
  }).join('');
}

function configToHtm(config) {
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
  return htm.join('');
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

function swap(from, to) {
  to.style.width = from.style.width;
  to.style.height = from.style.height;
  to.selectionStart = from.selectionStart;
  to.selectionEnd = from.selectionEnd;
  if (from.hasFocus()) {
    from.blur();
    to.focus();
  }
}
function readscroll(sender, reciever) {
  reciever.scrollTop = sender.scrollTop;
  reciever.scrollLeft = sender.scrollLeft;
}

function clearSelection() {
  each(document.querySelectorAll('.selection-start, .selection-end'), function() {
    this.className = this.className.replace(' selection-start', '').replace(' selection-end','');
  });
}

function updateSelection() {
  clearSelection();
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  if (range.startContainer) {
    range.startContainer.className += ' selection-start';
    range.endContainer.className += ' selection-end';
  }
}

function CommentBox(element) {
  this.dom = focusable(element);
  this.dum = focusable(make('<textarea class="dummy ' + this.dom.getAttribute('class').replace(' js-preview-input', '') + '" placeholder="' + this.dom.getAttribute('placeholder') + '" />')[0]);
  this.dom.parentNode.appendChild(this.dum);
  if (!this.dom) return;
  this.dom.className += ' comment_box';
  this.dom.parentNode.className += ' comment_box_parent';
  timeoutOn(this, function() {
    this.returnAliases(this.dom);
  }, 1);
  this.ready = true;
  var me = this;
  this.form = this.dom.form;
  this.form.addEventListener('submit', function(e) {
    me.submit();
  });
  readscroll(this.dom, this);
  this.dum.addEventListener('mouseenter', function() {
    me.unsubmit();
  });
  this.pane = make('<div id="comment_emotes"></div>')[0];
  this.dom.parentNode.appendChild(this.pane);
  this.pane.addEventListener('mousedown', function(e) {
    function handle() {
      this.removeEventListener('mouseup', handle);
      this.removeEventListener('mousemove', updateSelection);
    }
    this.addEventListener('mouseup', handle);
    this.addEventListener('mousemove', updateSelection);
  });
  this.pane.addEventListener('click', function(e) {
    var target = e.target || e.srcElement;
    if (target.tagName == 'IMG') target = target.parentNode;
    if (target.className.indexOf('emote') != -1) {
      insertTags(me.dom, target.getAttribute('title'), '');
      e.preventDefault();
    }
  });
  this.preview = document.querySelector('a[data-click-tab="preview"]');
  if (this.preview) {
    this.preview.addEventListener('mouseenter', function() {
      me.submit();
    });
    this.preview.addEventListener('mouseleave', function() {
      me.unsubmit();
    });
  }
  document.addEventListener('mousedown', function(e) {
    clearSelection();
    var target = e.target || e.srcElement;
    if (target.className.indexOf('post-reply-quote') != -1) {
      var string = target.getAttribute('data-post');
      each(emoticons, function() {
        string = this.returnAlias(string);
      });
      target.setAttribute('data-post', string);
    }
  });
}
CommentBox.prototype = {
  submit: function() {
    if (this.form.getAttribute('data-submitting') !== 'true') {
      readscroll(this.dom, this);
      this.dum.value = this.replaceAliases(this.dom);
      this.form.setAttribute('data-submitting', 'true');
      swap(this.dom, this.dum);
      this.returnAliases(this.dum);
      readscroll(this, this.dum);
      return false;
    }
    return true;
  },
  unsubmit: function() {
    if (this.dum.value) {
      readscroll(this.dum, this);
      this.dom.value = this.returnAliases(this.dum);
      this.form.setAttribute('data-submitting', 'false');
      swap(this.dum, this.dom);
      readscroll(this, this.dom);
    }
  },
  replaceAliases: function(dom) {
    var string = dom.value;
    if (string) {
      string = transformText(string, function(part) {
        each(emoticons, function() {
          part = this.replaceAlias(part);
        });
        return part;
      });
      dom.value = string;
    }
    return dom.value || '';
  },
  returnAliases: function(dom) {
    var string = dom.value;
    if (string) {
      string = transformText(string, function(part) {
        each(emoticons, function() {
          part = this.returnAlias(part);
        });
        return part;
      });
      dom.value = string;
    }
    return dom.value || '';
  },
  addEmoticons: function(htm) {
    var pane = this.pane;
    each(make(htm), function() {
      this.childNodes[0].addEventListener('dragstart', dragStart);
      pane.appendChild(this);
    });
  }
};

var ExtraEmotes = (function(win) {
  var modules = [];
  try {
    each(document.querySelectorAll('#comment_body, #post_body, #description, #image_description'), function() {
      modules.push(new CommentBox(this));
    });
  } catch (e) {
    console.log(e);
  }
  return win.ExtraEmotes = {
    addEmoticons: function(id, name, title, emotes, normalize, buttonImage) {
      if (!this.ready()) return;
      var htm = configToHtm(name ? { id: id, emotes: emotes } : id);
      each(modules, function() {
        this.addEmoticons(htm);
      });
    },
    ready: function() {
      return modules.length > 0;
    },
    getVersion: function() {
      return version;
    },
    valueOf: function valueOf() {
      return this.toString();
    },
    toString: function toString() {
      return '[object API] {\n  addEmoticons(id, name, title, emotes, normalize [, buttonImage]))';
    }
  };
})(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);
if (ExtraEmotes.ready()) {
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
a.emote, a.emote img {\
  -webkit-backface-visibility: hidden;\
  -webkit-transform: translateZ(0) scale(1.0, 1.0);\
  transform: translateZ(0);\
}\
a.emote img {\
  opacity: 0;\
}\
a.emote {\
  display: inline-block;\
  padding: 6px;\
  border-radius: 100%;\
  width: 27px;\
  height: 27px;\
  transition: background 0.2s ease, transform 0.1s ease;\
  background: no-repeat center;\
  transform: scale(1,1) rotate(0) translateZ(0);\
}\
a.emote:hover, a.emote.selection-start, a.emote.selection-start ~ a {\
  background-color: rgba(220,220,220,0.4);\
  transform: scale(1.1,1.1) rotate(10deg) translateZ(0);\
}\
a.emote:nth-child(odd):hover, a.emote:nth-child(odd).selection-start, a.emote.selection-start ~ a:nth-child(odd) {\
  transform: scale(1.1,1.1) rotate(-10deg) translateZ(0);\
}\
a.emote.selection-end ~ a, a.emote.selection-end ~ a:nth-child(odd) {\
  background-color: transparent;\
  transform: scale(1,1) rotate(0) translateZ(0);\
}\
a.emote:active {\
  transform: scale(1,1) rotate(10deg) translateZ(0);\
}\
a.emote:nth-child(odd):active {\
  transform: scale(1,1) rotate(-10deg) translateZ(0);\
}\
</style>')[0]);
}

ExtraEmotes.addEmoticons({
  url: '//sollace.github.io/emoticons/default/{name}.png',
  emotes: ['ajbemused','ajsleepy','ajsmug','applejackconfused','applejackunsure','applecry','eeyup','fluttercry','flutterrage','fluttershbad','fluttershyouch','fluttershysad','yay','heart','pinkiecrazy','pinkiegasp','pinkiehappy','pinkiesad2','pinkiesmile','pinkiesick','twistnerd','twistoo','rainbowderp','rainbowdetermined2','rainbowhuh','rainbowkiss','rainbowlaugh','rainbowwild','rainbowexcited','scootangel','raritycry','raritydespair','raritystarry','raritywink','duck','unsuresweetie','coolphoto','twilightangry2','twilightoops','twilightblush','twilightsheepish','twilightsmile','facehoof','moustache','trixie','trixieshiftleft','trixieshiftright','derpyderp1','derpyderp2','derpytongue2','trollestia','cheericonfused','cheerismile','cheeriderp','redheartgasp','zecora']
});