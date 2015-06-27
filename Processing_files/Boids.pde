int NUM_BOIDS = 100; 
ArrayList<Boid> flock = new ArrayList<Boid>();
HScrollbar sep;
HScrollbar ali;
HScrollbar coh;
PFont f = createFont("Lucida Bright Italic", 10.0, true);
PImage water, lightWater;
int BIG_ADD = 10;

void setup(){
  frameRate(40);
  size(500, 500);
 
  for(int i = 0; i < NUM_BOIDS; i++){
   flock.add(new Boid(300, 300, (int)(Math.random()*360))); 
  }
  
  water = loadImage("images/water.jpg");
  image(water,0,0);
}

void draw(){
  image(water,0,0);

  for(Boid b: flock){
    b.update(flock);
    b.render();  
  }
  
  fill(255);
  text("Number of Boids: " + flock.size(), width-200, 15);
}

void mousePressed(){
  if(mouseButton==LEFT)
     flock.add(new Boid(mouseX, mouseY,(int)(Math.random()*312))); 
  if(mouseButton==RIGHT){
    int H = (int)(Math.random()*360);

   for(int i = 0; i < BIG_ADD; i++){
     flock.add(new Boid(mouseX, mouseY, H));
   } 
  }
     
}

void keyPressed(){
 if(key == 'c'){
    for(Boid b : flock){
     b.H = (float)(Math.random()*360);
     b.S = (float)(Math.random()*50)+50;
     b.B = (float)(Math.random()*50) + 50;
  }
 } 
}

