// homebridge-grifs
// Domas Kalinauskas 2021
var shell = require('shelljs');
// ContactSensor
var Service, Characteristic;
var path_to_login_script;
module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-grifs", "GRIFHomeAlarm", GRIFHomeAlarm);
};

function GRIFHomeAlarm(log, config) {
	this.log = log;
	this.name = config["name"];
	path_to_login_script = config["path"];
}

GRIFHomeAlarm.prototype = {

	getServices: function () {
		var me = this;
		var informationService = new Service.AccessoryInformation();
		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Grif")
			.setCharacteristic(Characteristic.Model, "Grif")
			.setCharacteristic(Characteristic.SerialNumber, "123-456-789");
		var status_actual = 0;
		var alarmService = new Service.SecuritySystem("Alarm");
		alarmService
			.getCharacteristic(Characteristic.SecuritySystemCurrentState)
			.on('get', function(next) {
				var me = this;
				var status_report = shell.exec(path_to_login_script);
				if (status_report.includes('dis')) {
					status_actual = Characteristic.SecuritySystemCurrentState.DISARMED;
				} else {
					status_actual = Characteristic.SecuritySystemCurrentState.AWAY_ARMED;
				}
				return next(null, status_actual);
			});
		alarmService
			.getCharacteristic(Characteristic.SecuritySystemTargetState)
			.on('get', function(next) {
				var me = this;
				var status_report = shell.exec(path_to_login_script);
				if (status_report.includes('dis')) {
					status_actual = Characteristic.SecuritySystemCurrentState.DISARMED;
				} else {
					status_actual = Characteristic.SecuritySystemCurrentState.AWAY_ARMED;
				}
				return next(null, status_actual);
			})
			.on('set', function(powerState, next) {
				// alarmService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(status_actual);
				alarmService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(status_actual);

				return next(new Error("Setting alarm state isn't supported!"));
			});

		this.informationService = informationService;
		this.alarmService = alarmService;
		return [informationService, alarmService];
	}
};

