// super simple state container + constants

import { showContentWarningModal } from "../modals";
import { mod } from "../utils";

export default class MuseumState {
  private fileIndex = ORG_INDEX;
  private folderName: MuseumInputFolder = "favorites";
  private scenario: ScenarioType = Scenario["Main Scenario"];
  private onUpdate?: () => void;

  public get rootFolder() {
    return this.scenario === Scenario["Main Scenario"] ? "chr" : "chr2";
  }

  public get file() {
    return `${this.folderName}/${this.folder[this.fileIndex]}`;
  }

  public set file(path: string) {
    const split = path.split("/");
    const folder = split.at(-2) ?? "favorites";
    const filename = split.at(-1) ?? "org.mdl";
    //@ts-ignore
    const directory = this.folderStructure[
      folder as MuseumInputFolder
    ] as MuseumInputList;
    //@ts-ignore
    const index = directory.indexOf(filename as MuseumInputList[number]);
    if (index === -1) {
      this.fileIndex = ORG_INDEX;
    } else {
      this.fileIndex = index;
    }
    this.setFolderName(folder, this.fileIndex);
  }

  public nextFile() {
    this.fileIndex++;
    this.fileIndex = mod(this.fileIndex, this.folder.length);
    this.onUpdate?.();
  }

  public previousFile() {
    this.fileIndex--;
    this.fileIndex = mod(this.fileIndex, this.folder.length);
    this.onUpdate?.();
  }

  public nextFolder() {
    const folderIndex = this.folderNames.indexOf(this.folderName);
    this.setFolderName(
      this.folderNames[mod(folderIndex - 1, this.folderNames.length)]
    );
  }

  public previousFolder() {
    const folderIndex = this.folderNames.indexOf(this.folderName);
    this.setFolderName(
      this.folderNames[mod(folderIndex + 1, this.folderNames.length)]
    );
  }

  public toggleScenario() {
    this.setScenario(
      this.scenario === "Main Scenario" ? "Born From A Wish" : "Main Scenario"
    );
    return this.scenario;
  }

  public setOnUpdate(onUpdate: () => void) {
    onUpdate();
    this.onUpdate = onUpdate;
  }

  private get folder(): MuseumInputList {
    // @ts-ignore
    return this.folderStructure[this.folderName];
  }

  private get folderStructure() {
    return this.scenario === "Main Scenario"
      ? folderStructure
      : secondaryFolderStructure;
  }

  public get folderNames() {
    return this.scenario === "Main Scenario"
      ? folderNames
      : secondaryFolderNames;
  }

  public getScenario() {
    return this.scenario;
  }

  public setScenario(scenario: ScenarioType) {
    this.scenario = scenario;
    if (scenario === "Main Scenario") {
      this.setFolderName("favorites");
    } else {
      this.setFolderName("item");
    }
    return this.scenario;
  }

  public setFolderName(
    name: string,
    fileIndex?: number,
    overrideWarning = false
  ) {
    if (!(name in this.folderStructure)) {
      return;
    }
    if (!overrideWarning && name !== "favorites") {
      showContentWarningModal(() => this.setFolderName(name, fileIndex, true));
      return;
    }
    this.folderName = name as MuseumInputFolder;
    let preferredIndex =
      (this.scenario === "Main Scenario" &&
        (name === "item" ? PIZZA_INDEX : name === "wp" ? CSAW_INDEX : 0)) ||
      0;
    this.fileIndex = fileIndex ?? preferredIndex;
    this.onUpdate?.();
  }

  public getFolderName() {
    return this.folderName;
  }

  constructor(onUpdate?: () => void) {
    this.onUpdate = onUpdate;
  }
}

export type MuseumInputFolder =
  | keyof typeof folderStructure
  | keyof typeof secondaryFolderStructure;
export type MuseumInputList =
  | (typeof folderStructure)[keyof typeof folderStructure]
  | (typeof secondaryFolderStructure)[keyof typeof secondaryFolderStructure];
export type MuseumInputFile = MuseumInputList[number];
export const Scenario = {
  "Main Scenario": "Main Scenario",
  "Sub Scenario": "Born From A Wish",
} as const;
export type ScenarioType = (typeof Scenario)[keyof typeof Scenario];
export const folderStructure = {
  oni: ["oni.mdl"],
  edi: ["hhh_edi.mdl", "hhh_edi_notex.mdl", "lll_edi.mdl", "rhhh_edi.mdl"],
  mkn: ["mkn.mdl"],
  mar: [
    "hhh_mar.mdl",
    "hhh_mar_notex.mdl",
    "lll_mar.mdl",
    "rhhh_mar.mdl",
    "rhhh_mar_notex.mdl",
    "rlll_mar.mdl",
  ],
  xoo: ["xoo.mdl"],
  mxx: ["mxx.mdl"],
  scu: ["scu.mdl", "scu_st.mdl"],
  favorites: [
    "agl.mdl",
    // "bos.mdl",
    "inu.mdl",
    "lau.mdl",
    "org.mdl",
    // "piz.mdl",
    "wp_csaw.mdl",
  ],
  boat: ["boat.mdl"],
  mry: ["mry.mdl"],
  pap: ["pap.mdl"],
  wp: [
    "rwp_csaw.mdl",
    "rwp_handgun.mdl",
    "rwp_kakuzai.mdl",
    "rwp_nata.mdl",
    "rwp_pipe.mdl",
    "rwp_riflgun.mdl",
    "rwp_shotgun.mdl",
    "rwp_sp.mdl",
    "wp_csaw.mdl",
    "wp_handgun.mdl",
    "wp_kakuzai.mdl",
    "wp_nata.mdl",
    "wp_pipe.mdl",
    "wp_riflgun.mdl",
    "wp_shotgun.mdl",
    "wp_sp.mdl",
  ],
  red: ["red.mdl"],
  ike: ["ike.mdl"],
  agl: ["agl.mdl", "ragl.mdl"],
  item: [
    "3sk.mdl",
    "ali_01.mdl",
    "ali_02.mdl",
    "ali_03.mdl",
    "ali_04.mdl",
    "ali_05.mdl",
    "ate_01.mdl",
    "ate_02.mdl",
    "ate_03.mdl",
    "ate_04.mdl",
    "ate_05.mdl",
    "b_ami.mdl",
    "b_bol.mdl",
    "b_cha.mdl",
    "b_clo.mdl",
    "b_d00.mdl",
    "b_d01.mdl",
    "b_d02.mdl",
    "b_d03.mdl",
    "b_d05.mdl",
    "b_d06.mdl",
    "b_d08.mdl",
    "b_d10.mdl",
    "b_dha.mdl",
    "b_do4.mdl",
    "b_doo.mdl",
    "b_dor.mdl",
    "b_ell.mdl",
    "b_hul.mdl",
    "b_nat.mdl",
    "b_nik.mdl",
    "b_ori.mdl",
    "b_pia.mdl",
    "b_piz.mdl",
    "b_pop.mdl",
    "b_rei.mdl",
    "b_rop.mdl",
    "b_sti.mdl",
    "b_tan.mdl",
    "b_tel.mdl",
    "bab.mdl",
    "baf.mdl",
    "box.mdl",
    "box_01.mdl",
    "box_02.mdl",
    "c1b.mdl",
    "c2b.mdl",
    "c3b.mdl",
    "c4b.mdl",
    "c5b.mdl",
    "c6b.mdl",
    "c7b.mdl",
    "c8b.mdl",
    "c9b.mdl",
    "cab.mdl",
    "cbb.mdl",
    "ccb.mdl",
    "cda.mdl",
    "cdb.mdl",
    "cua.mdl",
    "cub.mdl",
    "d09.mdl",
    "dhb.mdl",
    "dhv.mdl",
    "dlg.mdl",
    "dm2.mdl",
    "dmr.mdl",
    "evj.mdl",
    "evk.mdl",
    "fan.mdl",
    "g_drink.mdl",
    "g_firstaid.mdl",
    "g_hair.mdl",
    "g_handbul.mdl",
    "g_handgun.mdl",
    "g_jlight.mdl",
    "g_kakuzai.mdl",
    "g_keyelevator.mdl",
    "g_keypurple.mdl",
    "g_letterm.mdl",
    "g_needle.mdl",
    "g_radio.mdl",
    "gom.mdl",
    "hed.mdl",
    "hin.mdl",
    "hou.mdl",
    "i_bear.mdl",
    "i_bear2.mdl",
    "i_colt.mdl",
    "i_flight.mdl",
    "i_handgun.mdl",
    "i_hari.mdl",
    "i_headphone.mdl",
    "i_j_light.mdl",
    "i_juice.mdl",
    "i_kakuzai.mdl",
    "i_key_clock.mdl",
    "i_keycou.mdl",
    "i_keyelevator.mdl",
    "i_keyspe.mdl",
    "i_knife.mdl",
    "i_letter.mdl",
    "i_letterm.mdl",
    "i_lring.mdl",
    "i_magazine.mdl",
    "i_mdrug.mdl",
    "i_mtablet.mdl",
    "i_needle.mdl",
    "i_photo.mdl",
    "i_purse.mdl",
    "i_radio.mdl",
    "i_video.mdl",
    "inu.mdl",
    "kab.mdl",
    "kum.mdl",
    "lsi.mdl",
    "mal.mdl",
    "mne.mdl",
    "mx2.mdl",
    "nak.mdl",
    "nat.mdl",
    "nef.mdl",
    "neo.mdl",
    "nep.mdl",
    "noa.mdl",
    "nor.mdl",
    "org.mdl",
    "ori.mdl",
    "piz.mdl",
    "pxx.mdl",
    "rboat.mdl",
    "ri_knife.mdl",
    "ri_photo.mdl",
    "rinu.mdl",
    "rlau.mdl",
    "rmry.mdl",
    "rmxx.mdl",
    "s00.mdl",
    "s01.mdl",
    "s02.mdl",
    "s03.mdl",
    "s04.mdl",
    "s05.mdl",
    "s06.mdl",
    "s07.mdl",
    "s08.mdl",
    "s09.mdl",
    "s0a.mdl",
    "s0b.mdl",
    "s0c.mdl",
    "s0d.mdl",
    "s0e.mdl",
    "s0f.mdl",
    "s0g.mdl",
    "s0h.mdl",
    "s0i.mdl",
    "s0j.mdl",
    "s0k.mdl",
    "s0l.mdl",
    "s0m.mdl",
    "s0n.mdl",
    "s0o.mdl",
    "s0p.mdl",
    "tlr.mdl",
    "tom.mdl",
    "tre.mdl",
    "tvc.mdl",
    "ty2.mdl",
    "ty3.mdl",
    "ura0.mdl",
    "ura1.mdl",
    "ura2.mdl",
    "ura3.mdl",
    "x_ample.mdl",
    "x_battery.mdl",
    "x_bear.mdl",
    "x_canopen.mdl",
    "x_cinderella.mdl",
    "x_coinelder.mdl",
    "x_coinprisoner.mdl",
    "x_coinsnake.mdl",
    "x_cup.mdl",
    "x_drink.mdl",
    "x_eggred.mdl",
    "x_eggrust.mdl",
    "x_firstaid.mdl",
    "x_hair.mdl",
    "x_handbul.mdl",
    "x_handgun.mdl",
    "x_horse.mdl",
    "x_jlight.mdl",
    "x_juice.mdl",
    "x_kakuzai.mdl",
    "x_key202.mdl",
    "x_key312.mdl",
    "x_key3f.mdl",
    "x_keybar.mdl",
    "x_keybase.mdl",
    "x_keybronze.mdl",
    "x_keyclock.mdl",
    "x_keycourt.mdl",
    "x_keyelevator.mdl",
    "x_keyemerg.mdl",
    "x_keyemploy.mdl",
    "x_keyfalse.mdl",
    "x_keyfish.mdl",
    "x_keygate.mdl",
    "x_keyhos.mdl",
    "x_keylyne.mdl",
    "x_keynorth.mdl",
    "x_keypurple.mdl",
    "x_keyrapis.mdl",
    "x_keyroof.mdl",
    "x_keyspiral.mdl",
    "x_letterm.mdl",
    "x_lightbulb.mdl",
    "x_lighter.mdl",
    "x_lostmemory.mdl",
    "x_magazine.mdl",
    "x_mermaid.mdl",
    "x_needle.mdl",
    "x_oil.mdl",
    "x_pictstand.mdl",
    "x_plate_female.mdl",
    "x_plate_kick.mdl",
    "x_plate_pig.mdl",
    "x_plier.mdl",
    "x_purse.mdl",
    "x_radio.mdl",
    "x_redrelig.mdl",
    "x_riflebul.mdl",
    "x_ringcopper.mdl",
    "x_ringlead.mdl",
    "x_shotbul.mdl",
    "x_snow.mdl",
    "x_spanner.mdl",
    "x_thinner.mdl",
    "x_video.mdl",
    "x_waxdoll.mdl",
    "x_wp_csaw.mdl",
    "x_wp_pipe.mdl",
    "x_wp_riflgun.mdl",
    "x_wp_shotgun.mdl",
    "x_wp_sp.mdl",
    "xag.mdl",
  ],
  bos: ["bos.mdl"],
  lau: ["lau.mdl"],
  arm: ["arm.mdl"],
  tyu: ["tyu.mdl", "tyu_st.mdl"],
  jms: [
    "hhh_jms.mdl",
    "hhh_jms_notex.mdl",
    "hhl_jms.mdl",
    "hhl_jms_notex.mdl",
    "hll_jms.mdl",
    "hll_jms_notex.mdl",
    "lll_jms.mdl",
    "lll_jms_hand.mdl",
    "lll_jms_kaku.mdl",
    "lll_jms_n.mdl",
    "lll_jms_normal.mdl",
    "lll_jms_notex.mdl",
    "rhhh_jms.mdl",
    "rhhl_jms.mdl",
    "rhll_jms.mdl",
    "rlll_jms.mdl",
  ],
  nse: ["nse.mdl", "nse_st.mdl"],
} as const;
export const PIZZA_INDEX = folderStructure.item.indexOf("piz.mdl");
export const CSAW_INDEX = folderStructure.wp.indexOf("wp_csaw.mdl");
export const ORG_INDEX = folderStructure.favorites.indexOf("org.mdl");
export const folderNames = [
  "agl",
  "arm",
  "boat",
  "bos",
  "edi",
  "favorites",
  "ike",
  "item",
  "jms",
  "lau",
  "mar",
  "mkn",
  "mry",
  "mxx",
  "nse",
  "oni",
  "pap",
  "red",
  "scu",
  "tyu",
  "wp",
  "xoo",
] as const;

export const secondaryFolderStructure = {
  mar: [
    "hhh_mar.mdl",
    "lxx_mar.mdl",
    "rhhh_mar.mdl",
    "rhhh_mar_notex.mdl",
    "rlxx_mar.mdl",
    "rlxx_mar_notex.mdl",
  ],
  wp: [
    "rwp_chinanife.mdl",
    "rwp_chinanife_notex.mdl",
    "rwp_colt.mdl",
    "rwp_colt_notex.mdl",
    "wp_chinanife.mdl",
    "wp_colt.mdl",
  ],
  item: [
    "b_d1x.mdl",
    "b_d2x.mdl",
    "b_d8x.mdl",
    "bdcard.mdl",
    "enx.mdl",
    "i_oil.mdl",
    "i_revo.mdl",
    "ri_revo.mdl",
    "ri_revo_notex.mdl",
    "s0x.mdl",
    "s1x.mdl",
    "u0x.mdl",
    "w1x.mdl",
    "w2x.mdl",
    "w2x_notex.mdl",
    "w3x.mdl",
    "w3x_notex.mdl",
    "w4x.mdl",
    "w4x_notex.mdl",
    "w5x.mdl",
    "w5x_notex.mdl",
    "w6x.mdl",
    "w6x_notex.mdl",
    "w7x.mdl",
    "w8x.mdl",
    "w9x.mdl",
    "x_birthday.mdl",
    "x_bullet_rivolver.mdl",
    "x_bullt_revolver.mdl",
    "x_chinanife.mdl",
    "x_cosmos.mdl",
    "x_houban_black.mdl",
    "x_houban_red.mdl",
    "x_houban_white.mdl",
    "x_keyacacia.mdl",
    "x_mach.mdl",
    "x_present.mdl",
    "x_revolver.mdl",
    "x_sekihi_black.mdl",
    "x_sekihi_red.mdl",
    "x_sekihi_white.mdl",
  ],
} as const;
export const secondaryFolderNames = ["mar", "wp", "item"];
