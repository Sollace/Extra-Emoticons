// ==UserScript==
// @name        Round Stables Pony Pack
// @description Adds Pony themed emoticons to FimFiction.net.
// @author      Sollace
// @namespace   fimfiction-sollace
// @version     3
// @icon        http://www.roundstable.com/forums/images/smilies/DashEmote2.png
// @include     /^http?[s]://www.fimfiction.net/.*/
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/FimQuery.core.js
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/Events.user.js
// @require     https://github.com/Sollace/Extra-Emoticons/raw/master/Core.user.js
// @grant       none
// @run-at      document-start
// ==/UserScript==

ExtraEmotes.addEmoticons("rs", "RoundStable", "Round Stable", ([
"http://www.roundstable.com/forums/images/smilies/rainbow3.png|rainbowsmile",
"http://www.roundstable.com/forums/images/smilies/dash-shutup.png|rainbowangry",
"http://www.roundstable.com/forums/images/smilies/maddash.png|rainbowmad",
"http://www.roundstable.com/forums/images/smilies/dashhat.png",
"http://www.roundstable.com/forums/images/smilies/saddash.png|rainbowsad",
"http://www.roundstable.com/forums/images/smilies/offendash.png|rainbowoffended",
"http://www.roundstable.com/forums/images/smilies/emot-rd-leer.png|rainbowleer",
"http://www.roundstable.com/forums/images/smilies/mlp-what.png|what",
"http://www.roundstable.com/forums/images/smilies/mlp_allears.png|allears",
"http://www.roundstable.com/forums/images/smilies/ajskeptic2.png",
"http://www.roundstable.com/forums/images/smilies/ajuh.png",
"http://www.roundstable.com/forums/images/smilies/applejargh.gif",
"http://www.roundstable.com/forums/images/smilies/appletalism.png",
"http://www.roundstable.com/forums/images/smilies/isee.png",
"http://www.roundstable.com/forums/images/smilies/kind-of-yall.png",
"http://www.roundstable.com/forums/images/smilies/liarjack.gif",
"http://www.roundstable.com/forums/images/smilies/bloomgah.png",
"http://www.roundstable.com/forums/images/smilies/flail.gif",
"http://www.roundstable.com/forums/images/smilies/dreamworks.png",
"http://www.roundstable.com/forums/images/smilies/flutterlip.png",
"http://www.roundstable.com/forums/images/smilies/flutterrage.png",
"http://www.roundstable.com/forums/images/smilies/flutterunsmith.png",
"http://www.roundstable.com/forums/images/smilies/modestshy.png",
"http://www.roundstable.com/forums/images/smilies/flutterhooray.gif",
"http://www.roundstable.com/forums/images/smilies/tabeflip.png",
"http://www.roundstable.com/forums/images/smilies/excellent.gif",
"http://www.roundstable.com/forums/images/smilies/cheese.png",
"http://www.roundstable.com/forums/images/smilies/party.png|pinkieparty",
"http://www.roundstable.com/forums/images/smilies/pinkamena.png",
"http://www.roundstable.com/forums/images/smilies/rimshot.gif",
"http://www.roundstable.com/forums/images/smilies/pinkie_p.png|pinkietongue",
"http://www.roundstable.com/forums/images/smilies/pinkiewaugh.png",
"http://www.roundstable.com/forums/images/smilies/yesssss.png",
"http://www.roundstable.com/forums/images/smilies/smile.png|pinkiesmile",
"http://www.roundstable.com/forums/images/smilies/tinfoil.png",
"http://www.roundstable.com/forums/images/smilies/wantitneedit.png",
"http://www.roundstable.com/forums/images/smilies/dingdingding.png",
"http://www.roundstable.com/forums/images/smilies/facehoof.png",
"http://www.roundstable.com/forums/images/smilies/flattered.png",
"http://www.roundstable.com/forums/images/smilies/mlp_eek.png|eek",
"http://www.roundstable.com/forums/images/smilies/mlp_rolleyes.png|rolleyes",
"http://www.roundstable.com/forums/images/smilies/excite.gif",
"http://www.roundstable.com/forums/images/smilies/mlp_smirk.png|twismirk",
"http://www.roundstable.com/forums/images/smilies/twiright.png",
"http://www.roundstable.com/forums/images/smilies/twismug2.png",
"http://www.roundstable.com/forums/images/smilies/twiwhat.png",
"http://www.roundstable.com/forums/images/smilies/noooo.png|spikenooo",
"http://www.roundstable.com/forums/images/smilies/spikeletter.png",
"http://www.roundstable.com/forums/images/smilies/emot-rarity-tears.png|raricry",
"http://www.roundstable.com/forums/images/smilies/mlp-vogue.png|vogue",
"http://www.roundstable.com/forums/images/smilies/rariaah.png",
"http://www.roundstable.com/forums/images/smilies/rariwat.png",
"http://www.roundstable.com/forums/images/smilies/rariwhine.png",
"http://www.roundstable.com/forums/images/smilies/rariwink.png",
"http://www.roundstable.com/forums/images/smilies/stararity.old.png",
"http://www.roundstable.com/forums/images/smilies/sadrarity.old.png",
"http://www.roundstable.com/forums/images/smilies/smirk.png|sweetiesmirk",
"http://www.roundstable.com/forums/images/smilies/sweetiefrown.png",
"http://www.roundstable.com/forums/images/smilies/sweetieyes.png",
"http://www.roundstable.com/forums/images/smilies/milkshakes.gif",
"http://www.roundstable.com/forums/images/smilies/scootsmile.png",
"http://www.roundstable.com/forums/images/smilies/nnghaloo.png",
"http://www.roundstable.com/forums/images/smilies/awwtwist.png",
"http://www.roundstable.com/forums/images/smilies/twisthi.png",
"http://www.roundstable.com/forums/images/smilies/twistsay.png",
"http://www.roundstable.com/forums/images/smilies/awesomecheer.png",
"http://www.roundstable.com/forums/images/smilies/memories.png",
"http://www.roundstable.com/forums/images/smilies/inquisitive.png",
"http://www.roundstable.com/forums/images/smilies/celmmmmf.png",
"http://www.roundstable.com/forums/images/smilies/octiglare.png|octaviaglare",
"http://www.roundstable.com/forums/images/smilies/snobtavia.png|octaviasnob",
"http://www.roundstable.com/forums/images/smilies/lilyaah.png",
"http://www.roundstable.com/forums/images/smilies/diagnosisponies.png",
"http://www.roundstable.com/forums/images/smilies/evil.png",
"http://www.roundstable.com/forums/images/smilies/smugtrixie.png",
"http://www.roundstable.com/forums/images/smilies/socks.png"]));