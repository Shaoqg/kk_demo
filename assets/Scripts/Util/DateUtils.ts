// import KKGClient from "../kk/KKGClient";
// import { I18N } from "../Tools/I18N";
// import { GetServerTimeResponse, GetServerTimeRequest } from "../kk/ServiceTypes";

export type DateData = {
    minute: number,
    hour: number,
    day: number,
    month: number,
    year: number
};

export class DateUtils {

    static MS_PER_DAY = 60 * 60 * 24 * 1000;
    static MS_PER_HOUR = 60 * 60 * 1000;
    static MS_PER_MINUTE = 60 * 1000;
    static MS_PER_SECOND = 1000;

    private static _serverTime: number;
    private static _retrievalTime: number;

    private static _kkgClient;
    // static set kkgClient(client: KKGClient) {
    //     this._kkgClient = client;
    //     DateUtils.retrieveServerTime();
    // }

    // static retrieveServerTime() {
    //     if(this._kkgClient) {

    //         let request : GetServerTimeRequest = {clientTime: Date.now()};
    //         this._kkgClient.getServerTime(request).then((res: GetServerTimeResponse) => {
    //             if(res && res.time) {
    //                 this._serverTime = res.time;
    //                 this._retrievalTime = Date.now();
    //             } else {
    //                 this._serverTime = this._retrievalTime = Date.now();
    //             }
    //         }).catch((e) => {
    //             this._serverTime = this._retrievalTime = Date.now();
    //         });

    //         return;
    //     }

    //     this._serverTime = this._retrievalTime = Date.now();
    // }
    
    // static getServerTime() {
    //     if(!this._kkgClient){
    //         console.error('no time from server');
    //         return Date.now();
    //     }

    //     let delta = Date.now() - this._retrievalTime;
    //     if(delta > this.MS_PER_MINUTE * 5) {
    //         this.retrieveServerTime();
    //     }
    //     return this._serverTime + delta;
    // }

    static getCurrentHourMin(timestamp?: number): string {
        let timeString = new Date(timestamp).toISOString().split("T")[1];
        let hms = timeString.split(":");

        return hms[0] + ":" + hms[1];
    }

    static getISODateString(timestamp?: number): string {
        return new Date(timestamp).toISOString().split("T")[0];
    }

    static getUTCTimestampFromYMDH(y: number, m: number, d: number, h: number) {
        let min = (h*60)%60; // partial hours are useful for testing!
        return Date.UTC(y, m, d, h, min);
    }

    static getUTCTimestampTodayAt(h: number, todayTimestamp?: number): number {
        //Get timestamp for today at given hour
        let today = todayTimestamp ? new Date(todayTimestamp) : new Date();

        return Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), h);
    }

    static getTimestampTodayAt(h: number, todayTimestamp?: number): number {
        //Get timestamp for today at given hour
        let today = todayTimestamp ? new Date(todayTimestamp) : new Date();

        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, 0,0, 0).getTime();
    }

    static getPSTTimestampTodayAt(h: number, todayTimestamp: number): number {
        //Get timestamp for today at given hour
        var timezone = -7; //目标时区时间，PST
        var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
        var targetDate = new Date(todayTimestamp + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);

        return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), h).getTime() - offset_GMT*60*1000 - timezone*3600*1000;
    }

    static getCurrentUTCDateData(): DateData {
        let date = new Date();

        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1, //Normally months start at 0. This is to be consistent with config.
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes()
        }
    }

    static getUTCDateDataByTimestamp(timestamp: number): DateData {
        let date = new Date(timestamp); //Needs millisecond conversion

        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1, //Normally months start at 0. This is to be consistent with config.
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes()
        }
    }

    static timeToString(seconds: number) {

        let hour = Math.floor(seconds / 3600).toString();
        let min = Math.floor(seconds % 3600 / 60).toString();
        let sec = Math.floor(seconds % 60).toString();

        hour = hour.length > 1 ? hour : "0" + hour;
        min = min.length > 1 ? min : "0" + min;
        sec = sec.length > 1 ? sec : "0" + sec;

        if (hour == "00") {
            return min + ":" + sec;
        } else {
            return hour + ":" + min + ":" + sec;
        }
    }

    // /**
    //  * return "-h-m-s"
    //  * @param seconds 
    //  */
    // static timeToString2(seconds: number) {

    //     let hour = Math.floor(seconds / 3600).toString();
    //     let min = Math.floor(seconds % 3600 / 60).toString();
    //     let sec = Math.floor(seconds % 60).toString();

    //     hour = hour.length > 1 ? hour : "0" + hour;
    //     min = min.length > 1 ? min : "0" + min;
    //     sec = sec.length > 1 ? sec : "0" + sec;

    //     let h_str = I18N.getString("HOUR");
    //     let m_str = I18N.getString("MIN");
    //     let s_str = I18N.getString("SEC");

    //     if (hour == "00") {
    //         return min + m_str + sec + s_str;
    //     } else {
    //         return hour + h_str + min + m_str + sec + s_str;
    //     }
    // }

    //     /**
    //  * return "-h-m"
    //  * @param seconds 
    //  */
    // static timeToString3(seconds: number) {

    //     let hour = Math.floor(seconds / 3600).toString();
    //     let min = Math.floor(seconds % 3600 / 60).toString();

    //     hour = hour.length > 1 ? hour : "0" + hour;
    //     min = min.length > 1 ? min : "0" + min;

    //     let h_str = I18N.getString("HOUR");
    //     let m_str = I18N.getString("MIN");

    //     return hour + h_str + min + m_str;
    // }
}