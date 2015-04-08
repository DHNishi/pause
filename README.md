# Pause

A simple Work/Break timer Chrome App built with Typescript.

The planned features of this app are as follows:

1. I can start a countdown timer and be notified when the time is up. (Done)
2. I can take a break at any time. This break can either be my designated break duration or a 5 or a 10 minute break. (Done)
3. When I am notified of my work time being up, I am given the option to either take a break, postpone the break, or skip the break. (Done)
4. I can change the duration of my work focus time and my break time. (Done.)
5. Change out the assets to be my own assets. (In-progress.)
6. Create a disruption window feature. If the break strikes, put up a disruption window that is alwaysOnTop. The disruption window has options to skip the break, take 5, or take 10. (In-progress.)
7. Use the chrome.idle.* API to add an option to selectively pause/reset the timer when the system has been idle for greater than X minutes.

The stretch features of this app are as follows:

1. I receive a notification on my phone/other devices when my break is up.
2. My break durations and work durations are logged to the app.

We can trigger a sound from the background page using: http://stackoverflow.com/questions/17509520/chrome-extension-play-sound-in-background-script
