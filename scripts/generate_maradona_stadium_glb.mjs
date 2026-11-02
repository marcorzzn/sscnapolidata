import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Polyfill FileReader for Node.js GLTFExporter binary export
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

console.log('Generating Photorealistic Web-Optimized 3D Model: Stadio Diego Armando Maradona...');

const stadiumRoot = new THREE.Group();
stadiumRoot.name = 'Stadio_Diego_Armando_Maradona';

// =========================================================================
// PBR MATERIALS DEFINITION
// =========================================================================
const plazaAsphaltMat = new THREE.MeshStandardMaterial({
  color: 0x1A1E24,
  roughness: 0.88,
  metalness: 0.1,
  name: 'Plaza_Asphalt',
});

const travertineConcreteMat = new THREE.MeshStandardMaterial({
  color: 0xD4D8E0, // Characteristic Roman/Neapolitan light travertine concrete
  roughness: 0.75,
  metalness: 0.12,
  name: 'Travertine_Concrete_Facade',
});

const darkConcreteMullionMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.65,
  metalness: 0.35,
  name: 'Facade_Dark_Mullions',
});

const napoliCyanMat = new THREE.MeshStandardMaterial({
  color: 0x01A0E8, // Official SSC Napoli Azzurro
  roughness: 0.42,
  metalness: 0.28,
  name: 'Napoli_Azzurro',
});

const royalBlueSeatMat = new THREE.MeshStandardMaterial({
  color: 0x004A77, // Darker blue mosaic seats
  roughness: 0.48,
  metalness: 0.22,
  name: 'Royal_Blue_Seats',
});

const whiteSeatMat = new THREE.MeshStandardMaterial({
  color: 0xF8FAFC, // White mosaic seats & pitch lines
  roughness: 0.45,
  metalness: 0.1,
  name: 'White_Mosaic_Seats',
});

const slateSeatMat = new THREE.MeshStandardMaterial({
  color: 0x94A3B8, // Light slate seats
  roughness: 0.55,
  metalness: 0.15,
  name: 'Slate_Seats',
});

const skyboxGlassMat = new THREE.MeshStandardMaterial({
  color: 0x0F172A, // Fumé tinted luxury glass
  roughness: 0.08,
  metalness: 0.92,
  name: 'Skybox_Reflective_Glass',
});

const italia90RedSteelMat = new THREE.MeshStandardMaterial({
  color: 0xB8292F, // Famous red space-frame steel truss of Italia '90
  roughness: 0.36,
  metalness: 0.74,
  name: 'Truss_Red_Steel',
});

const solarPanelPhotovoltaicMat = new THREE.MeshStandardMaterial({
  color: 0x0A111E, // Modern dark monocrystalline solar panel
  roughness: 0.15,
  metalness: 0.85,
  name: 'Photovoltaic_Solar_Panels',
});

const roofCanopyMat = new THREE.MeshStandardMaterial({
  color: 0xE2E8F0,
  roughness: 0.3,
  metalness: 0.2,
  transparent: true,
  opacity: 0.86,
  side: THREE.DoubleSide,
  name: 'Polycarbonate_Canopy',
});

const pitchGrassDarkMat = new THREE.MeshStandardMaterial({
  color: 0x15803D,
  roughness: 0.85,
  metalness: 0.05,
  name: 'Pitch_Grass_Dark',
});

const pitchGrassLightMat = new THREE.MeshStandardMaterial({
  color: 0x16A34A,
  roughness: 0.85,
  metalness: 0.05,
  name: 'Pitch_Grass_Light',
});

const floodlightGlowMat = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  emissive: 0xFEF08A,
  emissiveIntensity: 1.8,
  roughness: 0.15,
  metalness: 0.6,
  name: 'Floodlight_Lamps',
});

// Helper for oval coordinates (Fuorigrotta stadium bowl aspect: x=1.0, z=1.28)
function getOvalPos(theta, r, xFactor = 1.0, zFactor = 1.28) {
  return new THREE.Vector3(
    Math.cos(theta) * r * xFactor,
    0,
    Math.sin(theta) * r * zFactor
  );
}

// -------------------------------------------------------------
// 1. PIAZZALE TECCHIO URBAN PLAZA BASE
// -------------------------------------------------------------
const plazaGeo = new THREE.CylinderGeometry(21.0, 21.6, 0.4, 64);
const plazaMesh = new THREE.Mesh(plazaGeo, plazaAsphaltMat);
plazaMesh.name = 'Piazzale_Tecchio_Plaza';
plazaMesh.position.y = 0.2;
stadiumRoot.add(plazaMesh);

// Outer concrete curb ring
const curbGeo = new THREE.TorusGeometry(20.8, 0.14, 8, 64);
const curbMesh = new THREE.Mesh(curbGeo, darkConcreteMullionMat);
curbMesh.rotation.x = Math.PI / 2;
curbMesh.position.y = 0.42;
stadiumRoot.add(curbMesh);

// Security turnstiles / entrance gates at base perimeter
const turnstileGeo = new THREE.BoxGeometry(0.3, 0.5, 0.8);
const turnstilesGroup = new THREE.Group();
turnstilesGroup.name = 'Entrance_Turnstiles_Varchi';
for (let i = 0; i < 16; i++) {
  const angle = (i / 16) * Math.PI * 2;
  const pos = getOvalPos(angle, 17.5);
  const ts = new THREE.Mesh(turnstileGeo, darkConcreteMullionMat);
  ts.position.set(pos.x, 0.65, pos.z);
  ts.rotation.y = -angle;
  turnstilesGroup.add(ts);
}
stadiumRoot.add(turnstilesGroup);

// -------------------------------------------------------------
// 2. FOOTBALL PITCH (105m x 68m, Restyling all'Inglese)
// -------------------------------------------------------------
const pitchGroup = new THREE.Group();
pitchGroup.name = 'Football_Pitch_Field';

// Grass base
const pitchGeo = new THREE.BoxGeometry(7.2, 0.1, 10.8);
const pitchBase = new THREE.Mesh(pitchGeo, pitchGrassDarkMat);
pitchBase.position.y = 0.45;
pitchGroup.add(pitchBase);

// Alternating 12 lawnmower stripes
const stripeWidth = 10.8 / 12;
for (let i = 0; i < 12; i++) {
  if (i % 2 === 1) {
    const sGeo = new THREE.BoxGeometry(7.18, 0.005, stripeWidth);
    const sMesh = new THREE.Mesh(sGeo, pitchGrassLightMat);
    sMesh.position.set(0, 0.505, -5.4 + stripeWidth * (i + 0.5));
    pitchGroup.add(sMesh);
  }
}

// Pitch Lines Group
const linesGroup = new THREE.Group();
linesGroup.position.y = 0.51;

const lineThick = 0.05;
const pW = 6.4;
const pL = 10.0;

function createLine(w, l, x, z) {
  const geo = new THREE.PlaneGeometry(w, l);
  const mesh = new THREE.Mesh(geo, whiteSeatMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0, z);
  return mesh;
}

// Perimeter touchlines & goal lines
linesGroup.add(createLine(pW, lineThick, 0, -pL / 2)); // North goal line
linesGroup.add(createLine(pW, lineThick, 0, pL / 2));  // South goal line
linesGroup.add(createLine(lineThick, pL, -pW / 2, 0)); // West touchline
linesGroup.add(createLine(lineThick, pL, pW / 2, 0));  // East touchline
linesGroup.add(createLine(pW, lineThick, 0, 0));       // Halfway line

// Center circle
const circleGeo = new THREE.RingGeometry(1.2, 1.25, 48);
const circleMesh = new THREE.Mesh(circleGeo, whiteSeatMat);
circleMesh.rotation.x = -Math.PI / 2;
linesGroup.add(circleMesh);

// Center spot
const spotGeo = new THREE.CircleGeometry(0.08, 16);
const spotMesh = new THREE.Mesh(spotGeo, whiteSeatMat);
spotMesh.rotation.x = -Math.PI / 2;
linesGroup.add(spotMesh);

// Penalty boxes
const boxW = 3.6;
const boxL = 1.5;
linesGroup.add(createLine(boxW, lineThick, 0, -pL / 2 + boxL));
linesGroup.add(createLine(lineThick, boxL, -boxW / 2, -pL / 2 + boxL / 2));
linesGroup.add(createLine(lineThick, boxL, boxW / 2, -pL / 2 + boxL / 2));

linesGroup.add(createLine(boxW, lineThick, 0, pL / 2 - boxL));
linesGroup.add(createLine(lineThick, boxL, -boxW / 2, pL / 2 - boxL / 2));
linesGroup.add(createLine(lineThick, boxL, boxW / 2, pL / 2 - boxL / 2));

// Six-yard boxes
const sixW = 1.8;
const sixL = 0.55;
linesGroup.add(createLine(sixW, lineThick, 0, -pL / 2 + sixL));
linesGroup.add(createLine(lineThick, sixL, -sixW / 2, -pL / 2 + sixL / 2));
linesGroup.add(createLine(lineThick, sixL, sixW / 2, -pL / 2 + sixL / 2));

linesGroup.add(createLine(sixW, lineThick, 0, pL / 2 - sixL));
linesGroup.add(createLine(lineThick, sixL, -sixW / 2, pL / 2 - sixL / 2));
linesGroup.add(createLine(lineThick, sixL, sixW / 2, pL / 2 - sixL / 2));

pitchGroup.add(linesGroup);

// Regulation 3D Goalposts (Porte con rete)
function createGoal(zPos, rotY) {
  const goal = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.5 });
  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.75, 12);
  
  const p1 = new THREE.Mesh(postGeo, postMat);
  p1.position.set(-0.75, 0.75 / 2, 0);
  const p2 = new THREE.Mesh(postGeo, postMat);
  p2.position.set(0.75, 0.75 / 2, 0);
  
  const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.58, 12);
  const bar = new THREE.Mesh(barGeo, postMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.75, 0);

  const netMat = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    transparent: true,
    opacity: 0.65,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const netGeo = new THREE.BoxGeometry(1.5, 0.72, 0.5);
  const net = new THREE.Mesh(netGeo, netMat);
  net.position.set(0, 0.36, -0.25);

  goal.add(p1, p2, bar, net);
  goal.position.set(0, 0.5, zPos);
  goal.rotation.y = rotY;
  return goal;
}

pitchGroup.add(createGoal(-pL / 2, 0));
pitchGroup.add(createGoal(pL / 2, Math.PI));

// Dual Team Dugouts (Panchine incassate stile all'inglese)
function createDugout(zPos) {
  const dugout = new THREE.Group();
  const shellGeo = new THREE.BoxGeometry(1.5, 0.45, 0.45);
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x01A0E8, roughness: 0.3, metalness: 0.6 });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  dugout.add(shell);

  // Bench seats row
  const seatRowGeo = new THREE.BoxGeometry(1.35, 0.15, 0.2);
  const seatRowMat = new THREE.MeshStandardMaterial({ color: 0x004A77, roughness: 0.4 });
  const seats = new THREE.Mesh(seatRowGeo, seatRowMat);
  seats.position.set(0, -0.05, 0.05);
  dugout.add(seats);

  dugout.position.set(-3.7, 0.65, zPos);
  return dugout;
}

pitchGroup.add(createDugout(-1.0));
pitchGroup.add(createDugout(1.0));

// Perimeter LED Boards (Cartelloni pubblicitari continui)
const ledBoardMat = new THREE.MeshStandardMaterial({
  color: 0x01A0E8,
  emissive: 0x004A77,
  emissiveIntensity: 0.7,
  roughness: 0.3,
});
const ledXGeo = new THREE.BoxGeometry(0.1, 0.25, pL + 0.6);
const ledEast = new THREE.Mesh(ledXGeo, ledBoardMat);
ledEast.position.set(pW / 2 + 0.38, 0.62, 0);
const ledWest = new THREE.Mesh(ledXGeo, ledBoardMat);
ledWest.position.set(-pW / 2 - 0.38, 0.62, 0);

const ledZGeo = new THREE.BoxGeometry(pW + 0.8, 0.25, 0.1);
const ledNorth = new THREE.Mesh(ledZGeo, ledBoardMat);
ledNorth.position.set(0, 0.62, -pL / 2 - 0.4);
const ledSouth = new THREE.Mesh(ledZGeo, ledBoardMat);
ledSouth.position.set(0, 0.62, pL / 2 + 0.4);

pitchGroup.add(ledEast, ledWest, ledNorth, ledSouth);

// Optional Legacy Athletics Track Sub-mesh (can be toggled in viewer)
const trackGeo = new THREE.CylinderGeometry(7.8, 7.8, 0.08, 64);
const trackMat = new THREE.MeshStandardMaterial({
  color: 0x0066AA, // Universiadi 2019 Azzurro Track
  roughness: 0.6,
  metalness: 0.1,
  name: 'Athletics_Track_Legacy_Mat',
});
const trackMesh = new THREE.Mesh(trackGeo, trackMat);
trackMesh.name = 'Athletics_Track_Legacy';
trackMesh.position.y = 0.49;
trackMesh.scale.set(1.0, 1.0, 1.28);
trackMesh.visible = false; // Restyling all'inglese by default as requested!
pitchGroup.add(trackMesh);

stadiumRoot.add(pitchGroup);

// -------------------------------------------------------------
// 3. MULTI-TIER STANDS & SECTOR RINGS (Curve, Distinti, Posillipo)
// -------------------------------------------------------------
const standsGroup = new THREE.Group();
standsGroup.name = 'Interior_Stands_Rings';

const numSegments = 64;

function createEllipticalTier(rInner, rOuter, yBottom, yTop, mat, name) {
  const geo = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * Math.PI * 2;
    const pIn = getOvalPos(theta, rInner);
    vertices.push(pIn.x, yBottom, pIn.z);
    uvs.push(i / numSegments, 0);

    const pOut = getOvalPos(theta, rOuter);
    vertices.push(pOut.x, yTop, pOut.z);
    uvs.push(i / numSegments, 1);
  }

  for (let i = 0; i < numSegments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, d);
    indices.push(a, d, c);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  return mesh;
}

function createEllipticalWall(r, yBottom, yTop, mat, name) {
  const geo = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * Math.PI * 2;
    const p = getOvalPos(theta, r);
    vertices.push(p.x, yBottom, p.z);
    uvs.push(i / numSegments, 0);
    vertices.push(p.x, yTop, p.z);
    uvs.push(i / numSegments, 1);
  }

  for (let i = 0; i < numSegments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, d);
    indices.push(a, d, c);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  return mesh;
}

// 3.1 Primo Anello (Lower Tier): Restyling slope close to field
// Lower rows in Napoli Azzurro
const lowerTier1 = createEllipticalTier(5.6, 7.3, 0.55, 1.35, napoliCyanMat, 'Primo_Anello_Rows_Azzurro');
// Upper rows of Primo Anello in White & Royal Blue
const lowerTier2 = createEllipticalTier(7.3, 9.0, 1.35, 2.1, royalBlueSeatMat, 'Primo_Anello_Rows_RoyalBlue');
standsGroup.add(lowerTier1, lowerTier2);

// 3.2 Executive Skyboxes & Hospitality Suites Belt
// Glazed luxury ribbon between Ring 1 and Ring 2
const skyboxWall = createEllipticalWall(9.05, 2.1, 2.75, skyboxGlassMat, 'Executive_Skyboxes_Belt');
standsGroup.add(skyboxWall);

// Horizontal promenade & VIP terrace ledge
const skyboxLedge = createEllipticalTier(8.95, 9.35, 2.75, 2.75, darkConcreteMullionMat, 'Skybox_Promenade_Ledge');
standsGroup.add(skyboxLedge);

// 3.3 Secondo Anello (Upper Tier - Gran Gradinata)
// Divided into 3 stepped color bands to authentically reproduce the 2019 mosaic seating!
const upperTierAzzurro = createEllipticalTier(9.35, 11.2, 2.75, 3.75, napoliCyanMat, 'Secondo_Anello_Band_Azzurro');
const upperTierWhite = createEllipticalTier(11.2, 13.0, 3.75, 4.65, whiteSeatMat, 'Secondo_Anello_Band_White');
const upperTierRoyal = createEllipticalTier(13.0, 14.8, 4.65, 5.4, royalBlueSeatMat, 'Secondo_Anello_Band_RoyalBlue');
standsGroup.add(upperTierAzzurro, upperTierWhite, upperTierRoyal);

// 3.4 Terzo Anello Safety Rail & Concrete Parapet
const thirdTierRail = createEllipticalWall(14.85, 5.4, 5.85, darkConcreteMullionMat, 'Terzo_Anello_Balcony_Rail');
standsGroup.add(thirdTierRail);

// 3.5 Concrete Vomitories & Stairways (16 radial aisles cutting through tiers)
const vomitoryGroup = new THREE.Group();
vomitoryGroup.name = 'Vomitories_Aisles_Access';
for (let i = 0; i < 16; i++) {
  const theta = (i / 16) * Math.PI * 2;
  const pAisle = getOvalPos(theta, 11.8);
  const aisleGeo = new THREE.BoxGeometry(0.35, 0.05, 5.6);
  const aisleMesh = new THREE.Mesh(aisleGeo, travertineConcreteMat);
  aisleMesh.position.set(pAisle.x, 4.1, pAisle.z);
  aisleMesh.rotation.y = -theta;
  vomitoryGroup.add(aisleMesh);
}
standsGroup.add(vomitoryGroup);

stadiumRoot.add(standsGroup);

// -------------------------------------------------------------
// 4. EXTERIOR "CATINO" FACADE (Stadio del Sole - Carlo Cocchia 1959)
// Inverted funnel shape: narrower at ground, expanding outward at top
// -------------------------------------------------------------
const exteriorFacadeGroup = new THREE.Group();
exteriorFacadeGroup.name = 'Exterior_Catino_Facade_Stadio_del_Sole';

// Outer Inverted-Funnel Concrete Shell Wall: Base r=13.6, Top r=15.2, Height 0.4 to 5.4
const outerShell = createEllipticalWall(14.9, 0.4, 5.4, travertineConcreteMat, 'Exterior_Inverted_Funnel_Wall');
exteriorFacadeGroup.add(outerShell);

// 56 Radial Tapered Structural Pylons (Costoloni in Cemento Armato)
const pylonGeo = new THREE.BoxGeometry(0.38, 5.2, 0.75);
const numPylons = 56;
const pylonGroup = new THREE.Group();
pylonGroup.name = 'Radial_Structural_Pylons_Costoloni';

for (let i = 0; i < numPylons; i++) {
  const theta = (i / numPylons) * Math.PI * 2;
  const pBottom = getOvalPos(theta, 13.6);
  const pTop = getOvalPos(theta, 15.1);

  const pylon = new THREE.Mesh(pylonGeo, travertineConcreteMat);
  pylon.position.set(
    (pBottom.x + pTop.x) / 2,
    2.9,
    (pBottom.z + pTop.z) / 2
  );
  pylon.rotation.y = -theta + Math.PI / 2;
  pylon.rotation.z = Math.atan2(pTop.x - pBottom.x, 5.2) * 0.4;
  pylonGroup.add(pylon);
}
exteriorFacadeGroup.add(pylonGroup);

// Exterior Horizontal Walkway Balconies (Gallerie di Distribuzione & Frangisole)
const gallery1 = createEllipticalTier(13.8, 14.5, 2.2, 2.2, darkConcreteMullionMat, 'Exterior_Gallery_Ring_1');
const gallery2 = createEllipticalTier(14.5, 15.1, 3.8, 3.8, darkConcreteMullionMat, 'Exterior_Gallery_Ring_2');
exteriorFacadeGroup.add(gallery1, gallery2);

// 4 Monumental Spiral Access Ramps (Rampe Elicoidali Esterne)
function createSpiralRamp(centerX, centerZ, name) {
  const rampGroup = new THREE.Group();
  rampGroup.name = name;

  // Central core cylinder
  const coreGeo = new THREE.CylinderGeometry(0.55, 0.55, 5.2, 24);
  const coreMesh = new THREE.Mesh(coreGeo, travertineConcreteMat);
  coreMesh.position.y = 2.6;
  rampGroup.add(coreMesh);

  // Winding spiral walkway using helix steps
  const numSteps = 42;
  const stepGeo = new THREE.BoxGeometry(0.9, 0.12, 0.42);
  for (let s = 0; s < numSteps; s++) {
    const fraction = s / numSteps;
    const angle = fraction * Math.PI * 4.5;
    const r = 1.1;
    const step = new THREE.Mesh(stepGeo, travertineConcreteMat);
    step.position.set(
      Math.cos(angle) * r,
      0.4 + fraction * 4.6,
      Math.sin(angle) * r
    );
    step.rotation.y = -angle;
    rampGroup.add(step);
  }

  rampGroup.position.set(centerX, 0, centerZ);
  return rampGroup;
}

exteriorFacadeGroup.add(createSpiralRamp(-12.8, -10.5, 'Spiral_Ramp_Curva_B_West'));
exteriorFacadeGroup.add(createSpiralRamp(12.8, -10.5, 'Spiral_Ramp_Curva_B_East'));
exteriorFacadeGroup.add(createSpiralRamp(-12.8, 10.5, 'Spiral_Ramp_Curva_A_West'));
exteriorFacadeGroup.add(createSpiralRamp(12.8, 10.5, 'Spiral_Ramp_Curva_A_East'));

// Monumental Facade Entrance Portal (Piazzale Tecchio / West Main Entrance)
const portalGeo = new THREE.BoxGeometry(1.2, 2.8, 4.6);
const portalMesh = new THREE.Mesh(portalGeo, darkConcreteMullionMat);
portalMesh.name = 'Monumental_Main_Entrance_Portal';
portalMesh.position.set(-15.1, 1.8, 0);
exteriorFacadeGroup.add(portalMesh);

// "STADIO DIEGO ARMANDO MARADONA" Blue Signboard Box
const signGeo = new THREE.BoxGeometry(0.2, 0.6, 3.8);
const signMesh = new THREE.Mesh(signGeo, napoliCyanMat);
signMesh.name = 'Signboard_Stadio_Diego_Armando_Maradona';
signMesh.position.set(-15.75, 3.4, 0);
exteriorFacadeGroup.add(signMesh);

stadiumRoot.add(exteriorFacadeGroup);

// -------------------------------------------------------------
// 5. ROOF & SPACE-FRAME TRUSS (Copertura Italia '90 & Tetto Fotovoltaico)
// -------------------------------------------------------------
const roofGroup = new THREE.Group();
roofGroup.name = 'Roof_Space_Frame_Italia_90_And_Solar';

// 5.1 Red Tubular Space-Frame Compression Ring (Perimeter Ring Beam)
const trussRingGeo = new THREE.TorusGeometry(15.2, 0.32, 16, 64);
const trussRing = new THREE.Mesh(trussRingGeo, italia90RedSteelMat);
trussRing.name = 'Truss_Perimeter_Compression_Ring';
trussRing.rotation.x = Math.PI / 2;
trussRing.position.y = 6.4;
trussRing.scale.set(1.0, 1.28, 1.0);
roofGroup.add(trussRing);

// 5.2 Cantilever Space-Frame Triangular Girders (36 radial trusses extending over the stands)
const numRoofTrusses = 36;
const girderGeo = new THREE.BoxGeometry(3.6, 0.3, 0.3);
const girderGroup = new THREE.Group();
girderGroup.name = 'Cantilever_Space_Frame_Girders';

for (let i = 0; i < numRoofTrusses; i++) {
  const theta = (i / numRoofTrusses) * Math.PI * 2;
  const pOuter = getOvalPos(theta, 15.2);
  const pInner = getOvalPos(theta, 11.6);

  const girder = new THREE.Mesh(girderGeo, italia90RedSteelMat);
  girder.position.set(
    (pOuter.x + pInner.x) / 2,
    6.4,
    (pOuter.z + pInner.z) / 2
  );
  girder.rotation.y = -theta;
  girderGroup.add(girder);
}
roofGroup.add(girderGroup);

// 5.3 Inner Tension Cable Ring
const innerTensionRingGeo = new THREE.TorusGeometry(11.5, 0.18, 16, 64);
const innerRing = new THREE.Mesh(innerTensionRingGeo, italia90RedSteelMat);
innerRing.name = 'Inner_Tension_Ring';
innerRing.rotation.x = Math.PI / 2;
innerRing.position.y = 6.35;
innerRing.scale.set(1.0, 1.28, 1.0);
roofGroup.add(innerRing);

// 5.4 Translucent Polycarbonate Canopy (Covering upper and intermediate stands)
const canopyMesh = createEllipticalTier(11.4, 15.3, 6.25, 6.45, roofCanopyMat, 'Translucent_Polycarbonate_Canopy');
roofGroup.add(canopyMesh);

// 5.5 Integrated Photovoltaic Solar Panels Array (Tetto Fotovoltaico Euro 2032 candidate standard)
const solarArrayMesh = createEllipticalTier(13.0, 15.1, 6.47, 6.49, solarPanelPhotovoltaicMat, 'Integrated_Photovoltaic_Solar_Array');
roofGroup.add(solarArrayMesh);

// 5.6 Floodlight Clusters (4 Giant Corner Lighting Towers)
function createFloodlightCluster(x, z, rotY, name) {
  const lightTower = new THREE.Group();
  lightTower.name = name;

  const bracketGeo = new THREE.BoxGeometry(0.8, 0.5, 1.4);
  const bracket = new THREE.Mesh(bracketGeo, italia90RedSteelMat);
  lightTower.add(bracket);

  // Bank of 12 LED Projector Lamps
  const lampGeo = new THREE.BoxGeometry(0.25, 0.18, 0.22);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const lamp = new THREE.Mesh(lampGeo, floodlightGlowMat);
      lamp.position.set(0.42, (r - 1) * 0.22, (c - 1.5) * 0.28);
      lightTower.add(lamp);
    }
  }

  lightTower.position.set(x, 6.7, z);
  lightTower.rotation.y = rotY;
  return lightTower;
}

roofGroup.add(createFloodlightCluster(-10.8, -13.6, Math.PI / 4, 'Floodlight_Cluster_NorthWest'));
roofGroup.add(createFloodlightCluster(10.8, -13.6, -Math.PI / 4, 'Floodlight_Cluster_NorthEast'));
roofGroup.add(createFloodlightCluster(-10.8, 13.6, Math.PI * 0.75, 'Floodlight_Cluster_SouthWest'));
roofGroup.add(createFloodlightCluster(10.8, 13.6, -Math.PI * 0.75, 'Floodlight_Cluster_SouthEast'));

// 5.7 Giant Scoreboard LED Screens (Maxischermi Curva A & Curva B)
const screenGeo = new THREE.BoxGeometry(3.6, 1.4, 0.2);
const screenMat = new THREE.MeshStandardMaterial({
  color: 0x050C16,
  emissive: 0x004A77,
  emissiveIntensity: 0.7,
  roughness: 0.2,
});

const screenCurvaB = new THREE.Mesh(screenGeo, screenMat);
screenCurvaB.name = 'Maxischermo_LED_Curva_B';
screenCurvaB.position.set(0, 5.5, -11.4);
screenCurvaB.rotation.y = 0;

const screenCurvaA = new THREE.Mesh(screenGeo, screenMat);
screenCurvaA.name = 'Maxischermo_LED_Curva_A';
screenCurvaA.position.set(0, 5.5, 11.4);
screenCurvaA.rotation.y = Math.PI;

roofGroup.add(screenCurvaB, screenCurvaA);

stadiumRoot.add(roofGroup);

// =========================================================================
// EXPORT TO GLTF BINARY (.glb)
// =========================================================================
console.log('Assembling and exporting GLTF (.glb)...');

const exporter = new GLTFExporter();
exporter.parse(
  stadiumRoot,
  (gltf) => {
    const buffer = Buffer.from(gltf);
    const targetDir = path.resolve('public/models');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const exportDir = path.resolve('data/exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const glbTarget = path.join(targetDir, 'stadio_diego_armando_maradona.glb');
    const glbExport = path.join(exportDir, 'stadio_diego_armando_maradona.glb');

    fs.writeFileSync(glbTarget, buffer);
    fs.writeFileSync(glbExport, buffer);

    console.log(`✓ High-fidelity model successfully generated and exported:`);
    console.log(`  File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB (${buffer.length} bytes)`);
    console.log(`  Target path: ${glbTarget}`);
    console.log(`  Export path: ${glbExport}`);
  },
  (err) => {
    console.error('Export error:', err);
  },
  { binary: true }
);
