export function getPetConfigById(id){

    for (let i = 0; i < PetConfig.length; i++) {
        if (PetConfig[i].petId == id) {
            return PetConfig[i]
        }
    }

    return null;
}

export enum Rarity  {
    "nature",
    "fire",
    "water",
    "snack"
}

export type PetType = {
    "petId": string,
    "art_asset": string,
    "rarity": "common" | "uncommon" |"rare",
    "elements": Rarity| string,
    "featuredCost"?:number,
    "featuredAmount"?:number,
}

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
