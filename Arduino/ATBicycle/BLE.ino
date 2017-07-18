#include <CurieBLE.h>

BLEPeripheral blePeripheral;
BLEService CurieBLEService("1A95");
BLECharacteristic timingCharacteristic("0B25", BLERead | BLEWrite, 2 );

void setupBLE() {
  Serial.begin(38400);
  while (!Serial);
  blePeripheral.setLocalName("ATBicycle");
  blePeripheral.setAdvertisedServiceUuid(CurieBLEService.uuid());

  blePeripheral.addAttribute(CurieBLEService);
  blePeripheral.addAttribute(timingCharacteristic);

  blePeripheral.begin();
  
  Serial.println("Bluetooth device active, waiting for connections...");
}

void sendValueBLE() {
  BLECentral central = blePeripheral.central();
  char timing[2] = "1";
  if(central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());
    int bufsize = strlen(timing);
    timingCharacteristic.setValue((unsigned char*)timing, bufsize); 
    Serial.println("done");
  }
}
