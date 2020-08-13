
export class MathUtils {

    static RandomChance(chance):boolean{
        MathUtils.Clamp(chance, 0, 1);
        if(chance >= 1)
            return true
        
        return (Math.random() < chance);
    }

    static RandomRange(min:number, max:number) : number{
        return (Math.random() * (max - min) + min);
    }

    static Clamp(value:number, min:number, max:number) : number{
        return Math.max(min, Math.min(value, max));
    }

    static Vec2Distance(a:cc.Vec2, b:cc.Vec2) : number{
        return a.sub(b).mag();
    }

    static Vec3Distance(a:cc.Vec3, b:cc.Vec3) : number{
        return a.sub(b).mag();
    }
}

export function sumEach<T>(items:T[], func:(iem:T)=>number){
    let total = 0;
    items.forEach( x=> total+=func(x)||0 );
    return total;
}
