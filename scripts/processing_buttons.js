var p;
var selected_button = "Boids";

function initializeProcessingCanvas() {
  loadProcessingSketch('Boids', ['Boids.pde', 'Boid.pde']);
}

function escapeForHTML(s) {
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  return s;
}

function stripEnding(s) {
  return s.substring(0, s.length-4);
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

  $("#processing_source_file_list").empty();

  $.each(args, function(index, value) {
    $("#processing_source_file_list").append (
      $("<span>").attr({
        onclick: "loadSource('" + args[index] + "');",
        class: "processing_source_file_option",
        id: stripEnding(value)
      }).append(
        value
      ),
      " "
    );
  });  

  loadSource(args[0]);
}

function loadSource(s) {
  $.ajax({
    url : "Processing_files/" + s,
    dataType: "text",
    success : function (data) {
      document.getElementById("processing_source").className="";
      $("#processing_source").html(escapeForHTML(data));
      Rainbow.color(document.getElementById("processing_source_wrapper"));
      // console.log
      $("#processing_source_file_list").children().each(function() {
        $(this).attr({
          class: "processing_source_file_option"
        });
      });
      $("#" + stripEnding(s)).attr({
        class: "processing_source_file_option_selected"
      });
    }
  });
}

function toggleSource() {
  console.log($("#processing_source_container").css("display"));
  if ($("#processing_source_container").css("display") == "none") {
    $("#processing_source_container").css("display","block");
    $("#processing_source_hider").empty()
    $("#processing_source_hider").attr({class: "selected"}).append("Hide Source");
  } else {
    $("#processing_source_container").css("display","none");
    $("#processing_source_hider").empty()
    $("#processing_source_hider").attr({class: ""}).append("View Source");
  }
}