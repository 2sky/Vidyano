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

                    if (src.indexOf("/colors.css") > 0 || src.indexOf("vidyano.css") > 0)
                        return false;

                    return true;
                }
            },
            less: {
                src: "src/WebComponents/colors.less",
                dest: "dist/colors.less"
            }
        },
        dtsGenerator: {
            options: {
                name: 'Vidyano',
                baseDir: 'src',
                out: 'dist/vidyano.d.ts'
            },
            default: {
                src: ['src/**/*.ts']
            }
        }
    });

    grunt.registerTask("default", ["dist"]);
    grunt.registerTask("dist", [
        "clean",
        "less",
        "copy:dist",
        "copy:less",
        "dtsGenerator"
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks('dts-generator');
};
