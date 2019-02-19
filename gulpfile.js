// dependencies
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const autoprefixer = require("gulp-autoprefixer");

// paths
const RESOURCES_SCRIPTS_PATH = "resources/js/*.js";
const RESOURCES_STYLES_PATH = "resources/scss/*.scss";

const DEST_SCRIPTS_PATH = "_catalogs/masterpage/bah-ld/js";
const DEST_STYLES_PATH = "_catalogs/masterpage/bah-ld/css";

// scripts task
gulp.task("scripts", () => {
  console.log("Starting scripts task");

  return gulp
    .src(RESOURCES_SCRIPTS_PATH)
    .pipe(
      plumber(function(err) {
        console.log("scripts task error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/preset-env"]
      })
    )
    .pipe(uglify())
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_SCRIPTS_PATH));
});

// styles task
gulp.task("styles", () => {
  console.log("Starting styles task");

  return (
    gulp
      .src(RESOURCES_STYLES_PATH)
      .pipe(
        plumber(function(err) {
          console.log("Styles task error");
          console.log(err);
          this.emit("end");
        })
      )
      .pipe(sourcemaps.init())
      .pipe(autoprefixer())
      .pipe(
        sass({
          outputStyle: "compressed"
        })
      )
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(DEST_STYLES_PATH))
  );
});

gulp.task("default", () => {});
