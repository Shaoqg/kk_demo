import { PetObject } from "./PetObject";


export interface IAttack{ 
    attack:(pet:PetObject)=>{}
    beAttack:(pet:PetObject)=>{
    }
}