import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Box,
  Eye,
  Camera,
  Activity,
  Cpu,
  Zap,
  Check,
  Upload,
  RefreshCw,
  Orbit,
  Maximize2,
  Shield,
  Compass,
  Crosshair,
  Grid,
  Radio,
  SlidersHorizontal,
  Flame,
  Award,
  ChevronRight,
  Info,
  Wand2,
} from 'lucide-react';
import {
  CHARACTER_IMAGE_ASSETS,
  MosaicCharacterType,
  createUniversalVolumetricCharacterMesh,
  MeshSimplificationTier,
  MeshSimplificationStats,
  generateMosaicSpriteMultiRes,
} from '../utils/mosaicCharacterRenderer';
import {
  CustomCharacterAsset,
  PRESET_CHARACTER_ASSETS,
  getAllCharacterAssets,
  saveCustomCharacterAsset,
  equipAssetToSlot,
  getActiveCharacterEquipment,
  CharacterTargetSlot,
  MosaicTileStyle,
  ColorPaletteMode,
} from '../utils/customCharacterStore';
import { sounds } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface MultiAngle3DCharacterStudioProps {
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  powerOn?: boolean;
  initialAssetId?: string;
  onEquipSuccess?: (slot: CharacterTargetSlot, assetName: string) => void;
}

type CameraPresetAngle =
  | 'FRONT'
  | 'BACK'
  | 'ISO_FRONT'
  | 'ISO_BACK'
  | 'TOP'
  | 'SIDE_LEFT'
  | 'SIDE_RIGHT';

export const MultiAngle3DCharacterStudio: React.FC<MultiAngle3DCharacterStudioProps> = ({
  theme = {
    primary: '#00f0ff',
    secondary: '#38bdf8',
    background: '#070a14',
    text: '#ffffff',
    accent: '#f59e0b',
  },
  powerOn = true,
  initialAssetId,
  onEquipSuccess,
}) => {
  // Active Character / Preset State
  const [characterPresets, setCharacterPresets] = useState<CustomCharacterAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CustomCharacterAsset>(PRESET_CHARACTER_ASSETS[0]);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);

  // Conversion Studio Configuration State
  const [tileSize, setTileSize] = useState<number>(3);
  const [tileStyle, setTileStyle] = useState<MosaicTileStyle>('ROMAN_STONE');
  const [palette, setPalette] = useState<ColorPaletteMode>('ORIGINAL');
  const [groutIntensity, setGroutIntensity] = useState<number>(40);
  const [alphaCutout, setAlphaCutout] = useState<boolean>(true);
  const [chassisDepth, setChassisDepth] = useState<number>(0.26); // Volumetric thickness

  // Geometry Simplification Pipeline State
  const [simplificationTier, setSimplificationTier] = useState<MeshSimplificationTier>('CYBER_BALANCED');
  const [meshStats, setMeshStats] = useState<MeshSimplificationStats | null>(null);

  // 3D Viewport Controls State
  const [activeAngle, setActiveAngle] = useState<CameraPresetAngle>('FRONT');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [lightingTheme, setLightingTheme] = useState<'CYBER_CYAN' | 'SOLAR_GOLD' | 'CRIMSON_NEO' | 'STUDIO_WHITE'>('CYBER_CYAN');

  // Equip Notification & Feedback State
  const [equipToast, setEquipToast] = useState<{ slot: string; name: string } | null>(null);
  const [isProcessingConversion, setIsProcessingConversion] = useState<boolean>(false);

  // Canvas Previews for Dual-Sided Front & Back Faceplates
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string>('');
  const [backPreviewUrl, setBackPreviewUrl] = useState<string>('');

  // Three.js Mount References
  const viewportMountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    modelGroup: THREE.Group;
    lightsGroup: THREE.Group;
    gridHelper: THREE.GridHelper;
    isDragging: boolean;
    prevPointer: { x: number; y: number };
    currentRot: { x: number; y: number };
    reqId: number | null;
  } | null>(null);

  // Load Custom & Preset Assets
  useEffect(() => {
    const all = getAllCharacterAssets();
    setCharacterPresets(all);
    if (initialAssetId) {
      const found = all.find((a) => a.id === initialAssetId);
      if (found) setSelectedAsset(found);
    }
  }, [initialAssetId]);

  // Generate & Cache Front/Back Mosaic Textures on Conversion Settings Change
  const updateMosaicTextures = useCallback(async () => {
    setIsProcessingConversion(true);

    try {
      // Map asset to MosaicCharacterType
      let frontType: MosaicCharacterType = 'VALKYRIE_FRONT';
      let backType: MosaicCharacterType = 'VALKYRIE_BACK';

      const assetName = selectedAsset.name.toUpperCase();
      if (assetName.includes('STARFIGHTER') || assetName.includes('FALCON')) {
        frontType = 'STARFIGHTER_FRONT';
        backType = 'STARFIGHTER_BACK';
      } else if (assetName.includes('GOLIATH') || assetName.includes('TITAN')) {
        frontType = 'GOLIATH_FRONT';
        backType = 'GOLIATH_BACK';
      } else if (assetName.includes('PILOT') || assetName.includes('RONIN')) {
        frontType = 'CYBER_PILOT_FRONT';
        backType = 'CYBER_PILOT_BACK';
      } else if (assetName.includes('SENTINEL') || assetName.includes('DROID')) {
        frontType = 'SENTINEL_FRONT';
        backType = 'SENTINEL_BACK';
      } else if (assetName.includes('RIFLE') || assetName.includes('CARBINE')) {
        frontType = 'PLASMA_RIFLE_FRONT';
        backType = 'PLASMA_RIFLE_BACK';
      } else if (assetName.includes('CORVETTE')) {
        frontType = 'STEALTH_CORVETTE_FRONT';
        backType = 'STEALTH_CORVETTE_BACK';
      }

      // Generate 256x256 High-Resolution Mosaic Canvases
      const frontCanvas = generateMosaicSpriteMultiRes(frontType, 256, {
        tileSize,
        tileStyle,
        palette,
        groutIntensity,
        customImage: customImageSrc ? Object.assign(new Image(), { src: customImageSrc }) : null,
      });

      const backCanvas = generateMosaicSpriteMultiRes(backType, 256, {
        tileSize,
        tileStyle,
        palette,
        groutIntensity,
        customImage: customImageSrc ? Object.assign(new Image(), { src: customImageSrc }) : null,
      });

      setFrontPreviewUrl(frontCanvas.toDataURL());
      setBackPreviewUrl(backCanvas.toDataURL());

      // Rebuild 3D Mesh in Three.js Viewport
      if (sceneContextRef.current) {
        const { scene, modelGroup } = sceneContextRef.current;
        while (modelGroup.children.length > 0) {
          modelGroup.remove(modelGroup.children[0]);
        }

        const { group: newMeshGroup, stats } = createUniversalVolumetricCharacterMesh({
          characterType: frontType,
          customFrontCanvas: frontCanvas,
          customBackCanvas: backCanvas,
          tileSize,
          tileStyle,
          palette,
          groutIntensity,
          chassisDepth,
          wireframe: wireframeMode,
          simplificationTier,
        });

        modelGroup.add(newMeshGroup);
        setMeshStats(stats);
      }
    } catch (e) {
      console.warn('Failed to update 3D character mesh:', e);
    } finally {
      setIsProcessingConversion(false);
    }
  }, [
    selectedAsset,
    customImageSrc,
    tileSize,
    tileStyle,
    palette,
    groutIntensity,
    chassisDepth,
    wireframeMode,
    simplificationTier,
  ]);

  // Trigger texture regeneration on settings change
  useEffect(() => {
    updateMosaicTextures();
  }, [updateMosaicTextures]);

  // Initialize Three.js 3D Viewport
  useEffect(() => {
    const container = viewportMountRef.current;
    if (!container || !powerOn) return;

    // Clean up previous renderer
    if (sceneContextRef.current) {
      if (sceneContextRef.current.reqId) {
        cancelAnimationFrame(sceneContextRef.current.reqId);
      }
      sceneContextRef.current.renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      sceneContextRef.current = null;
    }

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Floating Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(16, 20, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Dynamic Multi-Source Studio Lighting Group
    const lightsGroup = new THREE.Group();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    lightsGroup.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0x00f0ff, 1.4);
    mainKeyLight.position.set(5, 8, 7);
    lightsGroup.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xffaa00, 0.8);
    fillLight.position.set(-5, -3, -6);
    lightsGroup.add(fillLight);

    const rimPointLight = new THREE.PointLight(0x38bdf8, 1.5, 20);
    rimPointLight.position.set(0, 4, -4);
    lightsGroup.add(rimPointLight);

    scene.add(lightsGroup);

    const currentRot = { x: 0.1, y: 0 };

    sceneContextRef.current = {
      scene,
      camera,
      renderer,
      modelGroup,
      lightsGroup,
      gridHelper,
      isDragging: false,
      prevPointer: { x: 0, y: 0 },
      currentRot,
      reqId: null,
    };

    // Initial build
    updateMosaicTextures();

    // Render & Turntable Animation Loop
    const animate = () => {
      if (!sceneContextRef.current) return;
      const ctx = sceneContextRef.current;

      if (autoRotate && !ctx.isDragging) {
        ctx.currentRot.y += 0.008 * rotationSpeed;
      }

      ctx.modelGroup.rotation.y = ctx.currentRot.y;
      ctx.modelGroup.rotation.x = ctx.currentRot.x;

      ctx.renderer.render(ctx.scene, ctx.camera);
      ctx.reqId = requestAnimationFrame(animate);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !sceneContextRef.current) return;
      const newW = container.clientWidth || 540;
      const newH = container.clientHeight || 440;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneContextRef.current) {
        if (sceneContextRef.current.reqId) {
          cancelAnimationFrame(sceneContextRef.current.reqId);
        }
        renderer.dispose();
      }
    };
  }, [powerOn, rotationSpeed, autoRotate, updateMosaicTextures]);

  // Update Studio Lighting Colors Dynamically
  useEffect(() => {
    if (!sceneContextRef.current) return;
    const { lightsGroup } = sceneContextRef.current;

    const mainKey = lightsGroup.children[1] as THREE.DirectionalLight;
    const fill = lightsGroup.children[2] as THREE.DirectionalLight;
    const rim = lightsGroup.children[3] as THREE.PointLight;

    if (!mainKey || !fill || !rim) return;

    if (lightingTheme === 'CYBER_CYAN') {
      mainKey.color.setHex(0x00f0ff);
      fill.color.setHex(0x0044ff);
      rim.color.setHex(0x38bdf8);
    } else if (lightingTheme === 'SOLAR_GOLD') {
      mainKey.color.setHex(0xffb700);
      fill.color.setHex(0xff4400);
      rim.color.setHex(0xffe066);
    } else if (lightingTheme === 'CRIMSON_NEO') {
      mainKey.color.setHex(0xff0055);
      fill.color.setHex(0x7700ff);
      rim.color.setHex(0xff4488);
    } else {
      mainKey.color.setHex(0xffffff);
      fill.color.setHex(0xddeeff);
      rim.color.setHex(0xffffff);
    }
  }, [lightingTheme]);

  // Camera Preset Angle Snap with GSAP Easing
  const handleSelectAnglePreset = (preset: CameraPresetAngle) => {
    setActiveAngle(preset);
    setAutoRotate(false);
    sounds.playClick(720);
    haptics.trigger('medium');

    const ctx = sceneContextRef.current;
    if (!ctx) return;

    let targetRotY = 0;
    let targetRotX = 0.05;

    switch (preset) {
      case 'FRONT':
        targetRotY = 0;
        targetRotX = 0.05;
        break;
      case 'BACK':
        targetRotY = Math.PI; // 180 degrees
        targetRotX = 0.05;
        break;
      case 'ISO_FRONT':
        targetRotY = Math.PI / 4; // 45 degrees
        targetRotX = 0.22;
        break;
      case 'ISO_BACK':
        targetRotY = (Math.PI * 3) / 4; // 135 degrees
        targetRotX = 0.22;
        break;
      case 'TOP':
        targetRotY = 0;
        targetRotX = Math.PI / 2.3; // Top-down
        break;
      case 'SIDE_LEFT':
        targetRotY = -Math.PI / 2; // -90 degrees
        targetRotX = 0.05;
        break;
      case 'SIDE_RIGHT':
        targetRotY = Math.PI / 2; // 90 degrees
        targetRotX = 0.05;
        break;
    }

    gsap.to(ctx.currentRot, {
      x: targetRotX,
      y: targetRotY,
      duration: 0.75,
      ease: 'power3.out',
    });
  };

  // Interactive Orbit Pointer Controls
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;
    ctx.isDragging = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.prevPointer = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = sceneContextRef.current;
    if (!ctx || !ctx.isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - ctx.prevPointer.x;
    const deltaY = clientY - ctx.prevPointer.y;

    ctx.currentRot.y += deltaX * 0.012;
    ctx.currentRot.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 2.2, ctx.currentRot.x + deltaY * 0.008));

    ctx.prevPointer = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    const ctx = sceneContextRef.current;
    if (ctx) ctx.isDragging = false;
  };

  // Custom Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playSpectrumLoad();
    haptics.trigger('success');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageSrc(result);

      // Create Custom Asset in Store
      const newCustomAsset: CustomCharacterAsset = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 18),
        sourceType: 'UPLOAD',
        imageUrl: result,
        targetSlot: 'ALL',
        createdAt: Date.now(),
        settings: {
          tileSize,
          tileStyle,
          groutIntensity,
          primaryGlow: '#00f0ff',
          secondaryGlow: '#38bdf8',
          palette,
          alphaCutout,
          preservePainterlyTone: true,
        },
      };

      saveCustomCharacterAsset(newCustomAsset);
      setCharacterPresets(getAllCharacterAssets());
      setSelectedAsset(newCustomAsset);
    };
    reader.readAsDataURL(file);
  };

  // In-Game Equip Actions
  const handleEquipToGame = (slot: CharacterTargetSlot) => {
    equipAssetToSlot(selectedAsset.id, slot);
    sounds.playPowerUp();
    haptics.trigger('heavy');

    const slotNames: Record<CharacterTargetSlot, string> = {
      ALL: 'Universal Active Rig',
      TPS_MECH: '3D TPS Mech Chassis',
      SPACE_STARFIGHTER: '3D Space Dogfight Starfighter',
      FPS_WEAPON: '3D Cyber FPS Plasma Weapon',
      PIXEL_SPRITE: '64x64 Arcade Pixel Runner',
      ARENA_MURAL: 'Roman Cyber Hologram Mural',
    };

    const slotLabel = slotNames[slot];
    setEquipToast({ slot: slotLabel, name: selectedAsset.name });
    if (onEquipSuccess) {
      onEquipSuccess(slot, selectedAsset.name);
    }

    setTimeout(() => {
      setEquipToast(null);
    }, 3800);
  };

  return (
    <div className="space-y-4 font-mono select-none" id="multi-angle-character-studio">
      {/* Top Studio HUD & Real-time Telemetry Bar */}
      <div className="p-3 bg-gradient-to-r from-[#060a17] via-[#091124] to-[#060a17] border border-cyan-500/30 rounded-lg shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2 tracking-wide">
              <span>3D MULTI-ANGLE CHARACTER STUDIO</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse font-mono">
                VOLUMETRIC MESH MATRIX
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-3">
              <span>
                Angle: <b className="text-cyan-300">{activeAngle.replace('_', ' ')}</b>
              </span>
              <span>•</span>
              <span>
                Optimization:{' '}
                <b className={simplificationTier === 'MOBILE_LOW_POWER' ? 'text-emerald-400' : 'text-amber-400'}>
                  {simplificationTier.replace('_', ' ')}
                </b>
              </span>
              <span>•</span>
              <span>
                Bevel Depth: <b className="text-white">{Math.round(chassisDepth * 100)}mm</b>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Convert Custom Character Image to 3D Mesh"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => updateMosaicTextures()}
            disabled={isProcessingConversion}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessingConversion ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Viewport on Left, Conversion Pipeline Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT / CENTER: 3D Multi-Angle Viewport */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative border border-cyan-500/30 rounded-lg overflow-hidden bg-[#03060f] shadow-2xl min-h-[420px]">
            {/* Three.js Interactive Render Container */}
            <div
              ref={viewportMountRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="w-full h-[440px] cursor-grab active:cursor-grabbing touch-none select-none relative"
            />

            {/* Floating Multi-Angle Preset Camera Switcher */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono shadow-xl z-10">
              <span className="text-[10px] text-neutral-400 px-1 font-bold">ANGLE:</span>
              {[
                { id: 'FRONT' as const, label: 'FRONT 0°', icon: Shield },
                { id: 'ISO_FRONT' as const, label: '3/4 ISO 45°', icon: Compass },
                { id: 'SIDE_RIGHT' as const, label: 'SIDE 90°', icon: Crosshair },
                { id: 'BACK' as const, label: 'REAR 180°', icon: RotateCcw },
                { id: 'TOP' as const, label: 'TOP 90°', icon: Maximize2 },
              ].map((preset) => {
                const isActive = activeAngle === preset.id;
                const Icon = preset.icon;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handleSelectAnglePreset(preset.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                        : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Viewport Top Right Utility Toolbar */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-lg border border-cyan-500/30 text-xs z-10 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  sounds.playClick(600);
                }}
                className={`p-1.5 rounded border transition-all ${
                  autoRotate
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                }`}
                title={autoRotate ? 'Pause 360° Turntable' : 'Start 360° Turntable'}
              >
                <Orbit className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setWireframeMode(!wireframeMode);
                  sounds.playClick(650);
                }}
                className={`p-1.5 rounded border transition-all ${
                  wireframeMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                }`}
                title="Toggle Wireframe Edge Matrix"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dual Front / Back Texture Thumbnails Floating in Bottom Left */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/85 backdrop-blur-md p-1.5 rounded-lg border border-white/15 text-[10px] z-10">
              <div className="text-center">
                <span className="text-neutral-400 block text-[8px] mb-0.5">FRONT FACE</span>
                {frontPreviewUrl ? (
                  <img
                    src={frontPreviewUrl}
                    alt="Front Faceplate"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded border border-cyan-500/40 bg-black/60 shadow-inner"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-900 rounded border border-white/10 animate-pulse" />
                )}
              </div>

              <div className="text-center">
                <span className="text-neutral-400 block text-[8px] mb-0.5">REAR / PLUME</span>
                {backPreviewUrl ? (
                  <img
                    src={backPreviewUrl}
                    alt="Back Faceplate"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded border border-amber-500/40 bg-black/60 shadow-inner"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-900 rounded border border-white/10 animate-pulse" />
                )}
              </div>
            </div>

            {/* Interactive Drag Orbit Hint */}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-white/15 text-[10px] text-neutral-400 flex items-center gap-1.5 pointer-events-none">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>Touch / Drag to Orbit 360°</span>
            </div>
          </div>

          {/* Real-time Geometry Simplification & Mobile Optimization HUD */}
          {meshStats && (
            <div className="p-3 bg-gradient-to-r from-cyan-950/20 via-neutral-900/40 to-cyan-950/20 border border-cyan-500/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>GEOMETRY SIMPLIFICATION & MOBILE RENDERING TELEMETRY</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                  {meshStats.targetMobileFps} FPS MOBILE TARGET
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-black/50 border border-white/10">
                  <div className="text-[10px] text-neutral-400">VERTICES</div>
                  <div className="font-bold text-white">
                    {meshStats.simplifiedVertices.toLocaleString()}{' '}
                    <span className="text-[9px] text-neutral-500">/ {meshStats.originalVertices.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/10">
                  <div className="text-[10px] text-neutral-400">TRIANGLES</div>
                  <div className="font-bold text-cyan-300">
                    {meshStats.simplifiedTriangles.toLocaleString()}
                  </div>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/10">
                  <div className="text-[10px] text-neutral-400">POLYGON DECIMATION</div>
                  <div className="font-bold text-emerald-400">
                    -{meshStats.reductionPercentage}%
                  </div>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/10">
                  <div className="text-[10px] text-neutral-400">DRAW CALLS / VRAM</div>
                  <div className="font-bold text-amber-300">
                    {meshStats.drawCalls} DC • {meshStats.estimatedMemoryKb} KB
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Conversion Pipeline, Character Selector, & Optimization Controls */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Character Preset Carousel */}
          <div className="p-3 bg-white/[0.03] border border-white/15 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                CHARACTER ASSET SELECTOR
              </span>
              <span className="text-[10px] text-neutral-400">
                {characterPresets.length} Assets Loaded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {characterPresets.map((asset) => {
                const isSelected = selectedAsset.id === asset.id;
                return (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setCustomImageSrc(asset.sourceType === 'UPLOAD' ? asset.imageUrl : null);
                      sounds.playClick(680);
                      haptics.trigger('click');
                    }}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_10px_rgba(0,240,255,0.3)] text-white'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-cover rounded border border-white/20 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-[11px] font-bold truncate">{asset.name}</div>
                      <div className="text-[9px] text-cyan-300/80 uppercase">{asset.targetSlot}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversion Studio Sliders & Parameters */}
          <div className="p-3 bg-white/[0.03] border border-white/15 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                CONVERSION MATRIX CONTROLS
              </span>
              <span className="text-[10px] text-cyan-300 font-bold">
                TIER {tileSize === 2 ? 'HD 25' : tileSize === 3 ? 'ULTRA 50' : tileSize === 4 ? 'MICRO 150' : 'MACRO 300'}
              </span>
            </div>

            {/* Tile Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300">Tesserae Tile Scale:</span>
                <span className="text-cyan-300 font-bold">{tileSize}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={tileSize}
                onChange={(e) => {
                  setTileSize(Number(e.target.value));
                  sounds.playClick(500 + Number(e.target.value) * 40);
                }}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>Sub-Pixel 2px</span>
                <span>Micro 4px</span>
                <span>Macro 10px</span>
              </div>
            </div>

            {/* Volumetric Chassis Depth (Solves Paper Cutout issue) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300">Volumetric Bevel Depth (3D Hull):</span>
                <span className="text-amber-300 font-bold">{Math.round(chassisDepth * 100)}mm</span>
              </div>
              <input
                type="range"
                min={0.08}
                max={0.6}
                step={0.02}
                value={chassisDepth}
                onChange={(e) => {
                  setChassisDepth(Number(e.target.value));
                  sounds.playClick(600 + Number(e.target.value) * 200);
                }}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>Slim 8mm</span>
                <span>Balanced 26mm</span>
                <span>Heavy Armored 60mm</span>
              </div>
            </div>

            {/* Tile Style Selector */}
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-300 block">Tesserae Architecture:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'ROMAN_STONE' as const, label: 'Roman Stone' },
                  { id: 'QUANTUM_TRANSISTOR' as const, label: 'Quantum Transistor' },
                  { id: 'GLYPH_CIPHER' as const, label: 'Glyph Cypher' },
                  { id: 'NEON_CIRCUIT' as const, label: 'Neon Circuit' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setTileStyle(s.id);
                      sounds.playClick(750);
                      haptics.trigger('light');
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all text-left ${
                      tileStyle === s.id
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-300 block">Color Palette:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'ORIGINAL' as const, label: 'Original' },
                  { id: 'CYBER_CYAN' as const, label: 'Cyan' },
                  { id: 'SOLAR_GOLD' as const, label: 'Gold' },
                  { id: 'CRIMSON_NEO' as const, label: 'Crimson' },
                  { id: 'EMERALD_QUANTUM' as const, label: 'Emerald' },
                  { id: 'TITANIUM_WHITE' as const, label: 'Titanium' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setPalette(p.id);
                      sounds.playClick(800);
                      haptics.trigger('light');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      palette === p.id
                        ? 'bg-amber-500/20 text-amber-200 border-amber-400'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Geometry Simplification Tier Selector (Mobile Optimization) */}
          <div className="p-3 bg-white/[0.03] border border-white/15 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                GEOMETRY SIMPLIFICATION PRESET
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'MOBILE_LOW_POWER' as const, label: 'Mobile Low Power', desc: '-62% Poly • 60 FPS' },
                { id: 'CYBER_BALANCED' as const, label: 'Cyber Balanced', desc: '-35% Poly • Crisp' },
                { id: 'HIGH_FIDELITY' as const, label: 'High Fidelity', desc: '-12% Poly • Bevel HD' },
                { id: 'RAW_FULL' as const, label: 'Raw Full Detail', desc: '100% Geometry' },
              ].map((tier) => (
                <button
                  type="button"
                  key={tier.id}
                  onClick={() => {
                    setSimplificationTier(tier.id);
                    sounds.playClick(650);
                    haptics.trigger('click');
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    simplificationTier === tier.id
                      ? 'border-emerald-400 bg-emerald-950/60 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-bold">{tier.label}</div>
                  <div className="text-[9px] text-emerald-300/80">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Instant In-Game Equip Actions */}
          <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 rounded-lg space-y-2">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>EQUIP 3D MESH TO ACTIVE GAME LOADOUT</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleEquipToGame('TPS_MECH')}
                className="px-2.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Equip TPS Mech</span>
              </button>

              <button
                type="button"
                onClick={() => handleEquipToGame('SPACE_STARFIGHTER')}
                className="px-2.5 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400 text-blue-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Equip Starfighter</span>
              </button>

              <button
                type="button"
                onClick={() => handleEquipToGame('FPS_WEAPON')}
                className="px-2.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Equip FPS Gun</span>
              </button>

              <button
                type="button"
                onClick={() => handleEquipToGame('PIXEL_SPRITE')}
                className="px-2.5 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400 text-purple-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Equip 64px Sprite</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Equip Toast Notification */}
      {equipToast && (
        <div className="fixed bottom-6 right-6 bg-cyan-950/95 border border-cyan-400 text-white p-3.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-bounce">
          <div className="p-2 rounded-lg bg-cyan-400 text-black">
            <Check className="w-5 h-5 font-extrabold" />
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-bold uppercase">EQUIPPED TO GAME MATRIX</div>
            <div className="text-sm font-extrabold text-white">{equipToast.name}</div>
            <div className="text-[10px] text-neutral-400">{equipToast.slot}</div>
          </div>
        </div>
      )}
    </div>
  );
};
