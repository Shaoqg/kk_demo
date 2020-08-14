import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { StrikeReward } from "./StrikeReward";
import User from "../Gameplay/User";
import { PetData } from "../UI/PetList";
import { PetInfo, petBouns } from "../UI/PetRevealDialog";
import { KKLoader } from "../Util/KKLoader";
import { getPetConfigById } from "../Config";
const { ccclass, property } = cc._decorator;

@ccclass
export class Strike extends ViewConnector {

    @property(cc.SpriteFrame)
    SpriteFrame: cc.SpriteFrame[] = [];


    static prefabPath = 'Prefab/Strike';

    static _instance: Strike = null;

    root: cc.Node = null;
    pet: cc.Node;
    petReady: number = 0;
    boatReady: boolean = false;
    bonusName: string[] = ["Metal", "Wood", "Fuel", "Bullet", "Food"]
    bonusNum: string[] = ["10", "20", "15", "33", "50"]
    updateTime: number = 0;
    goStrike: boolean = false;
    time: number = 0;
    counttime: number = 0;
    timeremain: number = 0;
    seats: boolean[]=[];
    seatNum: number;
    boundsAll: petBouns[]=[{BounsName:"Coin",BounsNum:0},{BounsName:"Wood",BounsNum:0},{BounsName:"Stone",BounsNum:0}];

    static async prompt(): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = Strike._instance = await this.loadView<Strike>(parentNode, Strike);

        vc.applyData();

        let executor = (resolve: (any) => void, reject: (error) => void) => {
            vc.onCloseCallback = resolve;
        }

        return new Promise<any>(executor);
    }

    static close() {
        if (this._instance) {
            this._instance.close({});
            this._instance.destroy();
            this._instance = undefined;
        }
    }

    applyData() {

        let underlay = cc.find("underlay", this.node);
        this.root = cc.find("content", this.node);
        this.adjustGameInterface();

        this.pet = cc.find("pet", this.node);
        let petList = [];
        petList=User.instance.getPetList()


        let go = cc.find("button_primary", this.root);
        let scrollview = cc.find("scrollview", this.root);
        let list = cc.find("list", scrollview);
        let battleinfo = cc.find("battleinfo", scrollview);
        let subtitleLabel = cc.find("subtitle/capacity", this.root).getComponent(cc.Label);
        let shipCapacity = cc.find("shipInfo/capacity", this.root);
        let shipLevel = cc.find("shipInfo/level", this.root);
        let shipSpeed = cc.find("shipInfo/speed", this.root);

        this.seatNum=User.instance.capacitys[User.instance.ship_capacity_level];
        shipCapacity.getComponent(cc.Label).string = "Capacity：" + 0 + "/"+this.seatNum;
        shipLevel.getComponent(cc.Label).string="Level:"+User.instance.level;
        shipSpeed.getComponent(cc.Label).string="Speed："+User.instance.speeds[User.instance.ship_speed_level]+" knots:";
        

        for(let i=1;i<=this.seatNum;i++){
            let petSeat = cc.find("petsOnShip/pet" + i, this.root);
            petSeat.active=true
            this.seats.push(false);
        }

        list.height = 11;

        petList.forEach((data, idx) => {
            this.createList(data, idx);
        });

        go.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.boatReady) {
                return;
            }
            list.active = false;
            scrollview.getComponent(cc.ScrollView).content = battleinfo;
            battleinfo.active = true;
            subtitleLabel.string = "Strike Log"

            let go_gry = cc.find("button_primary/button_gry", this.root);
            let goLabel = cc.find("button_primary/goLabel", this.root);
            let timecount = cc.find("shipInfo/timecount", this.root);

            go.getComponent(cc.Button).interactable = false;
            go_gry.active = true;
            goLabel.getComponent(cc.Label).string = "Exploring"
            timecount.active = true;
            go.off(cc.Node.EventType.TOUCH_END);
            let loadingbar = cc.find("loading_bar", this.node);
            loadingbar.active = true
            this.startCountDown();
        });


        this.root.stopAllActions();
        underlay.stopAllActions();
        this.root.scale = 0;
        underlay.opacity = 0;
        underlay.runAction(cc.fadeTo(0.1, 100));
        this.root.runAction(cc.scaleTo(0.4, this._originScale).easing(cc.easeBackOut()));

        let ship = cc.find("ship_bg/ship", this.root);
        ship.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveBy(1.2, 0, 8).easing(cc.easeInOut(1.2)),
                cc.moveBy(1.2, 0, -8).easing(cc.easeInOut(1.2))
            )));
        //this.adjustGameInterface();
    }
    async startCountDown() {
        this.goStrike = true
        this.time = Date.now() / 1000;
        this.counttime = 0.2;
        
    }

    update(dt) {
        if (!this.goStrike) {
            return;
        }
        this.updateTime += dt;
        if (this.updateTime >= 1) {
            this.updateTime -= 1;
            this.getTimeRemaining();
        }
    }
    getTimeRemaining() {
        let loadingbar = cc.find("loading_bar", this.node).getComponent(cc.ProgressBar);
        let timeelapsed = (Date.now() / 1000 - this.time);
        this.timeremain = this.counttime * 60 - (Math.round(timeelapsed));
        loadingbar.progress = 1 - (this.timeremain / (this.counttime * 60));
        if(this.timeremain<=0){
            this.goStrike=false;
            this.strikeOver()
        }
    }

    strikeOver() {
        let go = cc.find("button_primary", this.root);
        let goLabel = cc.find("button_primary/goLabel", this.root);
        let go_gry = cc.find("button_primary/button_gry", this.root);

        go.getComponent(cc.Button).interactable = true;
        go_gry.active = false;
        goLabel.getComponent(cc.Label).string = "Go Collect!";

        go.once(cc.Node.EventType.TOUCH_END, () => {
            this.boundsAll.forEach((bands) => {
                bands.BounsNum += User.instance.bounss[User.instance.ship_bouns_level];
            })
            StrikeReward.prompt(this.boundsAll);
        });
    }

    async createList(petData: any, idx: number) {
        let petinfo:PetInfo=null;
        User.instance.petInfos.forEach((info)=>{
            if(info.petId==petData.petId){
                petinfo=info;
            }
        })
        let petconfig=getPetConfigById(petinfo.petId);
        let pet = cc.instantiate(this.pet);
        let list = cc.find("scrollview/list", this.root);
        let petImage = pet.getChildByName("petimage").getComponent(cc.Sprite);
        petImage.spriteFrame = await KKLoader.loadSprite("Pets/"+petconfig.art_asset);
        // petImage.spriteFrame = this.SpriteFrame[petListInfo];

        list.addChild(pet);
        if (idx % 5 == 0) {
            list.height += pet.height + 11;
        }

        pet.y = -(pet.height / 2 + 11) - (Math.floor(idx / 5) * (pet.height + 11));
        pet.x = (idx % 5) * (pet.width + 11) + (pet.width / 2 + 11);

        pet.on(cc.Node.EventType.TOUCH_END, () => {
            this.setToReady(pet, petData,petinfo);
        });
    }

    setToReady(petNode: cc.Node, petData: PetData,petinfo:PetInfo) {
        if (this.petReady >= this.seatNum) {
            return;
        }
        let seatnumber=0;
        for(let i=1;i<=this.seatNum;i++){
            if(!this.seats[i-1]){
                seatnumber=i;
                break;
            }
        }
        this.petReady++;
        this.seats[seatnumber-1]=true;

        let petSeat = cc.find("petsOnShip/pet" + seatnumber.toString(), this.root);
        let shipCapacity = cc.find("shipInfo/capacity", this.root);

        let bg = petSeat.getChildByName("bg");
        let petImage = petSeat.getChildByName("petimage").getComponent(cc.Sprite);
        let bonusLabel = petSeat.getChildByName("bonus").getComponent(cc.Label);

        petNode.getChildByName("underlay").active = true;
        petNode.getChildByName("Label").active = true;

        bg.active = true;

        petImage.spriteFrame = petNode.getChildByName("petimage").getComponent(cc.Sprite).spriteFrame;
        petImage.node.active = true;
        bonusLabel.string=petinfo.petBouns.BounsName+"\n+"+(petinfo.petBouns.BounsNum*petData.petLevel)+"%";

        bonusLabel.node.active = true;

        this.boundsAll.forEach((bands)=>{
            if(bands.BounsName==petinfo.petBouns.BounsName){
                bands.BounsNum+=petinfo.petBouns.BounsNum*petData.petLevel;
            }
        });

        shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/"+this.seatNum;
        petSeat.once(cc.Node.EventType.TOUCH_END, () => {
            petNode.getChildByName("underlay").active = false;
            petNode.getChildByName("Label").active = false;
            bg.active = false;
            petImage.node.active = false;
            bonusLabel.node.active = false;

            if(this.petReady == this.seatNum){
                let go = cc.find("button_primary", this.root);
                let go_gry = cc.find("button_primary/button_gry", this.root);
                go.getComponent(cc.Button).interactable = false;
                go_gry.active = true;
                this.boatReady = false;
            }

            this.boundsAll.forEach((bands)=>{
                if(bands.BounsName==petinfo.petBouns.BounsName){
                    bands.BounsNum-=petinfo.petBouns.BounsNum*petData.petLevel;
                }
            });
            this.seats[seatnumber-1]=false;
            this.petReady--;
            shipCapacity.getComponent(cc.Label).string = "Capacity：" + this.petReady + "/"+this.seatNum;

        });
        if (this.petReady == this.seatNum) {
            let go = cc.find("button_primary", this.root);
            let go_gry = cc.find("button_primary/button_gry", this.root);
            go.getComponent(cc.Button).interactable = true;
            go_gry.active = false;
            this.boatReady = true;
        }
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.root.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}