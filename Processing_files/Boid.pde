class Boid{

  int size = 2;
  int COLOR_NUM = 20;
  int RANDOM_COLOR_CHANGE = 10;
  float visionCone = PI/6;
  float comfortZone = 15*size;
  float eyeSight = 37*size;
  float colorVision = 30*size;
  float speedLimit = 6*size;
  float forceLimit = .03*size;

  float sepWeight = 125;
  float aliWeight = 35;
  float cohWeight = 10; 

  PVector position;
  PVector velocity;
  PVector steeringForce;

  float H, S, B;

  public Boid(int x, int y, int H_){
    position = new PVector(x, y);
    float angle = random(TWO_PI);
    velocity = new PVector(cos(angle), sin(angle));
    H = H_;
    S = (float)(Math.random()*50)+50;
    B = (float)(Math.random()*50) + 50;

  }

  void update(ArrayList<Boid> flock){

    steeringForce = new PVector(0,0);
    steeringForce.add(forces(flock));
    velocity.mult(.5);
    velocity.add(steeringForce);
    if(velocity.mag()<1)
      velocity.mult(2);
    velocity.limit(speedLimit);
    position.add(velocity);

    if (position.x < size){
      position.x = width-size;
    }
    if (position.y < size) {
      position.y = height-size;
    }
    if (position.x > width-size) {
      position.x = size;
    }
    if (position.y > height-size){
      position.y = size;
    }
  }

  PVector forces(ArrayList<Boid> flock){
    PVector steering = new PVector(0,0);
    PVector separation = new PVector(0,0);
    PVector alignment = new PVector(0,0);
    PVector cohesion = new PVector(0,0);

    PVector mouse = new PVector(mouseX, mouseY);

    int sepCount = 0;
    int counter = 0;
    int colorCount = 0;
    float frontColor = 0;

    for(Boid b: flock){
      //check if within eyesight for cohesion and alignment
      float dist =PVector.dist(this.position, b.position);
      if(dist < eyeSight && dist != 0){ 
        //alignment
        counter++;
        PVector temp = new PVector(b.velocity.x, b.velocity.y);
        temp.normalize();
        temp.div(dist);
        alignment.add(temp);

        //cohesion
        temp = PVector.sub(b.position, position);
        temp.normalize();
        temp.div(dist);
        temp.mult(100);
        cohesion.add(temp);
      }
      //separation
      if(dist < comfortZone && dist > 0){
        PVector temp = PVector.sub(position, b.position);
        temp.normalize();
        temp.div(dist);
        temp.mult(100);
        separation.add(temp);
        sepCount++;
      }

      if(dist < colorVision && dist>0){
        //color
        PVector disp = PVector.sub(b.position, this.position);
        float head = heading2D(disp);
        //if the other boid is ahead of this one
        if(Math.abs(head-heading2D(velocity))<PI/2 && Math.abs(head-heading2D(b.velocity)) < visionCone){
          frontColor += b.H;
          colorCount++;
        }
      }     
    } 
    if(colorCount==0){

    } else if (colorCount > 3){
      float otherColor = frontColor/colorCount;
      H = otherColor;
    } else {
      float otherColor = frontColor/colorCount;
      H = (otherColor + H)/2;
    }

    mouse.sub(position);
    float dist = mouse.mag();
    mouse.normalize();
    mouse.div(dist);
    mouse.mult(5);  
    if(!mousePressed){
      if(keyPressed){
        if(key == ' '){
          steering.sub(mouse);
        }
      }
    }

    if(counter > 0)
      alignment.div(counter);
    if(counter > 0)
      cohesion.div(counter);
    if(sepCount > 0)
      separation.div(sepCount); 

    alignment.mult(aliWeight);
    alignment.limit(forceLimit);
    steering.add(alignment);

    cohesion.mult(cohWeight);
    cohesion.limit(forceLimit);
    steering.add(cohesion);

    separation.mult(sepWeight);
    separation.limit(forceLimit);
    steering.add(separation);

    return steering;
  }


  void render() {
    H %= 360;
    // Draw a triangle rotated in the direction of velocity
    float theta = heading2D(velocity) + PI/2;
    // heading2D() above is now heading() but leaving old syntax until Processing.js catches up
    colorMode(HSB, 360, 100, 100);
    fill(H,S,B);
    noStroke();
    pushMatrix();
    translate(position.x, position.y);
    rotate(theta);
    beginShape(TRIANGLES);
    vertex(0, size);
    vertex(-2*size,4*size);
    vertex(2*size, 4*size);
    endShape();
    ellipseMode(CENTER);
    ellipse(0,-size,2*size,6*size);
    popMatrix();
  }

  float heading2D(PVector pvect){
    return (float)(Math.atan2(pvect.y, pvect.x));  
  }

  void rotate2D(PVector v, float theta) {
    float xTemp = v.x;
    v.x = v.x*cos(theta) - v.y*sin(theta);
    v.y = xTemp*sin(theta) + v.y*cos(theta);
  }

}