<pre><code>                __                __          __                        
   ____ ___  __/ /___            / /_  ____  / /__________  ____  __  __
  / __ `/ / / / / __ \  ______  / __ \/ __ \/ __/ ___/ __ \/ __ \/ / / /
 / /_/ / /_/ / / /_/ / /_____/ / / / / /_/ / /_/ /__/ /_/ / /_/ / /_/ /
 \__, /\__,_/_/ .___/         /_/ /_/\____/\__/\___/\____/ .___/\__, /  
/____/       /_/                                        /_/    /____/   </code></pre>

Dynamic copy for your Gulp-generated HTML.


[![npm version](https://img.shields.io/npm/v/gulp-hotcopy.svg)](https://www.npmjs.com/package/gulp-hotcopy)
[![npm downloads](https://img.shields.io/npm/dt/gulp-hotcopy.svg)](https://www.npmjs.com/package/gulp-hotcopy)
[![npm](https://img.shields.io/npm/l/gulp-hotcopy.svg)]()
[![Github issues](https://img.shields.io/github/issues-raw/DallasMorningNews/gulp-hotcopy.svg)](https://github.com/DallasMorningNews/gulp-hotcopy/issues/)

* Documentation: [TK / not completed yet](http://gulp-hotcopy.rtfd.org)
* Issues: [https://github.com/DallasMorningNews/gulp-hotcopy/issues/](https://github.com/DallasMorningNews/gulp-hotcopy/issues/)
* Testing: TK
* Coverage: TK

## Features

* Descriptions TK.

## Installation

This library is very specific to projects built with the latest versions of the [generator-dmninteractives](https://github.com/DallasMorningNews/generator-dmninteractives) tool. As such, the instructions may not be particularly clear to external users.

1. Run the following line (or add `gulp-hotcopy` to your project's dependencies/devDependencies):

```bash
npm install gulp-hotcopy
```

2. Add an ArchieML file (with a `.aml` extension) to `./src/assets/hotcopy/`.

3. Add the line `"hotCopyDocument": "true"` to your `meta.json`.

4. Connect the hot copy to your template using the following code:

```nunjucks
{% set hotCopy = hotCopyHelper() %}
{% set copy = hotCopy.connect('my_file') %}
```

**NOTE:** The `my_file` value should have the same name as the .aml file you created earlier. You can connect several .aml files to an individual HTML page — just repeat the second line above, changing both the value passed to `hotCopy.connect()` and the variable this output is assigned to on each successive call.

5. Test the integration by loading a value from the ArchieML file.

A variable called `headline` at the top level of the ArchieML file should now be accessible as `{{ copy.headline }}`.

You can also use the following formatters to render pieces of content in standard DMN styles:

 -  `{% include "hot-copy/_author-formatter.html" %}`: Renders the first `<p>` tag in our byline block, using an `authors` variable at the top level of the ArchieML file. (This formatter expects the `authors` variable to be a list of author objects, each of which must contain `name` and `email` fields.)

 -  `{% for bodyGraph in copy.body %}{% include "hot-copy/_graph-formatter.html" %}{% endfor %}`: Renders each item listed in the top-level `body` variable, according to defined styles. Items in this list without a specific type will be rendered by the `./src/templates/hot-copy/text-graph.html` (plain paragraph) template. Other types will be rendered by their corresponding `.html` file in `./src/templates/embeds/`.

## Credits
