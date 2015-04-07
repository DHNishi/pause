/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;
declare var $ : any;

class Pomotimer {
    timeElement : HTMLElement;
    countdownCycle : number;

    constructor(_timeElement = null) {
        this.timeElement = _timeElement;

        var oneSecond = 1000;
        setInterval(() => {
            chrome.alarms.getAll((alarms : any[]) =>
            {
                if (alarms.length === 0) {
                    return;
                }
                var alarm = alarms[0];

                if (alarm.name === "work") {
                    $('#startNow').text("Begin Break Early");
                }
                else {
                    $('#startNow').text("Begin Work Early");
                }

                console.log("checking time");
                var now = moment();
                var alarmTime = moment(alarm.scheduledTime);
                var timeRemaining = moment.duration((alarmTime.diff(now)));
                if (this.timeElement) {
                    this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
                }
            });
        }, oneSecond);
    }

    startNextNow() {
        chrome.alarms.getAll((alarmArray : any[]) =>
        {
             if (alarmArray.length) {
                 var currentAlarm = alarmArray[0];
                 if (currentAlarm.name === "work") {
                     chrome.runtime.sendMessage('scheduleBreak');
                     return;
                 }
             }
             // Start work.
            chrome.runtime.sendMessage('scheduleWork');
        });
    }

}