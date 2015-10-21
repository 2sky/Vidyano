module.exports = function(grunt) {
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
                files: [{
                    expand: true,
                    src: ["src/WebComponents/**/*.less"],
                    ext: ".css"
                }]
            },
        },
        ts: {
            default: {
                tsconfig: true,
                options: {
                    fast: 'never'
                }
            }
        }
    });

    grunt.registerTask("default", [
        "less",
        "ts"
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-ts");
};
