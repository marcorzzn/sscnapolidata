import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Volume2, VolumeX, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { STADIUM_SECTORS, StadiumSectorInfo } from '../data/napoliVerifiedData';
import rawCori from '../data/generated/cori.json';

interface DatabaseChant {
  id: number;
  titolo: string;
  testo: string;
  audio_url: string | null;
  anno: number | null;
  curva: string;
  note_origini: string | null;
}

interface StadiumMaradona3DProps {
  lang: 'it' | 'en';
}

export const StadiumMaradona3D: React.FC<StadiumMaradona3DProps> = ({ lang }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<StadiumSectorInfo['id']>('curva_b');
  const [playingChantId, setPlayingChantId] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const selectedSector =
    STADIUM_SECTORS.find((s) => s.id === selectedSectorId) || STADIUM_SECTORS[0];

  const dbCoriForSector = useMemo(() => {
    const allCori = (rawCori as unknown as DatabaseChant[]) || [];
    if (selectedSectorId === 'curva_b') {
      return allCori.filter((c) => c.curva === 'Curva B' || c.curva === 'Generale');
    }
    if (selectedSectorId === 'curva_a') {
      return allCori.filter((c) => c.curva === 'Curva A' || c.curva === 'Generale');
    }
    if (selectedSectorId === 'distinti') {
      return allCori.filter((c) => c.curva === 'Distinti' || c.curva === 'Curva B' || c.curva === 'Generale');
    }
    return allCori.filter((c) => c.curva === 'Storico' || c.curva === 'Curva A' || c.curva === 'Generale');
  }, [selectedSectorId]);

  const cameraTargetRef = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 }>({
    pos: new THREE.Vector3(0, 17, 23),
    look: new THREE.Vector3(0, 1.5, 0),
  });
  const requestRenderRef = useRef<(() => void) | null>(null);
  const sectorMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<number | null>(null);

  // Focus camera smoothly on selected sector
  const focusSector = (sectorId: StadiumSectorInfo['id']) => {
    setSelectedSectorId(sectorId);
    if (sectorId === 'curva_b') {
      cameraTargetRef.current.pos.set(0, 13, -21);
    } else if (sectorId === 'curva_a') {
      cameraTargetRef.current.pos.set(0, 13, 21);
    } else if (sectorId === 'tribuna_posillipo') {
      cameraTargetRef.current.pos.set(-22, 13, 0);
    } else if (sectorId === 'distinti') {
      cameraTargetRef.current.pos.set(22, 13, 0);
    }
    if (requestRenderRef.current) requestRenderRef.current();
  };

  const resetCamera = () => {
    cameraTargetRef.current.pos.set(16, 17, 20);
    cameraTargetRef.current.look.set(0, 1.5, 0);
    if (requestRenderRef.current) requestRenderRef.current();
  };

  // Procedural Web Audio API Chant Cadence Synthesizer
  const toggleChantAudio = (chant: StadiumSectorInfo['chants'][0]) => {
    if (playingChantId === chant.id) {
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
      setPlayingChantId(null);
      return;
    }

    if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
    setPlayingChantId(chant.id);

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    let step = 0;
    const stepMs = Math.round((60 / chant.bpm) * 500);

    const playNote = () => {
      if (!audioCtxRef.current) return;
      const now = audioCtxRef.current.currentTime;
      const freq = chant.notesHz[step % chant.notesHz.length];

      // Stadium brass/chorus warm harmonic + stadium drum thud on even beats
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepMs / 1000 - 0.02);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start(now);
      osc.stop(now + stepMs / 1000);

      // Stadium Surdo / Timpano drum pulse on downbeats
      if (step % 2 === 0) {
        const drumOsc = audioCtxRef.current.createOscillator();
        const drumGain = audioCtxRef.current.createGain();
        drumOsc.type = 'sine';
        drumOsc.frequency.setValueAtTime(95, now);
        drumOsc.frequency.exponentialRampToValueAtTime(42, now + 0.14);

        drumGain.gain.setValueAtTime(0.2, now);
        drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        drumOsc.connect(drumGain);
        drumGain.connect(audioCtxRef.current.destination);
        drumOsc.start(now);
        drumOsc.stop(now + 0.17);
      }

      step += 1;
    };

    playNote();
    audioTimerRef.current = window.setInterval(playNote, stepMs);
  };

  useEffect(() => {
    return () => {
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  // Highlight selected sector mesh in 3D scene
  useEffect(() => {
    sectorMeshesRef.current.forEach((mesh, id) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (id === selectedSectorId) {
        mat.color.setHex(0x01a0e8);
        mat.emissive.setHex(0x004a77);
      } else {
        mat.color.setHex(0x1f5f8b);
        mat.emissive.setHex(0x000000);
      }
    });
    if (requestRenderRef.current) requestRenderRef.current();
  }, [selectedSectorId]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090b);
    scene.fog = new THREE.FogExp2(0x08090b, 0.015);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(16, 17, 20);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x90d5ff, 0x08090b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    keyLight.position.set(18, 28, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x01a0e8, 1.1);
    rimLight.position.set(-18, 14, -16);
    scene.add(rimLight);

    // Composite Multi-Part Procedural Model of Stadio Diego Armando Maradona (THREE.Group)
    const stadiumGroup = new THREE.Group();
    stadiumGroup.scale.set(1, 1, 1.28); // Authentic elliptical bowl ratio of Fuorigrotta

    // 1. Exterior Architectural Concrete Plinth
    const plinthGeo = new THREE.CylinderGeometry(12.2, 13.0, 0.6, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x151921,
      roughness: 0.85,
      metalness: 0.15,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = 0.3;
    plinthMesh.receiveShadow = true;
    stadiumGroup.add(plinthMesh);

    // 2. Blue Athletics Track (World University Games 2019 renovation)
    const trackGeo = new THREE.CylinderGeometry(7.6, 7.6, 0.12, 64);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x0066aa,
      roughness: 0.6,
      metalness: 0.1,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.position.y = 0.66;
    stadiumGroup.add(trackMesh);

    // 3. Football Pitch with Procedural Canvas Markings
    const pitchCanvas = document.createElement('canvas');
    pitchCanvas.width = 512;
    pitchCanvas.height = 512;
    const pCtx = pitchCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#146B3A';
      pCtx.fillRect(0, 0, 512, 512);
      // Mow stripes
      for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
          pCtx.fillStyle = '#187A43';
          pCtx.fillRect(0, i * (512 / 12), 512, 512 / 12);
        }
      }
      // Pitch lines
      pCtx.strokeStyle = 'rgba(255,255,255,0.85)';
      pCtx.lineWidth = 4;
      pCtx.strokeRect(48, 32, 416, 448);
      pCtx.beginPath();
      pCtx.moveTo(48, 256);
      pCtx.lineTo(464, 256);
      pCtx.stroke();
      pCtx.beginPath();
      pCtx.arc(256, 256, 52, 0, Math.PI * 2);
      pCtx.stroke();
      // Penalty boxes
      pCtx.strokeRect(146, 32, 220, 74);
      pCtx.strokeRect(146, 406, 220, 74);
    }
    const pitchTex = new THREE.CanvasTexture(pitchCanvas);
    pitchTex.colorSpace = THREE.SRGBColorSpace;
    pitchTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const pitchGeo = new THREE.BoxGeometry(7.2, 0.1, 10.2);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: pitchTex,
      roughness: 0.75,
      metalness: 0.05,
    });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.position.y = 0.74;
    pitchMesh.scale.set(1, 1, 1 / 1.28); // keep rectangular inside elliptical bowl
    stadiumGroup.add(pitchMesh);

    // 4. Lower Ring Bowl (Primo Anello Inferiore)
    const lowerBowlGeo = new THREE.CylinderGeometry(9.4, 7.6, 1.8, 64, 1, true);
    const lowerBowlMat = new THREE.MeshStandardMaterial({
      color: 0x0e3b5e,
      roughness: 0.55,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const lowerBowlMesh = new THREE.Mesh(lowerBowlGeo, lowerBowlMat);
    lowerBowlMesh.position.y = 1.6;
    stadiumGroup.add(lowerBowlMesh);

    // 5. Four Clickable Upper Tier Sectors (Curva B, Curva A, Distinti, Tribuna Posillipo)
    const clickableMeshes: THREE.Mesh[] = [];
    sectorMeshesRef.current.clear();

    const sectorDefs: {
      id: StadiumSectorInfo['id'];
      thetaStart: number;
      thetaLength: number;
    }[] = [
      { id: 'curva_b', thetaStart: Math.PI * 0.78, thetaLength: Math.PI * 0.44 }, // North
      { id: 'curva_a', thetaStart: -Math.PI * 0.22, thetaLength: Math.PI * 0.44 }, // South
      { id: 'distinti', thetaStart: Math.PI * 0.26, thetaLength: Math.PI * 0.48 }, // East
      { id: 'tribuna_posillipo', thetaStart: Math.PI * 1.26, thetaLength: Math.PI * 0.48 }, // West
    ];

    sectorDefs.forEach((def) => {
      const geo = new THREE.CylinderGeometry(
        11.6,
        9.5,
        2.6,
        32,
        1,
        true,
        def.thetaStart,
        def.thetaLength
      );
      const isInitialSelected = def.id === 'curva_b';
      const mat = new THREE.MeshStandardMaterial({
        color: isInitialSelected ? 0x01a0e8 : 0x1f5f8b,
        emissive: isInitialSelected ? 0x004a77 : 0x000000,
        roughness: 0.4,
        metalness: 0.3,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 3.6;
      mesh.userData.sectorId = def.id;
      mesh.layers.enable(1);
      stadiumGroup.add(mesh);
      clickableMeshes.push(mesh);
      sectorMeshesRef.current.set(def.id, mesh);
    });

    // 6. Iconic Italia '90 Red Steel Roof Truss & Canopy Ring
    const trussGeo = new THREE.TorusGeometry(11.9, 0.28, 16, 64);
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0xb8292f,
      roughness: 0.35,
      metalness: 0.75,
    });
    const trussMesh = new THREE.Mesh(trussGeo, trussMat);
    trussMesh.rotation.x = Math.PI / 2;
    trussMesh.position.y = 5.25;
    stadiumGroup.add(trussMesh);

    const canopyGeo = new THREE.RingGeometry(9.7, 12.1, 64);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xd8dee6,
      roughness: 0.3,
      metalness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.rotation.x = Math.PI / 2;
    canopyMesh.position.y = 5.05;
    stadiumGroup.add(canopyMesh);

    // 7. Exterior Structural Pillars (24 radial steel columns)
    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.14, 5.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x8a95a5,
      roughness: 0.4,
      metalness: 0.8,
    });
    const pillarInstanced = new THREE.InstancedMesh(pillarGeo, pillarMat, 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * 12.15, 2.6, Math.sin(angle) * 12.15);
      dummy.updateMatrix();
      pillarInstanced.setMatrixAt(i, dummy.matrix);
    }
    pillarInstanced.computeBoundingSphere();
    stadiumGroup.add(pillarInstanced);

    scene.add(stadiumGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 10;
    controls.maxDistance = 42;
    controls.target.set(0, 1.5, 0);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;
    controls.addEventListener('change', requestRender);

    // Raycasting for clicking sectors
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const sectorId = hits[0].object.userData.sectorId as StadiumSectorInfo['id'];
        if (sectorId) {
          setSelectedSectorId(sectorId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-hairline)] pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
            {lang === 'it'
              ? 'ARCHITETTURA 3D INTERATTIVA & CULTURA DELLA CURVA'
              : 'INTERACTIVE 3D ARCHITECTURE & CURVA CULTURE'}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            Stadio Diego Armando Maradona — Fuorigrotta (1959–Oggi)
          </h2>
        </div>
        <div className="text-xs font-mono-tabular text-[var(--text-secondary)]">
          Capienza omologata: 54.726 · Inaugurazione: 06/12/1959 (Napoli-Juventus 2-1)
        </div>
      </div>

      {/* 100% Unobstructed 3D Viewport with Unified Collapsible Bottom Control Dock */}
      <div className="relative w-full h-[480px] bg-[#08090B] border border-[#01A0E8]/35 overflow-hidden">
        {/* Top-Left Minimal Spec Badge */}
        <div className="absolute top-4 left-4 z-10 bg-[#08090B]/90 border border-white/15 px-3.5 py-2 pointer-events-none">
          <div className="text-[11px] font-mono-tabular text-[#01A0E8] font-bold">
            SETTORE ATTIVO: {lang === 'it' ? selectedSector.nameIt : selectedSector.nameEn}
          </div>
          <div className="text-[10px] font-mono-tabular text-[#9BA5B4]">
            {selectedSector.capacity} · Clicca sui settori 3D o usa la dock in basso
          </div>
        </div>

        {/* Dedicated Ref Container for WebGL Canvas */}
        <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Unified Collapsible Bottom Control Dock */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 transition-transform duration-200"
          style={{
            bottom: '16px',
            maxWidth: 'min(920px, 94vw)',
            width: '100%',
            transform: dockCollapsed
              ? 'translate(-50%, calc(100% - 28px))'
              : 'translate(-50%, 0)',
          }}
        >
          <div className="flex justify-center">
            <button
              onClick={() => setDockCollapsed(!dockCollapsed)}
              className="px-3 py-1 bg-[#0E1116] border border-b-0 border-[#01A0E8]/40 text-[11px] font-mono-tabular text-[#01A0E8] flex items-center gap-1.5 cursor-pointer"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{lang === 'it' ? 'Mostra Controlli Settori' : 'Show Sector Controls'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{lang === 'it' ? 'Nascondi Controlli (Zen 3D)' : 'Hide Controls (Zen 3D)'}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0E1116] border border-[#01A0E8]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {STADIUM_SECTORS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => focusSector(sec.id)}
                  className={`px-3 py-1.5 text-xs font-mono-tabular transition-colors border cursor-pointer whitespace-nowrap ${
                    selectedSectorId === sec.id
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'bg-[#08090B] text-white border-white/15 hover:border-[#01A0E8]'
                  }`}
                >
                  {sec.id === 'curva_b'
                    ? 'Curva B'
                    : sec.id === 'curva_a'
                    ? 'Curva A'
                    : sec.id === 'distinti'
                    ? 'Distinti'
                    : 'Tribuna Posillipo'}
                </button>
              ))}
            </div>

            <button
              onClick={resetCamera}
              className="px-3 py-1.5 text-xs font-mono-tabular text-[#9BA5B4] hover:text-white border border-white/15 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'it' ? 'Reset Visuale' : 'Reset View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sector Details: History, Choreographies & Interactive Chants Audio Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector History & Choreographies */}
        <div className="lg:col-span-6 p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
              {lang === 'it' ? 'STORIA DEL SETTORE & COREOGRAFIE' : 'SECTOR HISTORY & CHOREOGRAPHIES'}
            </span>
            <h3 className="text-2xl font-display font-extrabold mt-1">
              {lang === 'it' ? selectedSector.nameIt : selectedSector.nameEn}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
              {lang === 'it' ? selectedSector.historyIt : selectedSector.historyEn}
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
            <h4 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider">
              {lang === 'it'
                ? 'COREOGRAFIE E STRISCIONI DOCUMENTATI'
                : 'DOCUMENTED CHOREOGRAPHIES & BANNERS'}
            </h4>
            {selectedSector.choreographies.map((ch, idx) => (
              <div
                key={idx}
                className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]"
              >
                <div className="text-xs font-mono-tabular text-[#01A0E8] font-bold">
                  {ch.year} · {ch.match}
                </div>
                <div className="text-sm font-bold mt-1">
                  {lang === 'it' ? ch.titleIt : ch.titleEn}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {lang === 'it' ? ch.descriptionIt : ch.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Chants Archive with Web Audio API Synthesizer */}
        <div className="lg:col-span-6 p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
              {lang === 'it'
                ? 'ARCHIVIO AUDIO CORI & RITMICA DELLA CURVA'
                : 'CHANT AUDIO ARCHIVE & RHYTHM SYNTHESIZER'}
            </span>
            <h3 className="text-2xl font-display font-extrabold mt-1">
              {lang === 'it' ? 'Cori Storici del Settore' : 'Historic Sector Chants'}
            </h3>
          </div>

          <div className="space-y-4">
            {selectedSector.chants.map((chant) => {
              const isPlaying = playingChantId === chant.id;
              return (
                <div
                  key={chant.id}
                  className={`p-5 border transition-colors ${
                    isPlaying
                      ? 'bg-[#01A0E8]/10 border-[#01A0E8]'
                      : 'bg-[var(--bg-primary)] border-[var(--border-hairline)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono-tabular text-[#01A0E8]">
                        {chant.year} · {chant.bpm} BPM
                      </div>
                      <h4 className="text-lg font-display font-bold mt-0.5">{chant.title}</h4>
                    </div>
                    <button
                      onClick={() => toggleChantAudio(chant)}
                      className={`px-4 py-2 text-xs font-mono-tabular font-bold flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap ${
                        isPlaying
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                          : 'bg-transparent text-[#01A0E8] border-[#01A0E8] hover:bg-[#01A0E8]/15'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span>{lang === 'it' ? 'Ferma Audio' : 'Stop Audio'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>{lang === 'it' ? 'Ascolta Ritmica' : 'Play Cadence'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <blockquote className="mt-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] font-mono-tabular text-xs leading-relaxed">
                    "{chant.lyrics}"
                  </blockquote>

                  <p className="text-xs text-[var(--text-secondary)] mt-2.5">
                    {lang === 'it' ? chant.contextIt : chant.contextEn}
                  </p>
                </div>
              );
            })}

            {/* Official Chants from Database */}
            {dbCoriForSector.length > 0 && (
              <div className="pt-5 border-t border-[var(--border-hairline)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
                    {lang === 'it'
                      ? `CORI CERTIFICATI DAL DATABASE (${dbCoriForSector.length})`
                      : `CERTIFIED DATABASE CHANTS (${dbCoriForSector.length})`}
                  </span>
                  <span className="text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                    @sscnapolidata
                  </span>
                </div>

                {dbCoriForSector.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-[var(--bg-primary)] border border-[#01A0E8]/30 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="font-bold text-white text-sm">{c.titolo}</span>
                      <span className="px-2 py-0.5 bg-[#01A0E8]/15 border border-[#01A0E8] text-[#01A0E8]">
                        {c.curva} {c.anno && `· ${c.anno}`}
                      </span>
                    </div>

                    <blockquote className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-xs font-mono-tabular leading-relaxed text-[#01A0E8]">
                      "{c.testo}"
                    </blockquote>

                    {c.note_origini && (
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {c.note_origini}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
