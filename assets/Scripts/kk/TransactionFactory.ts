export{TransactionFactory};

import {jstr, getInObject} from "./DataUtils";

// TODO configure at some future date

const tempConfig = {
    "Eggs" : { "egg17" : {coins: 5, id:"egg17"} },
 "Cookies" : { cookie1 : {coins: 10, cookies:1} } 
};

const topKeyToDefintion= {
        // todo make arrays into maps for clarity? 
    "buyEgg" : {
        getDataFromConfig:"Egg",
        remove: [[ 'wallet.coins', 'coins' ]], // savegame path,  path to data in config item
        add: [['eggsOwned', 'id']] // savegame path,  path to data in config item
    },

    "buyCookie" : {
        getDataFromConfig:"Cookies",
        remove: [[ 'wallet.coins', 'coins']], // savegame path,  path to data in config item
        add: [['wallet.cookies', 'cookies']] // savegame path,  path to data in config item
    }
};

class TransactionFactory {

    // TODO could do some caching in here, for speed?


    static transactionFor(topKey:string, id:string, amount:number=1){
        const defintion = topKeyToDefintion[topKey];

        if (!defintion){
            return this.customTransactionFor(topKey, id, amount);
        }

        const config = tempConfig;
        // const configItem =configFactory.itemFor(topKey,Id);
        const configItem = tempConfig[topKey][id];
        let transaction = {};

        // TODO loop 'add' 'remove' and then items
        let remove0:[string,string] = defintion.remove[0];
        let r0data = getInObject(configItem, remove0[1] );
        transaction['remove'] = [ [remove0[0], r0data ] ];
        
        let add0:[string,string] = defintion.add[0];
        let add0data = getInObject(configItem, add0[1] );

        transaction['add'] = [ [add0[0], add0data ] ];
    }

    static customTransactionFor(topKey:string, id:string, amount:number=1){
        return undefined;
    }

}
