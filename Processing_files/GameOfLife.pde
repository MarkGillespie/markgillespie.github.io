int SIDE_DIM = 500;
int CELLS = 50;
float WIDTH = SIDE_DIM/CELLS;
color foreground, bgColor;
boolean[][] generation;
boolean paused = false;

void setup(){
  size(500, 500);
  generation = new boolean[CELLS][CELLS];
  foreground = color(0,150,0);
  bgColor = color(255);
  frameRate(10);
  randomize();
  ellipseMode(CENTER);
  noStroke();
  colorMode(HSB, CELLS*CELLS, 10, 10);
}

void draw(){
  background(bgColor);
  if(!paused) {
    fill(foreground);
    iterate();
  }
  render();
}

void render(){
  for(int i = 0; i < CELLS; i++) {
    for(int j = 0; j < CELLS; j++) {
      if(generation[i][j]) {
        //fill(i*j, 80, 80);
        ellipse(i*WIDTH + WIDTH/2, j*WIDTH + WIDTH/2, WIDTH*.9, WIDTH*.9);
      }
    }
  }
}

void randomize(){
  for(int i = 0; i < CELLS; i++) {
    for(int j = 0; j < CELLS; j++) {
      generation[i][j] = (random(1) < 0.5);
    }
  }
}

void symmetryRandomize() {
    for(int i = 0; i <= CELLS/2; i++) {
    for(int j = 0; j < CELLS; j++) {
      boolean isAlive = random(1) < 0.5;
      generation[i][j] = isAlive;
      generation[CELLS-i-1][j] = isAlive;
    }
  }
}

void iterate(){
  boolean[][] newBoard = new boolean[CELLS][CELLS];
  for(int i = 0; i < CELLS; i++){
    for(int j = 0; j < CELLS; j++){
      int neighbors = numNeighbors(i,j);
      if(generation[i][j]) {
        newBoard[i][j] = (neighbors == 2 || neighbors == 3);
      } else {
        newBoard[i][j] = (neighbors == 3);
      }
    }
  }

  for(int i = 0; i < CELLS; i++) {
    for(int j = 0; j < CELLS; j++) {
      generation[i][j] = newBoard[i][j];
      if(generation[i][j]) {
      }
    }
  }

}

int numNeighbors(int i, int j){
  int neighbors = 0;
  for(int k = -1; k <= 1; k++){
    for(int l = -1; l <= 1; l++){
      if(!(l==0 && k==0)){
        if(generation[(i+k+CELLS)%CELLS][(j+l+CELLS)%CELLS] == true){
          neighbors++;
        }
      }
    }
  }
  return neighbors;
}

void mousePressed(){
 int x,y;
 x = (int)(mouseX/WIDTH);
 y = (int)(mouseY/WIDTH);

 generation[x][y] = !generation[x][y]; 
}

void keyPressed(){
 if(key == CODED) {
    if(keyCode == SHIFT) {
       randomize();
    }
 } else if(key == ' '){
   paused = !paused; 
 }  else if(key == ENTER || key == RETURN) {
       symmetryRandomize(); 
    }
}
