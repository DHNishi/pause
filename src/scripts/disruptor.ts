/**
 * Created by dhnishi on 4/7/15.
 */

/// <reference path="pomodimer.ts" />

window.onload = () => {
    $.material.init();

    var myTimer = new Pomotimer(document.getElementById('small-time'), true);

    document.getElementById('skip-break').onclick = () => {
        myTimer.startNextNow();
    };

    document.getElementById('take-five').onclick = () => {
        chrome.runtime.sendMessage({
            message: "scheduleAlarm",
            type: "work",
            duration: 5 * 60
        });
    };

    document.getElementById('take-ten').onclick = () => {
        chrome.runtime.sendMessage({
            message: "scheduleAlarm",
            type: "work",
            duration: 10 * 60
        });
    };

    var updateTimes = () =>
    {
        chrome.alarms.getAll( (alarms) => {
            if (alarms.length === 0) {
                return;
            }
            var alarm = alarms[0];

            if (alarm.name !== "work" && alarm.name !== "break") {
                return;
            }

            var now = moment();
            var alarmTime = moment(alarm.scheduledTime);
            var timeRemaining = moment.duration((alarmTime.diff(now)));

            chrome.runtime.getBackgroundPage((backgroundPage) => {
                console.log(backgroundPage.lastDuration);
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
