// ==UserScript==
// @icon        http://sollace.github.io/emoticons/default/rainbowexcited.png
// @name        Derpibooru Emoticons
// @description Adds emoticons to derpibooru.org.
// @namespace   sollace
// @include     /^https*://(philomena\.|www\.)*(derpi|trixie)booru\.org.*/
// @version     1.5.4
// @inject-into content
// @grant       none
// ==/UserScript==

const version = '1.5.3';
const taken = [];
const emoticons = [];

function all(selector, func) {
  return [].forEach.call(document.querySelectorAll(selector), func);
}

function typeOf(obj) {
  return Object.prototype.toString.apply(obj).split(' ')[1].split(']')[0].toLowerCase();
}

function Emoticon(htm, item, name, id) {
  let name_d = `:${Emoticon.resolve(name)}:`;
  taken.push(name_d);
  this.html = `<a class="emote" title="${name_d}" style="background-image:url(https:${item.split('|')[0]});" ><img title=":${name}:" src="${item.split('|')[0]}"></img></a>`;
  this.category = id;
  this.from = name_d;
  this.to = `!https:${item.split('|')[0]}!`;
  htm.push(this.html);
  emoticons.push(this);
}
Emoticon.resolve = (name_d) => {
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
};

function transformText(text, func) {
  let mode = false;
  const escapes = ['"','==','@','`'];
  return text.split(new RegExp(`(${escapes.join('|')})`)).map(a => {
    if (mode) {
      if (a == mode) mode = false;
    } else {
      if (escapes.indexOf(a) < 0) return func(a);
      mode = a;
    }
    return a;
  }).join('');
}

function emotesOf(obj, func) {
  const cas = obj.case || false;
  return (obj.emotes || (typeOf(obj) === 'string' ? [obj] : obj)).forEach(a => func(cas, a));
}

function casesOf(group, func) {
  const url = group.url || '{name}';
  return (group.cases || [group]).forEach(a => func(url, a));
}

function complexConfigToHtm(config) {
  const htm = [];
  config.forEach(group => casesOf(group, (url, cases) => emotesOf(cases, (cas, item) => {
    const splitten = (item.emote || item).split('|');
    new Emoticon(htm, url.replace('{name}', splitten[0]), splitten.reverse()[0], item.case || cas);
  })));
  return htm.join('');
}

function dragStart(event) {
  let data = event.dataTransfer.getData('Text/plain');
  if (data && data.trim().indexOf('[') == 0) {
    data = data.split(/\n| /g).map(a => a.trim().replace(/\[/g, '').replace(/\]/g, '')).join('');
  } else {
    data = event.target.getAttribute('title');
  }
  
  event.dataTransfer.setData('Text/plain', data);
}

function insertEmote(textarea, open) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  let before = textarea.value.substring(0, start);
  let after = textarea.value.substring(end, textarea.value.length);

  let selected = end > start ? textarea.value.substring(start, end) : '';

  selected = selected.indexOf(open) > -1 ? selected.replace(open, '') : (open + selected);

  textarea.value = before + selected + after;
  textarea.selectionStart = start;
  textarea.selectionEnd = start + selected.length;
  textarea.focus();
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

function swap(from, to, v) {
  to.style.width = from.style.width;
  to.style.height = from.style.height;
  to.selectionStart = from.selectionStart;
  to.selectionEnd = from.selectionEnd;
  to.value = v;
  to.scrollTop = from.scrollTop;
  to.scrollLeft = from.scrollLeft;
  if (from.hasFocus()) {
    from.blur();
    to.focus();
  }
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

const handle = () => {
  document.removeEventListener('mouseup', handle);
  document.removeEventListener('mousemove', updateSelection);
};

document.addEventListener('mousedown', e => {
  if (e.target.closest('.comment_emotes')) {
    document.addEventListener('mouseup', handle);
    document.addEventListener('mousemove', updateSelection);
  }
});
document.addEventListener('dragstart', e => {
  if (e.target.closest('.emote')) dragStart(e);
});
document.addEventListener('mousedown',e => {
  clearSelection();
  const target = e.target.closest('.post-reply-quote');
  if (target) target.dataset.post = returnAliases(target.dataset.post);
});

function CommentBox(element) {
  this.dom = focusable(element);
  this.form = this.dom.form;
  
  this.dom.insertAdjacentHTML('afterend', `<div class="comment_box_flex"></div>`);
  this.dom.nextSibling.appendChild(this.dom);

  this.dom.insertAdjacentHTML('afterend', `
    <textarea class="dummy ${this.dom.getAttribute('class').replace(' js-preview-input', '')}" placeholder="${this.dom.getAttribute('placeholder')}"></textarea>
    <div class="comment_emotes" id="comment_emotes"></div>`);
  
  this.dum = focusable(this.dom.parentNode.querySelector('.dummy'));
  this.pane = this.dom.parentNode.querySelector('#comment_emotes');
  this.preview = this.form.querySelector('a[data-click-tab="preview"]');
  
  this.dom.classList.add('comment_box');

  requestAnimationFrame(() => this.dom.value = returnAliases(this.dom.value));
  
  this.ready = true;
  this.editing = false;
  
  const on = () => this.switchAreas(true);
  const off = () => this.switchAreas(false);
  
  this.form.addEventListener('submit', on);
  
  this.dum.addEventListener('mouseenter', off);
  if (this.preview) {
    this.preview.addEventListener('mouseenter', on);
    this.preview.addEventListener('mouseleave', off);
  }
  
  this.pane.addEventListener('click', e => {
    const target = e.target.closest('.emote');
    if (target) {
      e.preventDefault();
      insertEmote(this.getActiveArea(), target.getAttribute('title'));
    }
  });
}
CommentBox.prototype = {
  switchAreas: function(to) {
    this.form.classList.toggle('submitting', to);
    if (this.editing == to) return;
    const active = this.getActiveArea();
    const inactive = this.getInactiveArea();

    const aliased = returnAliases(active.value);
    const unaliased = replaceAliases(aliased);

    swap(active, inactive, aliased);
    active.value = unaliased;

    this.editing = to;
  },
  getActiveArea: function() {
    return this.editing ? this.dum : this.dom;
  },
  getInactiveArea: function() {
    return this.editing ? this.dom : this.dum;
  },
  addEmoticons: function(htm) {
    this.pane.innerHTML = htm;
  }
};

function replaceAliases(string) {
  return string ? transformText(string, part => {
    emoticons.forEach(a => part = a.replaceAlias(part));
    return part;
  }) : '';
}

function returnAliases(string) {
  return string ? transformText(string, part => {
    emoticons.forEach(a => part = a.returnAlias(part));
    return part;
  }) : '';
}

const ExtraEmotes = (win => {
  const modules = [];
  const configs = [];
  try {
    all('#comment_body, #js-comment-form_body, #post_body, #description, #image_description, #message_body, #topic_posts_attributes_0_body, textarea#body', a => {
      modules.push(new CommentBox(a));
    });
  } catch (e) {
    console.error(e);
  }
  return win.ExtraEmotes = {
    addEmoticons: function(id, name, _title_, emotes) {
      this.load(name ? { id: id, emotes: emotes } : id);
    },
    load: function(config) {
      if (!this.ready()) return;
      configs.push.apply(configs, config);
      const htm = complexConfigToHtm(configs);
      modules.forEach(module => module.addEmoticons(htm));
    },
    ready: _ => modules.length > 0,
    getVersion: _ => version
  };
})(typeof (unsafeWindow) !== 'undefined' && unsafeWindow != window ? unsafeWindow : window);

if (ExtraEmotes.ready()) {
  const element = document.createElement('STYLE');
  element.setAttribute('type', 'text/css');
  element.innerHTML = `
.comment_box_flex {
  display: flex;}
#comment_emotes {
  overflow-y: auto;
  border: 1px solid #cdcdcd;
  border-left: none;
  text-align: center;
  padding: 5px;
  flex-grow: 1;}
#comment_emotes img::selection {color: transparent;}
#comment_emotes img::-moz-selection {color: transparent;}
.comment_box, .comment_box + textarea {
  display: inline-block;
  max-width: calc(200%/3 - 10px);
  min-width: calc(200%/3 - 10px);
  min-height: 330px;
  resize: vertical;}
form.submitting .comment_box,
.comment_box + textarea {display: none;}
form.submitting .comment_box + textarea { display: inline-block;}
a.emote, a.emote img {
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1.0, 1.0);
  transform: translateZ(0);}
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
#comment_emotes:hover a.emote img {opacity: 0.7;}
#comment_emotes:hover a.emote:hover img {
  opacity: 1 !important;
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
a.emote:nth-child(odd):active {transform: scale(1,1) rotate(-10deg) translateZ(0);}`;
  document.body.insertAdjacentElement('afterend', element);
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
