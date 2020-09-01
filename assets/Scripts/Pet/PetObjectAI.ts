
import { PetObject } from './PetObject';
import { Idle } from './Behviors/Idle';
import { Wander } from './Behviors/Wander';
import { MoveToPosition } from './Behviors/MoveToPosition';
import { PerformAnimation } from './Behviors/PerformAnimation';
import { Behavior } from './Behviors/Behavior';

export class PetObjectAI {

    private static _behaviorClasses = {
        "Behavior": () => {return new Behavior();},
        "MoveToPosition": () => {return new MoveToPosition();},
        "PerformAnimation": () => {return new PerformAnimation();},
        "Idle": () => {return new Idle();},
        "Run": () => {return new Wander();},
    }

    static BehaviorEmoticons = {
        "dig": "emoticon_money",
        "sleepy": "emoticon_sleepy",
        "chase": "emoticon_devilish",
        "bored": "magic_rock",
        "swim": "emoticon_thirsty",
        "dirty": "emoticon_dirty",
        "boredBall": "ball",
        "magic_rock": "magic_rock",
        "boredBalloon": "balloon",
        "hungry": "food_02",
        "sleepyTent": "tent",
        "sleepyDrink": "energy_drink",
        "boredMagicRock": "magic_rock"
    }

    static getBehavior(id:string) : Behavior {
        if(PetObjectAI._behaviorClasses[id] == undefined) {
            console.error(id + " is not a valid behavior!");
            return undefined;
        }
        return PetObjectAI._behaviorClasses[id]();
    }

    static getClosestPet(checkPet:PetObject) : [PetObject, number, number]{
        let checkPos = checkPet.node.getPosition();
        let closePet: PetObject = null;
        let smallest = Infinity;

        let smallestY = closePet ? Math.abs(closePet.getWorldPostion().x - checkPos.x) : Infinity;
        return [closePet, smallest, smallestY];
    }

}