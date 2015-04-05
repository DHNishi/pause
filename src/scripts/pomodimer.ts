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

var WINDOW_HEIGHT_SETTINGS_NOT_VISIBLE = 250;
var WINDOW_HEIGHT_SETTINGS_VISIBLE = 350;

var showSettingsPage = () => {
    $('#settings').toggle();
    var currentWindowBounds = chrome.app.window.current().innerBounds;
    if (currentWindowBounds.height === WINDOW_HEIGHT_SETTINGS_VISIBLE) {
        currentWindowBounds.height = WINDOW_HEIGHT_SETTINGS_NOT_VISIBLE;
    }
    else {
        currentWindowBounds.height = WINDOW_HEIGHT_SETTINGS_VISIBLE;
    }
};

var initializeSliders = () => {
    var workSlider = $('#workSlider');
    workSlider.noUiSlider({
        start: 25,
        connect: "lower",
        range: {
            min: 5,
            max: 120
        }
    });
    workSlider.on({
        change: () => setSliderMinutes("work")
    });


    var breakSlider = $('#breakSlider');
    breakSlider.noUiSlider({
        start: 5,
        connect: "lower",
        range: {
            min: 3,
            max: 60
        }
    });
    breakSlider.on({
        change: () => setSliderMinutes("break")
    });
}

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

window.onload = () => {
    $.material.init();

    var myTimer = new Pomotimer(document.getElementById('time'));

    document.getElementById('startNow').onclick = () => {
        myTimer.startNextNow();
    };

    document.getElementById('openSettings').onclick = showSettingsPage;

    initializeSliders();
};
