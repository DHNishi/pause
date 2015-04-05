/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;

class Pomotimer {
    timeElement : HTMLElement;
    countdownCycle : number;

    constructor(_timeElement) {
        this.timeElement = _timeElement;

        var oneSecond = 1000;
        setInterval(() => {
            chrome.alarms.getAll((alarms : any[]) =>
            {
                if (alarms.length === 0) {
                    return;
                }
                var alarm = alarms[0];

                console.log("checking time");
                var now = moment();
                var alarmTime = moment(alarm.scheduledTime);
                var timeRemaining = moment.duration((alarmTime.diff(now)));
                this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
            });
        }, oneSecond);
    }

    startNextNow() {
        chrome.alarms.getAll((alarmArray : any[]) =>
        {
            chrome.alarms.clearAll();
             if (alarmArray.length > 0) {
                 var currentAlarm = alarmArray[0];
                 if (currentAlarm.name === "work") {
                     chrome.alarms.create("break", { when: Date.now() + 5000 });
                     return;
                 }
             }
             // Start work.
            chrome.alarms.create("work", { when: Date.now() + 5000 });
        });
    }

    addTime(minutes : number) {
        chrome.alarms.getAll((alarmArray : any[]) =>
        {
            if (alarmArray.length > 0) {
                var currentAlarm = alarmArray[0];
                var currentAlarmName = currentAlarm.name;
                var nextAlarmTime = moment(currentAlarm.scheduledTime).add(minutes, "minute");
                chrome.alarms.create(currentAlarmName, { when: nextAlarmTime.unix() * 1000});
            }
        });
    }
}

window.onload = function() {
    var myTimer = new Pomotimer(document.getElementById('time'));

    document.getElementById('takeFive').onclick = () => {
        myTimer.addTime(5);
    };

    document.getElementById('takeTen').onclick = () => {
        myTimer.addTime(10);
    };

    document.getElementById('startNow').onclick = () => {
        myTimer.startNextNow();
    };
};
