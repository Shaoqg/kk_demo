
export type Sound = {
  id: string,
  filename: string,
  volumeModifier: number,
  soundType: string,
  preload: boolean,
};

export type EnergyReward = {
  id: string,
  rewardAmount: number,
  timer?: number,
};

export type RewardedInvite = {
  id: string,
  amount: number,
};

export type TutorialCompleteReward = {
  id: string,
  amount: number,
};

export type Ad = {
  id: string,
  RewardedVideoId?: string,
  InterstitialId?: string,
  Reward: number,
  RewardType: string,
  Probability: number,
  Cooldown: number,
  DailyLimit: number,
};


export type IAP = {
  product_id: string,
  type: string,
  quantity: number,
  price_usd: number,
  island_id: string,
  imageName?: string
};

export default class MasterConfig {

  static debug = false;
  static useShare_w2e = false;
  static useLocalSave = false;
  static openW2E = false; //if true  can test w2e without ad or share


  // tutorialId
  static tutorialId: string = undefined;
  // feature flags config
  static featureFlags;
  // world share egg
  static worldShareEggEnabled: boolean = false;

  static allConfig = {};

  /**
   * Read game config
   * @param jsonobj
   */
  static readConfig(jsonobj: object) {

    // let rawSkinConfig = jsonobj["i18n_skinName"];
    // MasterConfig.readSkinConfig(rawSkinConfig);

    // Debug info
    if (MasterConfig.debug) {
      console.log(">> Start loading configs...");
      console.log(">>");
    }
  }

  static getTutorialId() {
      return localStorage.getItem("FTUEId") || MasterConfig.tutorialId;
  }

}
