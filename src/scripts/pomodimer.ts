/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;
declare var $ : any;

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
                this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
            });
        }, oneSecond);
    }

    startNextNow() {
        chrome.alarms.getAll((alarmArray : any[]) =>
        {
             if (alarmArray.length > 0) {
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

var WINDOW_HEIGHT_SETTINGS_NOT_VISIBLE = 250;
var WINDOW_HEIGHT_SETTINGS_VISIBLE = 400;

var showSettingsPage = () => {
    chrome.storage.sync.get(['remindOnClose', 'clearAlarmsOnClose'], (data) => {
        var remindOnClose = data['remindOnClose'];
        remindOnClose = (remindOnClose === undefined) ? true : remindOnClose;
        $('#remindAlarmsCheckbox').prop('checked', remindOnClose);
        $('#remindAlarmsCheckbox').click(() => {
            chrome.storage.sync.set({remindOnClose: $('#remindAlarmsCheckbox')[0].checked});
        });

        var clearAlarms = data['clearAlarmsOnClose'];
        clearAlarms = (clearAlarms === undefined) ? false : clearAlarms;
        $('#clearAlarmsCheckbox').prop('checked', clearAlarms);
        $('#clearAlarmsCheckbox').click(() => {
            chrome.storage.sync.set({clearAlarmsOnClose: $('#clearAlarmsCheckbox')[0].checked});
        });

        $('#settings').toggle();
        var currentWindowBounds = chrome.app.window.current().innerBounds;
        if (currentWindowBounds.height === WINDOW_HEIGHT_SETTINGS_VISIBLE) {
            currentWindowBounds.height = WINDOW_HEIGHT_SETTINGS_NOT_VISIBLE;
        }
        else {
            currentWindowBounds.height = WINDOW_HEIGHT_SETTINGS_VISIBLE;
        }
    });
};

var initializeSliders = () => {
    chrome.storage.sync.get('times', (data) => {
            var timeData = data['times'];
            if (timeData === undefined) {
                timeData = { 'work': 30, 'break': 10 };
            }

            var workMinutes = 25;
            if (timeData !== undefined && timeData['work'] !== undefined) {
                workMinutes = timeData['work'];
            }
            var workSlider = $('#workSlider');
            workSlider.noUiSlider({
                start: workMinutes,
                range: {
                    min: 5,
                    max: 120
                }
            });
            workSlider.on({
                change: () => setSliderMinutes("work")
            });
            $('#workMinutes').text(workMinutes + " minutes");

            var breakMinutes = 5;
            if (timeData !== undefined && timeData['break'] !== undefined) {
                breakMinutes = timeData['break'];
            }
            var breakSlider = $('#breakSlider');
            breakSlider.noUiSlider({
                start: breakMinutes,
                range: {
                    min: 3,
                    max: 60
                }
            });
            breakSlider.on({
                change: () => setSliderMinutes("break")
            });
            $('#breakMinutes').text(breakMinutes + " minutes");
        }
    );
};

var setSliderMinutes = (sliderType) => {
    var minutes : number = $('#' + sliderType + 'Slider').val();
    minutes = Math.floor(minutes);
    $('#' + sliderType + 'Minutes').text(minutes + " minutes");

    var times = chrome.storage.sync.get('times', (data) => {
        var myData = data['times'];
        if (myData === undefined) {
            data['times'] = {};
        }
        data['times'][sliderType] = minutes;
        chrome.storage.sync.set({times: data['times']}, () => {
            console.log(sliderType, " minutes changed to " + minutes);
        });
    });
};

var pauseAlarm = () => {
    console.log('pause');
    chrome.alarms.getAll((alarmArray : any[]) =>
    {
        if (alarmArray.length > 0) {
            var currentAlarm = alarmArray[0];
            var currentAlarmName = currentAlarm.name;
            var nextAlarmTime = moment.duration(moment(currentAlarm.scheduledTime).diff(moment()));

            var storedAlarm = {
                name: currentAlarmName,
                duration: nextAlarmTime.asSeconds()
            };

            chrome.alarms.clearAll();
            chrome.storage.local.set({ storedAlarm: storedAlarm });
            $('#startNow').prop("disabled", true);
            $('#pauseButton').text("Unpause");
        }
    });
};

var unpauseAlarm = () => {
    console.log('unpause');
    chrome.storage.local.get('storedAlarm', (data) =>
    {
        var storedAlarm = data['storedAlarm'];
        if (storedAlarm === undefined) {
            return;
        }
        chrome.runtime.sendMessage({
            message: 'scheduleAlarm',
            type: storedAlarm.name,
            duration: storedAlarm.duration
        })
        $('#startNow').prop("disabled", false);
        $('#pauseButton').text("Pause");
    });
};

var maybePauseAlarm = () => {
    chrome.alarms.getAll((alarmArray : any[]) => {
        if (alarmArray.length > 0) {
            pauseAlarm();
        }
        else {
            unpauseAlarm();
        }
    });
};

window.onload = () => {
    $.material.init();

    var myTimer = new Pomotimer(document.getElementById('time'));

    document.getElementById('startNow').onclick = () => {
        myTimer.startNextNow();
    };

    document.getElementById('openSettings').onclick = showSettingsPage;

    document.getElementById('pauseButton').onclick = maybePauseAlarm;

    initializeSliders();
};
