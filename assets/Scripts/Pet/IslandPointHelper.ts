import { IsLandType } from "../Config";
import IslandManager from "../Gameplay/Island/IslandManager";


export class IslandPointHelper {
    static getIslandBounds(islandType: IsLandType) : {left: number, top: number, right: number, bottom: number} {
        let loadedIsland = IslandManager.instance.getNodeByType(islandType);
        
        let petArea = cc.find("island/mapblocks/petArea", loadedIsland);
        let center = petArea.position;

        //TODO getScale?
        let left = center.x - petArea.width/2;  
        let top = center.y + petArea.height/2;
        let right = center.x + petArea.width/2;  
        let bottom = center.y - petArea.height/2;  

        return {left, top, right, bottom};
    }

    static getRandomPointOnIsland(islandType: IsLandType) {
        let islandBounds = this.getIslandBounds(islandType);
        
        let islandWidth = islandBounds.right - islandBounds.left;
        let random1 = Math.random();
        let randomX = (random1 * islandWidth) + islandBounds.left;

        let islandHeight = islandBounds.top - islandBounds.bottom;
        let random2 = Math.random();
        let randomY = (random2 * islandHeight) + islandBounds.bottom;
        return cc.v2(randomX, randomY);
    }

    
    // static calculateYfromX(x: number) : number {
    //     let yBounds = this.calculateYBoundsFromX(x);
    //     let yDistance = yBounds.top - yBounds.bottom;

    //     return (Math.random() * yDistance) + yBounds.bottom +100;
    // }

    // static calculateYfromXInCornoer(x: number) : number {
    //     let yBounds = this.calculateYBoundsFromX(x);
    //     let yDistance = (yBounds.top - yBounds.bottom)/2;
    //     return yBounds.top+ 100 - (Math.random() * yDistance);
    // }

    // static calculateYBoundsFromX(x: number) : {top: number, bottom: number} {
    //     let islandBounds = this.getIslandBounds();
    //     let getSlope = (p1: cc.Vec2, p2: cc.Vec2) => {
    //         return (p2.y - p1.y) / (p2.x - p1.x);
    //     }

    //     let rxOnLeft: boolean = x < 0;
    //     let upperSlope: number;
    //     let lowerSlope: number;

    //     if(rxOnLeft) {
    //         upperSlope = getSlope(islandBounds.left, islandBounds.top);
    //         lowerSlope = getSlope(islandBounds.left, islandBounds.bottom);
    //     } else {
    //         upperSlope = getSlope(islandBounds.top, islandBounds.right);
    //         lowerSlope = getSlope(islandBounds.bottom, islandBounds.right);
    //     }

    //     let yTop = islandBounds.top.y + (x * upperSlope);
    //     let yBottom = islandBounds.bottom.y + (x * lowerSlope);

    //     return {top:yTop, bottom:yBottom};
    // }

    
    // takes world point
    // returns world point
    // static getPointLockedToIsland(worldPoint: cc.Vec2) : cc.Vec2 {
    //     let loadedIsland = IslandManager.getLoadedIsland() as cc.Node;
    //     let islandPoint = loadedIsland.convertToNodeSpaceAR(worldPoint);

    //     let withinIsland = this.pointIsInIsland(worldPoint);
    //     if(withinIsland) {
    //         return worldPoint;
    //     }

    //     let yBounds = this.calculateYBoundsFromX(islandPoint.x);

    //     let y = islandPoint.y > 0 ? yBounds.top : yBounds.bottom;

    //     return loadedIsland.convertToWorldSpaceAR(cc.v2(islandPoint.x, y));
    // }

    // takes world point
    // static pointIsInIsland(worldPoint: cc.Vec2) : boolean {
    //     let loadedIsland = IslandManager.getLoadedIsland() as cc.Node;
    //     let islandPoint = loadedIsland.convertToNodeSpaceAR(worldPoint);
    //     let bounds = this.getIslandBounds();

    //     let xabs = Math.abs(islandPoint.dot(cc.v2(1,0)));
    //     let yabs = Math.abs(islandPoint.dot(cc.v2(0,1)));
    //     return (xabs / bounds.right.x) + (yabs / bounds.top.y) <= 1;
    // }
    // static pointIsInCorner(islandPoint: cc.Vec2) : boolean {
    //     return islandPoint.x<0&&islandPoint.y+100>0;
    // }
}