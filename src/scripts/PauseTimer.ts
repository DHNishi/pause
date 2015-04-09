/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;
declare var $ : any;

class Pomotimer {
    timeElement : HTMLElement;
    secondsLeft: number;

    constructor(_timeElement = null, reversed = false) {
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
                else if (alarm.name === "break") {
                    $('#startNow').text("Begin Work Early");
                }
                else {
                    return;
                }

                console.log("checking time");
                var now = moment();
                var alarmTime = moment(alarm.scheduledTime);
                var timeRemaining = moment.duration((alarmTime.diff(now)));

                if (reversed) {
                    chrome.runtime.getBackgroundPage( (backgroundPage) => {
                        var alarmDuration = moment.duration(backgroundPage.lastDuration, "seconds");
                        alarmDuration = alarmDuration.subtract(timeRemaining);
                        if (this.timeElement) {
                            this.timeElement.innerText = moment.utc(alarmDuration.asMilliseconds()).format('mm:ss');
                        }
                    });
                }
                else {
                    this.secondsLeft = timeRemaining.asSeconds();
                    if (this.timeElement) {
                        this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
                    }
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

    forceWorkStart(minutes?) {
        chrome.runtime.sendMessage({
            message: "scheduleAlarm",
            type: "work",
            duration: minutes * 60
        });
    }

    getCurrentAlarm(callback) {
        chrome.alarms.getAll((alarms) => {
            if (alarms.length === 0) {
                callback(undefined);
            }
            var alarm = alarms[0];

            if (alarm === undefined || (alarm.name !== "work" && alarm.name !== "break")) {
                callback(undefined);
            }
            callback(alarm);
        });
    }

    setTimeElement(timeElement : HTMLElement) {
        this.timeElement = timeElement;
    }

    pauseAlarm(pauseHoursDuration? : number, callback?) {
        console.log
        chrome.alarms.getAll((alarmArray : any[]) =>
        {
            if (alarmArray.length) {
                var currentAlarm = alarmArray[0];

                // Check to see if a restored alarm exists already.
                if (currentAlarm.name !== "restoreAlarm") {
                    var currentAlarmName = currentAlarm.name;
                    var nextAlarmTime = moment.duration(moment(currentAlarm.scheduledTime).diff(moment()));

                    var storedAlarm = {
                        name: currentAlarmName,
                        duration: nextAlarmTime.asSeconds()
                    };

                    chrome.alarms.clearAll();
                    chrome.storage.local.set({ storedAlarm: storedAlarm });
                }
                // Set up a potential unpause time in the future.
                if (pauseHoursDuration) {
                    chrome.alarms.create("restoreAlarm",
                        {
                            when: Date.now() + 1000 * 60 * 60 * pauseHoursDuration
                        });
                }
                callback(true);
            }
            callback(false);
        });
    }
}