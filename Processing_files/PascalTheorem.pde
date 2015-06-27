int tail = 400;
Point[] points = new Point[5];
Line aToBprime, bToAprime, aPrimeToC, bPrimeToC, middle, Am, Bn;
PVector dir = new PVector(1,0);
Point l,m,n;

Point artist = new Point(new PVector(-10,-10));;
Draws pen = new Draws(artist);

PVector sect;

void setup(){
  size(500, 500);
  points[0] = new Point(new PVector(200,200));//A
  points[1] = new Point(new PVector(400,100));//B
  points[2] = new Point(new PVector(300,200));//C
  points[3] = new Point(new PVector(200,400));//A'
  points[4] = new Point(new PVector(400,300));//B'
  aToBprime = new Line(points[0], points[4]);
  bToAprime = new Line(points[1], points[3]);
  aPrimeToC = new Line(points[3], points[2]);
  bPrimeToC = new Line(points[4], points[2]);
}

void draw(){
  background(220);
  for(Point p : points){
    p.update();
  } 
  
  aToBprime.update();
  aToBprime.render();
  bToAprime.update();
  bToAprime.render();
  aPrimeToC.update();
  aPrimeToC.render();
  bPrimeToC.update();
  bPrimeToC.render();
  l = new Point(aToBprime.intersection(bToAprime));
  middle = new Line(l, new Point(new PVector(l.position.x+dir.x, l.position.y+dir.y)));
  m = new Point(aPrimeToC.intersection(middle));
  n = new Point(bPrimeToC.intersection(middle));
  Am = new Line(points[0], m);
  Bn = new Line(points[1], n);
  
  artist.position = Am.intersection(Bn);
  
  Am.update();
  Am.render();
  Bn.update();
  Bn.render();
  
  middle.update();
  middle.render(); 
  
  ellipse(l.position.x, l.position.y, 20, 20);
  ellipse(m.position.x, m.position.y, 20, 20);
  ellipse(n.position.x, n.position.y, 20, 20);
  
  dir = rotateVector(dir, 0.01);
    
  artist.update();
  artist.render();
  
  pen.update();
  pen.render();

  for(Point p: points){
    p.render();
  }
}

class Draws{
 ArrayList<PVector> points = new ArrayList<PVector>();
 Point p;
 
 public Draws(Point p_){
  p = p_;
 } 
 
 void update(){
  points.add(p.position);
  if(points.size() > tail){
   points.remove(0);
  } 
 }
 
 void render(){
  for(int i = 0; i < points.size()-1; i++){
   stroke(50, 100);
   strokeWeight(3);
   line(points.get(i).x, points.get(i).y, points.get(i+1).x, points.get(i+1).y);
   stroke(255);
   strokeWeight(1);
  } 
 }
}

class Line{
  Point start, end;
  float A, B, C;
 
 
  public Line(Point start_, Point end_){
    start = start_;
    end = end_;
    A = -(end.position.y-start.position.y)/(end.position.x-start.position.x);
    B = 1;
    C = start.position.y-(end.position.y-start.position.y)/(end.position.x-start.position.x)*start.position.x;
  } 
  
  void update(){
    A = -(end.position.y-start.position.y)/(end.position.x-start.position.x);
    B = 1;
    C = start.position.y-(end.position.y-start.position.y)/(end.position.x-start.position.x)*start.position.x; 
  }
  
  void render(){
   float y1 = C/B;
   float y2 = -A/B*width+C/B;
   stroke(255);
   line(0, y1, width, y2); 
  }
    
  PVector intersection(Line l){
    float[][] coeffMat = new float[2][2];
    coeffMat[0][0] = A;
    coeffMat[1][0] = l.A;
    coeffMat[0][1] = B;
    coeffMat[1][1] = l.B;
    float[][] sols = {{C, 0},{l.C,0}};
    float[][] inv = inverse(coeffMat);
    float[][] intSols = mMult(inv, sols);
    return new PVector(intSols[0][0], intSols[1][0]);
    
    
  }
  
}

float[][] mMult(float[][]A, float[][]B){
  float[][] resultant = new float[A.length][B[0].length];
  for(int i = 0; i < A.length; i++){//A height
    for(int j = 0; j < B[0].length; j++){//B width
      for(int k = 0; k < B.length; k++){
        resultant[i][j] += A[i][k]*B[k][j];
      }
    }
  }
  return resultant;
}

float[][] inverse(float[][] m){
  float det = m[1][1]*m[0][0]-m[1][0]*m[0][1];
  float[][] augmented = new float[2][2];
  augmented[0][0] = m[1][1]/det;
  augmented[0][1] = -m[0][1]/det;
  augmented[1][0] = -m[1][0]/det;
  augmented[1][1] = m[0][0]/det;  
  return augmented;
}

class Point{
 PVector position;
 boolean isClicked = false;
 public Point(PVector pos){
  position = pos;
 } 
 
 void update(){
   if(isClicked){
    position.add(PVector.sub(new PVector(mouseX, mouseY), position)); 
   }
 }
 
 void render(){
   noStroke();
   fill(102,225,240);
   if(isClicked){
    fill(255); 
   }
   ellipse(position.x, position.y, 10, 10);
   fill(102,225,240);
 }
}


void mousePressed(){
 for(Point p : points){
   if(p.isClicked){
     break; 
   }
  } 
 for(Point p: points){
  if(PVector.sub(p.position, new PVector(mouseX, mouseY)).mag() < 10){
   p.isClicked  = true;
   break;
  } 
 }
}

void mouseReleased(){
  for(Point p : points){
   p.isClicked = false;
  } 
}

PVector rotateVector(PVector vect, float theta) {
    float xTemp = vect.x;
    vect.x = vect.x*cos(theta) - vect.y*sin(theta);
    vect.y = xTemp*sin(theta) + vect.y*cos(theta);
    return vect;
}




