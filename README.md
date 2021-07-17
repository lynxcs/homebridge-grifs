# Homebridge grifs

## Homebridge plugin for Grifs AG

### Introduction
This homebridge plugin exposes alarm status as an alarm accessory
The only feature that is currently supported is getting the status of the alarm (Armed or disarmed)

### Prerequisites
Homebridge server should be running Linux, as currently only that is supported by this plugin
The Grifs AG [website](https://saugierdve.lt) has to have its language set to English

### Installation
To install homebridge grifs:
- Install the plugin through Homebridge Config UI X or manually by:
```
$ sudo npm -g i homebridge-grifs
```
- Edit the the `config.json` and add the `Alarm` accessory e.g:
```
"accessories": [
    {
        "accessory": "GRIFHomeAlarm",
        "name": "Home Alarm",
        "path": "/usr/local/lib/node_modules/homebridge-grifs/grif_login"
    }
]
```
where `name` is the alarm name and `path` is the path to the grif_login script (which, if installed by npm -g, should be the same as the example)
- Modify the variables in grif_status (EMAIL and PASSWORD)
- Add grif_status to crontab (or equivalent), as this updates the alarm status in the background, e.g:
```
$ sudo crontab -e
*/3 * * * * /usr/local/lib/node_modules/homebridge-grifs/grif_status
```
#### Getting help
If you need help troubleshooting, create an issue and I'll try to help you fix it.
