const DHT11 = 11;
const DHT22 = 22;

Module.register('MM-DHTSensor', {

	defaults: {
		name: 'Mirror',
		type: DHT11,
		input: 3,
		test: false,
	},

	registered: false,

	getStyles: function () {
		return ["weather-icons.css"];
	},

	start: function () {
		this.readingError = true;
		this.currentTemperature = 0;
		this.currentHumidity = 0;
		Log.info("Starting module: " + this.name);

		this.registerSensor();
	},

	registerSensor: function () {
		var json = {
			'name': this.config.name,
			'type': this.config.type,
			'input': this.config.input,
			'test': this.config.test,
		};
		Log.info('About to register: ' + JSON.stringify(json));
		this.sendSocketNotification('REGISTER_SENSOR', json);
	},

	getDom: function () {
		var wrapper = document.createElement('div');
		if (this.registered === false) {
			wrapper.innerHTML = this.config.name + ' sensor currently registering';
		}
		else if (this.readingError === true) {
			wrapper.innerHTML = 'Error Reading Sensor for ' + this.config.name;
		}
		else {
			var main = document.createElement("div");
			main.className = "light";

			var title = document.createElement("span");
			title.innerHTML = this.config.name + ' sensor';
			title.className = "bright";
			main.appendChild(title);

			var temp = this.showTemperature(this.currentTemperature);
			main.appendChild(temp);

			var humidity = this.showHumidity(this.currentHumidity);
			main.appendChild(humidity);

			wrapper.appendChild(main);
		}
		return wrapper;
	},

	showTemperature: function (value) {
		var tempIcon = document.createElement("span");
		tempIcon.className = "fas fa-temperature-low";
		tempIcon.innerHTML = "&nbsp";

		var temperature = document.createElement("span");
		temperature.innerHTML = value + "°C";

		var element = document.createElement("div");
		element.className = "dimmed medium";
		element.appendChild(tempIcon);
		element.appendChild(temperature);
		return element;
	},

	showHumidity: function (value) {
		var humidityIcon = document.createElement("span");
		humidityIcon.className = "wi wi-humidity humidityIcon";
		humidityIcon.innerHTML = "&nbsp;";

		var humidity = document.createElement("span");
		humidity.innerHTML = value;

		var element = document.createElement("div");
		element.className = "dimmed medium";
		element.appendChild(humidityIcon);
		element.appendChild(humidity);
		return element;
	},

	updateSensor: function () {
		if (this.registered === false) {
			this.registerSensor();
		}
		else {
			Log.info("about to get sensor information");
			this.sendSocketNotification("SENSOR_INFO_REQ", this.config.name);
		}
	},

	socketNotificationReceived: function (notification, payload) {
		if (payload.name !== this.config.name) {
			return;
		}

		if (notification === 'REGISTERED_SENSOR') {
			Log.info('Registered sensor, start updating');
			this.registered = true;
		}
		else if (notification === 'SENSOR_INFO') {
			Log.info(JSON.stringify(payload));
			this.maybeUpdate(payload.success, payload.temp, payload.humidity);
		}
		else {
			Log.error('Unknown notification: ' + notification);
		}
	},

	maybeUpdate: function (success, temperature, humidity) {
		if (success === false) {
			Log.info('Error reading sensor info ');
			this.readingError = true;
		}
		else {
			Log.info('Checking if sensor has updated');
			if (this.readingError === true ||
				this.currentTemperature !== temperature ||
				this.currentHumidity !== humidity) {
				Log.info('Sensor info changed');
				this.currentTemperature = temperature;
				this.currentHumidity = humidity;
			}
			this.readingError = false;
		}
		this.updateDom();
	},
});

