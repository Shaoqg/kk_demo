import { PetData, getRandomConfigs, getBattleOpponentConfig, PetConfigType, getStrengthByPetData } from "../Config";
import { KKLoader } from "../Util/KKLoader";
import { PetObject, PetType } from "../Pet/PetObject";
import { Drop } from "../Pet/Behviors/Drop";
import { Wander } from "../Pet/Behviors/Wander";
import { delay, VoidCallPromise, CallPromise } from "../kk/DataUtils";
import { Idle } from "../Pet/Behviors/Idle";
import { BattleReward } from "../Screens/BattleReward";
import { StateManager } from "./State/StateManager";
import { PetObjectBattle } from "../Pet/PetObjectBattle";
import { Land } from "../Pet/Behviors/Land";
import { PetObjectBattle_Enemy } from "../Pet/PetObjectBattle_Enemy";
import BattleUI from "../UI/BattleUI";
import User from "./User";
import { EventEmitter, EventType } from "../Tools/EventEmitter";
import AdventureManager from "./AdventureManager";


export default class BattleArea2Manager {

    static instance: BattleArea2Manager = null;

    petNodes: cc.Node = null;
    selfPetDatas: PetData[] = [];

    selfPets: PetObjectBattle[] = [];
    opponent: PetObjectBattle[] = [];

    areaName:string = "";
    CurrentBattleOppnonentTotal = 0;
    battleIndex = -1;
    battleList: PetConfigType[][] = [];

    battlePromise: CallPromise<boolean> = null;

    pause = true;
    pauseTime = 1;

    attackTime = 0.3;

    constructor(pets: PetData[], petNodes: cc.Node, areaName:string) {
        this.petNodes = petNodes;
        this.areaName = areaName
        this.init(pets);
        BattleArea2Manager.instance = this;
    }


    async init(pets: PetData[]) {
        // creat
        await this.creatPetPool();

        this.creatSelfPet(pets);
        BattleUI.instance.setOnclickCB(this.selfPetDatas, this.triggerSkill.bind(this));

        this.battleList = getBattleOpponentConfig(this.areaName);
        this.creatOpponentPet(this.battleList.pop());

        this.battlePromise = new CallPromise<boolean>();

        // await delay(9);
        // //TODO attact pet
        // this.selfPets.forEach(async (pet, idx) => {
        //     await delay(idx * 0.1);
        //     pet.attack(this.opponent[this.opponent.length - 1]);
        // })
        delay(2).then(() => {
            this.pause = false;
        })

        let isWin = await this.battlePromise;
        if (isWin) {
            AdventureManager.instance.onEndExplore(true);

            EventEmitter.emitEvent(EventType.GO_CAPTURE);    
        }


        await BattleReward.prompt(isWin, pets);
        StateManager.instance.changeState("IslandState");
    }

    update(dt) {
        BattleUI.instance.update(dt);
        if (this.pause || this.pauseTime >= 0) {
            this.pauseTime -= dt;
        } else if (this.selfPets.length <= 0) {//palyer dead
            this.battlePromise.resolve(false);
        } else if (this.opponent.length > 0) {
            this.attackTime -= dt;
            if (this.attackTime <= 0) {
                this.attackTime += 0.3;
                //TODO attack  opponnetPet 
                for (let i = 0; i < this.opponent.length; i++) {
                    this.opponent[i].attack(this.selfPets);
                }

                for (let i = 0; i < this.selfPets.length; i++) {
                    this.selfPets[i].attack(this.opponent);
                }
            }
        } else if (this.battleList.length > 0) {
            this.updateBattleProgress();
            this.creatOpponentPet(this.battleList.pop());
            this.pauseTime = 1;

            for (let i = 0; i < this.selfPets.length; i++) {
                this.selfPets[i].clearBehavior(true);
            }
        } else {
            //TODO win 
            this.battlePromise.resolve(true);
        }
    }

    creatSelfPet(pets: PetData[]) {
        this.selfPetDatas = pets;
        pets.forEach(async (pet, idx) => {
            await delay((idx+1) * 0.3);
            let petObject = this._preparePetNode(pet, idx, this.getPos(false), false);
            petObject.teamIndx = idx;

            this.selfPets.push(petObject);
            petObject.onDeadCallback = () => {
                let index = this.selfPets.findIndex(pet => pet.node.name == petObject.node.name);
                this.selfPets.splice(index, 1);
                petObject.onRemove().then(() => {
                    this.setPetNode(petObject.node);
                })
            }
            // this.petInfo[idx].petObject = petObject;
        })
    }

    creatOpponentPet(petconfigs: PetConfigType[]) {
        let petDatas: PetData[] = [];
        this.CurrentBattleOppnonentTotal = petconfigs.length;
        this.battleIndex++;

        let levelInfo = User.instance.getAreaInfo(this.areaName).levelInfo;

        let baseLevel = levelInfo.level;

        let pos = this.getPos(true);
        petconfigs.forEach((config, idx) => {
            let petData = {
                petId: config.petId,
                petLevel: baseLevel
            }
            petDatas.push(petData)
            let petObject = this._preparePetNode(petData, idx, pos, true);

            this.opponent.push(petObject);
            petObject.onDeadCallback = () => {
                let index = this.opponent.findIndex(pet => pet.node.name == petObject.node.name);
                this.opponent.splice(index, 1);
                petObject.onRemove().then(() => {
                    this.setPetNode(petObject.node);
                })
                this.updateBattleProgress();
            }

        });
        // this.opponentPetDatas = petDatas;
        return petDatas;
    }

    updateBattleProgress() {
        let progress = 1 - this.opponent.length / this.CurrentBattleOppnonentTotal;

        BattleUI.instance.updateProgress(this.battleIndex, progress);
    }

    _petCount = 0;
    _petPool: cc.NodePool = null;
    async creatPetPool() {
        this._petPool = new cc.NodePool();
        //Hide the pet node by default, but make sure we have a pet prepared
        let prefab = await KKLoader.loadPrefab("Prefab/pet_battle");
        for (let index = 0; index < 10; index++) {
            let preppedPetNode = cc.instantiate(prefab)
            this._petPool.put(preppedPetNode);
        }
    }

    getPetNode(): cc.Node {
        if (this._petPool.size() > 0) {
            return this._petPool.get();
        }
        return null;
    }

    setPetNode(node: cc.Node) {
        this._petPool.put(node);
    }

    _preparePetNode(petData: PetData, idx: number, targePos: cc.Vec2, isOpponent = false) {

        // let islandNode = this.island;
        let petNode = cc.find("petTempNode", this.petNodes);

        //Hide the pet node by default, but make sure we have a pet prepared
        let preppedPetNode = this.getPetNode();
        preppedPetNode.name = petData.petId + this._petCount++;

        //Hide the pet node by default, but make sure we have a pet prepared
        petNode.parent.addChild(preppedPetNode);

        let petObject: PetObjectBattle = preppedPetNode.getComponent(!isOpponent ? PetObjectBattle : PetObjectBattle_Enemy)
            || preppedPetNode.addComponent(!isOpponent ? PetObjectBattle : PetObjectBattle_Enemy);
        petObject.init(petData, petNode.height, !isOpponent);

        if (isOpponent) {
            preppedPetNode.position = targePos.add(cc.v2(10 * idx, 20 * idx));

            let wanderBehavior = new Wander();
            wanderBehavior.init(petObject, "landPet", { position: preppedPetNode.position, wanderRadius: 100, useAnchor: true, target: targePos.add(cc.v2(Math.random() * 20, Math.random() * 20)) });
            wanderBehavior.start();
        } else {
            preppedPetNode.position = targePos;

            // let wanderBehavior = new Wander();
            // wanderBehavior.init(petObject, "landPet", { position: this.posList_to.pop(), wanderRadius: 15, useAnchor: true, target: targePos.sub(cc.v2(0, 1)) });
            // wanderBehavior.start()

            let landBehavior = new Land();
            landBehavior.init(petObject, "landPet");
            landBehavior.start();
        }

        return petObject;
    }

    posList = [cc.v2(-200, 250), cc.v2(200, 250), cc.v2(-200, 250), cc.v2(200, 250)];
    posList_to = [cc.v2(0, 100), cc.v2(0, 70), cc.v2(0, 30), cc.v2(0, 0)];
    posList_self = [cc.v2(200, -350), cc.v2(100, -350), cc.v2(0, -350), cc.v2(-100, -350)];
    getPos(isOpponent) {
        let center = cc.Vec2.ZERO;
        if (isOpponent) {
            center = this.posList.pop();
        } else {
            center = this.posList_self.pop();
        }
        return center;
    }

    async triggerSkill(petData: PetData) {
        let petObject = this.selfPets.find((pets) => { return pets.petData.petId == petData.petId })
        // KKLoader.loadRes("FX/skill_add", cc.);
        let pf = await KKLoader.loadPrefab("Prefab/skill_add");
        let node = cc.instantiate(pf);
        node.setParent(petObject.node.getParent());
        node.zIndex = 999;
        node.position = petObject.node.position;
        let addNum = getStrengthByPetData(petData) * 2;
        petObject.addHealth(addNum);
        await delay(1);
        node.destroy();
    }
}
