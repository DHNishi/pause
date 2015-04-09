/**
 * Created by dhnishi on 4/1/15.
 */

var DEFAULT_WORK_MINUTES = 30;
var DEFAULT_BREAK_MINUTES = 5;

var WINDOW_WIDTH = 500;
var WINDOW_HEIGHT = 250;
var DISRUPTOR_WIDTH = 750;
var DISRUPTOR_HEIGHT = 250;

var SECONDS = 1000;
var MINUTES = SECONDS * 60;
var HOURS = MINUTES * 60;

declare var chrome: any;

// Remove ephemeral alarms.
chrome.alarms.clear('restoreAlarm');
chrome.storage.local.remove('storedAlarm');

initializeStorageDefaults();

var lastDuration = null;

function initializeStorageDefaults() {
    chrome.storage.sync.get([
        'remindOnClose',
        'clearAlarmsOnClose',
        'times'
    ], (data) => {
        if (data['remindOnClose'] === undefined) {
            chrome.storage.sync.set({remindOnClose: true});
        }
        if (data['clearAlarmsOnCloses'] === undefined) {
            chrome.storage.sync.set({clearAlarmsOnClose: false});
        }
        if (data['times'] === undefined) {
            var times = {
                work: DEFAULT_WORK_MINUTES,
                break: DEFAULT_BREAK_MINUTES
            };
            chrome.storage.sync.set({times: times});
        }
    });
}

var createWindow = () => {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': WINDOW_WIDTH,
            'height': WINDOW_HEIGHT
        },
        "resizable": false
    }, (appWindow) => {
        appWindow.onClosed.addListener(() => {
            chrome.storage.sync.get('remindOnClose', (data) => {
                var remindOnClose = data['remindOnClose'];
                if (remindOnClose) {
                    remindRunningAlarmsNotification();
                }
            });
            chrome.storage.sync.get('clearAlarmsOnClose', (data) => {
                var clearAlarms = data['clearAlarmsOnClose'];
                if (clearAlarms) {
                    chrome.alarms.clearAll();
                }
            });
        });
    });
};

var createDisruptor = () => {
    var disruptorWindow = chrome.app.window.get('disruptor');
    if (disruptorWindow === null) {
        chrome.app.window.create('disruptor.html', {
            id: "disruptor",
            'bounds': {
                'width': DISRUPTOR_WIDTH,
                'height': DISRUPTOR_HEIGHT
            },
            "resizable": false
        }, (appWindow) => {
            appWindow.maximize();
        });
    }
    else {
        disruptorWindow.show();
    }
};

var remindRunningAlarmsNotification = () => {
    var options = {
        type: 'basic',
        title: 'pause is still running in the background.',
        message: 'Your work/break reminders will continue to fire.',
        buttons: [{title: "Don't remind me again"}, {title: "Don't run alarms after closing pause."}],
        iconUrl: 'pause-512.png'
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

    if (alarmType === "break") {
        createDisruptor();
    }
    else {
        var disruptorWindow = chrome.app.window.get('disruptor');
        if (disruptorWindow != null) {
            disruptorWindow.close();
        }
    }

    if (timeOverride === undefined) {
        chrome.storage.sync.get('times', (data) => {
                var myData = data['times'];
                var alarmTime = myData[alarmType];
                chrome.alarms.create(alarmType, { when: Date.now() + alarmTime * MINUTES});
                lastDuration = alarmTime * 60;
            }
        );
    }
    else {
        chrome.alarms.create(alarmType, { when: Date.now() + timeOverride * SECONDS});
        lastDuration = timeOverride;
    }
};

chrome.alarms.onAlarm.addListener(alarm => {
    console.log("We received an alarm!", alarm);
    if (alarm.name === "work") {
        var options = {
            type: 'basic',
            title: 'Time for a break!',
            message: 'Your work time has ended.',
            buttons: [{ title: "Skip break" }, { title: "Postpone 10 minutes"}],
            iconUrl: 'pause-512.png'
        };
        chrome.notifications.clear("breakTime", (wasCleared) => {
            chrome.notifications.create("breakTime", options, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        scheduleAlarm('break');
    }
    else if (alarm.name === "break") {
        scheduleAlarm('work');
        var workMessage = {
            type: 'basic',
            title: 'Time for work!',
            message: 'Your break time has ended.',
            iconUrl: 'pause-512.png'
        };
        chrome.notifications.clear("workTime", (wasCleared) => {
            chrome.notifications.create("workTime", workMessage, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        scheduleAlarm('work');
    }
    else if (alarm.name === "restoreAlarm") {
        restoreStoredAlarm();
    }
});

var restoreStoredAlarm = () => {
    chrome.storage.local.get('storedAlarm', (data) => {
        var storedAlarm = data['storedAlarm'];
        if (storedAlarm === undefined) {
            return;
        }
        chrome.runtime.sendMessage({
            message: 'scheduleAlarm',
            type: storedAlarm.name,
            duration: storedAlarm.duration
        });
        chrome.storage.local.remove('storedAlarm');
        chrome.runtime.sendMessage({
            message: 'comingBackFromAPause'
        });
    });
};

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
