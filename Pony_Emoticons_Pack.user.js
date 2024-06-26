// ==UserScript==
// @name        Pony Emoticons Pack
// @description Adds Pony themed emoticons to FimFiction.net.
// @author      Sollace
// @namespace   fimfiction-sollace
// @version     4
// @icon        http://sollace.github.io/emoticons/default/rainbowexcited.png
// @include     /^http?[s]://www.fimfiction.net/.*/
// @require     https://github.com/Sollace/Extra-Emoticons/raw/master/Core.user.js
// @grant       none
// @inject-into page
// @run-at      document-start
// ==/UserScript==

const dead_links = {
  '//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Redheart_gasp.png': '//sollace.github.io/emoticons/default/redheartgasp.png',
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteDimondMad_zps1373258d.png": "//sollace.github.io/emoticons/extended/dtmad.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteNyxUMad_zps22ef3b78.png": "//sollace.github.io/emoticons/nyxumad.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteNyxSly_zps98fe4bc2.png": "//sollace.github.io/emoticons/nyxsly.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteNyxHappy_zpse69a4147.png": "//sollace.github.io/emoticons/nyxhappy.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteSnowflakeYeah_zps44f65a3f.png": "//sollace.github.io/emoticons/yeah.png",
  "//i453.photobucket.com/albums/qq260/spacewings/ButtonStache_zps2e28ea66.png": "//sollace.github.io/emoticons/buttonstache.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteTom_zps20851d31.png": "//sollace.github.io/emoticons/extended/tom.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmoteTom2_zps51c59779.png": "//sollace.github.io/emoticons/extended/mandy.png",
  "//i453.photobucket.com/albums/qq260/spacewings/EmZecora_zpscd7ac24a.png": "//sollace.github.io/emoticons/default/zecora.png"
}
const removed_links = [
  "//dl.dropbox.com/u/31471793/FiMFiction/Derpy_Hooves_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Queen_Chrysalis.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Celestia.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Scootaloo_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Sweetie_Belle_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Pinkie_Pie_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Vinyl_Scratch_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Luna_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Twilight_Sparkle_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Rainbow_Dash_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Fluttershy_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Rarity_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Trixie_lolface_2.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Spike_lolface.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Redheart_smile.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Soarin_Dayum.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_Dayum.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_rape.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sad.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sexy.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_happy.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_oohh.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra_dealwithit.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Lyra_cry.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_gaze.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_gawk.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_grin.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_OMG_LOVE.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_cake.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_chair.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_something.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_rape.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_plot.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia_O_O.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_glare.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_mad.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_sad.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Derpy_Hooves.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Derpy_Hooves.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Scootaloo.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Sweetie_Belle.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_TwilightWut.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Pinkie_loool.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Cloudchaser_glasses.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_beam.png",
  "//dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_gaze.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Rainbow_Dash.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Luna_apple.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Queen_Chrysalis.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Twilight_Sparkle.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Twilight_crazy.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy_umad.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/Mr_Cake.png",
  "//dl.dropbox.com/u/31471793/FiMFiction/discord.png"
]

ExtraEmotes.addUrlMatcher(function(url, match) {
  if (url.indexOf('i.imgur.com') != -1) {
    url = url.split('/').reverse()[0].split('.')[0];
    match = match.split('_').reverse()[0].split('.')[0];
    return url == match;
  }
  return false;
});
ExtraEmotes.addUrlMatcher(function(url, match) {
  if (removed_links.indexOf(url) > -1) return match.indexOf('tom.png') > -1;
  return dead_links[url] == match;
});

ExtraEmotes.addEmoticons("x", "Default", "Extra", ([
  "http://sollace.github.io/emoticons/default/rainbowexcited.png",
  "http://sollace.github.io/emoticons/default/rainbowcat2.png",
  "http://sollace.github.io/emoticons/fimfic/nerdgasm-d72140i.png|nerdgasm",
  "http://sollace.github.io/emoticons/fimfic/twieww-d72140f.png|twieww",
  "http://sollace.github.io/emoticons/fimfic/fitwi-d7252jt.png|fitwi",
  "http://sollace.github.io/emoticons/fimfic/plotpie-d7251q8.png|plotpie",
  "http://sollace.github.io/emoticons/fimfic/plotpie2-d7251q5.png|plotpie2",
  "http://sollace.github.io/emoticons/fimfic/flirtypie-d7251py.png|flitrypie",
  "http://sollace.github.io/emoticons/fimfic/nompie-d7251pu.png|nompie",
  "http://sollace.github.io/emoticons/fimfic/piegasm-d7251pn.png|piegasm",
  "http://sollace.github.io/emoticons/fimfic/hapie-d7251pk.png|hapie",
  "http://sollace.github.io/emoticons/fimfic/pinkieplot-d7251pb.png|pinkieplot",
  "http://sollace.github.io/emoticons/fimfic/meaniepie-d7259oq.png|meaniepie",
  "http://sollace.github.io/emoticons/fimfic/maud-d7eb0mc.png|maud",
  "http://sollace.github.io/emoticons/fimfic/loves_rocks-d7eb3je.png|loves_rocks",
  "http://sollace.github.io/emoticons/fimfic/cslyra-d7220ek.png|cslyra",
  "http://sollace.github.io/emoticons/fimfic/schmoopie-d7213zs.png|schmoopie",
  "http://sollace.github.io/emoticons/fimfic/lovelee-d72141j.png|lovelee",
  "http://sollace.github.io/emoticons/fimfic/confusedlee-d72141b.png|confusedlee",
  "http://sollace.github.io/emoticons/fimfic/80slee-d72140p.png|80slee",
  "http://sollace.github.io/emoticons/fimfic/smilee-d72145b.png|smilee",
  "http://sollace.github.io/emoticons/fimfic/cheersilee-d72140d.png|cheersilee",
  "http://sollace.github.io/emoticons/fimfic/derpilee-d7213zo.png|derpilee",
  "http://sollace.github.io/emoticons/fimfic/naughtilee-d7213zj.png|naughtilee",
  "http://sollace.github.io/emoticons/fimfic/pisst-d7213zv.png|pisst",
  "http://sollace.github.io/emoticons/fimfic/dawwtwist-d72140m.png|dawwtwist",
  "http://sollace.github.io/emoticons/fimfic/thpring-d721404.png|thpring",
  "http://sollace.github.io/emoticons/fimfic/sorrytwist-d721405.png|sorrytwist",
  "http://sollace.github.io/emoticons/fimfic/madtwist-d721409.png|madtwist",
  "http://sollace.github.io/emoticons/fimfic/ootwist-d7213zw.png|ootwist",
  "http://sollace.github.io/emoticons/fimfic/kissaloo-d7lso4c.png|kissaloo",
  "http://sollace.github.io/emoticons/fimfic/roseluck-d7wi620.png|roseluck",
  "http://sollace.github.io/emoticons/fimfic/flitter-d7wi62v.png|flitter_blush",
  "http://sollace.github.io/emoticons/fimfic/starlighttriggered.png",
  "http://sollace.github.io/emoticons/default/trixie.png",
  "http://sollace.github.io/emoticons/default/twilightwat.png",
  "http://sollace.github.io/emoticons/fimfic/twiscepter_J8FwB24.png|twiscepter",
  "http://sollace.github.io/emoticons/fimfic/bloomscepter_CjCo3YR.png|bloomscepter",
  "http://sollace.github.io/emoticons/fimfic/sweetiescepter_IFkl4RG.png|sweetiescepter",
  "http://sollace.github.io/emoticons/fimfic/scootscepter_j0bYpQa.png|scootscepter",
  "http://sollace.github.io/emoticons/fimfic/molestia-d71qbk9.png|molestia",
  "http://sollace.github.io/emoticons/extended/dtmad.png",
  "http://sollace.github.io/emoticons/default/redheartgasp.png",
  "http://sollace.github.io/emoticons/extended/nyxumad.png",
  "http://sollace.github.io/emoticons/extended/nyxsly.png",
  "http://sollace.github.io/emoticons/extended/nyxhappy.png",
  "http://sollace.github.io/emoticons/extended/yeah.png",
  "http://sollace.github.io/emoticons/extended/buttonstache.png",
  "http://sollace.github.io/emoticons/default/zecora.png",
  "http://sollace.github.io/emoticons/extended/tom.png",
  "http://sollace.github.io/emoticons/extended/mandy.png"
]));

ExtraEmotes.addEmoticons("c", "Clap", "Clap", [
  "http://orig04.deviantart.net/3db3/f/2012/363/1/e/clapping_pony_icon___twilight_sparkle_by_taritoons-d5pkpl8.gif",
  "http://orig07.deviantart.net/0145/f/2012/363/7/9/clapping_pony_icon___rarity_by_taritoons-d5pksh9.gif",
  "http://orig09.deviantart.net/e3f6/f/2012/363/c/f/clapping_pony_icon___applejack_by_taritoons-d5pkxsu.gif",
  "http://orig10.deviantart.net/39db/f/2012/363/2/f/clapping_pony_icon___rainbow_dash_by_taritoons-d5pkzrg.gif",
  "http://orig08.deviantart.net/e8b4/f/2012/363/c/3/clapping_pony_icon___fluttershy_by_taritoons-d5pl2gh.gif",
  "http://orig03.deviantart.net/e7f9/f/2012/363/f/6/clapping_pony_icon___pinkie_pie_by_taritoons-d5pkuzy.gif",
  "http://sollace.github.io/emoticons/clap/discord-d8vpbw9.gif|discord",
  "http://sollace.github.io/emoticons/clap/maud-d7ee4tv.gif|maud",
  "http://orig03.deviantart.net/341c/f/2013/056/f/4/clapping_pony_icon___shining_armor_by_taritoons-d5w67ti.gif",
  "http://sollace.github.io/emoticons/clap/fancy_pants-d8drj8h.gif|fancy_pants",
  "http://orig08.deviantart.net/4237/f/2012/366/8/8/clapping_pony_icon___trixie_by_taritoons-d5pw36r.gif",
  "http://orig03.deviantart.net/49c6/f/2012/363/d/4/clapping_derpy_hooves_icon_by_shroomehtehponeh-d5pm8c9.gif",
  "http://orig06.deviantart.net/d00a/f/2012/363/4/3/clapping_pony_icon___lyra_heartstrings_by_travispony-d5pl0kc.gif",
  "http://orig06.deviantart.net/7231/f/2012/363/0/9/clapping_pony_icon___sweetie_drops_bonbon_by_travispony-d5pll1i.gif",
  "http://orig11.deviantart.net/fa66/f/2012/366/d/5/clapping_pony_icon___vinyl_scratch_by_taritoons-d5pw0yp.gif",
  "http://sollace.github.io/emoticons/clap/octavia-d6yq9am.gif|octavia",
  "http://orig14.deviantart.net/0d00/f/2013/003/7/8/clapping_pony_icon___applebloom_by_taritoons-d5q9yfg.gif",
  "http://orig10.deviantart.net/8c00/f/2013/056/8/9/clapping_pony_icon___scootaloo_by_taritoons-d5w610a.gif",
  "http://orig07.deviantart.net/90f7/f/2013/056/7/f/clapping_pony_icon___sweetie_belle_by_taritoons-d5w5zt5.gif",
  "http://sollace.github.io/emoticons/clap/snowdrop-d6xkrjj.gif|snowdrop",
  "http://sollace.github.io/emoticons/clap/dinky-d6ymjpt.gif|dinky",
  "http://orig00.deviantart.net/2b9e/f/2013/056/1/8/clapping_pony_icon___babs_seed_by_taritoons-d5w61z0.gif",
  "http://orig03.deviantart.net/5c7c/f/2013/001/c/9/clapping_pony_icon___princess_celestia_by_taritoons-d5pozf0.gif",
  "http://orig06.deviantart.net/cfa6/f/2013/001/b/5/clapping_pony_icon___princess_luna_by_taritoons-d5prurt.gif",
  "http://orig00.deviantart.net/1686/f/2012/364/3/a/clapping_pony_icon___princess_cadence_by_taritoons-d5pon2h.gif",
  "http://orig13.deviantart.net/b456/f/2013/001/7/e/clapping_pony_icon___nightmare_moon_by_taritoons-d5prx8v.gif",
  "http://orig05.deviantart.net/3778/f/2013/002/7/b/clapping_pony_icon___soarin___wonderbolt_uniform_by_taritoons-d5q6w8j.gif",
  "http://orig12.deviantart.net/0d99/f/2013/002/0/3/clapping_pony_icon___spitfire___wonderbolt_uniform_by_taritoons-d5q5mj8.gif",
  "http://orig02.deviantart.net/3507/f/2012/365/c/a/clapping_pony_icon___changeling_by_taritoons-d5ps0kg.gif",
  "http://orig02.deviantart.net/6711/f/2012/365/e/0/clapping_pony_icon___queen_chrysalis_by_taritoons-d5pshyl.gif",
  "http://orig05.deviantart.net/c65c/f/2013/308/0/6/daring_do_clap_clap___by_xingyaru-d6t0c4f.gif|daring_do",
  "http://orig11.deviantart.net/be54/f/2013/002/3/a/clapping_pony_icon___minuette_by_travispony-d5q5x0z.gif|colgate",
  "http://orig06.deviantart.net/89bf/f/2013/336/5/7/13860064636854_by_blknblupanther-d6whl0i.gif|sunset_shimmer",
  "http://orig08.deviantart.net/dcb0/f/2013/343/1/d/z_by_blknblupanther-d6xef1w.gif|zecora",
  "http://orig14.deviantart.net/8add/f/2013/177/c/d/flash_sentry__2__by_jamaythemunker-d6arwlb.gif|flash_sentry",
  "http://orig09.deviantart.net/07cd/f/2012/364/d/1/clapping_pony_icon___time_turner_by_travispony-d5pob3v.gif|dr_hooves",
  "http://orig08.deviantart.net/6e4a/f/2013/056/a/3/clapping_pony_icon___braeburn_by_taritoons-d5w65tv.gif",
  "http://sollace.github.io/emoticons/clap/bat_pony-d6xnck7.gif|bat_pony",
  "http://sollace.github.io/emoticons/clap/nyx-d6y1o60.gif|nyx",
  "http://sollace.github.io/emoticons/clap/flutterbat-d76qgbd.gif|flutterbat",
  "http://sollace.github.io/emoticons/clap/applejewel-d76qgay.gif|applejewel",
  "http://sollace.github.io/emoticons/clap/twiscepter-d6ymjpx.gif|twicane",
  "http://sollace.github.io/emoticons/clap/sollace-d6ymjq8.gif|sollace"
], false);
