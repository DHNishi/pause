/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="scripts/pomodimer.ts" />

declare var chrome: any;

chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 400,
            'height': 500
        }
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    // TODO: We could probably handle all of the work/break logic code in here.
    // By detecting the alarm name, we could switch between the alarms.
    // We could also listen for messages from the main page or from the notification to then modify the alarm times.
    // We could store information about what the user's preferences are within the local storage.
    // We could use the window.html to only surface information inferred from the currently set alarms. This could be
    //   updated every second to ensure that the user sees an up to date information.

    // In order to pull this out, we need to extract the business logic from pomodimer.ts into background.ts.
    // We then need to change the pomodimer code to probably remove the class and just pull data directly from the alarms API.
    console.log("We received an alarm!", alarm);
    if (alarm.name === "work") {
        console.log("RING RING: Work time is over!");
        var options = {
            type: 'basic',
            title: 'Time for a break!',
            message: 'Your work time has ended.',
            buttons: [{ title: "Skip break" }, { title: "Postpone 10 minutes"}],
            iconUrl: 'timer-512.png'
        };
        chrome.notifications.clear("breakTime", (wasCleared) => {
            chrome.notifications.create("breakTime", options, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        chrome.alarms.create("break", { when: Date.now() + 5000 });
    }
    else {
        chrome.alarms.create("work", { when: Date.now() + 5000 });
        var workMessage = {
            type: 'basic',
            title: 'Time for a work!',
            message: 'Your break time has ended.',
            iconUrl: 'timer-512.png'
        };
        chrome.notifications.clear("workTime", (wasCleared) => {
            chrome.notifications.create("workTime", workMessage, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId : string, buttonIndex : number) =>
{
    if (notificationId === "breakTime") {
        var SKIP_BREAK = 0;
        // var TAKE_10 = 1;
        if (buttonIndex === SKIP_BREAK) {
            chrome.alarms.clearAll();
            chrome.alarms.create("work", { when: Date.now() + 5000 });
        }
        else {
            chrome.alarms.clearAll();
            chrome.alarms.create("work", { when: Date.now() + 10 * 5000 });
        }
    }
});

chrome.notifications.onClicked.addListener((notificationId) => {
    var appWindows = chrome.app.window.getAll();
    if (appWindows.length > 0) {
        appWindows[0].show();
    }
    else {
        chrome.app.window.create('window.html', {
            'bounds': {
                'width': 400,
                'height': 500
            }
        });
    }
});

// TODO: Please add a listener here to allow for the triggering of the notification.

// When stopping an alarm, we need to calculate the time remaining and store it. When we restart, we create a new alarm with
// this time differential when we start again.