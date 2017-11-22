#include <CurieBLE.h>
#include <stdio.h>

BLEPeripheral blePeripheral;
BLEService CurieBLEService("1A95");
BLECharacteristic timingCharacteristic("0B25", BLERead | BLEWrite, 16);

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
  char buf[16];
  snprintf(buf, 16, "%.2f, %d, %d", Speed(), getRPM(), Gear_Pos);
//  snprintf(buf, 12, "%d, %d, %d", random(1,100), random(1,100), random(1,100));
//  Serial.println("hello");
  if(central) {
    //Serial.print("Connected to central: ");
    // print the central's MAC address:
    //Serial.println(central.address());
    int bufsize = strlen(buf);
    timingCharacteristic.setValue((unsigned char*)buf, bufsize);
    //Serial.println("done");
  }
}
