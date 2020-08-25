import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from "../Tools/ScreenSize";
import { PetData, getRandomConfigs, getPetConfigById, GameConfig, GameConfigType } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";


const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleScreen extends ViewConnector {

    static prefabPath = 'Screens/BattleScreen';
 
    static _instance: BattleScreen = null;

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        if (!BattleScreen._instance) {
            let vc = BattleScreen._instance = await this.loadView<BattleScreen>(parentNode, BattleScreen);
            vc.applyData();
        }else{
            BattleScreen._instance.node.active = true;
        }

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            BattleScreen._instance.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    root:cc.Node = null;

    applyData() {
        this.root = cc.find("content", this.node);
        
        let close = cc.find("btn_back", this.root);
        close.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.close();
        })
        

    }

    close() {


    }
    
    /**
    * 通过此方法将游戏的宽度缩放适应屏幕的程度
    */
   adjustGameInterface() {
        let scale = 1;
        scale = ScreenSize.getScale(1, 0.8);

        this.node.width = ScreenSize.width/scale;
        // this.node.height = screen.height;

        cc.find("content", this.node).scale = scale;
    }


    gameList:{index:number, node:cc.Node, config:GameConfigType}[]= [];
    creatGameItem() {
        let gameConfig = GameConfig;
        let gamePrefab = cc.find("");
        let index = 0;
        gameConfig.forEach((config)=>{
            if (!config.Enabled) {
                return;
            }

            let node = cc.instantiate(gamePrefab);

            this.gameList.push({
                index: index++,
                node:node,
                config:config
            });
        });
    }

    updateGameInfo(node: cc.Node, config: GameConfigType) {
        let label_name = node.getChildByName("label_name").getComponent(cc.Label);
        label_name.string = config.Name;

        let sprite  = node.getChildByName("sprite_bg").getComponent(cc.Sprite);
        GlobalResources.getSpriteFrame(SpriteType.Game, config.Art).then((sf)=>{
            sprite.spriteFrame = sf;
        });
    }


    creatPet() {

        let petDatas:PetData[] = this.creatFakePet();

        let node = this.getPetNode();
        petDatas.forEach((petData)=>{
            this.updatePetinfo(node, petData)
        })
    }

    updatePetinfo(node:cc.Node, petData:PetData) {
        let sprite = node.getChildByName("image").getComponent(cc.Sprite);
        let config = getPetConfigById(petData.petId);
        GlobalResources.getSpriteFrame(SpriteType.Pet, config.art_asset).then((sf)=>{
            sprite.spriteFrame = sf;
        })
    }


    _nodePool:cc.NodePool = new cc.NodePool();
    getPetNode() {
        if (this._nodePool.size() <=0) {
            let petPrefab = cc.find("player/playerItem", this.root);
            let newNode = cc.instantiate(petPrefab);
            return newNode;
        }

        return this._nodePool.get();
    }

    setPetNode(node) {
        this._nodePool.put(node);
    }

    creatFakePet(){
        let configs = getRandomConfigs(32);
        let petDatas:PetData[] = [];
        configs.forEach((config)=>{
            petDatas.push({
                petId: config.petId,
                petLevel: Math.floor(Math.random()*8)
            })
        });
        return petDatas;
    }

}
