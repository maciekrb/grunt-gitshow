# grunt-gitshow
> Replaces `git show --pretty` info in defined placeholders

## Install
From NPM:
```shell
npm install grunt-gitshow --save-dev
```

## GitShow Task

Once installed, you can configure the `gitshow` task as follows:

```javascript
module.exports = function(grunt){
  grunt.loadNpmTasks('grunt-gitshow');
  grunt.initConfig({
    gitshow: {
      backend: {
        options: {
          repo: '../some/path/to/.git',  // your git repo (./ by default)
          format: "%h %an %aD", // --pretty format opts see below
          match: 'my_version' //replace @@my_version by the output of git show --pretty="%h %an %aD"
        },
        files: [
          { 
            expand: true, 
            flatten: true, 
            src: ['<%= yeoman.app %>/index.html'], 
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    }
  });
  grunt.registerTask('default', 'gitshow');
};
```

### Options

#### Repo
Type: `String`

Path of the actual git repository

#### Format
Type: `String` 

Arguments to `git show --pretty` see [git show documentation](http://git-scm.com/docs/git-show). 
Most commonly used options are:

  - `%H`: commit hash
  - `%h`: abbreviated commit hash
  - `%T`: tree hash
  - `%t`: abbreviated tree hash
  - `%P`: parent hashes
  - `%p`: abbreviated parent hashes
  - `%an`: author name
  - `%aN`: author name (respecting .mailmap, see git-shortlog[1] or git-blame[1])
  - `%ae`: author email
  - `%aE`: author email (respecting .mailmap, see git-shortlog[1] or git-blame[1])
  - `%ad`: author date 
  - `%aD`: author date, RFC2822 style
  - `%ar`: author date, relative
  - `%at`: author date, UNIX timestamp
  - `%ai`: author date, ISO 8601-like format
  - `%aI`: author date, strict ISO 8601 format
  - `%cn`: committer name
  - `%cN`: committer name (respecting .mailmap, see git-shortlog[1] or git-blame[1])
  - `%ce`: committer email
  - `%cE`: committer email (respecting .mailmap, see git-shortlog[1] or git-blame[1])
  - `%cd`: committer date 
  - `%cD`: committer date, RFC2822 style
  - `%cr`: committer date, relative
  - `%ct`: committer date, UNIX timestamp
  - `%ci`: committer date, ISO 8601-like format
  - `%cI`: committer date, strict ISO 8601 format
  - `%d`: ref names, like the `--decorate` option of git-log[1]
  - `%D`: ref names without the " (", ")" wrapping.
  - `%e`: encoding
  - `%s`: subject
  - `%f`: sanitized subject line, suitable for a filename
  - `%b`: body
  - `%B`: raw body (unwrapped subject and body)
  - `%N`: commit notes

#### Match
Type: `String|RegExp`
Indicates the matching expression.

If matching type is `String` we use a simple variable lookup mechanism `@@string` (in any other case we use the default regexp replace logic). See [Applause doc](https://github.com/outaTiME/applause) for details, as replacement is done via *Applause* lib.

```javascript
    // using strings
    options: {
      repo: '../some/path/to/.git',  // your git repo (./ by default)
      format: "%h %an %aD", // --pretty format opts see below
      match: 'my_version' //replace @@my_version by the output of git show --pretty="%h %an %aD"
    }

    // using regexp
    options: {
      repo: '../some/path/to/.git',  // your git repo (./ by default)
      format: "%h %an %aD", // --pretty format opts see below
      match: /foo/g //replace all `foo` by the output of git show --pretty="%h %an %aD"
    }
```

## Release History

 * 2015-03-12    v0.0.2    `--quiet` option added to silence diff.
 * 2015-03-12    v0.0.1    First Released.
