module.exports = function (grunt) {
    let versionReplace = grunt.option("vidyano-version");
    if (grunt.option("vidyano-version-prerelease") === "master") {
        versionReplace += "-<%= meta.revision %>";
        grunt.option("vidyano-version-prerelease", "-<%= meta.revision %>");
    }
    else if (grunt.option("vidyano-version-prerelease"))
        versionReplace += ("-" + grunt.option("vidyano-version-prerelease"));

    grunt.option("vidyano-version-full", versionReplace);

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
                files: [{
                    expand: true,
                    src: ["src/WebComponents/**/*.scss"],
                    ext: ".css"
                }]
            },
        },
        run: {
            dev: {
                options: {
                    cwd: "src/ServiceWorker/FilesGenerator"
                },
                args: [
                    "files-generator.js"
                ]
            },
            dist: {
                options: {
                    cwd: "src/ServiceWorker/FilesGenerator"
                },
                args: [
                    "files-generator.js",
                    "-dist"
                ]
            }
        },
        ts: {
            serviceworker_files_generator: {
                cwd: 'src/ServiceWorker/FilesGenerator/',
                tsconfig: 'src/ServiceWorker/FilesGenerator/tsconfig.json',
                options: {
                    fast: 'never'
                }
            },
            serviceworker: {
                cwd: 'src/ServiceWorker/',
                tsconfig: 'src/ServiceWorker/tsconfig.json',
                options: {
                    fast: 'never'
                }
            },
            vidyano: {
                cwd: 'src/Libs/Vidyano/',
                tsconfig: 'src/Libs/Vidyano/tsconfig.json',
                options: {
                    fast: 'never'
                }
            },
            webcomponents: {
                cwd: 'src/WebComponents/',
                tsconfig: "src/WebComponents/tsconfig.json",
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
                    'src/Libs/Vidyano/**/*.ts',
                    'src/WebComponents/**/*.ts',
                    '!src/Libs/Vidyano/_reference.ts',
                    '!src/Libs/Vidyano/vidyano.d.ts'
                ]
            }
        },
        clean: ["dist/Vidyano.Web2/src/"],
        copy: {
            tslib: {
                cwd: "node_modules/tslib",
                src: "tslib.js",
                dest: "src/Libs/tslib/",
                expand: true
            },
            idb: {
                cwd: "node_modules/idb/lib",
                src: "idb.**",
                dest: "src/Libs/idb/",
                expand: true
            },
            dist: {
                cwd: "src",
                src: "**",
                dest: "dist/Vidyano.Web2/src/",
                expand: true,
                filter: function (src) {
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
                src: ['src/**/*.ts', '!src/Libs/Vidyano/vidyano.d.ts', 'node_modules/typescript/lib/lib.d.ts']
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    src: 'dist/Vidyano.Web2/src/WebComponents/**/*.css'
                }]
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
                    filter: function (src) {
                        if (src.endsWith("bignumber.js") || src.endsWith("lertify.js") || src.endsWith(".min.js"))
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
                replacements: [{ from: '"latest"', to: '"' + grunt.option("vidyano-version-full") + '"' }]
            },
            assemblyVersion: {
                src: ['dist\\Vidyano.Web2\\Properties\\AssemblyInfo.cs'],
                overwrite: true,
                replacements: [
                    { from: "0.0.0", to: grunt.option("vidyano-version") },
                    { from: "-prerelease", to: (grunt.option("vidyano-version-prerelease") ? "-" + grunt.option("vidyano-version-prerelease") : "") }
                ]
            },
            assemblyVersionRevert: {
                src: ['dist\\Vidyano.Web2\\Properties\\AssemblyInfo.cs'],
                overwrite: true,
                replacements: [
                    { from: grunt.option("vidyano-version"), to: "0.0.0" },
                    { from: 'AssemblyInformationalVersion("0.0.0' + (grunt.option("vidyano-version-prerelease") ? "-" + grunt.option("vidyano-version-prerelease") : ""), to: 'AssemblyInformationalVersion("0.0.0-prerelease' }
                ]
            },
            nugetPackageVersion: {
                src: ['dist\\Vidyano.Web2\\Vidyano.Web2.nuspec', 'dist\\Vidyano.Web2\\Vidyano.Web2.Definition.nuspec'],
                overwrite: true,
                replacements: [
                    { from: "$version$", to: grunt.option("vidyano-version-full") }
                ]
            },
            nugetPackageVersionRevert: {
                src: ['dist\\Vidyano.Web2\\Vidyano.Web2.nuspec', 'dist\\Vidyano.Web2\\Vidyano.Web2.Definition.nuspec'],
                overwrite: true,
                replacements: [
                    { from: grunt.option("vidyano-version-full"), to: "$version$" }
                ]
            }
        }
    });

    grunt.registerTask("default", [
        "bower:install",
        "sass",
        "copy:tslib",
        "copy:idb",
        "ts:vidyano",
        "ts:webcomponents",
        "ts:serviceworker_files_generator",
        "run:dev",
        "ts:serviceworker"
    ]);

    grunt.registerTask("nuget", [
        "bower:install",
        "sass",
        "copy:tslib",
        "copy:idb",
        "ts:vidyano",
        "ts:webcomponents",
        "ts:serviceworker_files_generator",
        "run:dist",
        "ts:serviceworker",
        "tslint",
        "clean",
        "copy:dist",
        "revision",
        "replace:vidyanoVersion",
        "replace:assemblyVersion",
        "replace:nugetPackageVersion",
        "uglify",
        "cssmin",
        "dtsGenerator"
    ]);

    grunt.registerTask("cdn", [
        "bower:install",
        "sass",
        "copy:tslib",
        "copy:idb",
        "ts",
        "clean",
        "copy:dist",
        "revision",
        "replace:vidyanoVersion",
        "replace:nugetVersion"
    ]);

    grunt.registerTask("nugetrevert", [
        "revision",
        "replace:assemblyVersionRevert",
        "replace:nugetPackageVersionRevert"
    ]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks("grunt-sass");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-git-revision");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('dts-generator');
};