# Getting Started 
Node version -> 16.18.1
Npm version -> 8.19.2



`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

# FOR PROD ONLY !!!

To start for prod build, you must be root

`sudo -i`

`cd /path/to/ojvindix`

Until in prod env the correct config is made :

`chown -R root:root .`

Add this in `package.json` in the `scripts` in the `start` :

```
HTTPS=true SSL_CRT_FILE=./.cert/cert.pem SSL_KEY_FILE=./.cert/key.pem PORT=443 react-scripts start
```

`npm start`

When finish you can revert the permission to make change

`chown -R <Your username>:<You username> .`