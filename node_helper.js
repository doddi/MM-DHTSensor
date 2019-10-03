var NodeHelper = require('node_helper');
var sensorLib = require("node-dht-sensor");

module.exports = NodeHelper.create({
	start: function () {
		this.sensors = [];
	},

	stop: function () {
		if (this.intervalTimer !== null) {
			clearInterval(this.intervalTimer);
		}
	},

	timer: null,

	socketNotificationReceived: function (notification, payload) {
		console.log(notification + " received");

		if (notification === 'REGISTER_SENSOR') {
			console.log('Registering sensor: ' + JSON.stringify(payload));
			sensorLib.initialize(payload.type, payload.input);
			this.sensors[payload.name] = {
				'type': payload.type,
				'input': payload.input,
				'test': payload.test
			};

			this.sendSocketNotification('REGISTERED_SENSOR', { 'name': payload.name });
			this.scheduleUpdate();
		}
	},

	scheduleUpdate: function () {
		var self = this;

		if (this.timer !== null) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(function () {
			self.readSensors()
		}, 5000);
	},

	readSensors: function () {
		console.log('Attempting to read sensors');

		for (var sensor in this.sensors) {
			var json = {};
			if (this.sensors[sensor].test === true) {
				json = {
					'name': sensor,
					'success': true,
					'temp': parseFloat(Math.random() * 100).toFixed(2),
					'humidity': parseFloat(Math.random() * 100).toFixed(2)
				};
			}
			else {
				json = this.readSensor(sensor, json);
			}
			this.sendSocketNotification('SENSOR_INFO', json);
		}
		this.scheduleUpdate();
	},

	readSensor: function (sensor, json) {
		response = sensorLib.read(this.sensors[sensor].type, this.sensors[sensor].input);
		if (response.isValid === false) {
			console.log('Error reading from sensor');
			json = {
				'name': sensor,
				'success': false,
				'temp': null,
				'humidity': null
			};
		}
		json = {
			'name': sensor,
			'success': true,
			'temp': response.temperature,
			'humidity': response.humidity
		};
		return json;
	}
});

