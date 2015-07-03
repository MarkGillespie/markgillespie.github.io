int numPlanets = 0;
ArrayList<Planet> planets = new ArrayList<Planet>(0);

Planet[] plan = new Planet[2];

void setup(){
  size(500, 500);
  background(200);

  planets.add(new Planet(
    new PVector(width/2, height/2),
    new PVector(0,0),
    100, 
    80, 
    0
  ));

  planets.add(new Planet(
    new PVector(width/2, height/2 + 200),
    new PVector(-2,0),
    1,
    10,
    0
  ));
}

void draw(){
  background(200);
  for(int i = 0; i < planets.size() ; i++){
    if(planets.get(i).update(planets)){
      planets.get(i).render();
    } else {
     println(i);
     planets.remove(i);
     i--; 
    }
  }

}

void mouseClicked(){
  PVector vel = PVector.random2D();
  vel.setMag(2);
  planets.add(new Planet(
    new PVector(mouseX, mouseY),
    vel,
    1,
    10,
    0
  )); 
}
