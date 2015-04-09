/**
 * Created by dhnishi on 4/7/15.
 */

/// <reference path="PauseTimer.ts" />
/// <reference path="TimerHelpers.ts" />

var WINDOW_HEIGHT_SETTINGS_NOT_VISIBLE = 250;
var WINDOW_HEIGHT_SETTINGS_VISIBLE = 400;

var MIN_WORK_SLIDER = 1;
var MAX_WORK_SLIDER = 120;
var MIN_BREAK_SLIDER = 1;
var MAX_BREAK_SLIDER = 60;

function showSettingsPage() {
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
}

function initializeSliders () {
    chrome.storage.sync.get('times', (data) => {
            // TODO: This function could use some monster clean-up.
            var workMinutes = data['times']['work'];
            var workSlider = $('#workSlider');
            workSlider.noUiSlider({
                start: workMinutes,
                range: {
                    min: MIN_WORK_SLIDER,
                    max: MAX_WORK_SLIDER
                }
            });
            workSlider.on({
                change: () => setSliderMinutes("work")
            });
            $('#workMinutes').text(workMinutes + " minutes");

            var breakMinutes = data['times']['break'];
            var breakSlider = $('#breakSlider');
            breakSlider.noUiSlider({
                start: breakMinutes,
                range: {
                    min: MIN_WORK_SLIDER,
                    max: MAX_WORK_SLIDER
                }
            });
            breakSlider.on({
                change: () => setSliderMinutes("break")
            });
            $('#breakMinutes').text(breakMinutes + " minutes");
        }
    );
}

function setSliderMinutes(sliderType) {
    var minutes : number = $('#' + sliderType + 'Slider').val();
    minutes = Math.floor(minutes);
    $('#' + sliderType + 'Minutes').text(minutes + " minutes");

    var times = chrome.storage.sync.get('times', (data) => {
        var myData = data['times'];
        data['times'][sliderType] = minutes;
        chrome.storage.sync.set({times: data['times']}, () => {
            console.log(sliderType, " minutes changed to " + minutes);
        });
    });
}

function startAPause() {
    console.log("start a pause");
    $('#startNow').prop("disabled", true);
    $('#pauseButton').text("Unpause");
    $('#time').addClass('paused').text('Paused');
    setPauseTime();
}

function setPauseTime()
{
    var repeating = setInterval(() => {
        chrome.alarms.get("restoreAlarm", (alarm) => {
            if (alarm === undefined) {
                clearInterval(repeating);
                return;
            }

            var nextAlarmTime = moment.duration(moment(alarm.scheduledTime).diff(moment()));
            $('#time').addClass('duration').text("Paused for " + nextAlarmTime.humanize());
        });
    }, 1000);
}

function comingBackFromAPause() {
    $('#startNow').prop("disabled", false);
    $('#pauseButton').text("Pause");
    $('#time').text("Unpausing...").removeClass('duration').removeClass('paused');
}

function maybePauseAlarm() {
    getCurrentAlarm((alarm) => {
        if (alarm !== undefined) {
            pauseAlarm(undefined, (didPauseAlarm : boolean) => {
                if (didPauseAlarm){
                    startAPause();
                }
            });
        }
        else {
            restoreStoredAlarm();
       }
    });
};

window.onload = () => {
    $.material.init();
    var myTimer = new Pomotimer();
    myTimer.setTimeElement(document.getElementById('time'));

    document.getElementById('startNow').onclick = () => {
        startNextNow();
    };

    document.getElementById('openSettings').onclick = showSettingsPage;
    document.getElementById('pauseButton').onclick = maybePauseAlarm;
    document.getElementById('pause1').onclick = () => pauseAlarm(1);
    document.getElementById('pause2').onclick = () => pauseAlarm(2);
    document.getElementById('pause4').onclick = () => pauseAlarm(4);
    document.getElementById('pause8').onclick = () => pauseAlarm(8);
    document.getElementById('pause24').onclick = () => pauseAlarm(24);


    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === "comingBackFromAPause") {
            comingBackFromAPause();
        }
        else if (request === "startingAPause") {
            startAPause();
        }
    });

    chrome.alarms.get('restoreAlarm', (alarm) => {
        if (alarm === undefined) {
           return;
        }
        startAPause();
    });

    initializeSliders();
};
