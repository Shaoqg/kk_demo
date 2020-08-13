
export type RandomFunc = () => number;
export function makeSeededRandom(seedString:string) : RandomFunc{
    let seedFunc = xmur3(seedString);
    // sfc32 takes four 32bit numbers; 
    // I tried using index for one of the seeds,
    // but I got the same result for evey index. 
    var rand = sfc32(seedFunc(), seedFunc(), seedFunc(), seedFunc());
    return rand;
}

// support functions;
// see https://stackoverflow.com/a/47593316
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math_imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    return function() {
        h = Math_imul(h ^ h >>> 16, 2246822507);
        h = Math_imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}


function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

let Math_imul = Math['imul'] || function(a, b) {
    var ah = (a >>> 16) & 0xffff;
    var al = a & 0xffff;
    var bh = (b >>> 16) & 0xffff;
    var bl = b & 0xffff;
    // the shift by 0 fixes the sign on the high part
    // the final |0 converts the unsigned value into a signed value
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
  };

export function getColor(input:string) : cc.Color {
    let convertStringToInt = (ch:string) => {
        if(ch.length == 2) {
            return parseInt("0x000000"+ch, 16);
        }
    }

    let returningColor: cc.Color;

    if(input.length == 6) {
        let r, g, b;
        r = input.substr(0,2);
        g = input.substr(2,2);
        b = input.substr(4,2);

        let rInt, gInt, bInt;
        rInt = convertStringToInt(r);
        gInt = convertStringToInt(g);
        bInt = convertStringToInt(b);

        returningColor = cc.color(rInt, gInt, bInt, 255);
    } else if(input.length == 8) {
        let r, g, b, a;
        r = input.substr(0,2);
        g = input.substr(2,2);
        b = input.substr(4,2);
        a = input.substr(6,2);

        let rInt, gInt, bInt, aInt;
        rInt = convertStringToInt(r);
        gInt = convertStringToInt(g);
        bInt = convertStringToInt(b);
        aInt = convertStringToInt(a);

        returningColor = cc.color(rInt, gInt, bInt, aInt);
    } else {
        console.warn("Could not convert string to color.");
        returningColor = cc.color(255, 255, 255, 255);
    }

    return returningColor;
}

export async function awaitAnimation(animation:cc.Animation) : Promise<void> {

    let animFinishedCB;
    let executor = (resolve:(any)=>void, reject:(error)=>void) =>{
        animFinishedCB = resolve;
    }

    if(animation) {
        animation.once(cc.Animation.EventType.FINISHED, () => { animFinishedCB(); });
    }

    return new Promise<void>(executor);
}

export function getWorldAngle(node: cc.Node) : number {
    let angle = 0;
    do {
        angle += node.angle;
        node = node.getParent();
    } while(node);

    return angle;
}

export function shuffleInPlace(arr: Array<any>) {
    for(let i = 0; i < arr.length; i++) {
        let rndIdx = Math.floor(Math.random()*arr.length);
        let temp = arr[i];
        arr[i] = arr[rndIdx];
        arr[rndIdx] = temp;
    }
}
