/**
 *
 *
 */

(function () {

    'use strict';

    var gulp = require('gulp'),
        livereload = require('gulp-livereload'),
        spawn = require('child_process').spawn,
        del = require('del'),
        jslint = require('gulp-jslint'),
        
        assetsInputDir = '../../css',
        assetsJsInputDir = '../../js',
        assetsBatchFilesDir = './batch_files/',

        paths = {
            scripts: {
                sources: assetsJsInputDir,
                inputDir: assetsJsInputDir + '/modules'
            }
        };

  	gulp.task('jslint', function () {
      return gulp.src([
            paths.scripts.inputDir + '/asyncBlock.js',
            paths.scripts.inputDir + '/analytics/*.js',
            paths.scripts.inputDir + '/checkout/loader.js',
			paths.scripts.inputDir + '/header-nav/*.js',
			paths.scripts.inputDir + '/header-search/common.js',		
			paths.scripts.inputDir + '/header-usernav/common.js',
			paths.scripts.inputDir + '/google-analytics/*.js',
			paths.scripts.inputDir + '/inline-scrollbar/*.js',			
			paths.scripts.inputDir + '/integrated-registration/*.js',
			paths.scripts.inputDir + '/my-account/change-email-address.js',        
            paths.scripts.inputDir + '/my-account/manage-clubcard-details.js',        
            paths.scripts.inputDir + '/my-account/manage-contact-details.js',     
			paths.scripts.inputDir + '/product-offers/*.js',
            paths.scripts.inputDir + '/recently-viewed/touch.js',
			paths.scripts.inputDir + '/settings/*.js',
			paths.scripts.inputDir + '/sticky-header/*.js',
			paths.scripts.inputDir + '/ui-components/*.js'
			])
        
            .pipe(jslint({
                node: true,
				predef: [
                    '$', 'jquery', 'define', 'require', 'window', 'document'
                ]
            }));           
    });
}());