import { ViewConnector } from "../Tools/ViewConnector";
import { Resource, getTaskConfigById, getPetConfigById, PetData, getStrengthByPetData, Element, RewardType } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import User from "../Gameplay/User";
import ScreenSize from "../Tools/ScreenSize";


export type BattleListType = { name: string, id: string, reward: RewardType };

export type PlayerListType = { playerID: string, playerPets: PetData[], friend:number};

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleScreen extends ViewConnector {

    static prefabPath = 'Screens/BattleScreen';

    static _instance: BattleScreen = null;

    root: cc.Node = null;
    rewarditem: cc.Node;


    environmentType: Element = Element.fire;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        if (!BattleScreen._instance) {
            let vc = BattleScreen._instance = await this.loadView<BattleScreen>(parentNode, BattleScreen);
            vc.applyData();
        }

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            BattleScreen._instance.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    applyData() {
        this.root = cc.find("content", this.node);
        
        let close = cc.find("btn_back", this.root);
        close.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.close();
        })
        
        this.initSelectInfo();
        this.initPlayerList();
    }

    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
   adjustGameInterface() {
    let scale = 1;
    scale = ScreenSize.getScale(1, 0.8);

    this.node.width = ScreenSize.width/scale;
    // this.node.height = screen.height;

    cc.find("content/scrollView", this.node).scale = scale;


}

    close() {
        this.node.active = false;
    }

    playerList:{[id:string]:{
        node: cc.Node,
        info: BattleListType,
        player: PlayerListType
    }} = {};
    initPlayerList() {
        let currentRes = Resource.stone;
        let rewardNum = 100;

        //get info
        let list: BattleListType[] = [
            {
                name: "Rare location",
                id: "0",
                reward: {
                    rewardType: currentRes,
                    rewardNum: rewardNum * 2
                }
            },
            {
                name: "Uncommon location",
                id: "1",
                reward: {
                    rewardType: currentRes,
                    rewardNum: rewardNum * 1.5
                }
            },
            {
                name: "Common location",
                id: "2",
                reward: {
                    rewardType: currentRes,
                    rewardNum: rewardNum * 1
                }
            },
            {
                name: "Bad location",
                id: "3",
                reward: {
                    rewardType: currentRes,
                    rewardNum: rewardNum * 0.8
                }
            }
        ]

        //get player info
        let playList: { [id: string]: PlayerListType } = {
            "0": {
                playerID: "player1",
                playerPets: [
                    {
                        petId: "airbeaknb",//lvl
                        petLevel: 6
                    },
                    {
                        petId: "jellybrain",//lvl
                        petLevel: 6
                    },
                    {
                        petId: "blaze",//lvl
                        petLevel: 6
                    },
                ],
                friend:0.1
            }
        }

        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            let node = this.creatItem(element, playList[element.id] || null);
            this.playerList[element.id] = {
                node: node,
                info: element,
                player: playList[element.id] || null
            }
            this.addPlayerToList(playList[element.id] || null, node);
        }
    }

    creatItem(info: BattleListType, player: PlayerListType) {
        let prefab = cc.find("content/scrollView/item", this.node);
        let parentNode = cc.find("content/scrollView/content", this.node);
        let node = cc.instantiate(prefab);
        node.active = true;
        node.setParent(parentNode);

        let label_name = cc.find("label_name", node).getComponent(cc.Label);
        label_name.string = "name:" + info.name;

        let label_strength = cc.find("label_strength", node).getComponent(cc.Label);
        label_strength.string = "0";

        //reward
        let reward_sprite = cc.find("rewardNode/icon", node).getComponent(cc.Sprite);
        GlobalResources.getSpriteFrame(SpriteType.UI, info.reward.rewardType, (sf) => {
            reward_sprite.spriteFrame = sf;
        });
        let label_reward = cc.find("rewardNode/label_reward", node).getComponent(cc.Label);
        label_reward.string = `X${info.reward.rewardNum}`;//info.reward.rewardNum;

        //button
        let btn_node = cc.find("btn_button", node);
        btn_node.on(cc.Node.EventType.TOUCH_END, () => {
            this.onclickButton(node, info, player);
        });

        return node;
    }


    addPlayerToList(playerListType: PlayerListType, node) {
        let petNodes = cc.find("pets", node);

        petNodes.children.forEach((node, i) => {
            let petNode = node;
            let sprite = cc.find("petimage", petNode).getComponent(cc.Sprite);
            sprite.spriteFrame = null;
            if (playerListType &&playerListType.playerPets && playerListType.playerPets[i]) {
                let pet = playerListType.playerPets[i];
                let petConfig = getPetConfigById(pet.petId);
                GlobalResources.getSpriteFrame(SpriteType.Pet, petConfig.art_asset, (sf) => {
                    sprite.spriteFrame = sf;
                });
            }
        });

        let label_btn = cc.find("btn_button/label", node).getComponent(cc.Label);
        let label_strength = cc.find("label_strength", node).getComponent(cc.Label);
        let label_tips = cc.find("label_playerName",node).getComponent(cc.Label);
        if (playerListType && playerListType.playerID) {
            if (playerListType.playerID == User.instance.playerID) {
                label_btn.string = "End";
            } else {
                label_btn.string = "Attack";
            }
            let strengthInfo = this.getStrength(playerListType.playerPets, this.environmentType);
            label_strength.string = `strength: ${strengthInfo.allStrenght}`;
            label_tips.string = "";
        } else {
            label_btn.string = "Hold";
            label_strength.string = `strength: 0`;
            label_tips.string = "No palyer";
        }
    }

    onclickButton(node: cc.Node, info: BattleListType, player: PlayerListType) {
        if (player) {
            if (player.playerID == User.instance.playerID) {
                //TODO over
                this.playerList[info.name].player = null;
                this.addPlayerToList(this.playerList[info.id].player, this.playerList[info.name].node);

            } else {
                //TODO Attack
                                                                
            }
        } else {
            //TODO 
            this.playerList[info.id].player = {
                playerID:User.instance.playerID,
                playerPets:this.selectPets,
                friend:0
            };
            this.addPlayerToList(this.playerList[info.id].player, node);
        }
    }


    initSelectInfo() {
        let selcetNodes = cc.find("playerInfo/petsOnShip", this.root).children;

        selcetNodes.forEach((node, i) => {
            let index = i;
            node.on(cc.Node.EventType.TOUCH_END, () => {
                this.selectPet(index, node);
            })
            this.updateSelectPetInfo(this.selectPets[index], node);
        });

        this.updateStrengthInfo();
    }

    updateSelectPetInfo(petData: PetData, node: cc.Node) {
        let add = cc.find("icon_add", node);
        let sprite = cc.find("petimage", node).getComponent(cc.Sprite);
        if (petData) {
            add.active = false;
            let config = getPetConfigById(petData.petId);
            GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset, (sf) => {
                sprite.spriteFrame = sf;
                sprite.node.active = true;
            });


        } else {
            add.active = true;
            sprite.node.active = false;
        }
    }

    async selectPet(i, node) {
        if (this.selectPets[i]) {
            //TODO removePet

            this.updateSelectPetInfo(null, node);
            this.selectPets[i] = null;
            this.updateStrengthInfo();
            return;
        }
        //TODO show selcet scrollview

        let petData: PetData = null;

        this.selectPets[i] = petData;
        this.updateSelectPetInfo(petData, node);
        this.updateStrengthInfo();
    }

    getStrength(petDatas: PetData[], type = Element.snack, friendBonus = 0.1) {
        let strength = 0;
        let typeNum = 0;
        let curType = type;

        petDatas.forEach((petData) => {
            if (petData) {
                strength += getStrengthByPetData(petData);
                let type = getPetConfigById(petData.petId);
                type.elements == curType && (typeNum++);
            }
        });

        return {
            strength: strength,
            typeNum: typeNum,
            allStrenght: Math.floor(10*(strength * (1 + typeNum * 0.1 + friendBonus)))/10
        }
    }

    selectPets: PetData[] = [null, null, null, null];
    updateStrengthInfo() {
        //TODO add number
        let strengthInfo = this.getStrength(this.selectPets, this.environmentType);
        let strength = strengthInfo.strength;
        let typeNum = strengthInfo.typeNum;

        let label_strength = cc.find("playerInfo/label_strength", this.root).getComponent(cc.Label);
        label_strength.string = "strength:\n" + strength;

        //Environmental bonus:
        let envirBouns = "";
        let label_environment = cc.find("playerInfo/label_environment", this.root).getComponent(cc.Label);
        label_environment.string = `${strength * typeNum * 0.1}(${typeNum * 10}%)`;

        //TODO

        //all strength
        let label_allStrength = cc.find("playerInfo/label_allStrength", this.root).getComponent(cc.Label);
        label_allStrength.string = `${strength + strength * typeNum * 0.1}(${typeNum * 10}%)`;
    }

}
