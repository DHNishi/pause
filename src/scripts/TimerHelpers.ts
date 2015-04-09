/**
 * Created by dhnishi on 4/9/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome: any;

function startNextNow() {
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

function forceWorkStart(minutes?) {
    chrome.runtime.sendMessage({
        message: "scheduleAlarm",
        type: "work",
        duration: minutes * 60
    });
}

function getCurrentAlarm(callback) {
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

function pauseAlarm(pauseHoursDuration? : number, callback?) {
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
            if (callback !== undefined) {
                callback(true);
            }
            chrome.runtime.sendMessage("startingAPause");
        }
        if (callback !== undefined) {
            callback(false);
        }
    });
}


function restoreStoredAlarm() {
    chrome.storage.local.get('storedAlarm', (data) => {
        var storedAlarm = data['storedAlarm'];
        if (storedAlarm === undefined) {
            return;
        }
        chrome.runtime.sendMessage({
            message: 'scheduleAlarm',
            type: storedAlarm.name,
            duration: storedAlarm.duration
        });
        chrome.storage.local.remove('storedAlarm');
        chrome.runtime.sendMessage({
            message: 'comingBackFromAPause'
        });
    });
}
