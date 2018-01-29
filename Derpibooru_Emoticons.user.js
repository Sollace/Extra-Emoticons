// ==UserScript==
// @icon        http://sollace.github.io/emoticons/default/rainbowexcited.png
// @name        Derpibooru Emoticons
// @description Adds emoticons to derpibooru.org.
// @namespace   sollace
// @include     /^http?[s]://(derpi|trixie)booru\.org.*/
// @version     1.2.2
// @grant       none
// ==/UserScript==

const version = '1.2.1';
const taken = [];
const emoticons = [];

const make = (function() {
  const div = document.createElement('DIV');
  return function make(htm, context) {
    context = context || div;
    context.innerHTML = htm;
    htm = [].slice.apply(context.childNodes);
    context.innerhHTMl = '';
    return htm;
  }
})();
function each(arr, func) {
  return [].forEach.call(arr, func);
}
function all(selector, func) {
  return each(document.querySelectorAll(selector), func);
}

function Emoticon(htm, item, name, id) {
  let name_d = `:${Emoticon.resolve(name)}:`;
  taken.push(name_d);
  this.html = `<a class="emote" title="${name_d}" style="background-image:url(${item.split('|')[0]});" ><img title=":${name}:" src="${item.split('|')[0]}"></img></a>`;
  this.category = id;
  this.from = name_d;
  this.to = `!${item.split('|')[0]}!`;
  htm.push(this.html);
  emoticons.push(this);
}
Emoticon.resolve = function(name_d) {
  if (taken.indexOf(name_d) > -1) {
    let mix = 1;
    while (taken.indexOf(`${name_d}_${mix}`) > -1) mix++;
    return `${name_d}_${mix}`;
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
  let mode = false;
  return text.split(/(==|@)/).map((a, index, arr) => {
    if (!mode) {
      if (a == '==' || a == '@') {
        mode = a.toString();
        return a;
      }
      return func(a);
    } else {
      if (a == mode) mode = false;
    }
    return a;
  }).join('');
}

function emotesOf(obj) {
  return obj.emotes || (typeof obj === 'string' || Object.prototype.toString.apply(obj) === '[object String]' ? [obj] : obj);
}

function complexConfigToHtm(config) {
  var htm = [];
  config.forEach(group => {
    const url = group.url || '{name}';
    (group.cases || [group]).forEach(cases => {
      const cas = cases.case || false;
      emotesOf(cases).forEach(item => {
        const splitten = (item.emote || item).split('|');
        new Emoticon(htm, url.replace('{name}', splitten[0]), splitten.reverse()[0], item.case || cas);
      });
    });
  });
  return htm.join('');
}

function dragStart(event) {
  let data = event.dataTransfer.getData('Text/plain');
  if (data && data.trim().indexOf('[') == 0) {
    data = data.split(/\n| /g).map(a => a.trim().replace(/\[/g, '').replace(/\]/g, '')).join('');
  } else {
    data = this.getAttribute('title');
  }
  event.dataTransfer.setData('Text/plain', data);
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

let focused_el = null;

function focusable(el) {
  if (el && !el.hasFocus) {
    el.addEventListener('focus', () => {
      if (focused_el != el) focused_el = el;
    });
    el.addEventListener('blur', () => {
      if (focused_el == el) focused_el = null;
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
  all('.selection-start, .selection-end', a => {
    a.classList.remove('selection-start');
    a.classList.remove('selection-end');
  });
}

function updateSelection() {
  clearSelection();
  const range = window.getSelection().getRangeAt(0);
  if (range.startContainer) {
    range.startContainer.className += ' selection-start';
    range.endContainer.className += ' selection-end';
  }
}

function CommentBox(element) {
  this.dom = focusable(element);
  this.dum = focusable(make(`<textarea class="dummy ${this.dom.getAttribute('class').replace(' js-preview-input', '')}" placeholder="${this.dom.getAttribute('placeholder')}" />`)[0]);
  this.dom.parentNode.appendChild(this.dum);
  if (!this.dom) return;
  this.dom.className += ' comment_box';
  this.dom.parentNode.className += ' comment_box_parent';
  requestAnimationFrame(() => this.returnAliases(this.dom));
  this.ready = true;
  var me = this;
  this.form = this.dom.form;
  this.form.addEventListener('submit', e => me.submit());
  readscroll(this.dom, this);
  this.dum.addEventListener('mouseenter', () => me.unsubmit());
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
    this.preview.addEventListener('mouseenter', () => me.submit());
    this.preview.addEventListener('mouseleave', () => me.unsubmit());
  }
  document.addEventListener('mousedown',e => {
    clearSelection();
    const target = e.target.closest('.post-reply-quote');
    if (!target) return;
    let string = target.dataset.post;
    emoticons.forEach(emoticon => {
      string = emoticon.returnAlias(string);
    });
    target.dataset.post = string;
  });
}
CommentBox.prototype = {
  submit: function() {
    if (this.form.dataset.submitting !== 'true') {
      readscroll(this.dom, this);
      this.dum.value = this.replaceAliases(this.dom);
      this.form.dataset.submitting = 'true';
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
      this.form.dataset.submitting = 'false';
      swap(this.dum, this.dom);
      readscroll(this, this.dom);
    }
  },
  replaceAliases: function(dom) {
    let string = dom.value;
    if (string) {
      string = transformText(string, part => {
        emoticons.forEach(emote => part = emote.replaceAlias(part));
        return part;
      });
      dom.value = string;
    }
    return dom.value || '';
  },
  returnAliases: function(dom) {
    let string = dom.value;
    if (string) {
      string = transformText(string, part => {
        emoticons.forEach(a => part = a.returnAlias(part));
        return part;
      });
      dom.value = string;
    }
    return dom.value || '';
  },
  addEmoticons: function(htm) {
    this.pane.innerHTML = htm;
    each(this.pane.children, a => {
      a.childNodes[0].addEventListener('dragstart', dragStart);
    });
  }
};

const ExtraEmotes = (function(win) {
  var modules = [];
  try {
    all('#comment_body, #post_body, #description, #image_description, #message_body, #topic_posts_attributes_0_body, textarea#body', a => {
      modules.push(new CommentBox(a));
    });
  } catch (e) {
    console.log(e);
  }
  return win.ExtraEmotes = {
    addEmoticons: function(id, name, _title_, emotes) {
      this.load(name ? { id: id, emotes: emotes } : id);
    },
    load: function(config) {
      if (!this.ready()) return;
      const htm = complexConfigToHtm(config);
      modules.forEach(module => module.addEmoticons(htm));
    },
    ready: function() {
      return modules.length > 0;
    },
    getVersion: function() {
      return version;
    }
  };
})(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);

if (ExtraEmotes.ready()) {
  document.head.insertAdjacentHTML('beforeend', `<style type="text/css">
#comment_emotes {
  box-sizing: border-box;
  display: inline-block;
  overflow-y: auto;
  width: 36.666%;
  height: 330px;
  vertical-align: top;
  border: 1px solid #cdcdcd;
  border-left: none;
  text-align: center;
  padding: 5px;}
.comment_box, .comment_box + textarea {
  display: inline-block;
  max-width: 60%;
  min-height: 330px;}
form[data-submitting="true"] .comment_box,
.comment_box + textarea {display: none;}
form[data-submitting="true"] .comment_box + textarea { display: inline-block;}
a.emote, a.emote img {
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1.0, 1.0);
  transform: translateZ(0);}
a.emote img {opacity: 0;}
a.emote {
  vertical-align: top;
  display: inline-block;
  padding: 6px;
  border-radius: 100%;
  width: 27px;
  height: 27px;
  transition: background 0.2s ease, transform 0.1s ease;
  background: no-repeat center;
  transform: scale(1,1) rotate(0) translateZ(0);}
a.emote:hover img {
  opacity: 0.7 !important;
  filter: blur(0.3px);}
a.emote:hover, a.emote.selection-start, a.emote.selection-start ~ a {
  background-color: rgba(220,220,220,0.4);
  transform: scale(1.1,1.1) rotate(10deg) translateZ(0);}
a.emote:nth-child(odd):hover, a.emote:nth-child(odd).selection-start, a.emote.selection-start ~ a:nth-child(odd) {
  transform: scale(1.1,1.1) rotate(-10deg) translateZ(0);}
a.emote.selection-end ~ a, a.emote.selection-end ~ a:nth-child(odd) {
  background-color: transparent;
  transform: scale(1,1) rotate(0) translateZ(0);}
a.emote:active {transform: scale(1,1) rotate(10deg) translateZ(0);}
a.emote:nth-child(odd):active {transform: scale(1,1) rotate(-10deg) translateZ(0);}
</style>`);
}

ExtraEmotes.load([
  {
    url: '//derpicdn.net/img/view/2016/11/10/{name}.png',
    emotes: [
      '1292828|ajbemused',
      '1292829|ajsleepy',
      '1292830|ajsmug',
      '1292831|applejackconfused',
      '1292834|applejackunsure'
    ]
  },
  {
    url: '//derpicdn.net/img/view/2016/11/14/{name}.png',
    emotes: [
      '1295600|applecry',
      '1295601|eeyup',
      '1295602|fluttercry',
      '1295603|flutterrage',
      '1295604|fluttershbad',
      '1295606|fluttershyouch',
      '1295607|fluttershysad',
      '1295608|yay',
      '1295631|heart',
      '1295632|pinkiecrazy',
      '1295633|pinkiegasp',
      '1295634|pinkiehappy',
      '1295635|pinkiesad2',
      '1295636|pinkiesmile',
      '1295637|pinkiesick',
      '1295735|twistnerd',
      '1295736|twistoo',
      '1295737|rainbowderp',
      '1295746|rainbowdetermined2',
      '1295747|rainbowhuh',
      '1295738|rainbowkiss',
      '1295739|rainbowlaugh',
      '1295741|rainbowwild'
      ]
  },
  {
    url: '//derpicdn.net/img/view/2016/12/11/{name}.png',
    emotes: [
      '1314940|rainbowexcited',
      '1314939|iwtcird'
    ]
  },
  {
    url: '//derpicdn.net/img/view/2016/11/14/{name}.png',
    emotes: [
      '1295743|scootangel',
      '1295752|raritycry',
      '1295753|raritydespair',
      '1295751|raritystarry',
      '1295754|raritywink',
      '1295756|duck',
      '1295757|unsuresweetie',
      '1295811|coolphoto',
      '1295812|twilightangry2',
      '1295813|twilightoops',
      '1295814|twilightblush',
      '1295815|twilightsheepish',
      '1295816|twilightsmile',
      '1295817|facehoof',
      '1295818|moustache'
    ]
  },
  {
    url: '//derpicdn.net/img/view/2016/12/11/{name}.png',
    emotes: [
      '1314942|starlightsmile',
      '1314941|starlighttriggered',
      '1314943|sunset'
    ]
  },
  {
    url: '//derpicdn.net/img/view/2016/11/15/{name}.png',
    emotes: [
      '1296259|trixie',
      '1296260|trixieshiftleft',
      '1296261|trixieshiftright',
      '1296262|derpyderp1',
      '1296263|derpyderp2',
      '1296264|derpytongue2',
      '1296265|trollestia',
      '1296267|cheericonfused',
      '1296268|cheerismile',
      '1296269|cheeriderp',
      '1296270|redheartgasp',
      '1296271|zecora'
    ]
  },
  '//derpicdn.net/img/view/2016/7/7/1195553.png|quack',
  '//derpicdn.net/media/2015/07/06/23_34_55_336_squirrelbadge2.png|squirrel'
]);