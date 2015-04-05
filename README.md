# Pomodimer

A simple Pomodoro timer Chrome App built with Typescript.

The planned features of this app are as follows:

1. I can start a countdown timer and be notified when the time is up. (Done)
2. I can take a break at any time. This break can either be my designated break duration or a 5 or a 10 minute break. (Done)
3. When I am notified of my work time being up, I am given the option to either take a break, postpone the break, or skip the break. (Done)
4. I can change the duration of my work focus time and my break time. (In-progress.)

The stretch features of this app are as follows:

1. I receive a notification on my phone/other devices when my break is up.
2. My break durations and work durations are logged to the app.

TODO: Please refactor all usages of actually counting down to using an event page w/ chrome.alarms.
This will allow our app to run quietly in the background. 
We will instead update the page by projecting the moment into the future X minutes and then calculating it based on that using a setInterval every second.
Every time we change the alarm either by adding time or resetting it, we reset our moment using Alarm.scheduledTime in the moment constructor.

We can trigger a sound from the background page using: http://stackoverflow.com/questions/17509520/chrome-extension-play-sound-in-background-script
