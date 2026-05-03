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

    // Glowing node points
    const nodeGeom = new THREE.BufferGeometry().setFromPoints(nodes);
    const nodeMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.18,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodePoints = new THREE.Points(nodeGeom, nodeMat);
    group.add(nodePoints);

    // Connections between nearby nodes
    const positions: number[] = [];
    const colors: number[] = [];
    const c1 = new THREE.Color(0x2563eb);
    const c2 = new THREE.Color(0x06b6d4);
    const threshold = 2.4;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < threshold) {
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
          colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    lineGeom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    group.add(lines);

    // Floating ambient particles
    const PARTICLES = isMobile ? 80 : 200;
    const partPos = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      partPos[i * 3] = (Math.random() - 0.5) * 14;
      partPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x7c3aed, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);

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
    const animate = () => {
      raf = requestAnimationFrame(animate);
      group.rotation.y += 0.0025;
      group.rotation.x += 0.0008;
      group.rotation.y += (mouse.current.x * 0.4 - group.rotation.y * 0.05) * 0.02;
      group.rotation.x += (mouse.current.y * 0.25 - group.rotation.x * 0.05) * 0.02;
      particles.rotation.y -= 0.0006;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      nodeGeom.dispose(); nodeMat.dispose();
      lineGeom.dispose(); lineMat.dispose();
      partGeom.dispose(); partMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
