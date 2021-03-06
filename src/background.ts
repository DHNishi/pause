/**
 * Created by dhnishi on 4/1/15.
 */

/// <reference path="scripts/TimerHelpers.ts" />
/// <reference path="scripts/PauseTimer.ts" />

var DEFAULT_WORK_MINUTES = 30;
var DEFAULT_BREAK_MINUTES = 5;
var DEFAULT_IDLE_DURATION = 60 * 5;

var WINDOW_WIDTH = 500;
var WINDOW_HEIGHT = 210;
var DISRUPTOR_WIDTH = 750;
var DISRUPTOR_HEIGHT = 250;

var SECONDS = 1000;
var MINUTES = SECONDS * 60;
var HOURS = MINUTES * 60;

declare var chrome: any;

// TODO: Remove lastDuration -- or refactor it into TimerHelpers.
var lastDuration = null;

function initializeStorageDefaults(callback) {
    chrome.storage.sync.get([
        "remindOnClose",
        "clearAlarmsOnClose",
        "times",
        "showDisruptor"
    ], (data) => {
        if (data.remindOnClose === undefined) {
            chrome.storage.sync.set({remindOnClose: true});
        }
        if (data.clearAlarmsOnCloses === undefined) {
        }
        if (data.times === undefined) {
            var times = {
                work: DEFAULT_WORK_MINUTES,
                break: DEFAULT_BREAK_MINUTES
            };
            chrome.storage.sync.set({times: times});
        }
        if (data.showDisruptor === undefined) {
            chrome.storage.sync.set({showDisruptor: true});
        }
        callback();
    });
}

var createWindow = () => {
    chrome.app.window.create("window.html", {
        "bounds": {
            "width": WINDOW_WIDTH,
            "height": WINDOW_HEIGHT
        },
        "resizable": false
    }, (appWindow) => {
        appWindow.onClosed.addListener(() => {
            chrome.storage.sync.get("remindOnClose", (data) => {
                var remindOnClose = data.remindOnClose;
                if (remindOnClose) {
                    remindRunningAlarmsNotification();
                }
            });
            chrome.storage.sync.get("clearAlarmsOnClose", (data) => {
                var clearAlarms = data.clearAlarmsOnClose;
                if (clearAlarms) {
                    chrome.alarms.clearAll();
                }
            });
        });
    });
};

var createDisruptor = () => {
    chrome.storage.sync.get("showDisruptor", (data) => {
       if (data.showDisruptor) {
           var disruptorWindow = chrome.app.window.get("disruptor");
           if (disruptorWindow === null) {
               chrome.app.window.create("disruptor.html", {
                   id: "disruptor",
                   "bounds": {
                       "width": DISRUPTOR_WIDTH,
                       "height": DISRUPTOR_HEIGHT
                   },
                   "resizable": false
               }, (appWindow) => {
                   appWindow.maximize();
               });
           } else {
               disruptorWindow.show();
           }
       }
    });
};

function remindRunningAlarmsNotification() {
    var options = {
        type: "basic",
        title: "pause is still running in the background.",
        message: "Your work/break reminders will continue to fire.",
        buttons: [{title: "Don't remind me again"}, {title: "Don't run alarms after closing pause."}],
        iconUrl: "pause-512.png"
    };

    chrome.notifications.clear("onClose", (wasCleared) => {
        chrome.notifications.create("onClose", options, (notificationId) => {
            console.log("Triggered close notification.", notificationId);
        });
    });
};

chrome.app.runtime.onLaunched.addListener(function() {
    initializeStorageDefaults(() => {
        chrome.storage.local.remove("pauseFromIdle");
        chrome.storage.local.get("storedAlarm", alarm => {
            if (alarm.storedAlarm === undefined) {
                chrome.alarms.getAll(alarms => {
                    if (alarms.length === 0) {
                        scheduleAlarm("work");
                    }
                });
            }
        });
        createWindow();
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === "scheduleWork") {
        scheduleAlarm("work");
    } else if (request === "scheduleBreak") {
        scheduleAlarm("break");
    } else if (request.message === "scheduleAlarm") {
        scheduleAlarm(request.type, request.duration);
    }
});

// TODO: Move this function into TimerHelpers.
function scheduleAlarm(alarmType, timeOverride?) {
    chrome.alarms.clearAll();

    // TODO: Refactor this into a callback when the message is received.
    if (alarmType === "break") {
        createDisruptor();
    } else {
        var disruptorWindow = chrome.app.window.get("disruptor");
        if (disruptorWindow != null) {
            disruptorWindow.close();
        }
    }

    if (timeOverride === undefined) {
        chrome.storage.sync.get("times", (data) => {
                var myData = data.times;
                var alarmTime = myData[alarmType];
                console.log(alarmTime);
                chrome.alarms.create(alarmType, { when: Date.now() + alarmTime * MINUTES});
                lastDuration = alarmTime * 60;
            }
        );
    } else {
        chrome.alarms.create(alarmType, { when: Date.now() + timeOverride * SECONDS});
        lastDuration = timeOverride;
    }
};

chrome.alarms.onAlarm.addListener(alarm => {
    console.log("We received an alarm!", alarm);
    if (alarm.name === "work") {
        var options = {
            type: "basic",
            title: "Time for a break!",
            message: "Your work time has ended.",
            buttons: [{ title: "Skip break" }, { title: "Postpone 10 minutes"}],
            iconUrl: "pause-512.png"
        };
        chrome.notifications.clear("breakTime", (wasCleared) => {
            chrome.notifications.create("breakTime", options, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        scheduleAlarm("break");
    } else if (alarm.name === "break") {
        scheduleAlarm("work");
        var workMessage = {
            type: "basic",
            title: "Time for work!",
            message: "Your break time has ended.",
            iconUrl: "pause-512.png"
        };
        chrome.notifications.clear("workTime", (wasCleared) => {
            chrome.notifications.create("workTime", workMessage, (notificationId) => {
                console.log("Triggered break notification.", notificationId);
            });
        });
        scheduleAlarm("work");
    } else if (alarm.name === "restoreAlarm") {
        restoreStoredAlarm();
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId : string, buttonIndex : number) => {
    if (notificationId === "breakTime") {
        var SKIP_BREAK = 0;
        // var TAKE_10 = 1;

        if (buttonIndex === SKIP_BREAK) {
            scheduleAlarm("work");
        } else {
            scheduleAlarm("work", 10 * 60);
        }
    } else if (notificationId === "onClose") {
        var DONT_REMIND_ME_AGAIN = 0;
        var DONT_RUN_ALARMS = 1;

        if (buttonIndex === DONT_REMIND_ME_AGAIN) {
            chrome.storage.sync.set({remindOnClose: false});
        } else { // Don"t run alarms.
            chrome.storage.sync.set({clearAlarmsOnClose: true});
            chrome.alarms.clearAll();
        }
    }
});

chrome.notifications.onClicked.addListener(notificationId => {
    var appWindows = chrome.app.window.getAll();
    if (appWindows.length) {
        appWindows[0].show();
    } else {
        createWindow();
    }
});

chrome.idle.setDetectionInterval(DEFAULT_IDLE_DURATION);
chrome.idle.onStateChanged.addListener((state) => {
    console.log("Idle changed: ", state);
    if (state === "idle") {
        chrome.alarms.get("work", alarm => {
            if (alarm === undefined) {
                return;
            }

            pauseAlarm();
            // TODO: Set an alarm to invalidate the stored alarm after a full break of time.
            chrome.storage.local.set({ pauseFromIdle: true});
        });
    } else if (state === "active") {
        chrome.storage.local.get(["pauseFromIdle"], data => {
            if (data.pauseFromIdle) {
                chrome.storage.local.set({ pauseFromIdle: false});
                restoreStoredAlarm();
            }
        });
    }
    // TODO: Check if alarm is expired. Due to a chrome.alarms bug, we need to work around this.
});
