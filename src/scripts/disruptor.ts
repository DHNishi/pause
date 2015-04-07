/**
 * Created by dhnishi on 4/7/15.
 */

/// <reference path="pomodimer.ts" />

window.onload = () => {
    $.material.init();

    var myTimer = new Pomotimer(document.getElementById('small-time'));

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
};
