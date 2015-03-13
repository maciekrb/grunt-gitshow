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
      processContent: false,
      processContentExclude: []
    });

    // Ugly hack to get the latest tag
    var gitargs = ['--git-dir=' + options.repo];
    if(options.format == "%v"){
      gitargs = gitargs.concat(['describe', '--tags']);
    } else {
      gitargs = gitargs.concat(['show', '--quiet', '--pretty='+ options.format]);
    }
    grunt.log.writeln(JSON.stringify(gitargs));

    options.repo = path.resolve(options.repo);
    var self = this;
    grunt.util.spawn({
      cmd: 'git',
      args: gitargs}, 
      function(err, ver_info, stderr){
        if(err){
          grunt.log.error("git command failed: " + err);
          ver_info = "N/A";
        }

        var applause_opts = {
          encoding: grunt.file.defaultEncoding,
          mode: false,
          patterns: [{ match: options.match, replacement: ver_info.stdout }],
          process: options.process || options.processContent,
          noProcess: options.noProcess || options.processContentExclude
        };

        // create applause instance
        var applause = Applause.create(applause_opts);
        var isExpandedPair;
        var tally = {
          files: 0
        };

        self.files.forEach(function (filePair) {
          var dest = filePair.dest;
          isExpandedPair = filePair.orig.expand || false;

          filePair.src.forEach(function (src) {
            src = unixifyPath(src);
            dest = unixifyPath(dest);

            if (detectDestType(filePair.dest) === 'directory') {
              dest = (isExpandedPair) ? dest : path.join(filePair.dest, src);
            } 

            if (grunt.file.isDir(src)) {
              grunt.file.mkdir(dest);
            } else {
              replace(src, dest, applause_opts, applause);
              if (applause_opts.mode !== false) {
                var m = (applause_opts.mode === true) ? fs.lstatSync(src).mode : applause_opts.mode;
                fs.chmodSync(dest, m);
              }
              tally.files++;
            }
          });
        });
        grunt.log.writeln('Replaced git info in ' + chalk.cyan(tally.files) + ' files');
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
