var p;

      function initializeProcessingCanvas() {
        loadProcessingSketch('Boids', ['Boids.pde', 'Boid.pde'])
      }

      function loadProcessingSketch(name, args) {
        if (Processing.getInstanceById("processing_canvas")) {
          Processing.getInstanceById("processing_canvas").exit();
        }

        filenames = [];

        $.each(args, function(index, value) {
          filenames[index] = "Processing_files/" + args[index];
        });

        var p = new Processing.loadSketchFromSources('processing_canvas', filenames);
        $("#processing_title").empty();
        $("#processing_title").append(
          name
        );

        $.ajax({
          type: "GET",
          url: "Processing_files/ProgramDescriptions.xml",
          dataType: "xml",
          success: function(xml) {
            $("#processing_description").empty();
            $("#processing_description").append(
                $(xml).find(name).text()
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
            )
          );
        });
      }