import { ViewConnector } from "../Tools/ViewConnector";
import ScreenSize from '../Tools/ScreenSize';
import { petBouns } from "../UI/PetRevealDialog";
import User from "../Gameplay/User";
import { Adventure } from "./Adventure";
import WorldManager from "../Gameplay/WorldManager";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import { AdventureAreas, PetData, getPetConfigById, getStrengthByPetData, getRandomConfigs, PetConfigType, PetConfig, ElementType, getRestraint } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { delay, VoidCallPromise, CallPromise } from "../kk/DataUtils";
import { BattleReward } from "./BattleReward";
import { PetObject, PetType } from "../Pet/PetObject";
import { Wander } from "../Pet/Behviors/Wander";
import VSModel from "../UI/VSModel";
import { Land } from "../Pet/Behviors/Land";
import ShipObject from "../Tools/ShipObject";
const { ccclass, property } = cc._decorator;

@ccclass
export class BattleArea extends ViewConnector {


    static prefabPath = 'Prefab/BattleArea';

    static _instance: BattleArea = null;
    shipDock: cc.Node;

    private touchArea:cc.Node = null;
    private petArea:cc.Node = null;

    private island:cc.Node = null;

    private petInfo:{
        index:number,
        selfIdleNode:cc.Node,
        opponentIdleNode:cc.Node,
        petObject:PetObject,
    }[] = [];
    private selfPetDatas: PetData[] = null;
    private opponentPetDatas: PetData[] = null;

    static async prompt(Pets: PetData[]): Promise<any> {
        let parentNode = cc.find("Canvas/DialogRoot");
        let vc = BattleArea._instance = await this.loadView<BattleArea>(parentNode, BattleArea);

        vc.applyData(Pets);

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

    async applyData(Pets: PetData[]) {

        this.adjustGameInterface();

        this.shipDock = cc.find("shipDock", this.node);
        this.petArea = cc.find("island/islandNode/island", this.node);
        this.touchArea = cc.find("island/islandNode/touchArea", this.node);
        this.island = cc.find("island/islandNode/island", this.node);

        this.touchArea.on(cc.Node.EventType.TOUCH_START,this.touchStart.bind(this));
        this.touchArea.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove.bind(this));
        this.touchArea.on(cc.Node.EventType.TOUCH_CANCEL,this.touchEnd.bind(this));
        this.touchArea.on(cc.Node.EventType.TOUCH_END,this.touchEnd.bind(this));

        this.initUI();

        let ship = await this.setShip(Pets)

        let act = cc.moveBy(2, cc.v2(500.0)).easing(cc.easeOut(1))

        let opponent = this.setOpponentPets()

        for (let i = 0; i < 4; i++) {
            this.petInfo.push({
                index: i,
                selfIdleNode: cc.find("vs/self/pet" + (i+1), this.island),
                opponentIdleNode: cc.find("vs/opponent/pet" + (i+1), this.island),
                petObject: null
            })

        }

        ship.runAction(act);
        await delay(3);

        this.setSelfPets(Pets);

        delay(2).then(()=>{
            this.updateArrow(Pets, opponent);
        })

        await delay(2);

        if (!this._isAuto) {
            let cb = new VoidCallPromise();
            let wait = () => {
                if (this._isAuto) {
                    cb.resolve();
                    return
                }
                setTimeout(wait,100);
            };
            wait();

            await cb;
        }

        this.hideBtnUI();
        await this.setStartAni(true);

        let isWin = await VSModel.prompt(Pets, opponent, ElementType.fire);

        //judge sucess or failed
        if (isWin) {
            Pets.forEach((pet) => {
                let UserPet = User.instance.findPetDataByPetId(pet.petId);
                UserPet.nowUsing = true;
                UserPet.UsingBy = "Defence"
            })
            User.instance.areaInfo.exploring["unknow"] = true
            User.instance.areaInfo.capture["unknow"] = true
            User.instance.areaInfo.captureStartTime["unknow"] = Date.now();
            User.instance.areaInfo.captureTimeTakenReward["unknow"] = Date.now();
            User.instance.saveUse();
            EventEmitter.emitEvent(EventType.GO_CAPTURE);
        }
        await BattleReward.prompt(isWin, Pets);
        this.close(undefined);
    }

    _isAuto = true;
    initUI() {
        let btn_auto = cc.find("UIRoot/bottom/btn_auto", this.node);
        let icon_auto = cc.find("UIRoot/bottom/auto/icon_auto", this.node);
        let btn_go = cc.find("UIRoot/bottom/btn_go", this.node);

        btn_auto.on(cc.Node.EventType.TOUCH_END, ()=>{
            icon_auto.active = false;
            btn_auto.active = false;
            btn_go.active = true;
            this._isAuto = false;
        })

        btn_go.on(cc.Node.EventType.TOUCH_END, ()=>{
            if (this._isAuto) {
                return;
            }
            this._isAuto = true;
        })
    }

    hideBtnUI() {
        let btn_auto = cc.find("UIRoot/bottom/btn_auto", this.node);
        let icon_auto = cc.find("UIRoot/bottom/auto/icon_auto", this.node);
        let btn_go = cc.find("UIRoot/bottom/btn_go", this.node);

        btn_auto.off(cc.Node.EventType.TOUCH_END);
        btn_go.off(cc.Node.EventType.TOUCH_END);

        btn_go.runAction(cc.fadeOut(0.2));
        btn_auto.runAction(cc.fadeOut(0.2));
        icon_auto.runAction(cc.fadeOut(0.2));
    }

    setStartAni(bool:boolean) {
        let cb = new VoidCallPromise();

        let labelNode = cc.find("UIRoot/center/label", this.node);
        let ani = labelNode.getComponent(cc.Animation);
        if (bool) {
            ani.play();
            ani.on("finished", ()=>{
                cb.resolve();
            })
        } else {
            ani.stop();
            cb.resolve();
        }

        return cb;
    }

    async setShip(Pets: PetData[]) {
        let shipPrefeb = await KKLoader.loadPrefab("Prefab/ShipObject");
        let shipNode = cc.instantiate(shipPrefeb);
        this.shipDock.addChild(shipNode)
        shipNode.x = shipNode.x - 500

        //setPets
       shipNode.getComponent(ShipObject).setPets(Pets);

        return shipNode;
    }

    selfPets:PetObject[] = [];
    setSelfPets(pets: PetData[]) {
        this.selfPetDatas = pets;
        pets.forEach(async (pet, idx) => {
            let petNode = cc.find("ShipObject/PetNode" + (idx + 1), this.shipDock)
            let petAni = petNode.getChildByName("image").getComponent(cc.Animation);
            await delay(idx * 0.2);
            petAni.play("jump");
            await delay(0.55);
            this._preparePetNode(pet, idx, false).then((petObject)=>{
                this.selfPets.push(petObject);

                this.petInfo[idx].petObject = petObject;
            })
        })
    }

    static i = 0;
    setOpponentPets() {
        let petsconfigs = getRandomConfigs(4);

        let petDatas: PetData[] = [];
        petsconfigs.forEach((config, idx) => {
            let petData = {
                petId: config.petId,
                petLevel: BattleArea.i <=0 ?7:2, //Math.floor(Math.random() * 8)
            }
            petDatas.push(petData)

            this._preparePetNode(petData, idx);
        });
        BattleArea.i ++;
        this.opponentPetDatas = petDatas;
        return petDatas;
    }

    async _preparePetNode(petData: PetData, idx: number, isOpponent = true) {

        let islandNode = this.island;
        let petNode = cc.find("pet" + (idx + 1), islandNode);

        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet");
        let preppedPetNode = cc.instantiate(prefab)

        //Hide the pet node by default, but make sure we have a pet prepared
        petNode.parent.addChild(preppedPetNode);

        let petObject = preppedPetNode.getComponent(PetObject) || preppedPetNode.addComponent(PetObject);
        petObject.init(petData, petNode.height);

        let path = isOpponent ? "vs/opponent/pet" : "vs/self/pet";
        let targeNode = cc.find(path + (idx + 1), islandNode).convertToWorldSpaceAR(cc.v2(0, 0));
        let targePos = petNode.getParent().convertToNodeSpaceAR(targeNode);

        if (isOpponent) {
            preppedPetNode.position = petNode.position;

            let wanderBehavior = new Wander();
            wanderBehavior.init(petObject, "landPet", { position: targePos, wanderRadius: 15, useAnchor: true, target: targePos.sub(cc.v2(0, 1)) });
            wanderBehavior.start()
        } else {
            preppedPetNode.position = targePos;

            let landBehavior = new Land();
            landBehavior.init(petObject, "landPet");
            landBehavior.start();
        }

        return petObject;
    }

    updateArrow(self: PetData[], opponent: PetData[]) {
        let arrows = cc.find("vs/arrows", this.petArea);
        let selfNodes = cc.find("vs/self", this.petArea);
        let opponentNodes = cc.find("vs/opponent", this.petArea);
        arrows.children.forEach((node, i) => {
            let green = node.getChildByName("green");
            let red = node.getChildByName("red");

            if (self.length - 1 >= i && opponent.length - 1 >= i) {
                let config1 = getPetConfigById(self[i].petId);
                let config2 = getPetConfigById(opponent[i].petId);

                let result = getRestraint(config1.elements as ElementType, config2.elements as ElementType);
                green.active = (result == 1);
                red.active = (result == -1);

                let strength_self = getStrengthByPetData(self[i]);
                let strength_opponent =  getStrengthByPetData(opponent[i]);

                let label_self = cc.find(`pet${i+1}/label`,selfNodes).getComponent(cc.Label);
                let label_opponent = cc.find(`pet${i+1}/label`,opponentNodes).getComponent(cc.Label);

                let bonus_self = Math.floor(strength_self*0.1*10)/10;
                label_self.string = green.active?`${strength_self + bonus_self}(${bonus_self})`:""+strength_self;
                let bouns_opponent = Math.floor(strength_opponent*0.1*10)/10;
                label_opponent.string = red.active?`${strength_opponent+bouns_opponent}(${bouns_opponent})`:""+strength_opponent;
            }
        })
    }

    private validTouchInstanceId: number = 0;
    canTouch = true;
    isStartTouch = false;
    touchedPlayspacePet: PetObject = null;
    touchStart(eventTouch: cc.Event.EventTouch) {
        var touches = eventTouch.getTouches();
        if (touches.length == 0 || (this.validTouchInstanceId > 0 && touches[0].__instanceId != this.validTouchInstanceId) || !this.canTouch) {
            this.validTouchInstanceId = 0;
            return;
        }
        if (this.isStartTouch)
            return;
        this.validTouchInstanceId = touches[0].__instanceId;
        this.isStartTouch = true;

        this.touchedPlayspacePet = this.findPetByPos(eventTouch.getLocation());
        if (this.touchedPlayspacePet) {
            this.showGizmo(true);
            this.touchedPlayspacePet.node.zIndex = 99;
        }
    }

    touchMove(eventTouch: cc.Event.EventTouch) {
        if (!this.canTouch || !this.isStartTouch)
            return;

        if (eventTouch.getTouches().length > 1) {
            this.validTouchInstanceId = 0;
            return;
        }
        if ( this.touchedPlayspacePet) {
            let touchPos = this.petArea.convertToNodeSpaceAR(eventTouch.getLocation());
            this.touchedPlayspacePet.node.setPosition(touchPos);
        }
    }

    touchEnd(eventTouch: cc.Event.EventTouch) {
        if (!this.canTouch || !this.isStartTouch)
            return;

        this.isStartTouch = false;

        if (this.touchedPlayspacePet) {
            let targetIndex = this.findIdleNodeIndex(eventTouch.getLocation());
            if (targetIndex >= 0 && this.petInfo[targetIndex].petObject.petData.petId != this.touchedPlayspacePet.petData.petId) {
                //TODO  changePet
                this.changePet(this.touchedPlayspacePet, targetIndex);
            }else {
                //TODO return Pet
                this.returnPet(this.touchedPlayspacePet);
            }
            this.showGizmo(false);
            this.touchedPlayspacePet = null;
        }
    }


    private findIdleNodeIndex(globalPos: cc.Vec2): (number) {
        let petIdleNodes = cc.find("vs/self", this.petArea).children
        
        let touchPos = this.petArea.convertToNodeSpaceAR(globalPos);
        // touchPos.subSelf(cc.v2(0, 60)); // move touch down; we are comparing to pet feet.
        let closeToTouch = (pet: cc.Node, index: number) => {
            let dist = pet.position.sub(touchPos).mag();
            return  dist < 60;
        }

        // const frontWeight = 0.0001;
        let score = (a: cc.Node, touch: cc.Vec2) => {
            // // mostly we care about who's closest to the touch,
            // // but if it's close, give some weight to who's in front 
            let dist = touch.sub(a.position).mag();
            // let frontness = -a.node.position.y;
            return -dist; // lower distance is better
        }

        let bestest = (a: cc.Node, b: cc.Node) => {
            return score(b, touchPos) - score(a, touchPos);
        }

        let sorted = petIdleNodes.filter(closeToTouch).sort(bestest);
        let touched = sorted.length > 0 ? sorted[0]: null;
        let i =touched ? petIdleNodes.findIndex((node)=> node.name == touched.name): -1;

        return i;
    }

    private findPetByPos(globalPos: cc.Vec2): (PetObject | undefined) {

        let touchPos = this.petArea.convertToNodeSpaceAR(globalPos);
        touchPos.subSelf(cc.v2(0, 50)); // move touch down; we are comparing to pet feet.
        let closeToTouch = (pet: PetObject, index: number) => {
            let dist = pet.node.position.sub(touchPos).mag();
            return  dist < 60;
        }

        // const frontWeight = 0.0001;
        let score = (a: PetObject, touch: cc.Vec2) => {
            // // mostly we care about who's closest to the touch,
            // // but if it's close, give some weight to who's in front 
            let dist = touch.sub(a.node.position).mag();
            // let frontness = -a.node.position.y;
            return -dist; // lower distance is better
        }

        let bestest = (a: PetObject, b: PetObject) => {
            return score(b, touchPos) - score(a, touchPos);
        }

        let sorted = this.selfPets.filter(closeToTouch).sort(bestest);
        let touched = sorted[0];
        return touched;
    }

    private changePet(origin:PetObject, targetIndex: number) {

        let originIndex = this.petInfo.findIndex(data => data.petObject.petData.petId == origin.petData.petId);

        //TODO changePetPos
        let worldPos = this.petInfo[targetIndex].selfIdleNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let targePos1 = origin.node.getParent().convertToNodeSpaceAR(worldPos);
        origin.node.runAction(cc.moveTo(0.1, targePos1));


        if (this.petInfo[targetIndex].petObject) {
            let targePet = this.petInfo[targetIndex].petObject;
            worldPos = this.petInfo[originIndex].selfIdleNode.convertToWorldSpaceAR(cc.v2(0, 0));
            let targePos2 = targePet.node.getParent().convertToNodeSpaceAR(worldPos);
            targePet.node.runAction(cc.moveTo(0.1, targePos2));
        }

        let petTemp = this.petInfo[targetIndex].petObject;
        this.petInfo[targetIndex].petObject = origin;
        this.petInfo[originIndex].petObject = petTemp;

        this.petInfo.forEach((data, i)=>{
            this.selfPetDatas[i]= data.petObject.petData;
        })

        //Update arrow
        this.updateArrow(this.selfPetDatas, this.opponentPetDatas);
    }

    private returnPet(origin:PetObject) {
        for (let idx = 0; idx < this.selfPetDatas.length; idx++) {
            let petData = this.selfPetDatas[idx];
            if (petData.petId == origin.petData.petId) {
                let worldPos = cc.find("vs/self/pet" + (idx + 1), this.island).convertToWorldSpaceAR(cc.v2(0, 0));
                let targePos2 = origin.node.getParent().convertToNodeSpaceAR(worldPos);
                origin.node.runAction(cc.moveTo(0.1, targePos2));
                
                break;
            }
        }
    }

    showGizmo(bool: boolean) {
        let selfGizmoNodes = cc.find("vs/self", this.petArea);
        selfGizmoNodes.children.forEach((node)=>{
            node.getChildByName("gizmo").opacity =bool? 120:30;
        })
    }

    getIslandDef() {
        //debug
        return 15 - Math.random() * 10
    }

    adjustGameInterface() {
        let scale = ScreenSize.getScale(1, 0.8);

        this._originScale = this.node.scale = scale;
    }

    onClose() {
        this.node.stopAllActions();
    }
}