# Silent Hill Museum

<img width="32%" src="https://github.com/user-attachments/assets/8eae0696-03be-4c2a-a912-13abfef1b361" alt="Cinderella"><img width="32%" src="https://github.com/user-attachments/assets/024f275e-5959-4ee9-9013-dec123603b1b" alt="Little Mermaid"><img width="32%" src="https://github.com/user-attachments/assets/c0425db8-340b-4638-968b-ce0f5ac6bef6" alt="Snow White">
<img width="32%" src="https://github.com/user-attachments/assets/22017dab-1242-44de-88b1-a61a5d1ac782" alt="Clock"><img width="32%" src="https://github.com/user-attachments/assets/0392b976-c0de-43d9-aab7-250166e0e1f2" alt="Piano"><img width="32%" src="https://github.com/user-attachments/assets/b688c619-10bc-4360-a307-e322ea2b8951" alt="Music Box">

![Build status](https://img.shields.io/github/actions/workflow/status/laura-a-n-n/silent-hill-museum/build.yml?&style=for-the-badge&color=blue) ![Test status](https://img.shields.io/github/actions/workflow/status/laura-a-n-n/silent-hill-museum/test.yml?label=tests&style=for-the-badge&color=blue) ![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Flaura-a-n-n%2Fsilent-hill-museum%2Fmain%2Fpackage.json&query=%24.version&style=for-the-badge&label=version&color=red) ![License](https://img.shields.io/github/license/laura-a-n-n/silent-hill-museum?style=for-the-badge&color=purple)

![kaitai](https://github.com/user-attachments/assets/6fef4124-0914-4c3e-9f1c-98931dc740da) ![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=Three.js) ![TypeScript](https://img.shields.io/badge/TypeScript-black?style=for-the-badge&logo=typescript) ![JavaScript](https://img.shields.io/badge/JavaScript-black?style=for-the-badge&logo=javascript) ![Python](https://img.shields.io/badge/Python-black?style=for-the-badge&logo=python)

**Live Website**: [silenthillmuseum.org](https://silenthillmuseum.org/)

The [_Silent Hill Museum_](https://silenthillmuseum.org/) is a digital archive of Silent Hill assets.

The museum reads the original binary files directly in your browser and delivers them to you in an interactive exhibit.

## How does it work?

The binary format is documented in [Kaitai Struct](https://kaitai.io/), a powerful declarative binary parsing language. This serves as both a human-readable outline and also a rigorous specification that can be compiled to a parser in many different languages. See the ksy file for the [Silent Hill 2 mdl format](https://github.com/laura-a-n-n/silent-hill-museum/blob/main/ksy/mdl.ksy).

In particular, the ksy files are compiled to a JavaScript parser, which allows the JavaScript Kaitai Struct runtime to facilitate the parsing of assets in their original form. Additionally, we emit TypeScript .d.ts type definitions from the Kaitai source, allowing this project to be written in TypeScript. The beauty of this is that it enables an IDE to know the structure of the binary files.

Once everything is parsed, we use [Three.js](https://threejs.org/) to draw assets to the screen.

## Installation

To get started locally, you'll need a working installation of [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). To view assets, you also need to have Silent Hill 2 Restless Dreams (PC) fully extracted.

1. Clone the repository and enter the folder.

```sh
git clone https://github.com/laura-a-n-n/silent-hill-museum.git
cd silent-hill-museum
```

2. In `public`, make a new folder called `mdl` and copy `data/chr` and `data/chr2` from Silent Hill 2 into it.

3. Install the dependencies.

```sh
npm install
```

4. Run the setup script.

```sh
npm run setup
```

5. Start the development server.

```sh
npm run dev
```

This should be enough to get started. See the [package.json](https://github.com/laura-a-n-n/silent-hill-museum/blob/main/package.json) for more scripts.

### Advanced setup

If you'd like to edit the Kaitai Struct (ksy) files, you need a copy of the Kaitai Struct compiler.

In order to emit TypeScript .d.ts files from the ksy source, this repository relies on a [fork](https://github.com/kaitai-io/kaitai_struct_compiler/pull/233) of the Kaitai Struct compiler that has not been merged to main. Huge thanks to [aquach](https://github.com/aquach) for making this project possible.

1. Install the [Kaitai Struct compiler](https://kaitai.io/#download). It should be globally available as the `kaitai-struct-compiler` command.

To make sure this step worked, try `npm run ksy-all` in the root directory of this folder.

2. Clone [this fork](https://github.com/laura-a-n-n/kaitai_struct_compiler) of aquach's TypeScript compiler for Kaitai Struct, as a sub-directory of this repository. It is the same feature, I just merged it with latest.

3. Follow [these instructions](https://doc.kaitai.io/serialization.html#_building_the_compiler_from_source) for building Kaitai Struct from source in the newly cloned folder, except checkout `feature/typescript`, not the `serialization` branch.

To test that everything worked, try `npm run ksy-museum` in the root folder of this repository.

Now whenever changes are made to the ksy file, run `npm run ksy-museum` before committing.
