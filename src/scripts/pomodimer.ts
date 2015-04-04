/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;

class Pomotimer {
    timeElement : HTMLElement;
    beginNextCycle : boolean;

    countdownCycle : number;

    // TODO(dhnishi): Please add getters and setters for changing the break and work times.

    constructor(_timeElement) {
        this.timeElement = _timeElement;
        chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
                console.log("received message");
                if (message.type === 'startAlarm') {
                    this.onStartAlarm(message.name);
                }
            }
        );
        chrome.alarms.onAlarm.addListener(this.onAlarmEnd);
    }

    /* TODO(dhnishi): Need to refactor this code to do the following things.
        1. Let the event page handle which alarm to be checking for.
        2. Set up listeners for when a startTimer event occurs. When it occurs, we then begin the appropriate listening.
        3. Upon a startTimer, we start our interval function which checks for the appropriate alarm.
        4. When an alarm is kill, we kill our interval.
    */

    // When we get a startTimer,
    // Clear all existing callbacks.
    // Begin listening on an interval to update the page.
    // If the alarm no longer exists, kill the callback.

    onStartAlarm(alarmName) {
        var oneSecond = 1000 // ms
        var countdownCycle = setInterval(() => {
            chrome.alarms.get(alarmName, (alarm) =>
            {
                console.log("ALARM: ", alarm);
                if (typeof alarm === 'undefined') {
                    clearInterval(countdownCycle);
                    return;
                }
                console.log("checking time");
                var now = moment();
                var alarmTime = moment(alarm.scheduledTime);
                var timeRemaining = moment.duration((alarmTime.diff(now)));
                this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
            });
        }, oneSecond);
    }

    onAlarmEnd(alarm) {
        console.log(alarm.name + " has triggered.");
    }

    addTime(minutes : number) {
        console.log("TBD");
        //this.timeRemaining.add(minutes, "minute");
    }

    zeroRemaining() {
        this.beginNextCycle = true;
    }
}

function beginTimer() {

}

console.log('hello world!');
window.onload = function() {
    var myTimer = new Pomotimer(document.getElementById('time'));

    document.getElementById('takeFive').onclick = () => {
        myTimer.addTime(5);
    };

    document.getElementById('takeTen').onclick = () => {
        myTimer.addTime(10);
    };

    document.getElementById('startNow').onclick = () => {
        //myTimer.zeroRemaining();
        chrome.alarms.create("work", { when: Date.now() + 5000 });
        chrome.runtime.sendMessage({type: "startAlarm", name : "work"});
        //myTimer.beginWorkTime(1);
    };
}
