module.exports = function(grunt) {
    "use strict";

    var buildPath = 'build/';
    var builds = [
        buildPath + 'meetup.boot.js',
        buildPath + 'meetup.main.js',
        buildPath + 'meetup.notify.js',
        buildPath + 'meetup.finish.js',
        //buildPath + 'example.main.js',
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
//            build: {
//                src: buildPath + '<%= pkg.name %>.js',
//                dest: 'main/js/<%= pkg.name %>.min.js'
//            },
            debug: {
                options: {
//                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    beautify: true,
                    compress: false,
                },
                files: {
                    'main/js/meetup.min.js': builds,
                }
            },
            release: {
                options: {
                    beautify: false,
                    compress: true,
                },
                files: {
                    'release/js/meetup.min.js': builds,
                }
            },
        },
        jshint: {
            all: ['Gruntfile.js', buildPath + '**/*.js']
        },
        concat: {
            options: {
                separator: ';',
            },
            debug: {
                src: builds,
                dest: 'main/js/meetup.js',
            },
            release: {
                src: builds,
                dest: 'release/js/meetup.js',
            },
        },
        watch: {
            scripts: {
                files: [
                    'Gruntfile.js',
                    buildPath + '**/*.js',
                    buildPath + '**/*.scss',
                ],
                tasks: ['default'],
                options: {
                    interrupt: true,
                },
            },
        },
        sass: {
            debug: {
                options: {
                    style: 'expanded',
                },
                files: {
                    './main/css/main.css': buildPath + 'main.scss',
                }
            }
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', [
                       'jshint',
                       'concat:debug',
                       'sass:debug',
    ]);
    grunt.registerTask('release', [
                       'jshint',
                       'concat:release',
                       'uglify:release',
                       'sass:debug',
    ]);
};
