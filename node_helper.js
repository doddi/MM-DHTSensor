var NodeHelper = require('node_helper');
var sensor = require("node-dht-sensor");

module.exports = NodeHelper.create({
	start: function() {
		this.sensors = [];
	},

	getSensorInformation: function(name) {
		console.log('Reading ' + name + ' which is of type ' + this.sensors[name].type + ' on input ' + this.sensors[name].input);

		var response = sensor.read(this.sensors[name].type, this.sensors[name].input);

		if (response.isValid === false) {
			console.log('Error reading from sensor');
			return {
				'success': false,
				'temp': null,
				'humidity': null
			};
		}

		return {
			'success': true,
			'temp': response.temperature,
			'humidity': response.humidity
		};
	},

	socketNotificationReceived: function(notification, payload) {
		console.log(notification + " received");

		if (notification === 'REGISTER_SENSOR') {
			console.log('Registering sensor: ' + JSON.stringify(payload));
			sensor.initialize(payload.type, payload.input);
			this.sensors[payload.name] = {
				'type': payload.type,
				'input': payload.input
			};
			console.log(this.sensors);
			this.sendSocketNotification('REGISTERED_SENSOR', null);
		}
		else if( notification === 'SENSOR_INFO_REQ') {
			console.log('Sensor info needed for ' + payload);
			var data = this.getSensorInformation(payload);

			this.sendSocketNotification('SENSOR_INFO_RCV', data);
		}
	},
});

