double SPEED(double convert) {
  if(convert == 0) return -1;
  return (1000 / ((convert * 1000000 / 3600) / tire_size));
}

double RPMtoInterval(double convert) {
  return (60 / convert * 1000);
}

int getRPM() {
  // r/minにする ... convert * 1000 -> 秒に * 60 -> 分に
  return (cadence * 1000 * 60);
}

