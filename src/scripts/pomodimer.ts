/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;

class Pomotimer {
    timeElement : HTMLElement;
    timeRemaining : moment.Duration;
    beginNextCycle : boolean;

    countdownCycle : number;

    // TODO(dhnishi): Please add getters and setters for changing the break and work times.

    constructor(_timeElement) {
        this.timeElement = _timeElement;
    }

    beginWorkTime(minutes : number) {
        this.timeRemaining = moment.duration(minutes, 'minutes');
        this.beginNextCycle = false;

        var oneSecond = 1000 // ms
        this.countdownCycle = setInterval(() => {
            this.timeRemaining.subtract(1, 'second');

            if (this.timeRemaining.asSeconds() < 55 || this.beginNextCycle) {
                clearInterval(this.countdownCycle);
                this.timeElement.innerText = "Time's up!";
                this.beginBreakTime(2);
                return;
            }

            var formatRemaining = moment.utc(this.timeRemaining.asMilliseconds());
            this.timeElement.innerText = formatRemaining.format('mm:ss');
        }, oneSecond);
        chrome.alarms.create("work", {when: Date.now() + 5000});
    }

    beginBreakTime(minutes : number) {
        // TODO: Remove code duplication.
        this.timeRemaining = moment.duration(minutes, 'minutes');
        this.beginNextCycle = false;

        var oneSecond = 1000 // ms
        this.countdownCycle = setInterval(() => {
            this.timeRemaining.subtract(1, 'second');

            if (this.timeRemaining.asSeconds() < 115 || this.beginNextCycle) {
                clearInterval(this.countdownCycle);
                this.timeElement.innerText = "Back to work...";
                // TODO: Use chrome.notifications to send a rich notification with actionable options.
                this.beginWorkTime(1);
                return;
            }

            var formatRemaining = moment.utc(this.timeRemaining.asMilliseconds());
            this.timeElement.innerText = formatRemaining.format('mm:ss');
        }, oneSecond);
        chrome.alarms.create("break", {when: Date.now() + 5000});
    }

    addTime(minutes : number) {
        this.timeRemaining.add(minutes, "minute");
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
    myTimer.beginWorkTime(1);

    document.getElementById('takeFive').onclick = () => {
        myTimer.addTime(5);
    };

    document.getElementById('takeTen').onclick = () => {
        myTimer.addTime(10);
    };

    document.getElementById('startNow').onclick = () => {
        myTimer.zeroRemaining();
    };
}
