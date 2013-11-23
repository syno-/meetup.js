module.exports = function(grunt) {
    "use strict";

    var buildPath = 'build/';
    var releasePath = 'main/js/';
    var builds = [
        buildPath + 'meetup.boot.js',
        buildPath + 'meetup.main.js',
        buildPath + 'meetup.notify.js',
        buildPath + 'meetup.finish.js',
        //buildPath + 'example.main.js',
    ];
    var debugBuilds = [
        buildPath + 'example.main.js',
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
//            build: {
//                src: buildPath + '<%= pkg.name %>.js',
//                dest: releasePath + '<%= pkg.name %>.min.js'
//            },
            debug: {
                options: {
//                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    beautify: true,
                    compress: false,
                },
                files: {
                    'main/js/meetup.min.js': builds
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', buildPath + '**/*.js']
        },
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: builds,
                dest: releasePath + 'meetup.js',
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
            dist: {
                options: {
                    style: 'expanded',
                },
                files: {
                    './main/css/main.css': buildPath + 'main.scss',
                }
            }
        },
    });
//    grunt.registerTask('ready', 'build ready task.', function(type) {
//        if (type === 'example') {
//        } else if (type === 'release') {
//        }
//    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', [
                       'jshint',
                       'concat',
                       'sass',
    ]);
    grunt.registerTask('release', [
                       'jshint',
                       'concat',
                       'uglify',
                       'sass',
    ]);
};
