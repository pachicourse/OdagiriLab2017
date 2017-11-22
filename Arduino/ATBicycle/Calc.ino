double SPEED(double convert) {
  if(convert == 0) return -1;
  return (double)((double)1000 / (((double)convert * (double)1000000 / (double)3600) / (double)tire_size));
}

double RPMtoInterval(double convert) {
  return (60 / convert * 1000);
}

int getRPM() {
  // r/minにする ... convert * 1000 -> 秒に * 60 -> 分に
  return ((double)1000 / (double)cadence * (double)60);
}


