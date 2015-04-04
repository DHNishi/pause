chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 400,
            'height': 500
        }
    });
});
chrome.alarms.onAlarm.addListener(function (alarm) {
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
        console.log("We were working.");
        chrome.alarms.create("break", { when: Date.now() + 5000 });
        chrome.runtime.sendMessage({ type: "startAlarm", name: "break" });
    }
    else {
        console.log("We were resting.");
        chrome.alarms.create("work", { when: Date.now() + 5000 });
        chrome.runtime.sendMessage({ type: "startAlarm", name: "work" });
    }
});
//# sourceMappingURL=background.js.map