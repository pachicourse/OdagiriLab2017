void CHANGE_Gear(void) {
  //  if(millis()-shift_once>=2000)
  if (Gear_Pos <= gear_steps && Gear_Pos > 0) {

    if (Before_Pos != Gear_Pos) { //ギア位置に変更がある場合のみギアチェンジ
      //    shift_once=millis();
      //          Serial.print(Before_Pos);
      //            Serial.print(">");
      //                  Serial.println(Gear_Pos);

      myservo.attach(ServoPin);
      shift_start = millis();
      //        delay(300);
      over_strokeflag = true;

      //シフトダウン
      if (Before_Pos > Gear_Pos) {
//        myservo.writeMicroseconds(constPulse[9 - Gear_Pos]);
        Serial.println(constPulse[9 - Gear_Pos]);

        up_down = false;
        Before_Pos -= 1;
        shift_up = false;

      }
      //シフトアップ
      else {
        //        myservo.writeMicroseconds((int)((Gear_Pos * Debug_num) + attach_min + adjust));
        //        Serial.println((int)((Gear_Pos * Debug_num) + attach_min + adjust));
        myservo.writeMicroseconds(constPulse[9 - Gear_Pos]);
        Serial.println(constPulse[9 - Gear_Pos]);
        up_down = true;


        Before_Pos += 1;
        shift_up = true;

      }
    }
  }
}

void over_stroke(void) {
        myservo.attach(ServoPin);

  if (over_strokeflag == true) {
//    Serial.println("overstroke");
    //      Serial.println("ovs");

    //    myservo.write((int)((Gear_Pos * Debug_num) + adjust ));//overstroke adjust = 3;
//    int servo_seconds = (int)((Gear_Pos * Debug_num) + attach_min +  adjust);
//    if (shift_up) servo_seconds -= 30;
//    else servo_seconds += 30;
    int overVal = 0;
    if(up_down) overVal = 20;
    else overVal = -20;
//    myservo.writeMicroseconds(constPulse[9 - Gear_Pos] + up_down ? 30 : -30);
    myservo.writeMicroseconds(constPulse[9 - Gear_Pos] + overVal);//up_down ? 30 : -30);


    //        delay(200);
    if (millis() - shift_start >= 700) {
      Serial.println("fuck");
//      myservo.detach();
//      ovs_flag = false;
        myservo.writeMicroseconds(constPulse[9 - Gear_Pos]);

      over_strokeflag = false;
    }
  }
}
