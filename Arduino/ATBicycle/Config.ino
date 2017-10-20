void writeConfig(int addr) {
  byte configTable[DATA_NUM];
  byte softbuff = 0;
  byte data;
  int ans = 255;
  int count = 0;

  while (1) {
    if (Serial.available() > 0) {
      int buf = Serial.read();
      //      data = Se
      //      serialFlush();
      if (buf != -1) {
        data = (byte)buf;
        if (data == softbuff) {
          Serial.write(ans);
          configTable[count] = data;
          //        delay(100);
                  serialFlush();
          softbuff = 0;
          count++;
          if(data == 15){
            pinMode(13,OUTPUT);
            digitalWrite(13,HIGH);
          }//test用
        }
        else {
//          Serial.write(byte(0));
          softbuff = data;
        }
      }
//      delay(100);
    }
    if (count == DATA_NUM) break;
  }

  Wire.beginTransmission(EPR_ADDR);
  Wire.write(highByte(addr));
  Wire.write(lowByte(addr));
  Wire.write(configTable, DATA_NUM);
  Wire.endTransmission();
  delay(5);
//
///  return;
}

void readConfig(int addr) {
  
  Wire.beginTransmission(EPR_ADDR);
  Wire.write(highByte(addr));
  Wire.write(lowByte(addr));
  Wire.endTransmission();
  Wire.requestFrom(EPR_ADDR, DATA_NUM);
  
  uphill_border = Wire.read();
  downhill_border = Wire.read();
  gear_steps = Wire.read();
  flat_accell_gear_up = Wire.read();
  flat_accell_gear_down = Wire.read();
  flat_cruise_gear_up = Wire.read();
  flat_cruise_gear_down = Wire.read();
  uphill_accell_gear_up = Wire.read();
  uphill_accell_gear_down = Wire.read();
  uphill_cruise_gear_up = Wire.read();
  uphill_cruise_gear_down = Wire.read();
  downhill_gear_up = Wire.read();
  downhill_gear_down = Wire.read();
  stop_speed = Wire.read();
  
  return;
}

void serialFlush() {
  while (Serial.available() > 0) {
    char t = Serial.read();
  }
}

void debugConfig() {
  Serial.print("uphill_border = "); Serial.println(uphill_border);
  Serial.print("downhill_border = "); Serial.println(downhill_border);
  Serial.print("gear_steps = "); Serial.println(gear_steps);
  Serial.print("flat_accell_gear_up = "); Serial.println(flat_accell_gear_up);
  Serial.print("flat_accell_gear_down = "); Serial.println(flat_accell_gear_down);
  Serial.print("flat_cruise_gear_up = "); Serial.println(flat_cruise_gear_up);
  Serial.print("flat_cruise_gear_down = "); Serial.println(flat_cruise_gear_down);
  Serial.print("uphill_accell_gear_up = "); Serial.println(uphill_accell_gear_up);
  Serial.print("uphill_accell_gear_down = "); Serial.println(uphill_accell_gear_down);
  Serial.print("uphill_cruise_gear_up = "); Serial.println(uphill_cruise_gear_up);
  Serial.print("uphill_cruise_gear_down = "); Serial.println(uphill_cruise_gear_down);
  Serial.print("downhill_gear_up = "); Serial.println(downhill_gear_up);
  Serial.print("downhill_gear_down = "); Serial.println(downhill_gear_down);
  Serial.print("stop_speed = "); Serial.println(stop_speed);
}
