# Silent Hill Explorer

Resources for exploring Silent Hill game files.

![The pizza from Silent Hill 2](pizza.png)

## Setup

Right now there are no dependencies other than [Python](https://www.python.org/downloads/)—I'm using 3.11.

In particular, you don't currently have to install any pip packages for this to work.

## Extract 3D Models

I couldn't find a simple way to extract .obj files from Silent Hill's binary .mdl files.

I really wanted to figure it out, so here we are...

Please note that this is only tested for PC .mdl files. I've heard PS2 files have quite a different structure, but I haven't really looked into it.

1. Create a new folder called `input` in the root folder of this repo and copy any .mdl files there. (The .mdl files live in the data directory of the game folder.)

2. Open up a terminal and run something like the following commands.

```sh
cd path/to/this/folder
python src/extract.py input/my_model.mdl
```

If all goes well, an .obj file will appear in `output`, which can be loaded into Blender.