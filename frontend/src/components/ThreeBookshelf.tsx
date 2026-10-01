"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { playBookSlide, playCoCClick } from "@/lib/sound";
import { Layers, Sparkles, BookOpen, BookPlus, Plus } from "lucide-react";

export interface MemoryItem {
  id: string;
  shelfId: string;
  title: string;
  era: string;
  date: string;
  excerpt: string;
  story: string;
  quote: string;
  imagePath: string;
  audioPath?: string;
  tags: string[];
  elixirCount: number;
  flamesCount: number;
  starsCount: number;
  color: string;
}

interface ShelfCategory {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  icon: string;
  bookColor: string;
  memoryCount: number;
}

interface ThreeBookshelfProps {
  memories: MemoryItem[];
  shelves: ShelfCategory[];
  onSelectMemory: (memory: MemoryItem) => void;
  selectedShelfId: string;
  onSelectShelf: (shelfId: string) => void;
  onOpenNewMemory?: () => void;
}

export function ThreeBookshelf({
  memories,
  shelves,
  onSelectMemory,
  selectedShelfId,
  onSelectShelf,
  onOpenNewMemory,
}: ThreeBookshelfProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerBookOpenRef = useRef<((bookId: string) => void) | null>(null);
  const [hoveredMemory, setHoveredMemory] = useState<MemoryItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "interactive_drawer">("3d");

  // Detect mobile on mount & resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Auto-switch to drawer mode on mobile for better touch UX
      // But only on first load, let user override
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Books to render on shelf
  const shelfBooks = useMemo(() => {
    if (selectedShelfId === "all") return memories;
    return memories.filter((m) => m.shelfId === selectedShelfId);
  }, [memories, selectedShelfId]);

  // Three.js 3D Canvas setup with full touch support & Clash of Clans Royal Aesthetics
  useEffect(() => {
    if (viewMode !== "3d" || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || (isMobile ? 400 : 540);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x13230a, 0.03);

    const isMobileView = width < 640;

    // 2. Camera with responsive mathematical framing (never cuts off shelf edges on mobile)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    const updateCameraPosition = (w: number, h: number) => {
      const aspect = w / h;
      const fovRad = (camera.fov * Math.PI) / 180;
      // Enhanced bookshelf total bounding width = 7.2 units, height = 3.8 units
      const shelfTotalWidth = 7.2;
      const shelfTotalHeight = 3.8;
      // 18% breathing room margin
      const distForWidth = (shelfTotalWidth * 1.18) / (2 * Math.tan(fovRad / 2) * aspect);
      const distForHeight = (shelfTotalHeight * 1.18) / (2 * Math.tan(fovRad / 2));
      const targetZ = Math.max(distForWidth, distForHeight, 5.2);

      camera.aspect = aspect;
      camera.position.set(0, 1.12, targetZ);
      camera.lookAt(0, 1.05, 0);
      camera.updateProjectionMatrix();
    };

    updateCameraPosition(width, height);

    // 3. Renderer with hardware optimization
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileView ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobileView;
    if (renderer.shadowMap.enabled) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";

    // 4. Clash of Clans Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.4);
    scene.add(ambientLight);

    // Golden Sunlight Key Light
    const mainSun = new THREE.DirectionalLight(0xfffae0, 2.4);
    mainSun.position.set(3, 7, 5);
    if (!isMobileView) {
      mainSun.castShadow = true;
      mainSun.shadow.mapSize.width = 1024;
      mainSun.shadow.mapSize.height = 1024;
      mainSun.shadow.bias = -0.001;
    }
    scene.add(mainSun);

    // Warm Shelf Interior Glow Light
    const shelfGlow = new THREE.PointLight(0xffb84d, 1.8, 6.5);
    shelfGlow.position.set(0, 2.3, 0.8);
    scene.add(shelfGlow);

    // Diya Flame Point Light (Flickering)
    const diyaLight = new THREE.PointLight(0xff9922, 2.2, 4.5);
    diyaLight.position.set(-2.6, 1.45, 0.4);
    scene.add(diyaLight);

    // Left & Right magical atmosphere lamps
    const leftFill = new THREE.PointLight(0xffa834, 1.2, 5.0);
    leftFill.position.set(-3.6, 0.2, 1.0);
    scene.add(leftFill);

    const rightFill = new THREE.PointLight(0x40c4ff, 1.1, 5.0);
    rightFill.position.set(3.6, 2.4, 1.0);
    scene.add(rightFill);

    // 5. Materials (Clash of Clans Hand-Painted Royal Palette)
    const darkMahogany = new THREE.MeshStandardMaterial({
      color: 0x33180b,
      roughness: 0.55,
      metalness: 0.1,
    });
    const richWalnut = new THREE.MeshStandardMaterial({
      color: 0x482413,
      roughness: 0.6,
      metalness: 0.08,
    });
    const cocGold = new THREE.MeshStandardMaterial({
      color: 0xf5ba2a,
      roughness: 0.25,
      metalness: 0.88,
    });
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0xffd966,
      roughness: 0.2,
      metalness: 0.95,
    });
    const parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xfbf2db,
      roughness: 0.85,
    });

    // 6. Build High-Quality 3D Sanctuary Bookshelf
    const shelfGroup = new THREE.Group();
    scene.add(shelfGroup);

    // Planks (Top, Middle, Bottom)
    const plankWidth = 6.4;
    const plankDepth = 1.05;
    const plankThickness = 0.14;

    const shelfPlankGeo = new THREE.BoxGeometry(plankWidth, plankThickness, plankDepth);
    const goldLipGeo = new THREE.BoxGeometry(plankWidth + 0.02, 0.05, 0.06);

    // Bottom Plank
    const bottomPlank = new THREE.Mesh(shelfPlankGeo, richWalnut);
    bottomPlank.position.set(0, -0.4, 0);
    bottomPlank.receiveShadow = true;
    shelfGroup.add(bottomPlank);

    const bottomLip = new THREE.Mesh(goldLipGeo, cocGold);
    bottomLip.position.set(0, -0.4, plankDepth / 2 + 0.03);
    shelfGroup.add(bottomLip);

    // Middle Plank
    const middlePlank = new THREE.Mesh(shelfPlankGeo, richWalnut);
    middlePlank.position.set(0, 1.2, 0);
    middlePlank.receiveShadow = true;
    shelfGroup.add(middlePlank);

    const midLip = new THREE.Mesh(goldLipGeo, cocGold);
    midLip.position.set(0, 1.2, plankDepth / 2 + 0.03);
    shelfGroup.add(midLip);

    // Top Plank
    const topPlank = new THREE.Mesh(shelfPlankGeo, richWalnut);
    topPlank.position.set(0, 2.6, 0);
    topPlank.receiveShadow = true;
    shelfGroup.add(topPlank);

    const topLip = new THREE.Mesh(goldLipGeo, cocGold);
    topLip.position.set(0, 2.6, plankDepth / 2 + 0.03);
    shelfGroup.add(topLip);

    // Fluted Side Pillars
    const pillarWidth = 0.32;
    const pillarHeight = 3.25;
    const pillarDepth = 1.15;
    const pillarGeo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth);

    const leftPillar = new THREE.Mesh(pillarGeo, darkMahogany);
    leftPillar.position.set(-3.25, 1.1, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    shelfGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, darkMahogany);
    rightPillar.position.set(3.25, 1.1, 0);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    shelfGroup.add(rightPillar);

    // Ornate Stepped Crown Header (Top Molding)
    const crownLayer1 = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.16, 1.22), darkMahogany);
    crownLayer1.position.set(0, 2.76, 0.02);
    shelfGroup.add(crownLayer1);

    const crownLayer2 = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.14, 1.28), richWalnut);
    crownLayer2.position.set(0, 2.9, 0.04);
    shelfGroup.add(crownLayer2);

    // Centered Royal Gold Medallion on Crown
    const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), cocGold);
    medallion.rotation.x = Math.PI / 2;
    medallion.position.set(0, 2.9, 0.68);
    shelfGroup.add(medallion);

    // Ornate Stepped Pedestal Base (Bottom Footing)
    const baseLayer1 = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.16, 1.22), darkMahogany);
    baseLayer1.position.set(0, -0.56, 0.02);
    shelfGroup.add(baseLayer1);

    const baseLayer2 = new THREE.Mesh(new THREE.BoxGeometry(7.15, 0.14, 1.28), richWalnut);
    baseLayer2.position.set(0, -0.7, 0.04);
    shelfGroup.add(baseLayer2);

    // Vertical Wainscot Paneling Backboard
    const backGeo = new THREE.BoxGeometry(6.4, 3.2, 0.08);
    const backMesh = new THREE.Mesh(backGeo, darkMahogany);
    backMesh.position.set(0, 1.1, -0.52);
    backMesh.receiveShadow = true;
    shelfGroup.add(backMesh);

    // Vertical panel shadow grooves on backboard
    for (let i = -2.5; i <= 2.5; i += 0.8) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.16, 0.02), richWalnut);
      slat.position.set(i, 1.1, -0.47);
      shelfGroup.add(slat);
    }

    // Heavy-Duty Clash of Clans Riveted Gold Corner Brackets
    const bracketGeo = new THREE.BoxGeometry(0.36, 0.28, 0.36);
    const rivetGeo = new THREE.SphereGeometry(0.045, 8, 8);

    [-3.25, 3.25].forEach((x) => {
      [-0.4, 1.2, 2.6].forEach((y) => {
        const bracket = new THREE.Mesh(bracketGeo, cocGold);
        bracket.position.set(x, y, 0.52);
        shelfGroup.add(bracket);

        // Gold Rivet Studs
        const r1 = new THREE.Mesh(rivetGeo, rivetMat);
        r1.position.set(x > 0 ? x - 0.08 : x + 0.08, y + 0.06, 0.7);
        shelfGroup.add(r1);

        const r2 = new THREE.Mesh(rivetGeo, rivetMat);
        r2.position.set(x > 0 ? x - 0.08 : x + 0.08, y - 0.06, 0.7);
        shelfGroup.add(r2);
      });
    });

    // 7. Sacred Relics on the Shelf:
    // A) Sacred Brass Diya with Glowing Flame on Middle Shelf (Left edge)
    const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.08, 16), cocGold);
    diyaBase.position.set(-2.6, 1.31, 0.2);
    shelfGroup.add(diyaBase);

    const diyaCup = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16), cocGold);
    diyaCup.rotation.x = Math.PI / 2;
    diyaCup.position.set(-2.6, 1.36, 0.2);
    shelfGroup.add(diyaCup);

    // Glowing Diya Flame
    const flameGeo = new THREE.ConeGeometry(0.06, 0.18, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffea55 });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(-2.6, 1.48, 0.2);
    shelfGroup.add(flameMesh);

    // B) Rolled Ancient Parchment Scrolls on Top Shelf (Right edge)
    const scroll1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 12), parchmentMat);
    scroll1.rotation.z = Math.PI / 2;
    scroll1.position.set(2.5, 1.34, 0.22);
    shelfGroup.add(scroll1);

    const scrollRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 12), cocGold);
    scrollRibbon.rotation.z = Math.PI / 2;
    scrollRibbon.position.set(2.5, 1.34, 0.22);
    shelfGroup.add(scrollRibbon);

    // 8. Spawn Rich Detailed Animated Books
    interface BookMeshObject extends THREE.Mesh {
      memoryData: MemoryItem;
      originX: number;
      originY: number;
      targetX: number;
      targetY: number;
      targetZ: number;
      baseTilt: number;
      targetRotY: number;
      targetRotX: number;
      targetScale: number;
      isOpening: boolean;
    }

    const bookMeshes: BookMeshObject[] = [];
    const booksToDisplay = shelfBooks.length > 0 ? shelfBooks : memories;

    // Distribute books compactly across lower and middle shelves
    booksToDisplay.forEach((mem, index) => {
      const isUpper = index % 2 === 0;
      const shelfY = isUpper ? 1.27 : -0.33;
      const colIndex = Math.floor(index / 2);
      const totalInRow = Math.ceil(booksToDisplay.length / 2);
      const maxSpan = 4.6;
      const spacing = Math.min(0.38, maxSpan / Math.max(totalInRow, 1));
      const shelfX = (colIndex - (totalInRow - 1) / 2) * spacing + (isUpper ? 0.2 : -0.1);

      const bookWidth = 0.20 + ((index * 7) % 3) * 0.025;
      const bookHeight = 0.84 + ((index * 5) % 3) * 0.08;
      const bookDepth = 0.64;

      const bookGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
      const baseColor = new THREE.Color(mem.color || "#8b3a82");

      const bookMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.38,
        metalness: 0.18,
      });

      const bookMesh = new THREE.Mesh(bookGeo, bookMat) as unknown as BookMeshObject;
      const initialY = shelfY + bookHeight / 2;
      bookMesh.position.set(shelfX, initialY, 0);
      bookMesh.castShadow = !isMobileView;
      bookMesh.receiveShadow = !isMobileView;
      bookMesh.memoryData = mem;
      bookMesh.originX = shelfX;
      bookMesh.originY = initialY;
      bookMesh.targetX = shelfX;
      bookMesh.targetY = initialY;
      bookMesh.targetZ = 0;
      bookMesh.targetRotY = 0;
      bookMesh.targetRotX = 0;
      bookMesh.targetScale = 1;
      bookMesh.isOpening = false;

      // Subtle handcrafted tilt for select books
      const tilt = (index % 5 === 2) ? -0.04 : (index % 5 === 4) ? 0.03 : 0;
      bookMesh.rotation.z = tilt;
      bookMesh.baseTilt = tilt;

      // 3 Raised Gold Spine Bands
      [-0.24, 0, 0.24].forEach((offsetY) => {
        const band = new THREE.Mesh(
          new THREE.BoxGeometry(bookWidth + 0.015, 0.05, 0.02),
          cocGold
        );
        band.position.set(0, bookHeight * offsetY, bookDepth / 2 + 0.005);
        bookMesh.add(band);
      });

      // Gold Embossed Spine Emblem (Star/Diamond)
      const crest = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.025),
        cocGold
      );
      crest.rotation.z = Math.PI / 4;
      crest.position.set(0, bookHeight * 0.12, bookDepth / 2 + 0.008);
      bookMesh.add(crest);

      // Visible Parchment Pages on Top
      const pageTop = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth - 0.03, 0.01, bookDepth - 0.04),
        parchmentMat
      );
      pageTop.position.set(0, bookHeight / 2 - 0.005, -0.01);
      bookMesh.add(pageTop);

      scene.add(bookMesh);
      bookMeshes.push(bookMesh);
    });

    // 9. Floating Golden Dust Motes / Magical Sparkles
    const particleCount = isMobileView ? 25 : 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 6.5;
      particlePos[i * 3 + 1] = Math.random() * 3.2 - 0.5;
      particlePos[i * 3 + 2] = Math.random() * 1.5 + 0.2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffe680,
      size: isMobileView ? 0.06 : 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Raycaster for Hover, Click, AND Touch
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let activeHoverMesh: BookMeshObject | null = null;
    let pulledOutBook: BookMeshObject | null = null;
    let pullResetTimer: ReturnType<typeof setTimeout> | null = null;
    let isOpeningAnyBook = false;

    const findBookFromIntersect = (intersects: THREE.Intersection[]): BookMeshObject | null => {
      if (intersects.length === 0) return null;
      let hit = intersects[0].object as THREE.Mesh;
      while (hit.parent && !(hit as unknown as BookMeshObject).memoryData) {
        hit = hit.parent as THREE.Mesh;
      }
      const book = hit as unknown as BookMeshObject;
      return book?.memoryData ? book : null;
    };

    const getNormalizedCoords = (clientX: number, clientY: number): THREE.Vector2 => {
      const rect = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const resetPulledBook = () => {
      if (pulledOutBook && !pulledOutBook.isOpening) {
        pulledOutBook.targetZ = 0;
        pulledOutBook.targetRotY = 0;
        pulledOutBook.targetRotX = 0;
        pulledOutBook.targetScale = 1;
        pulledOutBook.rotation.z = pulledOutBook.baseTilt;
        pulledOutBook = null;
      }
      activeHoverMesh = null;
      setHoveredMemory(null);
    };

    // Sound trigger that plays immediately across different books (crisp sweeping), but prevents looping on the same book
    let lastBookSoundId: string | null = null;
    let lastSoundTime = 0;
    const playBookSlideOnHover = (bookId: string) => {
      const now = Date.now();
      if (bookId !== lastBookSoundId) {
        if (now - lastSoundTime > 35) {
          lastBookSoundId = bookId;
          lastSoundTime = now;
          playBookSlide();
        }
      } else {
        if (now - lastSoundTime > 350) {
          lastSoundTime = now;
          playBookSlide();
        }
      }
    };

    // Human-like Book Open Animation (Slides out, floats to camera, turns to open cover)
    const triggerBookOpen = (book: BookMeshObject) => {
      if (isOpeningAnyBook) return;
      isOpeningAnyBook = true;
      book.isOpening = true;
      playCoCClick(1.0);
      playBookSlide();

      // Glide towards the center of camera view and rotate to face the reader
      book.targetX = 0;
      book.targetY = 1.15;
      book.targetZ = Math.max(camera.position.z - 2.0, 3.2);
      book.targetRotY = -Math.PI * 0.45; // Turn to show cover
      book.targetRotX = 0.12;
      book.targetScale = 1.7;
      book.rotation.z = 0;

      // Open reader modal smoothly as book reaches full view
      setTimeout(() => {
        onSelectMemory(book.memoryData);
        // Smoothly return 3D book behind the modal
        setTimeout(() => {
          book.targetX = book.originX;
          book.targetY = book.originY;
          book.targetZ = 0;
          book.targetRotY = 0;
          book.targetRotX = 0;
          book.targetScale = 1;
          book.rotation.z = book.baseTilt;
          book.isOpening = false;
          isOpeningAnyBook = false;
          resetPulledBook();
        }, 300);
      }, 380);
    };

    // Expose triggerBookOpen to external JSX clicks (preview card & Read button)
    triggerBookOpenRef.current = (bookId: string) => {
      const target = bookMeshes.find((b) => b.memoryData.id === bookId);
      if (target) {
        triggerBookOpen(target);
      } else {
        const fallback = memories.find((m) => m.id === bookId);
        if (fallback) onSelectMemory(fallback);
      }
    };

    // --- Mouse Events (Desktop) with Stable Hover & Instant Multi-Book Sweeping ---
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || isOpeningAnyBook) return;
      const coords = getNormalizedCoords(e.clientX, e.clientY);
      mouse.x = coords.x;
      mouse.y = coords.y;

      // Perform hover raycasting directly on pointer movement
      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(bookMeshes, true);
      const foundBook = findBookFromIntersect(intersects);

      if (foundBook !== activeHoverMesh) {
        if (foundBook && !foundBook.isOpening) {
          foundBook.targetZ = 0.88;
          foundBook.targetRotY = -0.14;
          foundBook.targetScale = 1.06;
          foundBook.rotation.z = 0;
          playBookSlideOnHover(foundBook.memoryData.id);
          setHoveredMemory(foundBook.memoryData);
        } else if (!foundBook) {
          setHoveredMemory(null);
        }

        if (activeHoverMesh && activeHoverMesh !== foundBook && !activeHoverMesh.isOpening) {
          activeHoverMesh.targetZ = 0;
          activeHoverMesh.targetRotY = 0;
          activeHoverMesh.targetScale = 1;
          activeHoverMesh.rotation.z = activeHoverMesh.baseTilt;
        }
        activeHoverMesh = foundBook;
      }
    };

    const handlePointerLeave = () => {
      if (isOpeningAnyBook) return;
      mouse.x = -999;
      mouse.y = -999;
      if (activeHoverMesh && !activeHoverMesh.isOpening) {
        activeHoverMesh.targetZ = 0;
        activeHoverMesh.targetRotY = 0;
        activeHoverMesh.targetScale = 1;
        activeHoverMesh.rotation.z = activeHoverMesh.baseTilt;
      }
      activeHoverMesh = null;
      setHoveredMemory(null);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || isOpeningAnyBook) return;
      const coords = getNormalizedCoords(e.clientX, e.clientY);
      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(bookMeshes, true);
      const book = findBookFromIntersect(intersects);
      if (book) {
        triggerBookOpen(book);
      }
    };

    // --- Touch Events (Mobile) ---
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchDrag = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isOpeningAnyBook) return;
      e.preventDefault();
      const touch = e.touches[0];
      touchStartTime = Date.now();
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchDrag = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isOpeningAnyBook) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.sqrt(dx * dx + dy * dy) > 12) {
        isTouchDrag = true;
      }

      if (isTouchDrag) {
        const panX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.x = panX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isOpeningAnyBook) return;
      e.preventDefault();
      const elapsed = Date.now() - touchStartTime;

      if (isTouchDrag || elapsed > 500) {
        mouse.x = -999;
        mouse.y = -999;
        return;
      }

      const touch = e.changedTouches[0];
      const coords = getNormalizedCoords(touch.clientX, touch.clientY);
      raycaster.setFromCamera(coords, camera);
      const intersects = raycaster.intersectObjects(bookMeshes, true);
      const tappedBook = findBookFromIntersect(intersects);

      if (pullResetTimer) {
        clearTimeout(pullResetTimer);
        pullResetTimer = null;
      }

      if (!tappedBook) {
        resetPulledBook();
        mouse.x = -999;
        mouse.y = -999;
        return;
      }

      if (pulledOutBook && pulledOutBook === tappedBook) {
        // SECOND TAP on same book → smoothly open to full screen!
        triggerBookOpen(tappedBook);
      } else {
        // FIRST TAP on a book → slides out halfway with tactile presentation
        if (pulledOutBook && !pulledOutBook.isOpening) {
          pulledOutBook.targetZ = 0;
          pulledOutBook.targetRotY = 0;
          pulledOutBook.targetScale = 1;
          pulledOutBook.rotation.z = pulledOutBook.baseTilt;
        }
        tappedBook.targetZ = 0.95;
        tappedBook.targetRotY = -0.16;
        tappedBook.targetScale = 1.08;
        tappedBook.rotation.z = 0;
        playBookSlideOnHover(tappedBook.memoryData.id);
        setHoveredMemory(tappedBook.memoryData);
        activeHoverMesh = tappedBook;
        pulledOutBook = tappedBook;

        pullResetTimer = setTimeout(() => {
          resetPulledBook();
        }, 6500);
      }

      mouse.x = -999;
      mouse.y = -999;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Flame flicker effect
      const flicker = 1.0 + Math.sin(elapsed * 12) * 0.15 + Math.cos(elapsed * 23) * 0.1;
      diyaLight.intensity = 2.0 * flicker;
      flameMesh.scale.set(flicker, flicker * 1.1, flicker);

      // Gentle floating dust particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.003;
        if (positions[i * 3 + 1] > 2.8) {
          positions[i * 3 + 1] = -0.6;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smoothly interpolate book positions, rotations, and scale
      bookMeshes.forEach((mesh) => {
        mesh.position.x += (mesh.targetX - mesh.position.x) * 0.15;
        mesh.position.y += (mesh.targetY - mesh.position.y) * 0.15;
        mesh.position.z += (mesh.targetZ - mesh.position.z) * 0.15;
        mesh.rotation.y += (mesh.targetRotY - mesh.rotation.y) * 0.14;
        mesh.rotation.x += (mesh.targetRotX - mesh.rotation.x) * 0.14;

        const curScale = mesh.scale.x;
        const newScale = curScale + (mesh.targetScale - curScale) * 0.15;
        mesh.scale.set(newScale, newScale, newScale);

        if (mesh === activeHoverMesh && !mesh.isOpening) {
          mesh.position.y = mesh.originY + Math.sin(elapsed * 5) * 0.012;
        }
      });

      // Gentle ambient camera tilt with mouse
      if (mouse.x > -900 && !isOpeningAnyBook) {
        camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
        camera.position.y += (1.12 + (mouse.y > -900 ? mouse.y * 0.15 : 0) - camera.position.y) * 0.04;
        camera.lookAt(0, 1.05, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler with Dynamic Aspect Ratio Calculation
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || (window.innerWidth < 640 ? 400 : 540);
      updateCameraPosition(newWidth, newHeight);
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      triggerBookOpenRef.current = null;
      if (container && container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [viewMode, shelfBooks, memories, onSelectMemory, isMobile]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1140px",
        margin: "0 auto",
        padding: isMobile ? "0 8px" : "0 16px",
      }}
    >
      {/* Bookshelf Header Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? "8px" : "12px",
          marginBottom: isMobile ? "10px" : "16px",
        }}
      >
        {/* Left: Books Button (Compact Rectangular Pill) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            className="coc-btn-pill coc-btn-pill-green"
            style={{
              height: isMobile ? "36px" : "42px",
              padding: isMobile ? "0 12px" : "0 16px",
              borderRadius: "14px",
              fontSize: isMobile ? "12px" : "14px",
              gap: isMobile ? "6px" : "8px",
              cursor: "default",
            }}
            title={`Memorial Bookshelf (${memories.length} Books)`}
          >
            <div className="coc-btn-gloss" />
            {/* Book Tome Icon */}
            <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))" }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#ffd700" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#2d6e18" stroke="#ffd700" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 7h6M9 11h6" stroke="#ffe57f" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="coc-text-shadow" style={{ color: "#ffffff", letterSpacing: "0.5px", fontWeight: 700 }}>
              Books
            </span>
          </div>
        </div>

        {/* Right Actions: Inscribe Memory & View Mode Switcher (Matching Compact Height) */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "8px", flexShrink: 0 }}>
          {onOpenNewMemory && (
            <button
              onClick={() => {
                playCoCClick(1.1);
                onOpenNewMemory();
              }}
              title="Add a new book into the shelf"
              className="coc-btn-pill coc-btn-pill-orange"
              style={{
                height: isMobile ? "36px" : "42px",
                padding: isMobile ? "0 12px" : "0 16px",
                borderRadius: "14px",
                fontSize: isMobile ? "12px" : "14px",
                gap: isMobile ? "6px" : "8px",
              }}
            >
              <div className="coc-btn-gloss" />
              {/* Quill / Add Plus Icon */}
              <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))" }}>
                <circle cx="12" cy="12" r="9" fill="#d9540b" stroke="#ffd700" strokeWidth="2" />
                <path d="M12 7v10M7 12h10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="coc-text-shadow" style={{ color: "#ffffff", letterSpacing: "0.5px", fontWeight: 700 }}>
                ADD
              </span>
            </button>
          )}

          {/* View Mode Switcher (Matching Compact Pill Height) */}
          <button
            onClick={() => {
              playCoCClick(1.2);
              setViewMode(viewMode === "3d" ? "interactive_drawer" : "3d");
            }}
            title={viewMode === "3d" ? "Switch to 2.5D Drawer Grid" : "Switch to 3D Bookshelf Stage"}
            className={`coc-btn-pill ${viewMode === "3d" ? "coc-btn-pill-blue" : "coc-btn-pill-green"}`}
            style={{
              height: isMobile ? "36px" : "42px",
              padding: isMobile ? "0 10px" : "0 14px",
              borderRadius: "14px",
              fontSize: isMobile ? "12px" : "14px",
              gap: isMobile ? "5px" : "6px",
            }}
            aria-label={viewMode === "3d" ? "Switch to 2.5D Drawer Grid" : "Switch to 3D Bookshelf Stage"}
          >
            <div className="coc-btn-gloss" />
            {viewMode === "3d" ? (
              <Layers size={isMobile ? 16 : 18} color="#ffffff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }} />
            ) : (
              <Sparkles size={isMobile ? 16 : 18} color="#ffffff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }} />
            )}
            <span className="coc-text-shadow" style={{ color: "#ffffff", letterSpacing: "0.5px", fontWeight: 700 }}>
              {viewMode === "3d" ? "Grid" : "3D Stage"}
            </span>
          </button>
        </div>
      </div>

      {/* 3D Interactive Canvas or 2.5D Drawer */}
      {viewMode === "3d" ? (
        <div
          className="bookshelf-3d-container"
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "clamp(320px, 46vh, 380px)" : "clamp(340px, calc(100vh - 240px), 520px)",
            borderRadius: isMobile ? "16px" : "24px",
            overflow: "hidden",
            border: isMobile ? "3px solid #3c2415" : "5px solid #3c2415",
            background: "radial-gradient(circle at 50% 40%, #2f4e19 0%, #172a0c 80%, #0d1706 100%)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,0.7)",
          }}
        >
          {/* Three.js render container */}
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

          {/* Interactive Tooltip Card when hovering/tapping a book */}
          {hoveredMemory && (
            <div
              onClick={() => {
                if (!isMobile) return;
                if (triggerBookOpenRef.current) {
                  triggerBookOpenRef.current(hoveredMemory.id);
                } else {
                  playCoCClick(1.0);
                  onSelectMemory(hoveredMemory);
                }
              }}
              style={{
                position: "absolute",
                bottom: isMobile ? "12px" : "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(180deg, rgba(45, 25, 12, 0.96) 0%, rgba(25, 14, 7, 0.96) 100%)",
                border: "3px solid #d4af37",
                borderRadius: isMobile ? "14px" : "16px",
                padding: isMobile ? "8px 12px" : "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "10px" : "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.2)",
                pointerEvents: isMobile ? "auto" : "none",
                cursor: isMobile ? "pointer" : "default",
                maxWidth: "92%",
                width: isMobile ? "calc(100% - 24px)" : "auto",
                backdropFilter: "blur(8px)",
                animation: "fadeIn 0.2s ease-out",
                touchAction: "manipulation",
              }}
            >
              <div
                style={{
                  width: isMobile ? "40px" : "48px",
                  height: isMobile ? "40px" : "48px",
                  borderRadius: isMobile ? "8px" : "10px",
                  overflow: "hidden",
                  border: "2px solid #ffcc00",
                  flexShrink: 0,
                }}
              >
                <img
                  src={hoveredMemory.imagePath}
                  alt={hoveredMemory.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? "10px" : "11px", color: "#ffdf40", fontWeight: 700, textTransform: "uppercase" }}>
                  {hoveredMemory.era} • {isMobile ? "Tap to Open Book 📖" : "Click Book on Shelf 📖"}
                </div>
                <div style={{
                  fontSize: isMobile ? "13px" : "16px",
                  color: "#ffffff",
                  fontFamily: "var(--coc-font-gaming)",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {hoveredMemory.title}
                </div>
                {!isMobile && (
                  <div style={{ fontSize: "12px", color: "#d2c7b5", marginTop: "2px" }}>
                    {hoveredMemory.excerpt}
                  </div>
                )}
              </div>

              {/* Action indicator pill — Only on mobile touch devices */}
              {isMobile && (
                <div
                  style={{
                    background: "linear-gradient(180deg, #ff9e24 0%, #b34305 100%)",
                    border: "1.5px solid #ffd700",
                    borderRadius: "10px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffffff",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  Read 📖
                </div>
              )}
            </div>
          )}

          {/* Guide hint at top */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? "10px" : "14px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(20, 35, 12, 0.8)",
              border: "1.5px solid rgba(255, 215, 0, 0.3)",
              borderRadius: "999px",
              padding: isMobile ? "3px 12px" : "4px 16px",
              fontSize: isMobile ? "10px" : "12px",
              color: "#a3f06b",
              fontWeight: 600,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <BookOpen size={isMobile ? 12 : 14} />
            <span>{isMobile ? "Tap book to pull out • Tap again to read" : "Hover to slide book out • Click to inspect & listen"}</span>
          </div>
        </div>
      ) : (
        /* 2.5D Animated Shelf Drawer Grid (Compact & Responsive for all devices) */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(auto-fill, minmax(140px, 1fr))"
              : "repeat(auto-fill, minmax(190px, 1fr))",
            gap: isMobile ? "10px" : "14px",
            padding: "10px 0",
          }}
        >
          {shelfBooks.map((mem) => (
            <div
              key={mem.id}
              onClick={() => {
                playCoCClick(1.0);
                onSelectMemory(mem);
              }}
              className="book-item-3d coc-modal-window"
              style={{
                cursor: "pointer",
                padding: isMobile ? "8px" : "12px",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "6px" : "10px",
                borderRadius: isMobile ? "12px" : "16px",
                background: "linear-gradient(180deg, #3d2415 0%, #25140b 100%)",
                border: isMobile ? "2.5px solid #5b3720" : "3.5px solid #5b3720",
                boxShadow: "0 6px 14px rgba(0,0,0,0.6)",
                touchAction: "manipulation",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: isMobile ? "120px" : "160px",
                  borderRadius: isMobile ? "8px" : "10px",
                  overflow: "hidden",
                  border: "2px solid #8c5a32",
                  backgroundColor: "#160d07",
                }}
              >
                <img
                  src={mem.imagePath}
                  alt={mem.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    left: "4px",
                    background: "rgba(10, 20, 5, 0.88)",
                    border: "1.5px solid #ffcc00",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#ffdf40",
                    fontWeight: 700,
                  }}
                >
                  {mem.era}
                </div>
                {mem.audioPath && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      background: "#1d7ce8",
                      borderRadius: "50%",
                      width: isMobile ? "22px" : "28px",
                      height: isMobile ? "22px" : "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #fff",
                      fontSize: isMobile ? "10px" : "12px",
                    }}
                    title="Includes spoken voice recording"
                  >
                    🎙️
                  </div>
                )}
              </div>

              <div>
                <h3
                  className="coc-text-shadow"
                  style={{ fontSize: isMobile ? "12px" : "14px", color: "#ffffff", marginBottom: "4px", lineHeight: "1.2" }}
                >
                  {mem.title}
                </h3>
                <p style={{
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#d5c8b5",
                  lineHeight: "1.35",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {mem.excerpt}
                </p>
              </div>

              {/* Volume Action Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 700,
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ color: "#ffd700" }}>📖 Open</span>
                <span style={{ color: "#aef085" }}>{mem.audioPath ? "Voice" : "Photo"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
