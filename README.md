# Pause

A simple Work/Break timer Chrome App built with Typescript.

The planned features of this app are as follows:

1. I can start a countdown timer and be notified when the time is up. (Done)
2. I can take a break at any time. This break can either be my designated break duration or a 5 or a 10 minute break. (Done)
3. When I am notified of my work time being up, I am given the option to either take a break, postpone the break, or skip the break. (Done)
4. I can change the duration of my work focus time and my break time. (Done.)
5. Change out the assets to be my own assets. (Done.)
6. Create a disruption window feature. If the break strikes, put up a disruption window that is alwaysOnTop. The disruption window has options to skip the break, take 5, or take 10. (Done.)
7. Pause the timer for definite amounts of time. (Done.)
8. Convert over to using the Materialize CSS library to avoid bizarre licensing issues.
9. Clean up and refactor the code for release.
  * Move all timer business logic code into the timer class. (Pretty much done.)
  * Rename the timer class from the legacy name Pomodimer to just PauseTimer. (Done.)
  * Change var FUNC = () => {} structures into function structures. (Done.)
  * Re-organize .ts files and annotate the function calls with docstrings. (In-progress).
  * Pass TSLint on all files.
  * Clean up the less files to be more idiomatic.
10. Release to the Chrome app store.

The stretch features of this app are as follows:

0. Use the chrome.idle.* API to add an option to selectively pause/reset the timer when the system has been idle for greater than X minutes. (Done.)
1. I receive a notification on my phone/other devices when my break is up.
2. My break durations and work durations are logged to the app.

Known issues:

Alarms act funny if returning from logging out and "trigger" while logged out.