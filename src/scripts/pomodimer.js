/**
 * Created by dhnishi on 4/1/15.
 */
/// <reference path="../../typings/moment/moment.d.ts" />
var Pomotimer = (function () {
    // TODO(dhnishi): Please add getters and setters for changing the break and work times.
    function Pomotimer(_timeElement) {
        var _this = this;
        this.timeElement = _timeElement;
        chrome.runtime.onMessage.addListener(function (message, _sender, _sendResponse) {
            console.log("received message");
            if (message.type === 'startAlarm') {
                _this.onStartAlarm(message.name);
            }
        });
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
    Pomotimer.prototype.onStartAlarm = function (alarmName) {
        var _this = this;
        var oneSecond = 1000; // ms
        var countdownCycle = setInterval(function () {
            chrome.alarms.get(alarmName, function (alarm) {
                console.log("ALARM: ", alarm);
                if (typeof alarm === 'undefined') {
                    clearInterval(countdownCycle);
                    return;
                }
                console.log("checking time");
                var now = moment();
                var alarmTime = moment(alarm.scheduledTime);
                var timeRemaining = moment.duration((alarmTime.diff(now)));
                _this.timeElement.innerText = moment.utc(timeRemaining.asMilliseconds()).format('mm:ss');
            });
        }, oneSecond);
    };
    Pomotimer.prototype.onAlarmEnd = function (alarm) {
        console.log(alarm.name + " has triggered.");
    };
    Pomotimer.prototype.addTime = function (minutes) {
        console.log("TBD");
        //this.timeRemaining.add(minutes, "minute");
    };
    Pomotimer.prototype.zeroRemaining = function () {
        this.beginNextCycle = true;
    };
    return Pomotimer;
})();
function beginTimer() {
}
console.log('hello world!');
window.onload = function () {
    var myTimer = new Pomotimer(document.getElementById('time'));
    document.getElementById('takeFive').onclick = function () {
        myTimer.addTime(5);
    };
    document.getElementById('takeTen').onclick = function () {
        myTimer.addTime(10);
    };
    document.getElementById('startNow').onclick = function () {
        //myTimer.zeroRemaining();
        chrome.alarms.create("work", { when: Date.now() + 5000 });
        chrome.runtime.sendMessage({ type: "startAlarm", name: "work" });
        //myTimer.beginWorkTime(1);
    };
};
//# sourceMappingURL=pomodimer.js.map