class Planet{
 PVector position, velocity, acceleration;
 float mass, radius, omega;
  
 public Planet(PVector position_, PVector velocity_, float mass_, float radius_, float omega_){
   position = new PVector(position_.x, position_.y);
   velocity = new PVector(velocity_.x, velocity_.y);
   acceleration = new PVector(0,0);
   mass = mass_;
   radius = radius_;
   omega = omega_;
 } 
 
 void render(){
   noStroke();
   ellipse(position.x, position.y, radius, radius); 
 }

 
 boolean update(ArrayList<Planet> planets){
   acceleration = new PVector(0,0);
  
   for(Planet p : planets){
     if(!p.equals(this)){
       PVector dist = PVector.sub(position, p.position);
       if(dist.mag() < (radius + p.radius)/4){
        
         //p.mass += mass;
         //p.radius += radius;       
         //return false;
       } else {
         applyForce(getForce(p));
       }
     }
   }
   velocity.add(acceleration);
   position.add(velocity);
   return true;   
 }
 
 void applyForce(PVector force){
   force = new PVector(force.x/mass, force.y/mass);
   acceleration.add(force);
 }
 
 PVector getForce(Planet p){
   float G = 15;
   PVector distance = PVector.sub(p.position, position);
   double forceMag = G * mass * p.mass /  (distance.mag() * distance.mag());
   if(distance.mag() != 0){
     distance.setMag((float)forceMag);
   }
   return distance;
 }
  
}
