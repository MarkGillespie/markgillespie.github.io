float amplitude, middle, ballRadius, ballGap, numBalls, theta, thetaStep, thetaGap;

void setup(){
 background(180);
 size(500, 500);
 amplitude = height/2;//distance from vertical center of graph to farthest point
 middle = height/2;//vertical center of graph
 ballRadius = 5;//radius of a circle
 ballGap = 10;//distance between circles
 numBalls = width/(ballRadius + ballGap);//number of circles
 theta = 0;//initial angle
 thetaStep = .01;//angle increment each frame
 thetaGap = .1;//angle increment between balls
}

void draw(){
  colorMode(RGB, 255);
  background(50);
  noStroke();
  //colorMode(HSB, 360, 100, 100);
  for(int i = 0; i < numBalls; i++){
  float y = i * thetaGap + theta;
  pushMatrix();
    translate(0, middle);
   // fill((fnc(y)*amplitude+middle)/height * 360, 15, 100);
    fill(255);
    ellipse(ballGap/2 + i * (ballRadius + ballGap), fnc(y)*amplitude, 2*ballRadius, 2*ballRadius);
  popMatrix();
 } 
 theta += thetaStep;
}

float fnc(float x){
  float fnMax = 2;
  //return square(x, 4)/fnMax;
  return (sin(x*2) + cos(x))/fnMax;
  //return (sin(1000*x) + cos(1001*x))/fnMax;
}

float square(float x, int n) {
  float sum = 0;
  for(int i = 1; i <= 2*n; i+=2) {
    sum += 1/i * sin(i * PI * x);
  }
  return sum;
}