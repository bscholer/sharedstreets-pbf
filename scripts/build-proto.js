#!/usr/bin/env node

import path from "path";
import globLib from "glob";
import { pbjs, pbts } from "protobufjs-cli";
import { fileURLToPath } from 'url';

const { glob } = globLib;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

glob.sync(path.join(__dirname, '..', 'sharedstreets-ref-system', 'proto', '*.proto')).forEach(filepath => {
  // Filepaths
  const { name, base } = path.parse(filepath)
  const js = path.join(__dirname, '..', 'proto', name + '.js')
  console.log(js);
  const dts = path.join(__dirname, '..', 'proto', name + '.d.ts')

  // Create ProtobufJS Static Javascript
  pbjs.main(['-t', 'static-module', '-w', 'default', '-o', js, filepath])

  // Create ProtobufJS Typescript Definition
  pbts.main(['-n', '-o', dts, js])
})
