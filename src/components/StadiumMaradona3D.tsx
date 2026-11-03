import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Sun,
  Shield,
  Play,
  Pause,
} from 'lucide-react';
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

type CameraPreset =
  | 'aerial_360'
  | 'facade_catino'
  | 'curve_spalti'
  | 'bordo_campo'
  | 'skybox_vip'
  | 'tetto_solare';

export const StadiumMaradona3D: React.FC<StadiumMaradona3DProps> = ({ lang }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<StadiumSectorInfo['id']>('curva_b');
  const [playingChantId, setPlayingChantId] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activePreset, setActivePreset] = useState<CameraPreset>('aerial_360');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showLegacyTrack, setShowLegacyTrack] = useState(false); // Restyling all'inglese by default
  const [isModelLoaded, setIsModelLoaded] = useState(false);

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

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const legacyTrackMeshRef = useRef<THREE.Object3D | null>(null);
  const sectorMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const requestRenderRef = useRef<(() => void) | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<number | null>(null);

  // Presets mapping
  const PRESET_COORDS: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
    aerial_360: { pos: [0, 24, 28], look: [0, 2, 0] },
    facade_catino: { pos: [-24, 6, 4], look: [-13, 3, 0] },
    curve_spalti: { pos: [0, 7.5, -13], look: [0, 1.8, 0] },
    bordo_campo: { pos: [-4.6, 1.35, 0], look: [0, 1.1, 0] },
    skybox_vip: { pos: [-10.8, 3.8, 0], look: [-4.5, 2.2, 0] },
    tetto_solare: { pos: [0, 26, 8], look: [0, 6, 0] },
  };

  // Smooth camera glide to target preset
  const applyPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    const cfg = PRESET_COORDS[preset];
    if (!controlsRef.current || !cameraRef.current) return;

    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    const startPos = cam.position.clone();
    const endPos = new THREE.Vector3(...cfg.pos);
    const startTarget = ctrl.target.clone();
    const endTarget = new THREE.Vector3(...cfg.look);

    let progress = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const animateTransition = () => {
      const elapsed = performance.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      cam.position.lerpVectors(startPos, endPos, ease);
      ctrl.target.lerpVectors(startTarget, endTarget, ease);
      ctrl.update();
      if (requestRenderRef.current) requestRenderRef.current();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };
    requestAnimationFrame(animateTransition);
  };

  // Focus sector in 3D scene
  const focusSector = (sectorId: StadiumSectorInfo['id']) => {
    setSelectedSectorId(sectorId);
    if (sectorId === 'curva_b') {
      applyPreset('curve_spalti');
    } else if (sectorId === 'curva_a') {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.set(0, 7.5, 13);
        controlsRef.current.target.set(0, 1.8, 0);
        controlsRef.current.update();
        if (requestRenderRef.current) requestRenderRef.current();
      }
    } else if (sectorId === 'tribuna_posillipo') {
      applyPreset('skybox_vip');
    } else if (sectorId === 'distinti') {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.set(13, 7.5, 0);
        controlsRef.current.target.set(0, 1.8, 0);
        controlsRef.current.update();
        if (requestRenderRef.current) requestRenderRef.current();
      }
    }
  };

  // Toggle Legacy Track
  useEffect(() => {
    if (legacyTrackMeshRef.current) {
      legacyTrackMeshRef.current.visible = showLegacyTrack;
      if (requestRenderRef.current) requestRenderRef.current();
    }
  }, [showLegacyTrack]);

  // Toggle Auto-Rotate in OrbitControls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
      controlsRef.current.autoRotateSpeed = 1.2;
      if (requestRenderRef.current) requestRenderRef.current();
    }
  }, [isAutoRotating]);

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

  // Main Three.js Scene Setup & GLTFLoader
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090b);
    scene.fog = new THREE.FogExp2(0x08090b, 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    camera.position.set(0, 24, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced Lighting (Sunlight + Sky Ambient + Rim Lights)
    const hemiLight = new THREE.HemisphereLight(0xb0e0ff, 0x08090b, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff8eb, 2.0);
    sunLight.position.set(22, 34, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const azzurroFill = new THREE.DirectionalLight(0x01a0e8, 1.1);
    azzurroFill.position.set(-22, 16, -18);
    scene.add(azzurroFill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    let frameId = 0;
    function renderLoop() {
      frameId = requestAnimationFrame(renderLoop);
      controls.update();
      renderer.render(scene, camera);
    }
    renderLoop();

    const requestRender = () => {
      // triggers frame
    };
    requestRenderRef.current = requestRender;

    // Load High-Fidelity GLB Model
    const glbUrl = `${import.meta.env.BASE_URL}models/stadio_diego_armando_maradona.glb`;
    const loader = new GLTFLoader();

    loader.load(
      glbUrl,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;

            if (m.name === 'Athletics_Track_Legacy') {
              legacyTrackMeshRef.current = m;
              m.visible = showLegacyTrack;
            }
          }
        });
        scene.add(model);
        setIsModelLoaded(true);
      },
      undefined,
      (err) => {
        console.error('Failed to load GLTF model:', err);
      }
    );

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="border-b border-[var(--border-hairline)] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'it'
                ? 'MODELLO 3D ARCHITETTONICO & NAVIGAZIONE DIGITALE'
                : 'ARCHITECTURAL 3D MODEL & DIGITAL NAVIGATION'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            Stadio Diego Armando Maradona — Napoli Fuorigrotta
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-1.5">
            {lang === 'it'
              ? 'Architettura originale di Carlo Cocchia (1959) · Copertura spaziale Italia ’90 · Restyling all’inglese'
              : 'Original design by Carlo Cocchia (1959) · Italia ’90 space-frame truss · English-style restyling'}
          </p>
        </div>

        {/* Action Buttons: Download GLB & Configuration Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Toggle: Restyling vs Athletics Track */}
          <button
            onClick={() => setShowLegacyTrack(!showLegacyTrack)}
            className={`px-3 py-1.5 text-xs font-mono-tabular border flex items-center gap-1.5 transition-colors cursor-pointer ${
              !showLegacyTrack
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {!showLegacyTrack
                ? (lang === 'it' ? 'Restyling all’Inglese (Zero Pista)' : 'English Style (No Track)')
                : (lang === 'it' ? 'Assetto con Pista Azzurra' : 'Legacy Track View')}
            </span>
          </button>

          {/* Download 3D Model (.glb) */}
          <a
            href={`${import.meta.env.BASE_URL}models/stadio_diego_armando_maradona.glb`}
            download="stadio_diego_armando_maradona.glb"
            className="px-3.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[#01A0E8] hover:text-[#08090B] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] text-xs font-mono-tabular font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={lang === 'it' ? 'Scarica file glTF binario (.glb) per Blender o viewer 3D' : 'Download glTF binary file (.glb) for Blender or 3D viewer'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Scarica .GLB (0.41 MB)' : 'Download .GLB (0.41 MB)'}</span>
          </a>
        </div>
      </div>

      {/* CAMERA VIEWPOINT PRESETS TOOLBAR */}
      <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[var(--text-secondary)] mr-1 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-[#01A0E8]" />
            <span>{lang === 'it' ? 'INQUADRATURE:' : 'VIEWPOINTS:'}</span>
          </span>

          {(
            [
              { id: 'aerial_360', it: 'Panoramica 360°', en: 'Aerial 360°' },
              { id: 'facade_catino', it: 'Facciata a Catino (1959)', en: 'Catino Facade (1959)' },
              { id: 'curve_spalti', it: 'Spalti & Curve Mosaico', en: 'Stands & Mosaic Tiers' },
              { id: 'bordo_campo', it: 'Bordo Campo (All’Inglese)', en: 'Pitch Side (English Style)' },
              { id: 'skybox_vip', it: 'Skybox & Hospitality', en: 'Skybox & VIP Suites' },
              { id: 'tetto_solare', it: 'Copertura & Fotovoltaico', en: 'Truss & Solar Roof' },
            ] as const
          ).map((vp) => (
            <button
              key={vp.id}
              onClick={() => applyPreset(vp.id)}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                activePreset === vp.id
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-primary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? vp.it : vp.en}
            </button>
          ))}
        </div>

        {/* Auto-Rotation 360° Switch */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`px-3 py-1 border flex items-center gap-1.5 transition-colors cursor-pointer ${
            isAutoRotating
              ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
              : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{lang === 'it' ? 'Rotazione 360°' : '360° Turntable'}</span>
        </button>
      </div>

      {/* 3D VIEWPORT CONTAINER */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[560px] bg-[#08090B] border border-[#01A0E8]/40 overflow-hidden shadow-2xl">
        {/* Top-Left Live Status Badge */}
        <div className="absolute top-4 left-4 z-10 bg-[#08090B]/90 border border-white/15 px-3.5 py-2 pointer-events-none backdrop-blur-sm">
          <div className="text-[11px] font-mono-tabular text-[#01A0E8] font-bold">
            SETTORE ATTIVO: {lang === 'it' ? selectedSector.nameIt : selectedSector.nameEn}
          </div>
          <div className="text-[10px] font-mono-tabular text-[#9BA5B4]">
            {selectedSector.capacity} · Ruota 360°, usa lo zoom o clicca sui settori in basso
          </div>
        </div>

        {/* WebGL Canvas Mount */}
        <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Collapsible Bottom Sector Quick Jump Dock */}
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
                  <span>{lang === 'it' ? 'Mostra Navigazione Settori' : 'Show Sector Navigation'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{lang === 'it' ? 'Nascondi Controlli (Zen 3D)' : 'Hide Controls (Zen 3D)'}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0E1116] border border-[#01A0E8]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
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
              onClick={() => applyPreset('aerial_360')}
              className="px-3 py-1.5 text-xs font-mono-tabular text-[#9BA5B4] hover:text-white border border-white/15 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'it' ? 'Reset Visuale' : 'Reset View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ARCHITECTURAL DOSSIER: 3 FOCUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Facciata a Catino */}
        <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
          <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
            01. LA FACCIATA A CATINO (1959)
          </div>
          <h3 className="font-display font-extrabold text-base text-[var(--text-primary)]">
            L’Imbuto Rovesciato di Carlo Cocchia
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'it'
              ? 'Inaugurato il 6 dicembre 1959 come Stadio del Sole, presenta una facciata ellittica a catino svasato verso l’esterno sorretta da 56 costoloni radiali in cemento armato e 4 monumentali rampe elicoidali d’accesso alle gradinate.'
              : 'Inaugurated on December 6, 1959 as Stadio del Sole, it features an inverted-funnel elliptical facade supported by 56 radial reinforced concrete buttress ribs and 4 monumental helical access ramps.'}
          </p>
        </div>

        {/* Card 2: Copertura Italia '90 & Fotovoltaico */}
        <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
          <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
            02. COPERTURA & TETTO FOTOVOLTAICO
          </div>
          <h3 className="font-display font-extrabold text-base text-[var(--text-primary)]">
            Tralicci Rossi & Transizione Green
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'it'
              ? 'L’iconica struttura spaziale in tubolari d’acciaio verniciati di rosso, realizzata per i Mondiali di Italia ’90, copre gli spalti superiori e integra la predisposizione per il tetto fotovoltaico monocristallino del dossier Euro 2032.'
              : 'The iconic space-frame tubular steel truss painted in red, built for Italia ’90, shelters the upper rings and integrates the monocrystalline photovoltaic roof array designed for Euro 2032.'}
          </p>
        </div>

        {/* Card 3: Restyling all'Inglese */}
        <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
          <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
            03. CONFIGURAZIONE RESTYLING
          </div>
          <h3 className="font-display font-extrabold text-base text-[var(--text-primary)]">
            Spalti a Bordo Campo & Skybox VIP
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'it'
              ? 'Il modello riproduce l’eliminazione della pista d’atletica con il prolungamento del primo anello a ridosso del rettangolo verde, la fascia centrale degli executive skybox vetrati e le sedute mosaico azzurro/bianco.'
              : 'The model reproduces the elimination of the athletics track with lower-tier stands descending right to the grass edge, executive glazed skybox hospitality suites, and the pixelated blue-and-white seating mosaic.'}
          </p>
        </div>
      </div>

      {/* SECTOR DETAILS & CHANTS AUDIO RHYTHM SYNTHESIZER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector History & Choreographies */}
        <div className="lg:col-span-6 p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase font-bold">
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
            <h4 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
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
            <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase font-bold">
              {lang === 'it'
                ? 'ARCHIVIO AUDIO CORI & RITMICA DELLA CURVA'
                : 'CHANT AUDIO ARCHIVE & RHYTHM SYNTHESIZER'}
            </span>
            <h3 className="text-2xl font-display font-extrabold mt-1">
              {lang === 'it' ? 'Cori Storici del Settore' : 'Historic Sector Chants'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {lang === 'it'
                ? 'Sintetizzatore polifonico Web Audio con battito di grancassa e cadenza della curva.'
                : 'Web Audio polyphonic cadence synthesizer with stadium drum pulse.'}
            </p>
          </div>

          <div className="space-y-3">
            {selectedSector.chants.map((chant) => {
              const isPlaying = playingChantId === chant.id;
              return (
                <div
                  key={chant.id}
                  className={`p-4 border transition-colors ${
                    isPlaying
                      ? 'bg-[#01A0E8]/10 border-[#01A0E8]'
                      : 'bg-[var(--bg-primary)] border-[var(--border-hairline)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        {chant.title}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)] mt-0.5">
                        {chant.curva} · {chant.bpm} BPM · {chant.yearIntroduced}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleChantAudio(chant)}
                      className={`px-3 py-1.5 text-xs font-mono-tabular flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isPlaying
                          ? 'bg-[#01A0E8] text-[#08090B] font-bold'
                          : 'bg-[var(--bg-secondary)] hover:bg-[#01A0E8] hover:text-[#08090B] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs italic text-[var(--text-secondary)] mt-2.5 font-serif border-l-2 border-[#01A0E8]/50 pl-3 py-0.5">
                    "{chant.lyrics}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
