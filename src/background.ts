/**
 * Created by dhnishi on 4/1/15.
 */

declare var chrome: any;

chrome.storage.local.remove('storedAlarm');
chrome.alarms.clearAll();

var createWindow = () => {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 500,
            'height': 250
        },
        "resizable": false
    }, (appWindow) => {
        appWindow.onClosed.addListener(() => {
            chrome.storage.sync.get('remindOnClose', (data) => {
                var remindOnClose = data['remindOnClose'];
                if (remindOnClose === undefined || remindOnClose) {
                    remindRunningAlarmsNotification();
                }
            });
            chrome.storage.sync.get('clearAlarmsOnClose', (data) => {
                var clearAlarms = data['clearAlarmsOnClose'];
                if (clearAlarms === undefined || clearAlarms) {
                    chrome.alarms.clearAll();
                }
            });
        });
    });
};

var remindRunningAlarmsNotification = () => {
    var options = {
        type: 'basic',
        title: 'pause is still running in the background.',
        message: 'Your work/break reminders will continue to fire.',
        buttons: [{title: "Don't remind me again"}, {title: "Don't run alarms after closing pause."}],
        iconUrl: 'timer-512.png'
    };

    chrome.notifications.clear("onClose", (wasCleared) => {
        chrome.notifications.create("onClose", options, (notificationId) => {
            console.log("Triggered close notification.", notificationId);
        });
    });
};

chrome.app.runtime.onLaunched.addListener(function() {
    createWindow();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === "scheduleWork") {
        scheduleAlarm("work");
    }
    else if (request === "scheduleBreak") {
        scheduleAlarm("break");
    }
    else if (request.message === "scheduleAlarm") {
        scheduleAlarm(request.type, request.duration);
    }
});

var scheduleAlarm = (alarmType, timeOverride?) => {
    chrome.alarms.clearAll();
    if (timeOverride === undefined) {
        chrome.storage.sync.get('times', (data) => {
                var alarmTime = (alarmType === "work") ? 25 : 5;
                var myData = data['times'];
                if (myData !== undefined && myData[alarmType] !== undefined) {
                    alarmTime = myData[alarmType];
                }
                chrome.alarms.create(alarmType, { when: Date.now() + 1000 * 60 * alarmTime});
            }
        );
    }
    else {
        chrome.alarms.create(alarmType, { when: Date.now() + 1000 * timeOverride});
    }
};

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
        scheduleAlarm('break');
    }
    else {
        scheduleAlarm('work');
        var workMessage = {
            type: 'basic',
            title: 'Time for work!',
            message: 'Your break time has ended.',
            iconUrl: 'timer-512.png'
        };
        chrome.notifications.clear("workTime", (wasCleared) => {
            chrome.notifications.create("workTime", workMessage, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        scheduleAlarm('work');
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId : string, buttonIndex : number) =>
{
    if (notificationId === "breakTime") {
        var SKIP_BREAK = 0;
        // var TAKE_10 = 1;

        if (buttonIndex === SKIP_BREAK) {
            scheduleAlarm('work');
        }
        else {
            scheduleAlarm('work', 10);
        }
    }
    else if (notificationId === "onClose") {
        var DONT_REMIND_ME_AGAIN = 0;
        var DONT_RUN_ALARMS = 1;

        if (buttonIndex === DONT_REMIND_ME_AGAIN) {
            chrome.storage.sync.set({remindOnClose: false});
        }
        else { // Don't run alarms.
            chrome.storage.sync.set({clearAlarmsOnClose: true});
            chrome.alarms.clearAll();
        }
    }
});

chrome.notifications.onClicked.addListener(notificationId => {
    var appWindows = chrome.app.window.getAll();
    if (appWindows.length) {
        appWindows[0].show();
    }
    else {
        createWindow();
    }
});