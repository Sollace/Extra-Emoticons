// ==UserScript==
// @name        Extra Emoticons Redux
// @description Allows additional emoticons to be added to FimFiction.net
// @author      Sollace
// @version     6
// @namespace   fimfiction-sollace
// @icon        http://sollace.github.io/emoticons/default/rainbowexcited.png
// @include     /^http?[s]://www.fimfiction.net/.*/
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/Events.user.js
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/FimQuery.core.js
// @grant       none
// @run-at      document-start
// ==/UserScript==

const ExtraEmotes = tryRun(_ => {
  const version = 6;
  const wind = win();
  
  if (wind.ExtraEmotes && wind.ExtraEmotes.getVersion() >= version) {
    return wind.ExtraEmotes;
  }
  
  const some = a => a;
  const cutProto = url => url.replace(/^https?:/,'');
  const debooru = url => url.indexOf('camo.derpicdn') > -1 ? decodeURIComponent(url.split('url=')[1].split('&')[0]) : url;
  const replaceAll = (find, replace, str) => str.replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replace);
  const collide = (func, args) => args.forEach(arg => func.apply(this, arg));
  
  function override(obj, member, new_func) {
    new_func.super = obj[member].super || obj[member];
    obj[member] = new_func;
  }
  
  function extend(onto, offof) {
    Object.keys(offof).forEach(key => onto[key] = offof[key]);
    return onto;
  }
  
  function Emoticon(norm, url, name, code, img) {
    img = img || !code;
    code = code || `:${name}:`;
    return {
      code: code,
      name: name,
      normalize: norm,
      url: cutProto(url),
      element: `<li data-name="${name}"><a title="${name}" data-click="addEmoticon" data-emoticon="${code}">${img ? `<img src="${cutProto(url)}"></img>` : code}</a></li>`,
      keywords: [ name ]
    };
  }
  
  const ExtraEmotesRegistry = (_ => {
    const sets = [], imgs = [], emojis = [], setsObj = {};
    
    function registerSet(set, emoji) {
      setsObj[set.category] = set;
      sets.push(set);
      if (emoji) {
        imgs.push(set);
        emojis.push.apply(emojis, set.emojis);
      }
      return set;
    }
    
    function emoteUrl(url) {
      return cutProto(debooru(url)).split('|')[0];
    }
    
    function emoteName(url) {
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
    
    return {
      emojis: _ => emojis,
      imgs: _ => imgs,
      cats: setsin => (sets.length ? {
        keys: ['Ponies'].concat(sets.map(i => i.category), Object.keys(setsin).filter(a => a != 'Ponies')),
        values: extend(extend({}, setsin), setsObj)
      } : {
        keys: Object.keys(setsin),
        values: extend({}, setsin)
      }),
      EmojiSet: (id, name, title, emotes, normalize, buttonImage) => registerSet({
        element: `<li class="emoji-selector__header" data-category="${name}">${title}</li>`,
        button: `<li data-click="jumpTo" data-category="${name}"><img src="${buttonImage || emoteUrl(emotes[0])}"></img></li>`,
        category: name,
        emojis: emotes.map(emote => Emoticon(normalize, emoteUrl(emote), emoteName(emote), `:${id}:${emoteName(emote)}:`, true))
      }, true),
      TextSet: (id, name, title, emotes, buttonImage) => registerSet({
        element: `<li class="emoji-selector__header" data-category="${name}">${title}</li>`,
        button: `<li data-click="jumpTo" data-category="${name}"><img src="${buttonImage}"></img></li>`,
        category: name,
        emojis: emotes.map(emote => Emoticon(false, emote, emoteName(emote), code, false))
      })
    };
  })();
  
  const urlMatcher = (root => {
    return {
      match: (one, two) => one == two || root(one, two),
      add: (matcher) => {
        const parent = root;
        root = (one, two) => matcher(one, two) || parent(one, two);
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
      const type = emoteType(cutProto(debooru(me.getAttribute('src'))));
      if (type.result == 1) {
        me.insertAdjacentHTML('afterend', emojiImg(type));
        me.parentNode.removeChild(me);
      } else {
        me.classList.add('done');
      }
    }
    
    function emojiImg(type) {
      return type.result == 2 ?
        `<img class="user_image" data-lightbox src="${type.emoji.url}"></img>` : 
        `<img class="emoticon${type.emoji.normalize ? ' limited' : ''}" alt="${type.emoji.name}" src="${type.emoji.url}"></img>`
    }
    
    function unspoilerSibling(me) {
      const type = emoteType(cutProto(debooru(me.getAttribute('href'))));
      
      if (type.result == 0) {
        me.classList.add('done');
      } else {
        let next = me.parentNode.nextSibling;
        if (type.result > 1 && next && next.tagName != 'BR') {
          me.parentNode.insertAdjacentHTML('afterend', '<br>');
        }
        let prev = me.parentNode.previousSibling;
        if (prev) {
          if (type.wrap && prev.tagName != 'BR') {
            me.parentNode.insertAdjacentHTML('beforebegin', '<br>');
          } else if (prev.tagName == 'BR') {
            prev.parentNode.removeChild(prev);
          }
        }
        me.parentNode.insertAdjacentHTML('afterend', emojiImg(type));
        me.parentNode.parentNode.removeChild(me.parentNode);
      }
    }
    
    function search(array, func, result) {
      array.find((a, i, ar) => !!(result = func(a, i, ar)));
      return result;
    }

    function emoteType(url) {
      if (!url || !url.length) return { result: 0 };
      
      const mustWrap = /\?.*wrap=true/.test(url);
      if (/\?.*isEmote/.test(url)) {
        return { result: 2, emoji: { url: cutProto(url) }, wrap: mustWrap };
      }
      url = url.split('?')[0];
      
      return search(ExtraEmotesRegistry.emojis(), emoji => {
        if (urlMatcher.match(url, emoji.url)) return { result: 1, emoji: emoji, wrap: mustWrap};
      }, { result: 0 });
    }
    
    return e => {
      all('.comment_data .user_image_link:not(.done)', unspoilerSibling);
      all('.comment_data img.user_image:not(.done)', emotify);
    };
  })();
  
  const aliases = (_ => {
    function getUrls(txt) {
      txt = txt.match(/\[img\]([^\s]+)\[\/img\]/ig);
      if (!txt) return [];
      return txt.map(i => some({thick: i, thin: i.replace(/\[[\/]?img\](http[s]?:)?/ig,'')}));
    }

    function restore(txt) {
      console.log('aliases.restore');
      console.log(txt);
      txt = txt.replace(/\?wrap\=true/g, '');
      const urls = getUrls(txt);
      ExtraEmotesRegistry.emojis().forEach(emoji => {
        urls.filter(item => urlMatcher.match(item.thin, emoji.url)).forEach(item => {
            txt = replaceAll(item.thick, emoji.code, txt);
        });
      });
      console.log(txt);
      return txt;
    }

    function remove(txt) {
      console.log('aliases.remove');
      console.log(txt);
      ExtraEmotesRegistry.emojis().forEach(emoji => {
        txt = replaceAll(`\n ${emoji.code}`, `\n [img]http:${emoji.url}?wrap=true[/img]`, txt);
        txt = replaceAll(emoji.code, `[img]http:${emoji.url}[/img]`, txt);
      });
      console.log(txt);
      return txt;
    }

    return {
      swap: (textarea, func) => {
        const scrollTop = textarea.scrollTop;
        textarea.value = func(textarea.value);
        textarea.scrollTop = scrollTop;
        textarea.focus();
      },
      doRemove: remove,
      remove: textarea => aliases.swap(textarea, remove),
      restore: textarea => aliases.swap(textarea, restore)
    };
  })();
  
  const formHandler = e => all('textarea', e.target || e, aliases.remove);
  const submitHandler = (textarea, callback) => {
    const backup = textarea.value;
    aliases.remove(textarea);
    callback(() => aliases.swap(textarea, () => backup));
  };
  const saveHandler = (controller, callback, args) => {
    const last = [];
    all('textarea', controller.element, area => submitHandler(area, next => last.push(next)));
    const result = callback.apply(controller, args);
    last.forEach(l => l());
    return result;
  };
  
  const kniggySets = (_ => {
    let cachedSets;
    return {
      ready: _ => !!cachedSets,
      parse: controller => {
        if (cachedSets) return cachedSets; 
        let currentCategory = null;
        const sets = [];
        controller.emojiElements.forEach(e => {
          const cat = e.element.dataset.category;
          if (cat) {
            currentCategory = cat;
            sets[cat] = {
              element: e.element.outerHTML,
              button: `<li data-click="jumpTo" data-category="${cat}">${controller.getEmojiForCategory(cat)}</li>`,
              category: cat, 
              emojis: []
            };
          } else {
            sets[currentCategory].emojis.push({
              code: e.element.querySelector('[data-emoticon]').dataset.emoticon,
              name: e.element.dataset.name,
              element: e.element.outerHTML,
              keywords: e.keywords
            });
          }
        });
        return cachedSets = sets;
      },
      flatten: controller => {
        const elements = controller.emojiElements;
        elements.length = 0;
        const sets = ExtraEmotesRegistry.cats(cachedSets);
        sets.keys.forEach(set => {
          elements.push(sets.values[set]);
          elements.push.apply(elements, sets.values[set].emojis);
        });
        controller.elements.tabs.innerHTML = sets.keys.map(i => sets.values[i].button).join('');

        return elements;
      }
    }
  })();
  
  const addCss = _ => {
    const light = currentTheme() == 'light';
    const container_border_base = light ? '#bebab5' : '#333d4f',
          emoji_input_background = light ? '#fff' : '#252c39',
          emoji_input_foreground = light ? '#333' : '#a3abc3',
          emoji_input_shadow = 'rgba(0,0,0,0.1)',
          emoji_input_border = light ? '#aaa' : '#333d4f',
          emoji_header_background_min = light ? '#f8f8f8' : '#232a36',
          emoji_header_background_max = light ? '#f2f2f2' : '#333a46',
          emoji_header_border = light ? '#ddd' : container_border_base,
          emoji_focus_background = light ? '#eee' : '#336';
    updateStyle(`
.emoji-selector img, img.limited { max-height: 27px}

/*Make the emoticon picker not look like plot*/
.format-toolbar .emoji-selector .emoji-selector__search {
  background: none !important;
  padding: 3px !important;
  box-shadow: none;}
.emoji-selector__search input {
  width: 100%;
  margin: 0;
  padding: 5px;
  border-radius: 4px;
  background: ${emoji_input_background};
  color: ${emoji_input_foreground};
  box-shadow: inset 0 0 5px 3px ${emoji_input_shadow};
  border: solid 1px ${emoji_input_border};}
.format-toolbar .emoji-selector .emoji-selector__tabs,
.format-toolbar .emoji-selector .emoji-selector__list > li.emoji-selector__header {
  border-bottom: 1px solid ${emoji_header_border};
  border-top: 1px solid ${emoji_header_border};
  background: ${emoji_header_background_min} !important;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, ${emoji_header_background_min}), color-stop(100%, ${emoji_header_background_max})) !important;
  background: -webkit-linear-gradient(top, ${emoji_header_background_min} 0%, ${emoji_header_background_max} 100%) !important;
  background: linear-gradient(to bottom, ${emoji_header_background_min} 0%, ${emoji_header_background_max} 100%) !important;}
.format-toolbar .emoji-selector .emoji-selector__tabs li {
  background: none !important;
  box-shadow: none;}
.format-toolbar .emoji-selector .emoji-selector__tabs li:hover,
.format-toolbar .emoji-selector .emoji-selector__tabs li.selected {
  background: rgba(0,0,0,0.1) !important;}
.format-toolbar .emoji-selector .emoji-selector__list > li:hover {
    background: ${emoji_focus_background};
    border-radius: 4px;
    box-shadow: 0 0 0 3px ${emoji_focus_background};
}

.format-toolbar .emoji-selector .emoji-selector__list > li {
  margin: 4px;
  vertical-align: middle;}
.format-toolbar .emoji-selector .emoji-selector__list > li:hover {
  border-radius: 100% !important;}
.format-toolbar .emoji-selector .emoji-selector__list > li.emoji-selector__header:hover {
  border-radius: 0 !important;}
/*Center pony emoticon images vertically*/
.format-toolbar .emoji-selector .emoji-selector__list > li a {height: 36px;}
.format-toolbar .emoji-selector .emoji-selector__list > li img {margin-top: 5px;}
`, 'Extra_Emotes_Stylesheet');
  };
  
  document.addEventListener("DOMContentLoaded", tryRun(() => {
    if (!document.querySelector('.body_container')) return;

    if (document.location.href.indexOf('/manage_user/messages/') < 0) {
      if (isMyPage()) FimFicEvents.on('aftereditmodule', () => {
        all('.module_editing_form textarea', aliases.restore);
      });
      FimFicEvents.on('afterpagechange aftereditcomment afteraddcomment', unspoiler);
    }
    
    FimFicEvents.on('earlylistemoticons', e => {
      if (kniggySets.ready()) {
        console.log('cancelled bbcode ajax because we already have them.');
        e.event.preventDefault();
      }
    });
    
    addCss();
    
    window.addEventListener('darkmodechange', addCss);
    window.addEventListener('storage', c => {
      if (c.key == 'stylesheet') addCss();
    });
    
    function rebuildEmojiSets(controller) {
      if (!kniggySets.ready()) kniggySets.parse(controller);
      kniggySets.flatten(controller);
    }
    
    collide(override, [
      [NightModeController.prototype, 'update', function() {
        NightModeController.prototype.update.super.apply(this, arguments);
        window.dispatchEvent(new Event('darkmodechange'));
      }],
      [EmojiController.prototype, 'bind', function() {
        EmojiController.prototype.bind.super.apply(this, arguments);
        if (kniggySets.ready()) {
          this.searchedElements = this.emojiElements;
          this.render();
          App.BindAll(this.element);
        }
      }],
      [EmojiController.prototype, 'render', function() {
        rebuildEmojiSets(this);
        this.elements.list.innerHTML = this.searchedElements.map(a => a.element).join(''); // use html instead of dom nodes
      }],
      [EmojiController.prototype, 'search', function(term) {
        rebuildEmojiSets(this);
        if (!term) {
          this.searchedElements = this.emojiElements;
          return this.render(); //short-circuit unneccessary search (kniggy pls)
        }
        EmojiController.prototype.search.super.apply(this, arguments);
      }],
      [BBCodeEditorController.prototype, 'togglePreview', function() {
        return saveHandler(this, BBCodeEditorController.prototype.togglePreview.super, arguments);
      }],
      [NewCommentController.prototype, 'saveComment', function() {
        return saveHandler(this, NewCommentController.prototype.saveComment.super, arguments);
      }],
      [ComposePmController.prototype, 'send', function() {
        return saveHandler(this, ComposePmController.prototype.send.super, arguments);
      }],
      [UserPageController.prototype, 'saveModule', function() {
        return saveHandler(this, UserPageController.prototype.saveModule.super, arguments);
      }],
      [ChapterController.prototype, 'save', function() {
        return saveHandler(this, ChapterController.prototype.save.super, arguments);
      }],
      [CommentListController.prototype, 'toggleEditComment', function(sender) {
        const com = sender.closest('.comment');
        let rem = null;
        if (!com.querySelector('textarea')) {
          rem = FimFicEvents.on('afterpagechange', () => {
            all('textarea', com, aliases.restore);
            com.querySelector('.form-edit-comment').addEventListener('submit', () => all('textarea', com, aliases.remove));
            FimFicEvents.off('afterpagechange', rem);
          });
        }
        const res = CommentListController.prototype.toggleEditComment.super.apply(this, arguments);
        if (!rem) all('textarea', com, com.querySelector('.comment-edit.hidden') ? aliases.remove : aliases.restore);
        return res;
      }],
      [ChapterController.prototype, 'toggleEdit', function() {
        const res = ChapterController.prototype.toggleEdit.super.apply(this, arguments);
        all('textarea', this.element, this.editing ? aliases.restore : aliases.remove);
        return res;
      }]
    ]);
  }));
  
  return wind.ExtraEmotes = {
    getVersion: _ => version,
    addEmoticons: ExtraEmotesRegistry.EmojiSet, //Adds a collection of image emoticons
    addRaw: ExtraEmotesRegistry,                //Adds a collection of text emoticons
    addUrlMatcher: urlMatcher.add               //Adds a matching function to identify emoticon images by url
  };
})();
