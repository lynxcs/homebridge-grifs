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
        "type": "Alarm",
        "email": "email@example.com",
        "password": "password
    }
]
```
where `name` is the alarm name; `type` is "Alarm" (Security System), "Switch" (Switch) or "Sensor" (Occupancy Sensor); `email` is email address of the Grifs website account; `password` is the password of the account.
#### Getting help
If you need help troubleshooting, create an issue and I'll try to help you fix it.
