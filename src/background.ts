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