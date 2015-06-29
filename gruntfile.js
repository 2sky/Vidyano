module.exports = function (grunt) {
    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: "src/Libs/",
                    layout: "byComponent",
                    verbose: true
                }
            }
        },
        less: {
            development: {
                options: {
                    paths: ["importfolder"]
                },
                files: [
					{
					    expand: true,
					    src: ["src/**/*.less"],
					    ext: ".css"
					}
                ]
            },
        },
        watch: {
            less: {
                files: ["src/**/*.less"],
                tasks: ["less"],
                options: {
                    livereload: true
                }
            }
        },
        typescript: {
            base: {
                src: ["src/**/*.ts"],
                dest: "build",
                options: {
                    declaration: true,
                    target: "es5",
                    sourceMap: true
                }
            }
        },
        clean: ["dist"],
        copy: {
            dist: {
                cwd: "src",
                src: "**",
                dest: "dist/",
                expand: true,
                filter: function (src) {
                    if (src.indexOf(".less") > 0 || src.indexOf(".min.css") > 0 || src.indexOf(".ts") > 0 || src.indexOf(".tt") > 0 || src.indexOf(".config") > 0 || src.indexOf("\\bin") > 0)
                        return false;

                    return true;
                }
            }
        }
    });

    grunt.registerTask("default", ["bower:install"]);
    grunt.registerTask("dist", [
        "clean",
        "copy:dist"
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-typescript");
};