import { PetData, getPetConfigById } from "../Config";
import GlobalResources, { SpriteType } from "../Util/GlobalResource";
import User from "../Gameplay/User";
import { EventEmitter, EventType } from "./EventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShipObject extends cc.Component {

    start() {
        this.setMast();
        EventEmitter.subscribeTo(EventType.UPDATE_SPEED, this.setMast.bind(this));

    }

    async setPets(pets: PetData[]) {
        for (let i = 1; i <= pets.length; i++) {
            let petNode = cc.find("PetNode" + i, this.node);
            let petImage = petNode.getChildByName("image").getComponent(cc.Sprite);
            let petconfig = getPetConfigById(pets[i - 1].petId);

            petNode.active = true;
            petImage.spriteFrame = await GlobalResources.getSpriteFrame(SpriteType.Pet, petconfig.art_asset);
        }
    }

    setMast() {
        let level = User.instance.ship_speed_level+1;
        for (let i = 1; i < level; i++) {
            let mast = cc.find("mast" + (i + 1), this.node);
            mast.active = true;
        }
    }

}
