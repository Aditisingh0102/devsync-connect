import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface ProfileHero3DProps { className?: string }

export default function ProfileHero3D({ className }: ProfileHero3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const isDark = resolvedTheme !== "light";
    const lineColor = isDark ? "#ffffff" : "#000000";
    const lineOpacity = isDark ? 0.36 : 0.22;
    const dotColor = isDark ? "#dc2626" : "#1e40af"; // red in dark mode, dark blue in light mode
    const dotEmissive = isDark ? "#ef4444" : "#3b82f6";
    const dotEmissiveIntensity = isDark ? 0.5 : 0.2;

    const NODE_COUNT = 28;
    const radius = 2.2;
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

    const sphereGeom = new THREE.SphereGeometry(0.08, 8, 6);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dotColor),
      metalness: 0.15,
      roughness: 0.5,
      emissive: new THREE.Color(dotEmissive),
      emissiveIntensity: dotEmissiveIntensity,
    });
    const instanced = new THREE.InstancedMesh(sphereGeom, nodeMat, nodes.length);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodes.length; i++) {
      dummy.position.copy(nodes[i]);
      dummy.scale.setScalar(1 - (Math.random() * 0.3));
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    group.add(instanced);

    const positions: number[] = [];
    const threshold = 2.4;
    const connections = Array(nodes.length).fill(0);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < threshold) {
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
          connections[i]++;
          connections[j]++;
        }
      }
    }

    // Ensure every node is connected to at least 2 neighbors to prevent isolated nodes
    for (let i = 0; i < nodes.length; i++) {
      if (connections[i] < 2) {
        const distances = nodes.map((n, idx) => ({ idx, dist: nodes[i].distanceTo(n) }));
        distances.sort((a, b) => a.dist - b.dist);
        for (let k = 1; k <= 2; k++) {
          const neighborIdx = distances[k].idx;
          const neighbor = nodes[neighborIdx];
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z, neighbor.x, neighbor.y, neighbor.z);
        }
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(lineColor), transparent: true, opacity: lineOpacity });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    group.add(lines);

    const partCount = 80;
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      partPos[i * 3] = (Math.random() - 0.5) * 6;
      partPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ color: isDark ? 0x1f2937 : 0x94a3b8, size: 0.03, transparent: true, opacity: isDark ? 0.22 : 0.35 });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);

    const hemi = new THREE.HemisphereLight(
      isDark ? new THREE.Color("#0f172a") : new THREE.Color("#e2e8f0"),
      isDark ? new THREE.Color("#020617") : new THREE.Color("#cbd5e1"),
      isDark ? 0.45 : 0.75
    );
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(
      isDark ? new THREE.Color("#93c5fd") : new THREE.Color("#3b82f6"),
      isDark ? 0.06 : 0.2
    );
    dir.position.set(4, 5, 2);
    scene.add(dir);

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
      if (!prefersReduced) {
        group.rotation.y += 0.0013;
        group.rotation.x += 0.0006;
        particles.rotation.y -= 0.0004;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      sphereGeom.dispose();
      nodeMat.dispose();
      lineGeom.dispose();
      lineMat.dispose && lineMat.dispose();
      partGeom.dispose();
      partMat.dispose && partMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [resolvedTheme]);

  return <div ref={mountRef} className={className} aria-hidden />;
}
