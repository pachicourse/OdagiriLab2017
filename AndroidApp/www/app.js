// Demo of the high-level extended BLE plugin API.

// Application code starts here. The code is wrapped in a
// function closure to prevent overwriting global objects.
;

window.addEventListener("load", init);
var tween;
var rect;

function init() {

    var stage = new createjs.Stage("canvas");
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
    handleLoad();

    function handleLoad() {
        h = window.innerWidth / 3;
        h2 = window.innerWidth / 3+20;
        
        var speed_label = [80,85,90,95,0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80]
    for(var i = 1; i <= 20; i++) {
        var shape = new createjs.Shape();
        var g = shape.graphics;
        g.beginFill("black");
        g.drawRect(0, 0, 10,10);
        g.endFill();
        var my_txt = new createjs.Text(String(speed_label[i-1]));

        var rot = 2 * Math.PI * i / 20;
        shape.x = h * Math.cos(rot) ;
        my_txt.x = h2 * Math.cos(rot) ;
//        + window.innerWidth / 2;
        shape.y = h * Math.sin(rot) ;
        my_txt.y = h2 * Math.sin(rot) ;
//            + window.innerHeight / 2;
        console.log(rot);
        stage.addChild(shape);
        stage.addChild(my_txt);
//        ar_shape.push(shape);
    }
        
        rect = new createjs.Shape();
        var hari_size = stage.canvas.width * 0.4;
        rect.graphics.beginFill("Black").drawRect(0, 0, hari_size, 4);

        stage.addChild(rect);
        stage.setTransform(stage.canvas.width / 2, stage.canvas.height / 2); //矩形を描画したい位置までステージの基準点を移動 
        rect.regX = 0; //矩形の基準点を矩形の中心に移動 
        rect.regY = 2; //矩形の基準点を矩形の中心に移動

        //        rect.scaleX = rect.scaleY = 0.1;
        tween = createjs.Tween.get(rect, {
            loop: true,
            override: true
        }).to({
            rotation: 360
        }, 1000)
    }

    function tick(event) {
        stage.update();
    }
}
speed = 40;

function updateTween(speed) {
        speed += (Math.random() * (20 - 0 + 1) + 0)-10;

    var angle = speed / 100 * 360;
    console.log(speed);

    createjs.Tween.removeTweens(rect);
    tween = createjs.Tween.get(rect, {
            override: true,
        })
        .to({
            rotation: angle + 90 //90は下を0にするため。
        }, 300, createjs.Ease.backOut)
}

var hoge = 0;
(function () {

    // UUIDs of services and characteristics.
    var LUXOMETER_SERVICE = '00001a95-0000-1000-8000-00805f9b34fb'
    var LUXOMETER_CONFIG = 'f000aa72-0451-4000-b000-000000000000'
    var LUXOMETER_DATA = '00000b25-0000-1000-8000-00805f9b34fb'

    function initialize() {
        // Start scanning for a device.
        findDevice()
    }

    function findDevice() {
        showMessage('Scanning for the ATBicycle...')

        // Start scanning. Two callback functions are specified.
        evothings.ble.startScan(
            onDeviceFound,
            onScanError, {
                serviceUUIDs: ['00001a95-0000-1000-8000-00805f9b34fb']
            })

        // This function is called when a device is detected, here
        // we check if we found the device we are looking for.
        function onDeviceFound(device) {
            // For debugging, print advertisement data.
            //console.log(JSON.stringify(device.advertisementData))

            // Alternative way to identify the device by advertised service UUID.
            /*
            if (device.advertisementData.kCBAdvDataServiceUUIDs.indexOf(
            	'0000aa10-0000-1000-8000-00805f9b34fb') > -1)
            {
            	showMessage('Found the TI SensorTag!')
            }
            */

            if (device.advertisementData.kCBAdvDataLocalName == 'ATBicycle') {
                showMessage('Found the ATBicycle')

                // Stop scanning.
                evothings.ble.stopScan()

                // Connect.
                connectToDevice(device)
            }
        }

        // Function called when a scan error occurs.
        function onScanError(error) {
            showMessage('Scan error: ' + error)
        }
    }

    function connectToDevice(device) {
        showMessage('Connecting to device...')

        evothings.ble.connectToDevice(
            device,
            onConnected,
            onDisconnected,
            onConnectError, {
                serviceUUIDs: [LUXOMETER_SERVICE]
            })

        function onConnected(device) {
            showMessage('Connected')

            // Get Luxometer service and characteristics.
            var service = evothings.ble.getService(device, LUXOMETER_SERVICE)
            var configCharacteristic = evothings.ble.getCharacteristic(service, LUXOMETER_CONFIG)
            var dataCharacteristic = evothings.ble.getCharacteristic(service, LUXOMETER_DATA)
            timer(callback = function () {
                evothings.ble.readCharacteristic(
                    device,
                    dataCharacteristic,
                    function (data) {
                        data
                        showMessage('characteristic data: ' + evothings.ble.fromUtf8(data));
                        updateTween(parseInt(evothings.ble.fromUtf8(data)));
                    },
                    function (errorCode) {
                        showMessage('readCharacteristic error: ' + errorCode);
                    }
                );
            })

            // Enable notifications for Luxometer.
            enableLuxometerNotifications(device, configCharacteristic, dataCharacteristic)
        }

        function onDisconnected(device) {
            showMessage('Device disconnected')
        }

        // Function called when a connect error or disconnect occurs.
        function onConnectError(error) {
            showMessage('Connect error: ' + error)
        }
    }

    // Use notifications to get the luxometer value.
    function enableLuxometerNotifications(device, configCharacteristic, dataCharacteristic) {
        // Turn Luxometer ON.
        evothings.ble.writeCharacteristic(
            device,
            configCharacteristic,
            new Uint8Array([1]),
            onLuxometerActivated,
            onLuxometerActivatedError)

        function onLuxometerActivated() {
            showMessage('Luxometer is ON')

            // Enable notifications from the Luxometer.
            evothings.ble.enableNotification(
                device,
                dataCharacteristic,
                onLuxometerNotification,
                onLuxometerNotificationError)
        }

        function onLuxometerActivatedError(error) {
            showMessage('Luxometer activate error: ' + error)
        }

        // Called repeatedly until disableNotification is called.
        function onLuxometerNotification(data) {
            var lux = calculateLux(data)
            showMessage('Luxometer value: ' + lux)
        }

        function onLuxometerNotificationError(error) {
            showMessage('Luxometer notification error: ' + error)
        }
    }

    // Calculate the light level from raw sensor data.
    // Return light level in lux.
    function calculateLux(data) {
        // Get 16 bit value from data buffer in little endian format.
        var value = new DataView(data).getUint16(0, true)

        // Extraction of luxometer value, based on sfloatExp2ToDouble
        // from BLEUtility.m in Texas Instruments TI BLE SensorTag
        // iOS app source code.
        var mantissa = value & 0x0FFF
        var exponent = value >> 12

        var magnitude = Math.pow(2, exponent)
        var output = (mantissa * magnitude)

        var lux = output / 100.0

        // Return result.
        return lux
    }

    function timer(callback) {
        callback();
        setTimeout(timer, 100, callback);
    }


    function showMessage(text) {
        document.querySelector('#message').innerHTML = text
        console.log(text)
    }

    // Start scanning for devices when the plugin has loaded.
    document.addEventListener('deviceready', initialize, false)

})(); // End of closure.
