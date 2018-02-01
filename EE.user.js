// ==UserScript==
// @name        Extra Emoticons Redux
// @description Allows additional emoticons to be added to FimFiction.net
// @author      Sollace
// @namespace   fimfiction-sollace
// @include     /^http?[s]://www.fimfiction.net/.*/
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/Events.user.js
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/FimQuery.core.js
// @grant       none
// @run-at      document-start
// ==/UserScript==

const ExtraEmotes = tryRun(ExtraEmoticons);

function tryRun(func) {
  try {
    return func();
  } catch (e) {
    console.error(e);
  }
}

function ExtraEmoticons() {
  const version = 6;
  const wind = win();
  
  if (wind.ExtraEmotes && wind.ExtraEmotes.getVersion() >= version) {
    return wind.ExtraEmotes;
  }
  
  const defaultEmojis = 'ajbemused;ajsleepy;ajsmug;applejackconfused;applejackunsure;applecry;eeyup;fluttercry;flutterrage;fluttershbad;fluttershyouch;fluttershysad;yay;heart;pinkiecrazy;pinkiegasp;pinkiehappy;pinkiesad2;pinkiesmile;pinkiesick;twistnerd;rainbowderp;rainbowdetermined2;rainbowhuh;rainbowkiss;rainbowlaugh;rainbowwild;scootangel;raritycry;raritydespair;raritystarry;raritywink;duck;unsuresweetie;coolphoto;twilightangry2;twilightoops;twilightblush;twilightsheepish;twilightsmile;facehoof;moustache;trixieshiftleft;trixieshiftright;derpyderp1;derpyderp2;derpytongue2;trollestia'.split(';');

  function cutProto(url) {
    return url.replace(/^http?[s]:/,'');
  }

  function debooru(url) {
    return url.indexOf('camo.derpicdn') > -1 ? decodeURIComponent(url.split('url=')[1].split('&')[0]) : url;
  }

  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace);
  }

  function override(obj, member, new_func) {
    new_func.super = obj[member].super || obj[member];
    obj[member] = new_func;
  }

  function search(array, func, result) {
    array.find((a, i, ar) => !!(result = func(a, i, ar)));
    return result;
  }
  
  function newEl(html) {
    const div = document.createElement('DIV');
    div.innerHTML = html;
    return div.firstChild;
  }
  
  function extend(onto, offof) {
    Object.keys(offof).forEach(key => onto[key] = offof[key]);
    return onto;
  }
  
  const ExtraEmotesRegistry = (_ => {
    const sets = [], imgs = [], setsObj = {};
    
    function registerSet(set, emoji) {
      setsObj[set.category] = set;
      sets.push(set);
      if (emoji) imgs.push(set);
      return set;
    }
    
    return {
      imgs: _ => imgs,
      cats: setsin => sets.length ? {
        keys: ['Ponies'].concat(sets.map(i => i.category), Object.keys(setsin).filter(a => a != 'Ponies')),
        values: extend(extend({}, setsin), setsObj)
      } : {
        keys: Object.keys(setsin),
        values: extend({}, setsin)
      },
      EmojiSet: (id, name, title, emotes, normalize, buttonImage) => registerSet({
        element: newEl(`<li class="emoji-selector__header" data-category="${name}">${title}</li>`),
        button: `<li data-click="jumpTo" data-category="${name}"><img src="${buttonImage || emoteUrlFor(emotes[0])}"></img></li>`,
        category: name,
        normalize: normalize,
        emojis: emotes.map(emote => Emoticon(emoteUrlFor(emote), emoteNameFor(emote), `:${id}:${emoteNameFor(emote)}:`, true))
      }, true),
      TextSet: (id, name, title, emotes, buttonImage) => registerSet({
        element: newEl(`<li class="emoji-selector__header" data-category="${name}">${title}</li>`),
        button: `<li data-click="jumpTo" data-category="${name}"><img src="${buttonImage}"></img></li>`,
        category: name,
        normalize: false,
        emojis: emotes.map(emote => Emoticon(emote, emoteNameFor(emote), code, false))
      });
    };
  })();
  
  const urlMatcher = (root => {
    return {
      match: (one, two) => one == two || (root ? root(one, two) : false),
      add: (matcher) => {
        const parent = root;
        if (parent) {
          return root = (one, two) => matcher(one, two) || parent(one, two);
        }
        return root = matcher;
      }
    };
  })((url, match) => {
    if (url.indexOf('.deviantart.') != -1) {
      url = url.split('-').reverse()[0].split('.')[0];
      match = match.split('/').reverse()[0].split('-').reverse()[0].split('.')[0];
      return url == match;
    }
    return false;
  });

  const unspoiler = (_ => {
    function emotify(me) {
      const url = cutProto(debooru(me.getAttribute('src')));
      const type = emoteType(url);
      if (type.result == 1) {
        me.src = type.url;
        me.alt = me.title = type.name;
        me.classList.add('emoticon');
        me.classList.remove('user_image');
        if (type.lim) {
          me.classList.add('limited');
        }
      }
      me.classList.add('done');
    }

    function unspoilerSibling(me) {
      const url = cutProto(debooru(me.getAttribute('href')));
      const type = emoteType(url);

      if (type.result == 0) {
        me.classList.add('dontUnspoiler');
        me.parentNode.insertAdjacentHTML('afterend', '<br />');
        return;
      }
      if (type.result == 2) {
        me.parentNode.insertAdjacentHTML('afterend', `<img class="user_image" src="${type.url}"></img>`);
        me.parentNode.parentNode.removeChild(me.parentNode);
        return;
      }

      me.parentNode.normalize();

      let p = me.parentNode.previousSibling;
      const after = me.parentNode.nextSibling;

      if (p.tagName == 'BR') {
        p = p.previousSibling;
        p.parentNode.removeChild(p.nextSibling);
      }

      const wrap = type.wrap || !p.length || p.tagName != 'P';

      me.insertAdjacentHtml(wrap ? 'afterend' : 'beforeend', `<img class="emoticon${type.lim ? ' limited' : ''}" alt="${type.name}" title="${type.name}" src="${type.url}"></img>`);
      if (wrap) me.parentNode.style.display = 'inline';
      
      me.parentNode.parentNode.removeChild(me.parentNode);
      if (after && after.nodeType == 3) {
        const img = wrap ? me.nextSibling : p.lastChild;
        img.parentNode.insertBefore(after, img.nextSibling);
      }
    }

    function emoteType(url) {
      let mustWrap = false;

      if (url) {
        let questionStart = url.indexOf('?');
        if (questionStart > -1) {
          let splitten = url.substring(questionStart + 1, url.length);
          musWrap = splitten.indexOf('wrap=true') > -1;
          if (splitten.indexOf('isEmote') > -1) {
            return { result: 2, url: cutProto(url), lim: true, wrap: mustWrap, name: emoteNameFor(url) };
          }
          if (mustWrap) url = url.split('?')[0];
        }
        
        return search(ExtraEmotesRegistry.imgs(), category => {
          return search(category.emojis, emoji => {
            if (urlMatcher.match(url, emoji.url)) return {
              result: 1,
              url: emoji.url,
              name: emoji.name,
              lim: category.normalize,
              wrap: mustWrap
            };
          });
        }, { result: 0, lim: true, wrap: mustWrap });
    }
    
    return _ => {
      all('.comment_data .user_image_link:not(.dontUnspoiler)', unspoilerSibling);
      all('.comment_data img.user_image:not(.done)', emotify);
    };
  })();

  const aliases = (_ => {
    function getUrls(txt) {
      txt = txt.match(/\[img\]([^\s]+)\[\/img\]/ig);
      if (!txt) return [];
      return txt.map(i => {
        return {
          thin: i.replace(/\[[\/]?img\](http[s]?:)?/ig,''),
          thick: i
        };
      });
    }

    function restore(txt) {
      txt = txt.replace(/\?wrap\=true/g, '');
      const urls = getUrls(txt);
      ExtrEmojiSets.forEach(category => {
        if (category.raw) return;
        category.emojis.forEach(emoji => {
          urls.forEach(item => {
            if (urlMatcher.match(item.thin, emoji.url)) {
              txt = replaceAll(item.thick, emoji.code, txt);
            }
          });
        });
      });
      return txt;
    }

    function remove(txt) {
      ExtrEmojiSets.forEach(category => {
        if (category.raw) return;
        category.emojis.forEach(emoji => {
          txt = replaceAll(`\n ${emoji.code}`, `\n [img]http:${emoji.url}?wrap=true[/img]`, txt);
          txt = replaceAll(emoji.code, `[img]http:${emoji.url}[/img]`, txt);
        });
      });
      return txt;
    }

    return {
      swap: (textarea, func) => {
        const scrollTop = textarea.scrollTop;
        textarea.value = func(textarea.value);
        textarea.scrollTop = scrollTop;
        textarea.focus();
      },
      remove: function(textarea) {
        this.swap(textarea, remove);
      },
      restore: function(textarea) {
        swap(textarea, restore);
      }
    };
  });

  const submitHandler = (_ => {
    function swap(from, to) {
      to.setAttribute('style', from.getAttribute('style'));
      to.setAttribute('class', from.getAttribute('class'));
      to.width = from.width;
      to.height = from.height;
      to.value = from.value;
      to.scrollTop = from.scrollTop;
      to.scrollLeft = from.scrollLeft;
      to.focus();
    }

    return function(textarea, callback) {
      if (textarea.style.display != 'none') {
        textarea.insertAdjacentHTML('<textarea />');
        const backup = textarea.nextSibling;
        swap(textarea, backup);
        textarea.style.display = 'none';

        aliases.remove(textarea);
        callback(() => {
          swap(backup, textarea);
          textarea.style.display = '';
          backup.parentNode.removeChild(parent);
        });
      }
    };
  });

  function run() {
    if (document.location.href.indexOf('/manage_user/messages/') < 0) {
      if (isMyPage()) FimFicEvents.on('aftereditmodule', () => {
        all('.module_editing_form textarea', aliases.restore);
      });
      FimFicEvents.on('afterpagechange aftereditcomment afteraddcomment', unspoiler);
    }

    FimFicEvents.on('beforepreviewcontent', e => {
      e.event.data.bbcode = aliases.remove(e.event.data.bbcode);
    });

    document.addEventListener("DOMContentLoaded", () => tryRun(initOverrides));
    
    makeStyle(`
.emoji-selector img,
img.limited { max-height: 27px}`);
    
    
    function initOverrides() {
      console.log('initOverrides');
      if (!document.querySelector('.body_container')) return;
      console.log(EmojiController.prototype);
      override(EmojiController.prototype, 'render', function() {
        try {
        rebuildEmojiSets(this);
        } catch (e) {console.error(e);}
        EmojiController.prototype.render.super.apply(this, arguments);
      });
      override(EmojiController.prototype, 'search', function() {
        rebuildEmojiSets(this);
        EmojiController.prototype.search.super.apply(this, arguments);
      });
      override(NewCommentController.prototype, 'saveComment', function() {
        submitHandler(this.element.querySelector('textarea'), n => {
          NewCommentController.prototype.saveComment.super.apply(this, arguments);
          n();
        });
      });
      override(ComposePmController.prototype, 'send', function() {
        submitHandler(this.element.querySelector('textarea'), n => {
          ComposePmController.prototype.send.super.apply(this, arguments);
          n();
        });
      });
      function saveHandler(controller, callback) {
        const last = [];
        all(controller.element, 'textarea', area => submitHandler(area, next => last.push(next)));
        callback.apply(controller, arguments);
        last.forEach(l => l());
      }

      override(UserPageController.prototype, 'saveModule', function() {
        saveHandler(this, UserPageController.prototype.saveModule.super);
      });
      override(ChapterController.prototype, 'toggleEdit', function() {
        ChapterController.prototype.toggleEdit.super.apply(this, arguments);
        if (this.editing) {
          all(this.element, 'textarea', area => aliases.restore);
        } else {
          all(this.element, 'textarea', area => aliases.remove);
        }
      });
      override(ChapterController.prototype, 'save', function() {
        saveHandler(this, ChapterController.prototype.save.super);
      });
    }
  }
  
  
  function rebuildEmojiSets(controller) {
    if (!controller.emotes) {
      controller.emotes = parseKniggySets(controller);
     // controller.extraEmotes['Ponies'].emojis = defaultEmojis.map(emoji => Emoticon(`//static.fimfiction.net/images/emoticons/${emoji}.png`, emoji));
    }
    flattenKniggySets(controller);
  }
  
  function parseKniggySets(controller) {
    let currentCategory = null;
    const sets = [];
    controller.emojiElements.forEach(e => {
      const cat = e.element.dataset.category;
      if (cat) {
        currentCategory = cat;
        sets[cat] = {
          element: e.element,
          button: `<li data-click="jumpTo" data-category="${cat}">${controller.getEmojiForCategory(cat)}</li>`,
          category: cat, 
          emojis: []
        };
      } else {
        sets[currentCategory].emojis.push({
          code: e.element.querySelector('[data-emoticon]').dataset.emoticon,
          name: e.element.dataset.name,
          element: e.element,
          keywords: e.keywords
        });
      }
    });
    return sets;
  }
  
  function flattenKniggySets(controller) {
    const elements = controller.emojiElements;
    elements.length = 0;
    const sets = ExtraEmotesRegistry.cats(controller.emotes);
    
    sets.keys.forEach(set => {
      elements.push(sets.values[set]);
      elements.push.apply(elements, sets.values[set].emojis);
    });
    controller.elements.tabs.innerHTML = sets.keys.map(i => sets.values[i].button).join('');
    
    return elements;
  }
  
  function Emoticon(url, name, code, img) {
    img = img || !code;
    code = code || `:${name}:`;
    return {
      code: code,
      name: name,
      url: cutProto(url),
      element: newEl(`<li data-name="${name}"><a title="${name}" data-click="addEmoticon" data-emoticon="${code}">${img ? `<img src="${cutProto(url)}"></img>` : code}</a></li>`),
      keywords: [ name ]
    };
  }
  
  function emoteUrlFor(url) {
    return cutProto(debooru(url)).split('|')[0];
  }

  function emoteNameFor(url) {
    const bar = url.indexOf('|');
    if (bar > -1) return url.substring(bar + 1, url.length);

    url = url.split('/').reverse()[0].split('.')[0].replace(/ /g, '_').replace('clapping_pony_icon_', '');

    if (url.indexOf('_by_') > -1) {
      url = url.split('_by_')[0];
    }
    while (url.indexOf('__') > -1) {
      url = url.replace(/__/g, '_');
    }
    return url;
  }
  
  run();
  
  return {
    //Adds a collection of image emoticons
    //Optional: buttonImage
    addEmoticons: function (id, name, title, emotes, normalize, buttonImage) {
      ExtraEmotesRegistry.EmojiSet(id, name, title, emotes, normalize, buttonImage);
    },
    //Adds a collection of text emoticons
    addRaw: function (id, name, title, emotes, buttonImage) {
      ExtraEmotesRegistry.TextSet(id, name, title, emotes, buttonImage);
    },
    //Adds a matching function to identify emoticon images by url
    addUrlMatcher: function(matcher) {
      urlMatcher.add(matcher);
    }
  };
}
