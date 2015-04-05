/**
 * Created by dhnishi on 4/1/15.
 */

declare var chrome: any;

var createWindow = () => {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 400,
            'height': 500
        }
    });
};

chrome.app.runtime.onLaunched.addListener(function() {
    createWindow();
});

chrome.alarms.onAlarm.addListener(alarm => {
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

        chrome.alarms.clearAll();
        var postponeTime = buttonIndex === SKIP_BREAK ? Date.now() + 5000 : Date.now() + 10 * 6000;
        chrome.alarms.create("work", { when: postponeTime });

    }
});

chrome.notifications.onClicked.addListener(notificationId => {
    var appWindows = chrome.app.window.getAll();
    if (appWindows.length > 0) {
        appWindows[0].show();
    }
    else {
        createWindow();
    }
});

// When stopping an alarm, we need to calculate the time remaining and store it. When we restart, we create a new alarm with
// this time differential when we start again.