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
        tslint: {
            options: {
                configuration: "tslint.json"
            },
            files: {
                src: [
                    'src/Libs/Vidyano/*.ts',
                    'src/WebComponents/**/*.ts'
                ]
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
                    if (src.indexOf("demo") >= 0 || src.endsWith(".min.css") || src.indexOf("Test") >= 0)
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
                src: ['src/**/*.ts', 'node_modules/typescript/lib/lib.d.ts']
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
                        if (src == "dist\\Vidyano.Web2\\src\\Libs\\bignumber.js" || src.endsWith("lertify.js") || src.endsWith(".min.js"))
                            return false;

                        return true;
                    }
                }]
            }
        },
        revision: {
            options: {
                property: 'meta.revision',
                ref: 'HEAD',
                short: true
            }
        },
        replace: {
            vidyanoVersion: {
                src: ['dist\\Vidyano.Web2\\src\\Libs\\Vidyano\\vidyano.js'],
                overwrite: true,
                replacements: [{from: '"latest"', to: '"' + grunt.option("vidyano-version") + (grunt.option("vidyano-version-prerelease") ? "-" + grunt.option("vidyano-version-prerelease") : "") + '-<%= meta.revision %>"'}]
            },
            nugetVersion: {
                src: ['dist\\Vidyano.Web2\\Properties\\AssemblyInfo.cs'],
                overwrite: true,
                replacements: [
                    {from: "0.0.0", to: grunt.option("vidyano-version")},
                    {from: "-prerelease", to: grunt.option("vidyano-version-prerelease") ? "-" + grunt.option("vidyano-version-prerelease") : ""}
                ]
            },
            nugetVersionRevert: {
                src: ['dist\\Vidyano.Web2\\Properties\\AssemblyInfo.cs'],
                overwrite: true,
                replacements: [
                    {from: grunt.option("vidyano-version"), to: "0.0.0"},
                    {from: 'AssemblyInformationalVersion("0.0.0' + (grunt.option("vidyano-version-prerelease") ? "-" + grunt.option("vidyano-version-prerelease") : ""), to: 'AssemblyInformationalVersion("0.0.0-prerelease'}
                ]
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
        "sass",
        "ts",
        "tslint",
        "clean",
        "copy:dist",
        "revision",
        "replace:vidyanoVersion",
        "replace:nugetVersion",
        "uglify",
        "dtsGenerator"
    ]);

    grunt.registerTask("cdn", [
        "bower:install",
        "sass",
        "ts",
        "clean",
        "copy:dist",
        "revision",
        "replace:vidyanoVersion",
        "replace:nugetVersion"
    ]);

    grunt.registerTask("nugetrevert", [
        "replace:nugetVersionRevert",
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-sass");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-git-revision");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('dts-generator');
};
