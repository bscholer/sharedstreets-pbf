// tslint:disable:variable-name
// This lets us use __filename and __dirname, which we have to define ourselves because of ESM

import * as fs from "fs";
import { loadJsonFileSync } from "load-json-file";
import path, { dirname } from "path";
import { downloadTile, Layer } from "sharedstreets-download-tile";
import test from "tape";
import { fileURLToPath } from "url";
import { writeJsonFileSync } from "write-json-file";
import * as sharedstreetsPbf from "./index.js";

const layers: Layer[] = ["geometry", "intersection", "metadata", "reference"];
const tile = [1186, 1466, 12];
const [x, y, z] = tile;
const domain = "tiles.sharedstreets.io/planet-180312";

// tslint:disable-next-line:whitespace
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Download Tile
// Set Environment Variable `export DOWNLOAD=true` to regenerate
if (process.env.DOWNLOAD) {
  layers.forEach((layer) => {
    downloadTile(tile, layer, { domain }).then((data) => {
      const filepath = path.join(__dirname, "test", "in", `${z}-${x}-${y}.${layer}.pbf`);
      fs.writeFileSync(filepath, data);
    });
  });
}

const pbf: any = sharedstreetsPbf;
layers.forEach((layer) => {
  test("sharedstreets-pbf -- " + layer, (t) => {
    const filepath = path.join(__dirname, "test", "in", `${z}-${x}-${y}.${layer}.pbf`);
    const outfile = path.join(__dirname, "test", "out", `${z}-${x}-${y}.${layer}.json`);
    const { name, base } = path.parse(filepath);
    const buffer = fs.readFileSync(filepath);
    const result = pbf[layer](buffer);

    // Save Result
    // Set Environment Variable `export REGEN=true` to regenerate
    if (process.env.REGEN) {
      writeJsonFileSync(outfile, result);
    }
    t.deepEqual(result, loadJsonFileSync(outfile), name);
    t.end();
  });
});
