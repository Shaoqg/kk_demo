import { TaskType } from "./UI/TaskScreen";

export function getPetConfigById(id:string){
    for (let i = 0; i < PetConfig.length; i++) {
        if (PetConfig[i].petId == id) {
            return PetConfig[i]
        }
    }
    return null;
}

export function getTaskConfigById(id, taskType) {
  if (taskType == "daily") {
    for (let i = 0; i < DailyTaskConfig.length; i++) {
      if (DailyTaskConfig[i].taskID == id) {
        return DailyTaskConfig[i]
      }
    }
  } else if (taskType == "achievement") {
    for (let i = 0; i < AcheievementConfig.length; i++) {
      if (AcheievementConfig[i].taskID == id) {
        return AcheievementConfig[i]
      }
    }
  }
  return null;
}

export function getStrengthByPetData(petData:PetData) {
  let strength = 0;

  let config = getPetConfigById(petData.petId);

  switch (config.rarity) {
    case Rarity.common:
      strength = petData.petLevel * 2;
      break;
    case Rarity.uncommon:
      strength = petData.petLevel * 3;
      break;
    case Rarity.rare:
      strength = petData.petLevel * 4;
      break;
  }
  return strength;
}

export function getStrengthBonus() {


}
  export function getRotaryRewardByIndex(idx){
    for (let i = 0; i < RotaryReward.length; i++) {
        if (RotaryReward[i].index == idx) {
            return RotaryReward[i]
        }
    }
    return null;
}

export function getPetIntroByElements(pet:PetType){
    switch (pet.elements) {
        case Element.nature:
                return pet.rarity == Rarity.common ? "Can get little food bonus": "Can get more food bonus";
        case Element.fire:
                return pet.rarity == Rarity.common ? "Can get little coin bonus":"Can get more coin bonus"
        case Element.water:
                return pet.rarity == Rarity.common ? "Can get little wood bonus":"Can get more wood bonus"
        case Element.snack:
                return pet.rarity == Rarity.common ? "Can get little stone bonus":"Can get more stone bonus"
        default:
            break;
    }

    return "";
}

export function getPetBouns(pet: PetType) {
  switch (pet.elements) {
    case Element.nature:
      return { BounsName: "Food", BounsNum: 10 };
    case Element.fire:
      return { BounsName: "Coin", BounsNum: 10 };
    case Element.water:
      return { BounsName: "Wood", BounsNum: 10 };
    case Element.snack:
      return { BounsName: "Stone", BounsNum: 10 };
    default:
      break;
  }

  return null;
}

export enum Rarity  {
    "nature",
    "fire",
    "water",
    "snack"
}

export enum Resource  {
  "coin" = "coin",
  "wood" = "wood",
  "food" = "food",
  "stone" = "stone",
  "magicStone" = "magicStone",
  "pet" = "pet",
}

export class PetData {
  petId: string = "";
  petName?: string = "";
  petLevel: number = 1;
}

export enum Rarity {
    "common" = "common",
    "uncommon" = "uncommon",
    "rare" = "rare",
}

export enum Element{
    "nature" = "nature" ,
    "fire" = "fire",
    "water" = "water",
    "snack" = "snack"
}

export type PetType = {
    "petId": string,
    "art_asset": string,
    "rarity": Rarity| string,
    "elements": Rarity| string,
    "featuredCost"?:number,
    "featuredAmount"?:number,
}

export type RewardType = {
  rewardType: Resource,
  rewardNum: number,
  bounds?: number,
  petId?: string,
}

export type RotaryType = {
  index: number,
  reward: RewardType,
  weight: number,
}


export let speeds: number[] = [24, 30, 42];
export let capacitys: number[] = [1, 3, 5];
export let bounss: number[] = [10, 50, 200];

export let AdventureTime: number = 5;
export let AdventureLogLines: number = 50;
export let AdventureBasicwood = 5;
export let AdventureBasicstone = 30;
export let AdventureBasiccoins = 100;
export let AdventureShipMaxFood = 5;

export let TreeNeed: number[] = [10, 50, 200, 1000];

export let Trees = [
{ 
  treeId:"tree1",
  treeName:"Candy tree",
},
{
  treeId:"tree2",
  treeName:"The woods",
},
{
  treeId:"tree3",
  treeName:"Tree house",
},
]
export let AdventureAreas = [
  {
    areaName: "water",
    areaCompletetime: 1,
  },
  {
    areaName: "fire",
    areaCompletetime: 1,
  },
  {
    areaName: "food",
    areaCompletetime: 1,
  },
  {
    areaName: "nature",
    areaCompletetime: 1,
  }
];

export let speedLevelUpInfo= [
    {
        coin:100,
        wood:5,
    },
    {
        coin:200,
        wood:20,
    },
]
export let capacityLevelUpInfo= [
    {
        coin:10,
        wood:5,
        stone:5,
    },
    {
        coin:20,
        wood:2,
        stone:10,
    },
]
export let bounsLevelUpInfo= [
    {
        coin:1000,
        stone:50,
    },
    {
        coin:2000,
        stone:1000,
    },
]

export let AcheievementConfig: TaskType[] = [
  {
    taskID: "Task_Ach_1",
    taskName: "First Coin",
    taskInfo: "get 10 coins",
    reward: {
      rewardType: Resource.coin,
      rewardNum: 5000,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 10,
    },
  },
  {
    taskID: "Task_Ach_2",
    taskName: "Use Coin",
    taskInfo: "use 20 coins",
    reward: {
      rewardType: Resource.food,
      rewardNum: 150,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 20,
    },
  },
  {
    taskID: "Task_Ach_3",
    taskName: "Use Coin2",
    taskInfo: "use 30 coins",
    reward: {
      rewardType: Resource.coin,
      rewardNum: 800,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 30,
    },
  },
]

export let DailyTaskConfig: TaskType[] = [
  {
    taskID: "Task_Dal_1",
    taskName: "First Coin",
    taskInfo: "get 10 coins",
    reward: {
      rewardType: Resource.wood,
      rewardNum: 5000,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 10,
    },
  },
  {
    taskID: "Task_Dal_2",
    taskName: "Use Coin",
    taskInfo: "use 20 coins",
    reward: {
      rewardType: Resource.food,
      rewardNum: 150,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 20,
    },
  },
  {
    taskID: "Task_Dal_3",
    taskName: "Use Coin2",
    taskInfo: "use 30 coins",
    reward: {
      rewardType: Resource.stone,
      rewardNum: 800,
    },
    getReward:
    {
      rewardType: Resource.coin,
      rewardNum: 30,
    },
  },
  {
    taskID: "Task_Dal_4",
    taskName: "Magic Power",
    taskInfo: "Just Click Me",
    reward: {
      rewardType: Resource.magicStone,
      rewardNum: 800,
    },
  },
]
export let RotaryReward:RotaryType[]= [
  {
    index: 0,
    reward: {
      rewardType: Resource.pet,
      rewardNum: 1,
      petId: "meathead"
    },
    weight: 10,
  }, {
    index: 1,
    reward: {
      rewardType: Resource.stone,
      rewardNum: 10,
    },
    weight: 10,
  }, {
    index: 2,
    reward: {
      rewardType: Resource.coin,
      rewardNum: 100,
    },
    weight: 10,
  }, {
    index: 3,
    reward: {
      rewardType: Resource.food,
      rewardNum: 150,
    },
    weight: 10,
  }, {
    index: 4,
    reward: {
      rewardType: Resource.wood,
      rewardNum: 300,
    },
    weight: 10,
  }, {
    index: 5,
    reward: {
      rewardType: Resource.coin,
      rewardNum: 500,
    },
    weight: 10,
  }, {
    index: 6,
    reward: {
      rewardType: Resource.stone,
      rewardNum: 150,
    },
    weight: 10,
  }, {
    index: 7,
    reward: {
      rewardType: Resource.food,
      rewardNum: 50,
    },
    weight: 10,
  }, {
    index: 8,
    reward: {
      rewardType: Resource.magicStone,
      rewardNum: 10,
    },
    weight: 10,
  }, {
    index: 9,
    reward: {
      rewardType: Resource.coin,
      rewardNum: 300,
    },
    weight: 10,
  }, {
    index: 10,
    reward: {
      rewardType: Resource.pet,
      rewardNum: 1,
      petId: "pandu"
    },
    weight: 10,
  }, {
    index: 11,
    reward: {
      rewardType: Resource.magicStone,
      rewardNum: 15,
    },
    weight: 10,
  }, {
    index: 12,
    reward: {
      rewardType: Resource.wood,
      rewardNum: 30,
    },
    weight: 20,
  }, {
    index: 13,
    reward: {
      rewardType: Resource.coin,
      rewardNum: 70,
    },
    weight: 30,
  }, {
    index: 14,
    reward: {
      rewardType: Resource.magicStone,
      rewardNum: 5,
    },
    weight: 15,
  }, {
    index: 15,
    reward: {
      rewardType: Resource.pet,
      rewardNum: 1,
      petId: "fimpkin"
    },
    weight: 1,
  }, {
    index: 16,
    reward: {
      rewardType: Resource.magicStone,
      rewardNum: 5,
    },
    weight: 15,
  }, {
    index: 17,
    reward: {
      rewardType: Resource.pet,
      rewardNum: 1,
      petId: "leafbat"
    },
    weight: 20,
  }, {
    index: 18,
    reward: {
      rewardType: Resource.coin,
      rewardNum: 500,
    },
    weight: 15,
  }, {
    index: 19,
    reward: {
      rewardType: Resource.food,
      rewardNum: 15,
    },
    weight: 15,
  },
]

export let PetConfig:PetType[] = [
    {
      "petId": "king_parrot",
      "art_asset": "king_parrot",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5,
    },
    {
      "petId": "froom",
      "art_asset": "froom",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5,

    },
    {
      "petId": "catbob",
      "art_asset": "catbob",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "oink",
      "art_asset": "oink",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "horseradish",
      "art_asset": "horseradish",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "leafbat",
      "art_asset": "leafbat",
      "rarity": "common",
      "elements": "nature",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "pandu",
      "art_asset": "pandu",
      "rarity": "uncommon",
      "elements": "nature",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "oxford",
      "art_asset": "oxford",
      "rarity": "uncommon",
      "elements": "nature",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "lionell",
      "art_asset": "lionell",
      "rarity": "uncommon",
      "elements": "nature",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "bumble",
      "art_asset": "bumble",
      "rarity": "rare",
      "elements": "nature",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "stumpy",
      "art_asset": "stumpy",
      "rarity": "rare",
      "elements": "nature",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "moby_esq",
      "art_asset": "moby_esq",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "marimo",
      "art_asset": "marimo",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "toddle",
      "art_asset": "toddle",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "lil_blub",
      "art_asset": "lil_blub",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "pinkie",
      "art_asset": "pinkie",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "ducky",
      "art_asset": "ducky",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "clamton",
      "art_asset": "clamton",
      "rarity": "common",
      "elements": "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "puffy",
      "art_asset": "puffy",
      "rarity": "uncommon",
      "elements": "water",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "airbeaknb",
      "art_asset": "airbeaknb",
      "rarity": "uncommon",
      "elements": "water",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "pearl",
      "art_asset": "pearl",
      "rarity": "uncommon",
      "elements": "water",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "kalamagi",
      "art_asset": "kalamagi",
      "rarity": "rare",
      "elements": "water",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "jellybrain",
      "art_asset": "jellybrain",
      "rarity": "rare",
      "elements": "water",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "waxy",
      "art_asset": "waxy",
      "rarity": "common",
      "elements": "fire",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "fimpkin",
      "art_asset": "fimpkin",
      "rarity": "common",
      "elements": "fire",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "hotshot",
      "art_asset": "hotshot",
      "rarity": "common",
      "elements": "fire",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "blaze",
      "art_asset": "blaze",
      "rarity": "uncommon",
      "elements": "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "lumen",
      "art_asset": "lumen",
      "rarity": "uncommon",
      "elements": "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "wizbang",
      "art_asset": "wizbang",
      "rarity": "uncommon",
      "elements": "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "smokey",
      "art_asset": "smokey",
      "rarity": "uncommon",
      "elements": "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "burnice",
      "art_asset": "burnice",
      "rarity": "rare",
      "elements": "fire",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "bellows",
      "art_asset": "bellows",
      "rarity": "rare",
      "elements": "fire",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "sprinkles",
      "art_asset": "sprinkles",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "blorger",
      "art_asset": "blorger",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "small_fry",
      "art_asset": "small_fry",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "glazer",
      "art_asset": "glazer",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "mr_flapjacks",
      "art_asset": "mr_flapjacks",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "el_taco",
      "art_asset": "el_taco",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "pizzaface",
      "art_asset": "pizzaface",
      "rarity": "common",
      "elements": "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "goobert",
      "art_asset": "goobert",
      "rarity": "uncommon",
      "elements": "snack",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "butter-fly",
      "art_asset": "butter-fly",
      "rarity": "uncommon",
      "elements": "snack",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "soosh",
      "art_asset": "soosh",
      "rarity": "uncommon",
      "elements": "snack",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "ez_bake",
      "art_asset": "ez_bake",
      "rarity": "rare",
      "elements": "snack",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "toastman",
      "art_asset": "toastman",
      "rarity": "rare",
      "elements": "snack",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "fire_ice",
      "art_asset": "fire_ice",
      "rarity": "common",
      "elements": 
        "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "spectrum",
      "art_asset": "spectrum",
      "rarity": "common",
      "elements": 
        "water",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "beacon",
      "art_asset": "beacon",
      "rarity": "uncommon",
      "elements": 
        "water",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "surfslug",
      "art_asset": "surfslug",
      "rarity": "uncommon",
      "elements": 
        "fire"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "nimbus",
      "art_asset": "nimbus",
      "rarity": "rare",
      "elements": 
        "fire"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "tug",
      "art_asset": "tug",
      "rarity": "rare",
      "elements": 
        "fire"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "jitters",
      "art_asset": "jitters",
      "rarity": "common",
      "elements": 
        "snack"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "ebi",
      "art_asset": "ebi",
      "rarity": "common",
      "elements": 
        "snack"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "macadoodle",
      "art_asset": "macadoodle",
      "rarity": "common",
      "elements": 
        "snack"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "bao_bao",
      "art_asset": "bao_bao",
      "rarity": "common",
      "elements": 
        "snack"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "klondike",
      "art_asset": "klondike",
      "rarity": "uncommon",
      "elements": 
        "snack"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "doofus",
      "art_asset": "doofus",
      "rarity": "uncommon",
      "elements": 
        "snack"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "hangry",
      "art_asset": "hangry",
      "rarity": "rare",
      "elements": 
        "snack"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "swefish",
      "art_asset": "swefish",
      "rarity": "rare",
      "elements": 
        "snack"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "birfday",
      "art_asset": "birfday",
      "rarity": "common",
      "elements": 
        "fire",
      
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "smored",
      "art_asset": "smored",
      "rarity": "common",
      "elements": 
        "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "ma_po",
      "art_asset": "ma_po",
      "rarity": "common",
      "elements": 
        "snack",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "burnt",
      "art_asset": "burnt",
      "rarity": "common",
      "elements": 
        "fire"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "meatpot",
      "art_asset": "meatpot",
      "rarity": "uncommon",
      "elements": 
        "fire"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "devilegg",
      "art_asset": "devilegg",
      "rarity": "uncommon",
      "elements": 
        "fire"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "meathead",
      "art_asset": "meathead",
      "rarity": "rare",
      "elements": 
        "fire"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "meatyor",
      "art_asset": "meatyor",
      "rarity": "rare",
      "elements": 
        "fire"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "cubemunk",
      "art_asset": "cubemunk",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "grump",
      "art_asset": "grump",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "shelldon",
      "art_asset": "shelldon",
      "rarity": "common",
      "elements":
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "zapseal",
      "art_asset": "zapseal",
      "rarity": "uncommon",
      "elements": 
        "nature"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "oorf",
      "art_asset": "oorf",
      "rarity": "uncommon",
      "elements": 
        "nature"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "tusk",
      "art_asset": "tusk",
      "rarity": "rare",
      "elements": 
        "nature"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "turtlebun",
      "art_asset": "turtlebun",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "tacocat",
      "art_asset": "tacocat",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "carrot_top",
      "art_asset": "carrot_top",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "pupnut",
      "art_asset": "pupnut",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "lionheart",
      "art_asset": "lionheart",
      "rarity": "uncommon",
      "elements": 
        "nature"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "hotdogdog",
      "art_asset": "hotdogdog",
      "rarity": "uncommon",
      "elements": 
        "nature"
      ,
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "sweethorn",
      "art_asset": "sweethorn",
      "rarity": "rare",
      "elements": 
        "nature"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "bananobo",
      "art_asset": "bananobo",
      "rarity": "rare",
      "elements": 
        "snack",
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "hotmonkey",
      "art_asset": "hotmonkey",
      "rarity": "common",
      "elements": 
        "fire",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "katburns",
      "art_asset": "katburns",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "sungazer",
      "art_asset": "sungazer",
      "rarity": "common",
      "elements": 
        "fire",
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "firefox",
      "art_asset": "firefox",
      "rarity": "common",
      "elements": 
        "nature"
      ,
      "featuredCost": 500,
      "featuredAmount": 5
    },
    {
      "petId": "hottail",
      "art_asset": "hottail",
      "rarity": "uncommon",
      "elements": 
        "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "magma",
      "art_asset": "magma",
      "rarity": "uncommon",
      "elements": 
        "fire",
      "featuredCost": 900,
      "featuredAmount": 3
    },
    {
      "petId": "pengzu",
      "art_asset": "pengzu",
      "rarity": "rare",
      "elements": 
        "nature"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
    {
      "petId": "zee",
      "art_asset": "zee",
      "rarity": "rare",
      "elements": 
        "nature"
      ,
      "featuredCost": 1400,
      "featuredAmount": 1
    },
  ]
