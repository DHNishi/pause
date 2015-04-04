/**
 * Created by dhnishi on 4/1/15.
 */

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
});