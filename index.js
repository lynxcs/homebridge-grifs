// homebridge-grifs
// Domas Kalinauskas 2021
const request = require('request').defaults({jar: true});
const parse = require('node-html-parser').parse;

var logger;
var Service, Characteristic;
var Email, Password, Type, Interval;
var currentStatus;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-grifs", "GRIFHomeAlarm", GRIFHomeAlarm);
};

async function queryWebsite() {
    if (Email != undefined && Password != undefined) {
        const formData = {
            email: Email,
            password: Password,
            language: "en",
        };
        request.post({url:'https://www.saugierdve.lt/login', formData: formData}, function (error1, response1, body1) {
            request.get("https://www.saugierdve.lt/system/view/318/areas", function (error2, response2, body2) {
                const alarmStatus = parse(body2).querySelector("#area_388_status_name");
                if (alarmStatus.text == "Disarmed")
                {
                    if (Type == "Alarm")
                    {
                        currentStatus = 3;
                    }
                    else
                    {
                        currentStatus = 0;
                    }
                }
                else
                {
                    currentStatus = 1;
                }
            });
        });
    }
    else {
        logger.error("Configuration error: email and password not set!");
    }
}

function GRIFHomeAlarm(log, config) {
	this.log = log;
	logger = log;
	this.name = config["name"];
	Email = config["email"];
	Password = config["password"];
	Type = config["type"];
	Interval = config["interval"];

	if (Type == undefined) {
		Type = "Switch";
	}

	if (Interval == undefined) {
		Interval = 3;
	}

    if (Type == "Alarm") {
        currentStatus = 3;
    }
    else {
        currentStatus = 0;
    }

	queryWebsite();
	setInterval(function () {
		queryWebsite();
	}, Interval * 60 * 1000);

}

function getStatus(next) {
    return next(null, currentStatus);
}

GRIFHomeAlarm.prototype =
	{
		getServices: function () {
			var informationService = new Service.AccessoryInformation();
			informationService
				.setCharacteristic(Characteristic.Manufacturer, "Grif")
				.setCharacteristic(Characteristic.Model, "Grif")
				.setCharacteristic(Characteristic.SerialNumber, "123-456-789");
			var alarmService;
			if (Type == "Sensor") {
				alarmService = new Service.OccupancySensor("Alarm");
				alarmService.getCharacteristic(Characteristic.OccupancyDetected)
                    .on('get', getStatus);
			}
			else if (Type == "Switch") {
				alarmService = new Service.Switch("Alarm");
				alarmService.getCharacteristic(Characteristic.On)
					.on('get', getStatus)
                    .on('set', function (wantedState, next) {
						if (wantedState != currentStatus)
						{
							alarmService.getCharacteristic(Characteristic.On).updateValue(currentStatus);
							logger.error("Setting alarm status isn't supported!");
							return next(new Error("Setting alarm status isn't supported!"));
						}
						return next();
					});
			}
			else if (Type == "Alarm") {
				alarmService = new Service.SecuritySystem("Alarm");

				alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.on('get', getStatus);

				alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState)
					.on('get', getStatus)
					.on('set', function (wantedState, next) {
						if (wantedState != currentStatus)
						{
							alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(currentStatus);
							alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(currentStatus);
							logger.error("Setting alarm status isn't supported!");
							return next(new Error("Setting alarm status isn't supported!"));
						}
						return next();
					});
			}
			this.informationService = informationService;
			this.alarmService = alarmService;
			return [informationService, alarmService];
		}
	};
