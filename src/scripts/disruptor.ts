/**
 * Created by dhnishi on 4/7/15.
 */

/// <reference path="TimerHelpers.ts" />
/// <reference path="PauseTimer.ts" />

window.onload = () => {
    $.material.init();

    var myTimer = new Pomotimer(document.getElementById('small-time'), true);

    document.getElementById('skip-break').onclick = () => {
        startNextNow();
    };

    document.getElementById('take-five').onclick = () => {
        forceWorkStart(5);
    };

    document.getElementById('take-ten').onclick = () => {
        forceWorkStart(10);
    };

    function updateTimes() {
        getCurrentAlarm( (alarm) => {
            console.log(alarm);
            if (alarm === undefined) {
               return;
            }

            var now = moment();
            var alarmTime = moment(alarm.scheduledTime);
            var timeRemaining = moment.duration((alarmTime.diff(now)));

            chrome.runtime.getBackgroundPage((backgroundPage) => {
                var alarmDuration = moment.duration(backgroundPage.lastDuration, "seconds");
                document.getElementById('end-time').innerText = moment.utc(alarmDuration.asMilliseconds()).format('mm:ss');

                var percentDone = 100 - timeRemaining.asSeconds() / alarmDuration.asSeconds() * 100;
                document.getElementById('time-progress-bar').style.width = "" + percentDone + "%";
            });
        });
    };

    updateTimes();

    var oneSecond = 1000;
    setInterval(() => {
        updateTimes();
    }, oneSecond);
};
