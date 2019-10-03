# MM-DHTSensor
This is a [MagicMirror](https://github.com/MichMich/MagicMirror) module for connecting DHT11/22 Temperature and Humidty sensors.

## Installation
1. Navigate in to your MagicMirrors `module` folder and execute `git clone https://github.com/doddi/MM-DHTSensor.git`
2. Execute `npm install` to install all its dependencies

## Using MM-DHTSensor

To use this module, add it to the modules array configuration `config/config.js` file:

```
modules: [
    {
        module: 'MM-DHTSensor',
        config: {
            // See 'Configuration options'
        }
    }
]
```

## Configuration options
The following properties can be configured:

| Option | Description |
| --- | --- |
| `name` | Display name of the sensor |
| `type` | Type of sensor, either 11/22 |
| `input` | Input pin assigned |
| `test` | if set to true will generate values |

## Dependencies
- [node-dht-sensor](https://www.npmjs.com/package/node-dht-sensor)