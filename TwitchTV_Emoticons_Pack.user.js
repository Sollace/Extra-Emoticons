// ==UserScript==
// @name        TwitchTV Emoticons Pack
// @description Adds all emoticons from Twitch.tv to FimFiction.net
// @author      Sollace
// @namespace   fimfiction-sollace
// @version     2.3.1
// @icon        http://sollace.github.io/emoticons/twitch/twitch.png
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @require     http://code.jquery.com/jquery-1.8.3.min.js
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/Logger.js
// @require     https://github.com/Sollace/UserScripts/raw/Dev/Internal/FimQuery.core.js
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/Events.user.js
// @require     https://github.com/Sollace/Extra-Emoticons/raw/master/Core.user.js
// @grant       none
// ==/UserScript==

function twitchify(emotes) {
  for (var i = 0; i < emotes.length; i++) {
    if (emotes[i].indexOf('http') != 0) {
      emotes[i] = 'http://sollace.github.io/emoticons/twitch/' + emotes[i];
    }
  }
  return emotes;
}

ExtraEmotes.addUrlMatcher(function(url, match) {
  if (url.indexOf('www.chatslang.com') != -1) {
    url = url.split('/').reverse()[0].split('.')[0];
    match = match.split('/').reverse()[0].split('.')[0];
    return url == match;
  }
  return false;
});

ExtraEmotes.addEmoticons("tt", "Twitch", "Twitch", twitchify([
//Twitch
"smile.png",
"sad.png",
"big_grin.png",
"angry.png",
"bored.png",
"confused.png",
"cool.png",
"surprised.png",
"undecided.png",
"winking.png",
"sticking_tongue_out.png",
"wink.png",
"pirate.png",
"heart.png",

//Twitch Turbo
"purple/smile.png|:t:smile",
"purple/sad.png|:t:sad",
"purple/big_grin.png|:t:big_grin",
"purple/angry.png|:t:angry",
"purple/sleeping.png|:t:sleeping",
"purple/confused.png|:t:confused",
"purple/cool.png|:t:cool",
"purple/surprised.png|:t:surprised",
"purple/heart.png|:t:heart",
"purple/undecided.png|:t:undecided",
"purple/winking.png|:t:winking",
"purple/sticking_tongue_out.png|:t:sticking_tongue_out",
"purple/winking_with_tongue_out.png|:t:wink",
"purple/pirate.png|:t:pirate",

//Monkey Faces
"monkey/smile.png|:m:smile",
"monkey/sad.png|:m:sad",
"monkey/big_grin.png|:m:big_grin",
"monkey/angry.png|:m:angry",
"monkey/sleeping.png|:m:sleeping",
"monkey/confused.png|:m:confused",
"monkey/cool.png|:m:cool",
"monkey/surprised.png|:m:surprised",
"monkey/in_love.png|:m:in_love",
"monkey/love_it.png|:m:love_it",
"monkey/undecided.png|:m:undecided",
"monkey/winking.png|:m:winking",
"monkey/sticking_tongue_out.png|:m:sticking_tongue_out",
"monkey/crazy.png|:m:crazy",
"monkey/dunce.png|:m:dunce",
"monkey/mouth_shut.png|:m:mouth_shut",
"monkey/ninja.png|:m:ninja",
"monkey/pirate.png|:m:pirate",
"monkey/smoking.png|:m:smoking",

"twitch.png"
]).reverse());