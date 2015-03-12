/*
 * grunt-gitshow
 * http://gruntjs.com
 *
 * Copyright (c) 2015 Maciek Ruckgaber, contributors
 * Licensed under the MIT license.
 * https://github.com/maciekrb/grunt-gitshow
 *
 * Borrowed code from:
 *   - grunt-contrib-copy 
 *   - grunt-replace (outaTiME)
 */

module.exports = function(grunt){
  'use strict';

  var path = require('path');
  var fs = require('fs');
  var chalk = require('chalk');
  var Applause = require('applause');

  grunt.registerMultiTask('gitshow', 'Add git show output to files', function(){

    var done = this.async();
    var options = this.options({
      repo: './.git',
      format: '%h %an %aD',
      match: 'gitshow_version',
    });


    grunt.util.spawn({
      cmd: 'git',
      args: [
        '--git-dir=' + options.repo, 
        'show', 
        '--pretty="format:'+ options.format + '"']
      }, function(err, ver_info, stderr){
        if(err){
          grunt.log.error("git command failed: " + err);
          ver_info = "N/A";
        }

        var applause_opts = {
          encoding: grunt.file.defaultEncoding,
          mode: false,
          patterns: [{ match: options.match, replacement: ver_info }]
        };

        // create applause instance
        var applause = Applause.create(applause_opts);
        var dest;
        var isExpandedPair;

        this.files.forEach(function (filePair) {
          isExpandedPair = filePair.orig.expand || false;
          filePair.src.forEach(function (src) {
            if (detectDestType(filePair.dest) === 'directory') {
              dest = (isExpandedPair) ? filePair.dest : unixifyPath(path.join(filePair.dest, src));
            } else {
              dest = filePair.dest;
            }
            if (grunt.file.isDir(src)) {
              grunt.file.mkdir(dest);
            } else {
              replace(src, dest, options, applause);
              if (options.mode !== false) {
                fs.chmodSync(dest, (options.mode === true) ? fs.lstatSync(src).mode : options.mode);
              }
            }
          });
        });
        done();
    });

  });

  var detectDestType = function(dest) {
    if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };

  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };

  var replace = function (source, target, options, applause) {
    grunt.file.copy(source, target, {
      encoding: options.encoding,
      process: function (contents) {
        var result = applause.replace(contents, [source, target]);
        // force contents
        if (result === false && options.force === true) {
          result = contents;
        }
        if (result !== false && options.verbose === true) {
          grunt.log.writeln('GitShow ' + chalk.cyan(source) + ' → ' +
            chalk.green(target));
        }
        return result;
      },
      noProcess: options.noProcess || options.processContentExclude
    });
  };
};
