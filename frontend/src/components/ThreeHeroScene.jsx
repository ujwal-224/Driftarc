import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // Group for entire rotating architecture system
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.5);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // 1. Central Core Wireframe Polyhedron (representing Deterministic Scanner Core)
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    systemGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      transparent: true,
      opacity: 0.35
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    systemGroup.add(innerMesh);

    // 2. Floating 3D Microservice Nodes (Architecture boxes)
    const nodeData = [
      { name: 'React Client', color: 0x38bdf8, pos: [-5.5, 2.5, 1.5], type: 'Frontend' },
      { name: 'API Gateway', color: 0x818cf8, pos: [-2, -3.2, 2], type: 'Service' },
      { name: 'Postgres DB', color: 0x10b981, pos: [4.8, 3.2, -1], type: 'Database' },
      { name: 'Redis Cache', color: 0xf43f5e, pos: [5.2, -2.4, 1.8], type: 'Drift!', isDrift: true },
      { name: 'Kafka Stream', color: 0xa855f7, pos: [0.5, 4.2, -2], type: 'Queue' },
      { name: 'Auth0 Service', color: 0xf59e0b, pos: [-4.5, -1.8, -2.5], type: 'External' }
    ];

    const nodeMeshes = [];
    const nodeRings = [];

    nodeData.forEach((item) => {
      // Node Box
      const boxGeo = new THREE.BoxGeometry(1.4, 0.9, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.9
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(item.pos[0], item.pos[1], item.pos[2]);

      // Wireframe edge outline
      const wireGeo = new THREE.BoxGeometry(1.42, 0.92, 0.92);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      box.add(wire);

      // Pulsing Drift Ring for Drift item
      if (item.isDrift) {
        const ringGeo = new THREE.RingGeometry(1.1, 1.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        box.add(ring);
        nodeRings.push(ring);
      }

      systemGroup.add(box);
      nodeMeshes.push({ mesh: box, origin: [...item.pos], isDrift: item.isDrift });
    });

    // 3. Connective Laser Beams (Connecting nodes to central core & each other)
    const linesGroup = new THREE.Group();
    systemGroup.add(linesGroup);

    const linePairs = [
      [nodeData[0].pos, [0, 0, 0], 0x38bdf8],
      [nodeData[1].pos, [0, 0, 0], 0x818cf8],
      [nodeData[2].pos, [0, 0, 0], 0x10b981],
      [nodeData[3].pos, [0, 0, 0], 0xf43f5e],
      [nodeData[4].pos, [0, 0, 0], 0xa855f7],
      [nodeData[5].pos, [0, 0, 0], 0xf59e0b],
      [nodeData[0].pos, nodeData[1].pos, 0x38bdf8],
      [nodeData[1].pos, nodeData[3].pos, 0xf43f5e]
    ];

    linePairs.forEach(([p1, p2, color]) => {
      const points = [
        new THREE.Vector3(p1[0], p1[1], p1[2]),
        new THREE.Vector3(p2[0], p2[1], p2[2])
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.45,
        linewidth: 1
      });
      const line = new THREE.Line(lineGeo, lineMat);
      linesGroup.add(line);
    });

    // 4. Background Particle Field (Stars & Matrix dust)
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45;
      particlePositions[i + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i + 2] = (Math.random() - 0.5) * 45;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Mouse Parallax Tracker
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      mouseX = (x - 0.5) * 2;
      mouseY = (y - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow interpolation
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Rotate central system
      systemGroup.rotation.y = elapsedTime * 0.15 + targetX * 0.6;
      systemGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1 - targetY * 0.4;

      // Core rotation
      coreMesh.rotation.x = elapsedTime * 0.3;
      coreMesh.rotation.y = elapsedTime * 0.4;

      // Floating wave animation for microservice nodes
      nodeMeshes.forEach((item, idx) => {
        item.mesh.position.y = item.origin[1] + Math.sin(elapsedTime * 1.5 + idx * 1.2) * 0.25;
        item.mesh.position.x = item.origin[0] + Math.cos(elapsedTime * 1.2 + idx * 0.8) * 0.15;
      });

      // Pulse drift ring
      nodeRings.forEach((ring) => {
        const scale = 1 + Math.sin(elapsedTime * 4) * 0.15;
        ring.scale.set(scale, scale, scale);
      });

      // Slow particle drift
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[460px] md:min-h-[580px] relative pointer-events-auto cursor-grab active:cursor-grabbing"
      title="Interactive 3D Architectural Scene (Move mouse to rotate)"
    />
  );
}
