// dependencies
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const autoprefixer = require("gulp-autoprefixer");
const zip = require("gulp-zip");
const del = require("del");

// paths
const RESOURCES_SCRIPTS_PATH = "resources/js/*.js";
const RESOURCES_STYLES_PATH = "resources/scss/*.scss";
const DIST_SCRIPTS_PATH = "_catalogs/masterpage/bah-ld/js";
const DIST_STYLES_PATH = "_catalogs/masterpage/bah-ld/css";

const RESOURCES_BUILD_PATH = "_catalogs/masterpage/bah-ld/**";
const DIST_BUILD_PATH = "dist";

// delete:dist task
gulp.task("delete:dist", () => {
  console.log("Starting delete:dist task");
  return del([DIST_BUILD_PATH]);
});

// build:zip task
gulp.task("build:zip", () =>{
  console.log("Starting build:zip task");
  return gulp
    .src(RESOURCES_BUILD_PATH)
    .pipe(
      plumber(function(err) {
        console.log("build task error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(zip("bah-ld.zip"))
    .pipe(gulp.dest(DIST_BUILD_PATH));
})

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
    .pipe(gulp.dest(DIST_SCRIPTS_PATH));
});

// styles task
gulp.task("styles", () => {
  console.log("Starting styles task");

  return gulp
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
    .pipe(gulp.dest(DIST_STYLES_PATH));
});

// watch task
gulp.task("watch", () => {
  console.log("Starting watch task");
  gulp.watch(RESOURCES_SCRIPTS_PATH, gulp.series("scripts"));
  gulp.watch(RESOURCES_STYLES_PATH, gulp.series("styles"));
});

// build task
gulp.task("build", gulp.series("delete:dist", "build:zip"));

// default task
gulp.task(
  "default",
  gulp.series("watch", () => {
    console.log("Starting default task");
  })
);
