demo
====

Demonstration for the Route360° JavaScript API

#DEV Dependencies
1. Node.js
2. Git

*Note, that these are just dev dependencies. For the built version, all frontend dependencies are included*

#Installation
1. clone the git repo `git clone https://github.com/route360/laupi.git`
2. `npm install`
3. go to `app/scripts`, copy `cfg.default.js` and name it `cfg.js`
4. open `cfg.js` and insert your API key.

*Don't do a `bower install` please! there is a custom version of the r360 libary included. The bower install would overwrite it with the standard one.*

#Development
You can now run the app via `grunt serve` and start developing.

*if you have trouble with grunt, try to install the grunt-cli globally: `npm install grunt-cli -g`*

#Building
If you want to build your code, just use `grunt build`. It will create a `dist/` directory with a compiled version of your current code.
