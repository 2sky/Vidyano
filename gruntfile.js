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
        sass: {
            development: {
                options: {
                    paths: ["importfolder"]
                },
                files: [{
                    expand: true,
                    src: ["src/WebComponents/**/*.scss"],
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
        },
        clean: ["dist/Vidyano.Web2/src/"],
        copy: {
            dist: {
                cwd: "src",
                src: "**",
                dest: "dist/Vidyano.Web2/src/",
                expand: true,
                filter: function(src) {
                    if (src.indexOf("demo") >= 0 || src.endsWith(".min.css"))
                        return false;

                    if (src.indexOf(".css") > 0 || src.endsWith(".js") || src.indexOf(".html") > 0)
                        return true;

                    return false;
                }
            }
        },
        dtsGenerator: {
            options: {
                name: 'Vidyano',
                baseDir: 'src',
                out: 'dist/Vidyano.Web2/vidyano.d.ts'
            },
            default: {
                src: ['src/**/*.ts']
            }
        },
        uglify: {
            nuget: {
                options: {
                    mangle: false
                },
                files: [{
                    expand: true,
                    src: 'dist/Vidyano.Web2/src/**/*.js',
                    filter: function(src) {
                        if (src == "dist\\Vidyano.Web2\\src\\Libs\\bignumber.js" || src.endsWith(".min.js"))
                            return false;

                        return true;
                    }
                }]
            }
        }
    });

    grunt.registerTask("default", [
        "bower:install",
        "sass",
        "ts"
    ]);

    grunt.registerTask("nuget", [
        "bower:install",
        "ts",
        "clean",
        "copy:dist",
        "uglify",
        "dtsGenerator"
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-sass");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('dts-generator');
};
