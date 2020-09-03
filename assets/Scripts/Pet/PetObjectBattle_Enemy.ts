import { Attack } from "./Behviors/Attack";
import { PetObject } from "./PetObject";
import { MoveToTarget } from "./Behviors/MoveToTarget";
import { PetObjectBattle } from "./PetObjectBattle";


export enum PetType {
    None = "None",
    Garden = "Garden",
    Battle = "Battle",
    Battle2 = "Battle2",
}

const { ccclass, property } = cc._decorator;

@ccclass
export class PetObjectBattle_Enemy extends PetObjectBattle {

    async attack(targePets: PetObjectBattle[]) {

        if (this._currentBehavior.getType() != "Attack" && this._currentBehavior.getType() != "MoveToTarget") {
            let index = 0;
            let distance = 0;
            let isFind : boolean = false;
            targePets.forEach((pets, i) => {

                let tempDistance = pets.node.position.sub(this.node.position).mag();
                if (tempDistance > 200) {
                    return;
                }
                if (tempDistance > distance && !pets.isDead()) {
                    distance = tempDistance;
                    index = i;
                    isFind = true;
                }
            });
            if (!isFind) {
                return;
            }
            let behavior = new MoveToTarget();
            behavior.init(this, "petMainWander", { targetPet: targePets[index] });
            let isMoveTo = await behavior.start();
            if (isMoveTo) {
                let behavior_attack = new Attack();
                behavior_attack.init(this, "petMainWander", { targetPet: targePets[index] });
                behavior_attack.start();
            }
        }
    }

}
