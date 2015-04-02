/**
 * Created by dhnishi on 4/1/15.
 */
chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 400,
            'height': 500
        }
    });
});
//# sourceMappingURL=background.js.map