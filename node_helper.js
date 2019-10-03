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

	intervalTimer: null,

	socketNotificationReceived: function (notification, payload) {
		console.log(notification + " received");

		if (notification === 'REGISTER_SENSOR') {
			console.log('Registering sensor: ' + JSON.stringify(payload));
			sensorLib.initialize(payload.type, payload.input);
			this.sensors[payload.name] = {
				'type': payload.type,
				'input': payload.input
			};

			this.sendSocketNotification('REGISTERED_SENSOR', null);

			var self = this;
			this.intervalTimer = setInterval(function () {
				self.readSensors()
			}, 5000);
		}
	},

	readSensors: function () {
		console.log('Attempting to read sensors');

		for (var sensor in this.sensors) {
			response = sensorLib.read(this.sensors[sensor].type, this.sensors[sensor].input);

			var json = {};
			if (response.isValid === false) {
				console.log('Error reading from sensor');
				json = {
					'success': false,
					'temp': null,
					'humidity': null
				};
			}

			json = {
				'success': true,
				'temp': response.temperature,
				'humidity': response.humidity
			};

			this.sendSocketNotification('SENSOR_INFO', json);
		}
	},
});

