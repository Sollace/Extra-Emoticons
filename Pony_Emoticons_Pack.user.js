// ==UserScript==
// @name        Pony Emoticons Pack
// @description Adds Pony themed emoticons to FimFiction.net.
// @author      Sollace
// @namespace   fimfiction-sollace
// @version     2.4
// @icon        http://fc00.deviantart.net/fs70/f/2014/013/0/2/nerdgasm_by_comeha-d72140i.png
// @include     http://www.fimfiction.net/*
// @include     https://www.fimfiction.net/*
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/Logger.js
// @require     https://github.com/Sollace/UserScripts/raw/master/Internal/FimQuery.core.js
// @require     https://github.com/Sollace/Extra-Emoticons/raw/master/Core.user.js
// @grant       none
// ==/UserScript==

ExtraEmotes.addEmoticons("x", "Dropbox", "Extra", ([
"http://fc00.deviantart.net/fs70/f/2014/013/0/2/nerdgasm_by_comeha-d72140i.png",
"http://fc05.deviantart.net/fs70/f/2014/013/8/1/twieww_by_comeha-d72140f.png",
"http://fc09.deviantart.net/fs70/f/2014/014/c/3/fitwi_by_comeha-d7252jt.png",
"http://fc07.deviantart.net/fs71/f/2014/014/6/b/plotpie_by_comeha-d7251q8.png",
"http://fc09.deviantart.net/fs71/f/2014/014/7/3/plotpie2_by_comeha-d7251q5.png",
"http://fc03.deviantart.net/fs70/f/2014/014/f/0/flirtypie_by_comeha-d7251py.png",
"http://fc00.deviantart.net/fs70/f/2014/014/7/8/nompie_by_comeha-d7251pu.png",
"http://fc00.deviantart.net/fs71/f/2014/014/5/1/piegasm_by_comeha-d7251pn.png",
"http://fc02.deviantart.net/fs71/f/2014/014/a/8/hapie_by_comeha-d7251pk.png",
"http://fc07.deviantart.net/fs71/f/2014/014/8/d/pinkieplot_by_comeha-d7251pb.png",
"http://fc08.deviantart.net/fs70/f/2014/014/e/1/meaniepie_by_comeha-d7259oq.png",
"http://fc02.deviantart.net/fs70/f/2014/103/7/3/maud_by_comeha-d7eb0mc.png",
"http://fc04.deviantart.net/fs70/f/2014/103/c/f/loves_rocks_by_comeha-d7eb3je.png",
"http://fc01.deviantart.net/fs71/f/2014/013/d/b/cslyra_by_comeha-d7220ek.png",
"http://fc06.deviantart.net/fs71/f/2014/153/f/b/schmoopie_by_comeha-d7213zs.png",
"http://fc00.deviantart.net/fs70/f/2014/013/3/1/lovelee_by_comeha-d72141j.png",
"http://fc04.deviantart.net/fs71/f/2014/013/d/d/confusedlee_by_comeha-d72141b.png",
"http://fc01.deviantart.net/fs71/f/2014/013/e/f/80slee_by_comeha-d72140p.png",
"http://fc02.deviantart.net/fs70/f/2014/013/0/0/smilee_by_comeha-d72145b.png",
"http://fc09.deviantart.net/fs70/f/2014/013/4/1/cheersilee_by_comeha-d72140d.png",
"http://fc05.deviantart.net/fs70/f/2014/013/8/b/derpilee_by_comeha-d7213zo.png",
"http://fc04.deviantart.net/fs71/f/2014/013/8/f/naughtilee_by_comeha-d7213zj.png",
"http://fc06.deviantart.net/fs70/f/2014/153/f/a/pisst_by_comeha-d7213zv.png",
"http://fc04.deviantart.net/fs71/f/2014/013/7/7/dawwtwist_by_comeha-d72140m.png",
"http://fc04.deviantart.net/fs71/f/2014/013/a/d/thpring_by_comeha-d721404.png",
"http://fc03.deviantart.net/fs70/f/2014/013/f/5/sorrytwist_by_comeha-d721405.png",
"http://fc04.deviantart.net/fs70/f/2014/013/9/0/madtwist_by_comeha-d721409.png",
"http://fc08.deviantart.net/fs71/f/2014/013/2/0/ootwist_by_comeha-d7213zw.png",
"http://fc08.deviantart.net/fs71/f/2014/161/d/b/kissaloo_by_comeha-d7lso4c.png",
"http://fc07.deviantart.net/fs70/f/2014/236/8/a/roseluck_by_comeha-d7wi620.png",
"http://fc07.deviantart.net/fs70/f/2014/236/0/b/flutter_blush_by_comeha-d7wi62v.png|flitter_blush",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDimondMad_zps1373258d.png|dtiara_mad",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Redheart_gasp.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Redheart_smile.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Soarin_Dayum.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_Dayum.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_rape.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Spit_sexy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_happy.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Lyra_oohh.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Lyra_dealwithit.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Lyra_cry.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_gaze.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_gawk.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Bon_grin.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Bonbon_OMG_LOVE.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_cake.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_chair.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_something.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_rape.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Octy_plot.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Octavia_O_O.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_glare.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_mad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny_sad.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Viny.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Derpy_Hooves.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Derpy_Hooves.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Derpy_Hooves_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Scootaloo.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Sweetie_Belle.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Queen_Chrysalis.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/lolface_Celestia.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_TwilightWut.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_RageFace.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Pinkie_loool.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Scootaloo_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Sweetie_Belle_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Pinkie_Pie_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Vinyl_Scratch_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Luna_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Twilight_Sparkle_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Rainbow_Dash_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Fluttershy_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Rarity_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Trixie_lolface_2.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Spike_lolface.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_rainbowkiss_flip.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_rainbowderp_flip.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Cloudchaser_glasses.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_beam.png",
"http://dl.dropbox.com/u/21167245/FiMFiction/Emoticons/misc_Colgate_gaze.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/sillyfilly_Rainbow_Dash.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Luna_apple.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Queen_Chrysalis.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/shrug_Twilight_Sparkle.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Emoticons/misc_Twilight_crazy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_Fluttershy_umad.png",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxUMad_zps22ef3b78.png|nyx_umad",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxSly_zps98fe4bc2.png|nyx_sly",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxHappy_zpse69a4147.png|nyx_happy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSnowflakeYeah_zps44f65a3f.png|snowflake_yeah",
"http://dl.dropbox.com/u/31471793/FiMFiction/emoticons/misc_YouDontSay2.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/eenope.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/Mr_Cake.png",
"http://dl.dropbox.com/u/31471793/FiMFiction/discord.png",
"http://i.imgur.com/J8FwB24.png|twiscepter",
"http://i.imgur.com/CjCo3YR.png|bloomsceptr",
"http://i.imgur.com/IFkl4RG.png|sweetiescepter",
"http://i.imgur.com/j0bYpQa.png|scootscepter",
"http://i453.photobucket.com/albums/qq260/spacewings/EmZecora_zpscd7ac24a.png|zecora",
"http://i453.photobucket.com/albums/qq260/spacewings/ButtonStache_zps2e28ea66.png|button_stache",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTom_zps20851d31.png|tom",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTom2_zps51c59779.png|mandy",
"http://fc02.deviantart.net/fs70/f/2013/357/9/7/hoof_up_by_comeha-d6z0jqb.png|hoof_up",
"http://fc09.deviantart.net/fs71/f/2013/357/3/d/hoof_down_by_comeha-d6z0jqf.png|hoof_down",
"http://fc09.deviantart.net/fs70/f/2013/357/a/1/2_hoofs_up_by_comeha-d6z0lto.png|2_hoofs_up",
"http://fc04.deviantart.net/fs71/f/2013/357/c/0/fave_by_comeha-d6z0jqh.png|faved",
"http://fc07.deviantart.net/fs71/f/2013/357/a/f/later_by_comeha-d6z0jq9.png|read_later",
"http://i.imgur.com/1LNo58W.png|watch",
"http://fc04.deviantart.net/fs70/f/2014/011/1/6/molestia_by_comeha-d71qbk9.png"
]).reverse());

ExtraEmotes.addEmoticons("c", "Clap", "Clap", [
"http://fc06.deviantart.net/fs71/f/2013/354/a/c/clapping_pony_icon___sollace_by_comeha-d6ymjq8.gif",
"http://fc08.deviantart.net/fs71/f/2014/073/0/0/clapping_pony_icon___twiscepter_by_comeha-d6ymjpx.gif",
"http://fc00.deviantart.net/fs71/f/2014/047/c/2/clapping_pony_icon___applejewel_by_comeha-d76qgay.gif",
"http://fc02.deviantart.net/fs71/f/2014/047/e/6/clapping_pony_icon___flutterbat_by_comeha-d76qgbd.gif",
"http://fc02.deviantart.net/fs70/f/2013/349/d/7/clapping_pony_icon___nyx_by_comeha-d6y1o60.gif",
"http://fc09.deviantart.net/fs70/f/2013/346/b/7/clapping_pony_icon___bat_pony_by_comeha-d6xnck7.gif",
"http://fc02.deviantart.net/fs71/f/2013/056/a/3/clapping_pony_icon___braeburn_by_taritoons-d5w65tv.gif",
"http://fc06.deviantart.net/fs70/f/2012/364/d/1/clapping_pony_icon___time_turner_by_travispony-d5pob3v.gif|dr_hooves",
"http://fc09.deviantart.net/fs70/f/2013/177/c/d/flash_sentry__2__by_jamaythemunker-d6arwlb.gif|flash_sentry",
"http://fc07.deviantart.net/fs70/f/2013/343/1/d/z_by_blknblupanther-d6xef1w.gif|zecora",
"http://fc00.deviantart.net/fs71/f/2013/336/5/7/13860064636854_by_blknblupanther-d6whl0i.gif|sunset_shimmer",
"http://fc04.deviantart.net/fs70/f/2013/002/3/a/clapping_pony_icon___minuette_by_travispony-d5q5x0z.gif|colgate",
"http://fc04.deviantart.net/fs71/f/2013/308/0/6/daring_do_clap_clap___by_xingyaru-d6t0c4f.gif|daring_do",
"http://fc08.deviantart.net/fs70/f/2012/365/e/0/clapping_pony_icon___queen_chrysalis_by_taritoons-d5pshyl.gif",
"http://fc05.deviantart.net/fs71/f/2012/365/c/a/clapping_pony_icon___changeling_by_taritoons-d5ps0kg.gif",
"http://fc04.deviantart.net/fs71/f/2013/002/0/3/clapping_pony_icon___spitfire___wonderbolt_uniform_by_taritoons-d5q5mj8.gif",
"http://fc08.deviantart.net/fs71/f/2013/002/7/b/clapping_pony_icon___soarin___wonderbolt_uniform_by_taritoons-d5q6w8j.gif",
"http://fc02.deviantart.net/fs70/f/2013/001/7/e/clapping_pony_icon___nightmare_moon_by_taritoons-d5prx8v.gif",
"http://fc08.deviantart.net/fs71/f/2012/364/3/a/clapping_pony_icon___princess_cadence_by_taritoons-d5pon2h.gif",
"http://fc00.deviantart.net/fs70/f/2013/001/b/5/clapping_pony_icon___princess_luna_by_taritoons-d5prurt.gif",
"http://fc04.deviantart.net/fs70/f/2013/001/c/9/clapping_pony_icon___princess_celestia_by_taritoons-d5pozf0.gif",
"http://fc06.deviantart.net/fs71/f/2013/056/1/8/clapping_pony_icon___babs_seed_by_taritoons-d5w61z0.gif",
"http://fc03.deviantart.net/fs71/f/2013/354/d/d/clapping_pony_icon___dinky_hooves_by_comeha-d6ymjpt.gif",
"http://fc07.deviantart.net/fs71/f/2013/345/b/0/clapping_pony_icon___snowdrop_by_comeha-d6xkrjj.gif",
"http://fc09.deviantart.net/fs71/f/2013/056/7/f/clapping_pony_icon___sweetie_belle_by_taritoons-d5w5zt5.gif",
"http://fc00.deviantart.net/fs71/f/2013/056/8/9/clapping_pony_icon___scootaloo_by_taritoons-d5w610a.gif",
"http://fc04.deviantart.net/fs70/f/2013/003/7/8/clapping_pony_icon___applebloom_by_taritoons-d5q9yfg.gif",
"http://fc01.deviantart.net/fs71/f/2013/354/9/1/clapping_pony_icon___octavia_by_comeha-d6yq9am.gif",
"http://fc05.deviantart.net/fs71/f/2012/366/d/5/clapping_pony_icon___vinyl_scratch_by_taritoons-d5pw0yp.gif",
"http://fc04.deviantart.net/fs70/f/2012/363/0/9/clapping_pony_icon___sweetie_drops_bonbon_by_travispony-d5pll1i.gif",
"http://fc06.deviantart.net/fs71/f/2012/363/4/3/clapping_pony_icon___lyra_heartstrings_by_travispony-d5pl0kc.gif",
"http://fc03.deviantart.net/fs70/f/2012/363/d/4/clapping_derpy_hooves_icon_by_shroomehtehponeh-d5pm8c9.gif",
"http://fc05.deviantart.net/fs70/f/2012/366/8/8/clapping_pony_icon___trixie_by_taritoons-d5pw36r.gif",
"http://fc01.deviantart.net/fs71/f/2015/013/e/4/clapping_pony_icon___fancy_pants_by_comeha-d8drj8h.gif",
"http://fc00.deviantart.net/fs71/f/2013/056/f/4/clapping_pony_icon___shining_armor_by_taritoons-d5w67ti.gif",
"http://fc09.deviantart.net/fs71/f/2014/103/a/1/maud_by_comeha-d7ee4tv.gif",
"http://orig10.deviantart.net/d992/f/2015/153/1/0/clapping_pony_icon___discord_by_comeha-d8vpbw9.gif",
"http://fc04.deviantart.net/fs70/f/2012/363/f/6/clapping_pony_icon___pinkie_pie_by_taritoons-d5pkuzy.gif",
"http://fc01.deviantart.net/fs71/f/2012/363/c/3/clapping_pony_icon___fluttershy_by_taritoons-d5pl2gh.gif",
"http://fc00.deviantart.net/fs70/f/2012/363/2/f/clapping_pony_icon___rainbow_dash_by_taritoons-d5pkzrg.gif",
"http://fc06.deviantart.net/fs71/f/2012/363/c/f/clapping_pony_icon___applejack_by_taritoons-d5pkxsu.gif",
"http://fc05.deviantart.net/fs70/f/2012/363/7/9/clapping_pony_icon___rarity_by_taritoons-d5pksh9.gif",
"http://fc03.deviantart.net/fs70/f/2012/363/1/e/clapping_pony_icon___twilight_sparkle_by_taritoons-d5pkpl8.gif"
], false);

ExtraEmotes.addEmoticons("s", "Sexy", "Sexy Pony", [
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTwilightWet_zps61ffef2a.png|twilight",
"http://i453.photobucket.com/albums/qq260/spacewings/EmotePinkieWet_zps32fea050.png|pinkie_pie",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteFluttershyWet_zpsea1c8bcc.png|fluttershy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteApplejackWet_zps7c07ac53.png|applejack",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteRarityWet_zpsccdf0ccd.png|rarity",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDashWet_zps24095993.png|rainbow_dash",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteApplebloomWet_zps748a6d82.png|apple_bloom",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteScootalooWet_zps5f2070e9.png|scootaloo",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSweetieWet_zpsdc3945e2.png|sweetie_belle",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteNyxWet_zps8e840827.png|nyx",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDerpyWet_zps033d2371.png|derpy",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteOctaviaWet_zps7127dafd.png|octavia",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteVinylWet_zps61262968.png|vinyl_scratch",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteLyraWet_zps22067d40.png|lyra",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteBonBonWet_zps9d8d557f.png|bonbon",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteTrixieWet_zps25f2546e.png|trixie",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteSpitfireWet_zps4192ddd5.png|spitfire",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteCelestiaWet_zps97a59249.png|celestia",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteLunaWet_zps2a650793.png|luna",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteCadenceWet_zps38b84bee.png|cadence",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteChrysalisWet_zps4d3ac114.png|crysalis",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteBMacWet_zps3058c380.png|b_mac",
"http://i453.photobucket.com/albums/qq260/spacewings/ThunderlaneWet_zpsf0b0d1a5.png|thunderlane",
"http://i453.photobucket.com/albums/qq260/spacewings/Soarin_zps4b9cfb20.png|soaren",
"http://i453.photobucket.com/albums/qq260/spacewings/EmoteDrWhoovesWet_zps3eb37554.png|dr_hooves",
"http://i453.photobucket.com/albums/qq260/spacewings/ShiningAWet_zps2369479a.png|shining",
"http://i453.photobucket.com/albums/qq260/spacewings/RumbleWet_zps6564ca82.png|rumble",
"http://i453.photobucket.com/albums/qq260/spacewings/SpikeWet_zps1fb14f95.png|spike"
].reverse(), false);