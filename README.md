# Slides CLI

[![Stories in Ready](https://badge.waffle.io/RobinThrift/Slides-CLI.svg?label=ready&title=Ready)](http://waffle.io/RobinThrift/Slides-CLI)
[![Dependency Status](https://david-dm.org/robinthrift/Slides-CLI.svg)](https://david-dm.org/robinthrift/Slides-CLI)
[![devDependency Status](https://david-dm.org/robinthrift/Slides-CLI/dev-status.svg)](https://david-dm.org/robinthrift/Slides-CLI#info=devDependencies)
[![Build Status](https://travis-ci.org/RobinThrift/Slides-CLI.svg)](https://travis-ci.org/RobinThrift/Slides-CLI)

---

Slides (CLI) is an easy way to create HTML slideshows from a markdown document.
Just list your slides in one document and let Slides to the rest. It will split
your slides and convert them to the reveal.js format.
You can also pass an metadata that will be used so style your slide (i. e.  a background image)


## Installation
Install Slides using `npm`:  
`$ npm install -g slides-cli`  
You will then have access to the `slides` command.

## Usage
`slides` expects a `src/` directory with a `slides.md` file in it (this can
be changed, see *Options* below).
Any other files/folders in the `src/` directory (with the exception of `.scss` file) will be coppied to the `build/`
folder when you run the command.

### Command Line Args
- `cwd`: Change the projects root
- `path`: Change the path to the input file (defaults to `slides.md`)

### Format
```markdown
title: My Presenation
author: Me
--
# Slide 1
- some
- bullet
- points

-- {
    background:
        img: 'some/img.jpg'
}
# Slide 2
![alt](path/to/another/img.ext)

-- {
    background:
        img: 'img/logo.png'
        size: '120px'
        position: '10% 5%'
}
# Our Company!
```

The section before the first `--` is presentation metadata, like the title, author or stylesheets you want to include
(see *Theming* below). This metadata is accesible from within the templates.
  
Slides are separated by two dashes `--`. You can pass options along with a slide by wrapping YAML data
within the `{}`s. For the most part these options are passed directly to reveal.js (through HTML).

### Presentation Options
The only options that are used internally are:
- `reveal`: object that will be passed directly to [`Reveal.initialize`](https://github.com/hakimel/reveal.js/#configuration)
- `marked`: this options object will be passed to the [marked](https://github.com/chjj/marked) markdown compiler
- `theme`: controlls the css and templates paths
    - `css`: the path to the scss file you want to render
    - `templates`: path to a `wrap.hbt` and a `slide.hbt` template

### Theming
Your custom style sheet will be processed with SASS, so make sure, it has a `.scss` extension.
Include `@import "base"` at the top of your file to include the reveal.js base CSS.

The default theme is reveal.js's default theme.

Please refer to the reveal.js [docs](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md) for more information
on how to theme the slide shows.

## Roadmap
- custom templates
- use matadata within slides
- built in static file server
- plugin support
- shortcodes (maybe as plugin)
