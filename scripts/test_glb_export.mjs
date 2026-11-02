import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

if (typeof global.FileReader === 'undefined') {
  global.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onloadend = null;
      this.onerror = null;
    }
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }).catch((err) => {
        if (this.onerror) this.onerror(err);
      });
    }
  };
}

const scene = new THREE.Scene();
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x01a0e8 })
);
scene.add(box);

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (gltf) => {
    const buffer = Buffer.from(gltf);
    const outDir = path.resolve('public/models');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'test.glb');
    fs.writeFileSync(outPath, buffer);
    console.log('Successfully exported test.glb, size:', buffer.length, 'bytes');
  },
  (err) => {
    console.error('Export error:', err);
  },
  { binary: true }
);
