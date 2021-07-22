// homebridge-grifs
// Domas Kalinauskas 2021
var fs = require('fs');
var execScript = require('child_process').exec;
var logger;
// ContactSensor
var Service, Characteristic;
var Email, Password, Type;
module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-grifs", "GRIFHomeAlarm", GRIFHomeAlarm);
};

function readStatus() {
	if (fs.readFileSync('/tmp/alarmStatus').includes('dis')) {
		if (Type == "Alarm") {
			return 3;
		}
		else {
			return 0;
		}
	}
	else {
		return 1;
	}
}

function queryWebsite() {
	if (Email != undefined && Password != undefined) {
		var previousStatus = readStatus();
		execScript('nohup sh -c \'' + __dirname + '/grif_status "' + Email + '" "' + Password + '" &\' &');
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
	if (Type == undefined) {
		Type = "Switch";
	}

	// Create alarmStatus file in case it doesn't exist
	execScript('touch /tmp/alarmStatus');

	// Make script executable in case it isn't yet
	execScript('chmod a+x ' + __dirname + '/grif_status');

	queryWebsite();
	setInterval(function () {
		queryWebsite();
	}, 3 * 60 * 1000);

}

GRIFHomeAlarm.prototype =
{
	getServices: function () {
		var informationService = new Service.AccessoryInformation();
		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Grif")
			.setCharacteristic(Characteristic.Model, "Grif")
			.setCharacteristic(Characteristic.SerialNumber, "123-456-789");
		var alarmStatus = readStatus();
		var alarmService;
		if (Type == "Sensor") {
			alarmService = new Service.OccupancySensor("Alarm");
			fs.watchFile('/tmp/alarmStatus', (curr, prev) => {
				if (alarmStatus != readStatus())
				{
					logger.info("Alarm status changed!");
					alarmStatus = readStatus();
					alarmService.getCharacteristic(Characteristic.OccupancyDetected).updateValue(alarmStatus);
				}
			});

			alarmService.getCharacteristic(Characteristic.OccupancyDetected)
				.on('get', function (next) {
					alarmStatus = readStatus();
					return next(null, alarmStatus);
				});
		}
		else if (Type == "Switch") {
			alarmService = new Service.Switch("Alarm");
			fs.watchFile('/tmp/alarmStatus', (curr, prev) => {
				if (alarmStatus != readStatus())
				{
					logger.info("Alarm status changed!");
					alarmStatus = readStatus();
					alarmService.getCharacteristic(Characteristic.On).updateValue(alarmStatus);
				}
			});

			alarmService.getCharacteristic(Characteristic.On)
				.on('get', function (next) {
					alarmStatus = readStatus();
					return next(null, alarmStatus);
				})
				.on('set', function (wantedState, next) {
					alarmStatus = readStatus();
					if (wantedState != alarmStatus)
					{
						alarmService.getCharacteristic(Characteristic.On).updateValue(alarmStatus);
						logger.error("Setting alarm status isn't supported!");
						return next(new Error("Setting alarm status isn't supported!"));
					}
					return next();
				});
		}
		else if (Type == "Alarm") {
			alarmService = new Service.SecuritySystem("Alarm");
			fs.watchFile('/tmp/alarmStatus', (curr, prev) => {
				if (alarmStatus != readStatus())
				{
					logger.info("Alarm status changed!");
					alarmStatus = readStatus();
					alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(alarmStatus);
					alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(alarmStatus);
				}
			});

			alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
				.on('get', function (next) {
					alarmStatus = readStatus();
					return next(null, alarmStatus);
				});
			alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState)
				.on('get', function (next)
				{
					alarmStatus = readStatus();
					return next(null, alarmStatus);
				})
				.on('set', function (wantedState, next) {
					alarmStatus = readStatus();
					if (wantedState != alarmStatus)
					{
						alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(alarmStatus);
						alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(alarmStatus);
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