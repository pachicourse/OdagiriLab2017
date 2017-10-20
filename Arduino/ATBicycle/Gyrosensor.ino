void gyro_init() {
  // put your setup code here, to run once:
  //Serial.begin(9600);
  return;
}

int gyro() {
  // put your main code here, to run repeatedly:
  int a4 = analogRead(A3);
  int a5 = analogRead(A4);
//  Serial.println("A4 is " + (String)a4);
//  Serial.println("A5 is " + (String)a5);
  //delay(500);
  return a5;
}

