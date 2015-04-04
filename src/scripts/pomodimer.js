/**
 * Created by dhnishi on 4/1/15.
 */
/// <reference path="../../typings/moment/moment.d.ts" />
var Pomotimer = (function () {
    // TODO(dhnishi): Please add getters and setters for changing the break and work times.
    function Pomotimer(_timeElement) {
        this.timeElement = _timeElement;
    }
    Pomotimer.prototype.beginWorkTime = function (minutes) {
        var _this = this;
        this.timeRemaining = moment.duration(minutes, 'minutes');
        this.beginNextCycle = false;
        var oneSecond = 1000; // ms
        this.countdownCycle = setInterval(function () {
            _this.timeRemaining.subtract(1, 'second');
            if (_this.timeRemaining.asSeconds() < 55 || _this.beginNextCycle) {
                clearInterval(_this.countdownCycle);
                _this.timeElement.innerText = "Time's up!";
                _this.beginBreakTime(2);
                return;
            }
            var formatRemaining = moment.utc(_this.timeRemaining.asMilliseconds());
            _this.timeElement.innerText = formatRemaining.format('mm:ss');
        }, oneSecond);
        chrome.alarms.create("work", { when: Date.now() + 5000 });
    };
    Pomotimer.prototype.beginBreakTime = function (minutes) {
        var _this = this;
        // TODO: Remove code duplication.
        this.timeRemaining = moment.duration(minutes, 'minutes');
        this.beginNextCycle = false;
        var oneSecond = 1000; // ms
        this.countdownCycle = setInterval(function () {
            _this.timeRemaining.subtract(1, 'second');
            if (_this.timeRemaining.asSeconds() < 115 || _this.beginNextCycle) {
                clearInterval(_this.countdownCycle);
                _this.timeElement.innerText = "Back to work...";
                // TODO: Use chrome.notifications to send a rich notification with actionable options.
                _this.beginWorkTime(1);
                return;
            }
            var formatRemaining = moment.utc(_this.timeRemaining.asMilliseconds());
            _this.timeElement.innerText = formatRemaining.format('mm:ss');
        }, oneSecond);
        chrome.alarms.create("break", { when: Date.now() + 5000 });
    };
    Pomotimer.prototype.addTime = function (minutes) {
        this.timeRemaining.add(minutes, "minute");
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
    myTimer.beginWorkTime(1);
    document.getElementById('takeFive').onclick = function () {
        myTimer.addTime(5);
    };
    document.getElementById('takeTen').onclick = function () {
        myTimer.addTime(10);
    };
    document.getElementById('startNow').onclick = function () {
        myTimer.zeroRemaining();
    };
};
//# sourceMappingURL=pomodimer.js.map