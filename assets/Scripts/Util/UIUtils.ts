import { Rarity, ElementType } from "../Config";

export function SetElements(element: ElementType[] | ElementType | string, node) {
    // background graphics

    let natureNode = cc.find("type_land", node);
    let fireNode = cc.find("type_fire", node);
    let waterNode = cc.find("type_water", node);
    let snackNode = cc.find("type_snack", node);
    natureNode.active = false;
    fireNode.active = false;
    waterNode.active = false;
    snackNode.active = false;

    let elements =[];
    if (element instanceof Array) {
        elements = element;
    } else {
        elements = [element];
    }

    // element icons
    elements.forEach(element => {
        switch (element) {
            case "nature":
                natureNode.active = true;
                break;
            case "fire":
                fireNode.active = true;
                break;
            case "water":
                waterNode.active = true;
                break;
            case "snack":
                snackNode.active = true;
                break;
        }
    });
}
