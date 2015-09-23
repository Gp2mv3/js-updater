# js-updater
Updater for offline Web applications in JS/HTML5 using FileSystem API

This code is currently a proof of concept that we can use as a base to create an update system for offline cordova applications.
The idea is to serve the app's files on a webserver that will be fetched by the app (in cordova/www), at any change of version, the app downloads the files and save them in the local fileSystem.

Currently only tested on Chrome Desktop (starting to work a bit). It's highly experimental and cannot be used as it is currently.
