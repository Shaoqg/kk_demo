let path = {
    castle:"Canvas/world/island/islandNode",
    nature:"Canvas/world/island/natureNode",
    fire:"Canvas/world/island/fireNode",
    food:"Canvas/world/island/snackNode",
    water:"Canvas/world/island/waterNode",
}

export class IslandPointHelper {
    static getIslandBounds(relativeIslandNode?: cc.Node) : {left: cc.Vec2, top: cc.Vec2, right: cc.Vec2, bottom: cc.Vec2} {
        let island = cc.find(path.castle);
        let loadedIsland = relativeIslandNode || island as cc.Node ;
        
        let center = loadedIsland.position;
        let islandNode = loadedIsland.getChildByName("island");

        let islandImageNode = islandNode.getChildByName("bg").children[0].children[0];
        let islandImageSize = islandImageNode.getComponent<cc.Sprite>(cc.Sprite).spriteFrame.getOriginalSize();
        
        let left = cc.v2(center.x - islandImageNode.width/2 + 160, center.y); // move right because ripples and offscreen
        
        let top = cc.v2(center.x, center.y + islandImageNode.height/2 - 100);
        let right = cc.v2(center.x + islandImageNode.width/2 - 160, center.y); // move left because ripples and offscreen
        let bottom = cc.v2(center.x, center.y - islandImageNode.height/2 + 100); // move up because of wave ripples are part of the image

        return {left, top, right, bottom};
    }

    static getRandomPointOnIsland(relativeIslandNode?: cc.Node) {
        let islandBounds = this.getIslandBounds(relativeIslandNode);
        
        let islandWidth = islandBounds.right.x - islandBounds.left.x;

        let random = Math.random();
        let randomX = (random * islandWidth) + islandBounds.left.x;

        let randomY = this.calculateYfromX(randomX);
        return cc.v2(randomX, randomY);
    }

    
    static calculateYfromX(x: number) : number {
        let yBounds = this.calculateYBoundsFromX(x);
        let yDistance = yBounds.top - yBounds.bottom;

        return (Math.random() * yDistance) + yBounds.bottom +100;
    }

    static calculateYfromXInCornoer(x: number) : number {
        let yBounds = this.calculateYBoundsFromX(x);
        let yDistance = (yBounds.top - yBounds.bottom)/2;
        return yBounds.top+ 100 - (Math.random() * yDistance);
    }

    static calculateYBoundsFromX(x: number) : {top: number, bottom: number} {
        let islandBounds = this.getIslandBounds();
        let getSlope = (p1: cc.Vec2, p2: cc.Vec2) => {
            return (p2.y - p1.y) / (p2.x - p1.x);
        }

        let rxOnLeft: boolean = x < 0;
        let upperSlope: number;
        let lowerSlope: number;

        if(rxOnLeft) {
            upperSlope = getSlope(islandBounds.left, islandBounds.top);
            lowerSlope = getSlope(islandBounds.left, islandBounds.bottom);
        } else {
            upperSlope = getSlope(islandBounds.top, islandBounds.right);
            lowerSlope = getSlope(islandBounds.bottom, islandBounds.right);
        }

        let yTop = islandBounds.top.y + (x * upperSlope);
        let yBottom = islandBounds.bottom.y + (x * lowerSlope);

        return {top:yTop, bottom:yBottom};
    }

    static getRandomPointOnIslandInWorldSpaceForPet(petNode: cc.Node) : cc.Vec2 {
        let loadedIsland = cc.find(path.castle);
        
        let point = this.getRandomPointOnIsland(loadedIsland);
        
        return loadedIsland.convertToWorldSpaceAR(point);
    }
    
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