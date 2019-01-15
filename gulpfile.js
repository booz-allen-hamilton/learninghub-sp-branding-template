// dependencies
const gulp = require('gulp')
const propeller = require('gulp-propeller')
const propellersp = require('propeller-sharepoint')

gulp.task('default', function(){

  // add sharepoint deployer to propeller
  propeller.extend(propellersp)

  //run propeller tasks
  //propeller.run().deploy('o365');
  //propeller.run().deploy('master');
  //propeller.run().deploy('scripts')
  //propeller.run().deploy('stylesheets')
  //propeller.run().deploy('webparts');
  //propeller.run().deploy('images');
  //propeller.run().deploy('fonts');
  propeller.run();
})
