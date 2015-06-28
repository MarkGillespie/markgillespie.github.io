var p;
var selected_button = "Boids";

function initializeProcessingCanvas() {
  loadProcessingSketch('Boids', ['Boids.pde', 'Boid.pde'])
}

function loadProcessingSketch(name, args) {
  $("#" + selected_button + "_button").attr({
    class : "processing_button" 
  });

  selected_button = name;

  $("#" + selected_button + "_button").attr({
    class : "selected_processing_button" 
  });

  if (Processing.getInstanceById("processing_canvas")) {
    Processing.getInstanceById("processing_canvas").exit();
  }

  filenames = [];

  $.each(args, function(index, value) {
    filenames[index] = "Processing_files/" + args[index];
  });

  var p = new Processing.loadSketchFromSources('processing_canvas', filenames);

  $.ajax({
    type: "GET",
    url: "Processing_files/ProgramDescriptions.html",
    dataType: "html",
    success: function(html) {
      // console.log(html.getElementsByTagName(name)[0].textContent);
      $("#processing_description").empty();
      $("#processing_description").append(
        $(html).find("#" + name).children()[1]
      );

      $("#processing_title").empty();
      $("#processing_title").append(
        $(html).find("#" + name).children()[0]
      );
    }
  });

  $("#processing_source").empty();
  $("#processing_source").append(
    "Source: "          
  );

  $.each(args, function(index, value) {
    $("#processing_source").append (
      $("<a>").attr({
        href : "Processing_files/" + value
      }).append(
        value
      ),
      " "
    );
  });
}