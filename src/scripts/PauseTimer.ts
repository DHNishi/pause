/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="../../typings/moment/moment.d.ts" />

declare var chrome : any;
declare var $ : any;

class Pomotimer {
    timeElement : HTMLElement;
    secondsLeft: number;

    constructor(_timeElement = null, reversed = false) {
        this.timeElement = _timeElement;

        this.updateTimeElement(reversed);
        var oneSecond = 1000;
        setInterval(() => {
            this.updateTimeElement(reversed);
        }, oneSecond);
    }

    updateTimeElement(reversed : boolean) {
        chrome.alarms.getAll((alarms : any[]) =>
        {
            if (alarms.length === 0) {
                return;
            }
            var alarm = alarms[0];

            if (alarm.name === "work") {
                $('#startNow').text("Begin Break Early");
            }
            else if (alarm.name === "break") {
                $('#startNow').text("Begin Work Early");
            }
            else {
                return;
            }

            console.log("checking time");
            var now = moment();
            var alarmTime = moment(alarm.scheduledTime);
            var timeRemaining = moment.duration((alarmTime.diff(now)));

            if (reversed) {
                chrome.runtime.getBackgroundPage( (backgroundPage) => {
                    var alarmDuration = moment.duration(backgroundPage.lastDuration, "seconds");
                    alarmDuration = alarmDuration.subtract(timeRemaining);
                    if (this.timeElement) {
                        this.timeElement.innerText = this.humanizeDuration(alarmDuration);
                    }
                });
            }
            else {
                this.secondsLeft = timeRemaining.asSeconds();
                if (this.timeElement) {
                    this.timeElement.innerText = this.humanizeDuration(timeRemaining);
                }
            }
        });
    }

    setTimeElement(timeElement : HTMLElement) {
        this.timeElement = timeElement;
    }

    humanizeDuration(duration : moment.Duration) {
        var minutes : any = Math.floor(duration.asMinutes());
        var seconds : any = duration.seconds();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ":" + seconds;
    }
}