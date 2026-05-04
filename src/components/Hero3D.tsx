import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Hero3DProps { className?: string }

export default function Hero3D({ className }: Hero3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 768;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Network nodes on a sphere
    const NODE_COUNT = isMobile ? 26 : 48;
    const radius = 3.6;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
      nodes.push(new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ));
    }

    const sphereGeom = new THREE.SphereGeometry(0.12, 10, 8);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1E293B"), // deep navy
      metalness: 0.2,
      roughness: 0.45,
      emissive: new THREE.Color("#2563EB"),
      emissiveIntensity: 0.06,
    });
    const instanced = new THREE.InstancedMesh(sphereGeom, nodeMat, nodes.length);
    instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodes.length; i++) {
      dummy.position.copy(nodes[i]);
      dummy.scale.setScalar(1 - (Math.random() * 0.28));
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    group.add(instanced);

    const positions: number[] = [];
    const threshold = 2.4;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < threshold) {
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#334155"),
      transparent: true,
      opacity: 0.36,
      linewidth: 1,
    });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    group.add(lines);

    const PARTICLES = isMobile ? 60 : 140;
    const partPos = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      partPos[i * 3] = (Math.random() - 0.5) * 14;
      partPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x1f2937, size: 0.04, transparent: true, opacity: 0.28, depthWrite: false,
    });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);

    // Lighting: subtle cool-blue ambient + soft directional for depth
    const hemi = new THREE.HemisphereLight(new THREE.Color("#0f172a"), new THREE.Color("#020617"), 0.45);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(new THREE.Color("#93c5fd"), 0.08);
    dir.position.set(5, 8, 2);
    scene.add(dir);

    const handleMouse = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    const handleResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let raf = 0;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      // heavier, weighty rotation but subtle
      if (!prefersReduced) {
        group.rotation.y += 0.0012; // slower, weighty
        group.rotation.x += 0.0005;
        group.rotation.y += (mouse.current.x * 0.3 - group.rotation.y * 0.04) * 0.015;
        group.rotation.x += (mouse.current.y * 0.18 - group.rotation.x * 0.04) * 0.015;
        particles.rotation.y -= 0.0003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      sphereGeom.dispose();
      instanced.dispose();
      nodeMat.dispose();
      lineGeom.dispose(); lineMat.dispose();
      partGeom.dispose(); partMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
