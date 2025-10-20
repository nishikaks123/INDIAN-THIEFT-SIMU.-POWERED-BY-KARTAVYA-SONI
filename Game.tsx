import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface GameProps {
    onResourceCollected: () => void;
    onTimeUpdate: (time: string) => void;
    onHealthUpdate: (health: number) => void;
}

const GRAVITY = 30;
const JUMP_FORCE = 10;
const FALL_DAMAGE_THRESHOLD = 15;
const FALL_DAMAGE_MULTIPLIER = 3;

const Game: React.FC<GameProps> = ({ onResourceCollected, onTimeUpdate, onHealthUpdate }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    
    // Game state refs
    const resourceObjects = useRef<THREE.Mesh[]>([]);
    const healthPacks = useRef<THREE.Mesh[]>([]);
    const playerHealth = useRef(100);
    const velocityY = useRef(0);
    const isGrounded = useRef(true);


    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        const dayColor = new THREE.Color(0x87ceeb);
        const nightColor = new THREE.Color(0x000033);
        scene.background = dayColor.clone();
        scene.fog = new THREE.Fog(0x87ceeb, 0, 150);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        currentMount.appendChild(renderer.domElement);

        // Player
        const textureLoader = new THREE.TextureLoader();
        const playerTexture = textureLoader.load('assets/character.png');
        const playerGeometry = new THREE.PlaneGeometry(1.5, 2);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            map: playerTexture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
         });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.y = 1;
        player.castShadow = true;
        scene.add(player);
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x348c31 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Obstacles, Resources, and Health Packs
        for (let i = 0; i < 100; i++) {
            const rand = Math.random();
            const height = rand > 0.9 ? 1.5 : Math.random() * 8 + 1;
             const geometry = rand > 0.9 
                ? new THREE.BoxGeometry(1, 1, 1) // Health pack
                : new THREE.BoxGeometry(Math.random() * 2 + 1, height, Math.random() * 2 + 1);
            
            let color;
            let isResource = false;
            let isHealthPack = false;

            if (rand > 0.9) { // Health Pack
                color = 0xff0000;
                isHealthPack = true;
            } else if (rand > 0.7) { // Resource
                color = 0x228B22;
                isResource = true;
            } else { // Obstacle
                color = Math.random() * 0x888888 + 0x444444;
            }

            const material = new THREE.MeshStandardMaterial({ color });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 150,
                height / 2,
                (Math.random() - 0.5) * 150
            );
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube);
            
            if (isResource) resourceObjects.current.push(cube);
            if (isHealthPack) healthPacks.current.push(cube);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(50, 50, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        scene.add(directionalLight);

        // Rain
        const rainCount = 10000;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(rainCount * 3);
        for(let i = 0; i < rainCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 200;
            positions[i*3+1] = Math.random() * 100;
            positions[i*3+2] = (Math.random() - 0.5) * 200;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.2, transparent: true });
        const rain = new THREE.Points(rainGeo, rainMaterial);
        rain.visible = false;
        scene.add(rain);

        // Controls
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            keysPressed.current[key] = true;

            if (key === 'r') rain.visible = !rain.visible;
            if (key === ' ' && isGrounded.current) velocityY.current = JUMP_FORCE;

            if (key === 'e') {
                const playerPos = player.position;
                // Check for resources
                for (let i = resourceObjects.current.length - 1; i >= 0; i--) {
                    if (playerPos.distanceTo(resourceObjects.current[i].position) < 3) {
                        scene.remove(resourceObjects.current[i]);
                        resourceObjects.current.splice(i, 1);
                        onResourceCollected();
                        return; 
                    }
                }
                // Check for health packs
                for (let i = healthPacks.current.length - 1; i >= 0; i--) {
                    if (playerPos.distanceTo(healthPacks.current[i].position) < 3) {
                        scene.remove(healthPacks.current[i]);
                        healthPacks.current.splice(i, 1);
                        playerHealth.current = Math.min(100, playerHealth.current + 25);
                        onHealthUpdate(playerHealth.current);
                        return;
                    }
                }
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            keysPressed.current[event.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        const dayDuration = 120; // 2 minutes for a full day/night cycle
        
        const animate = () => {
            if (playerHealth.current <= 0) {
                 // Simple death state - could be expanded later
                (player.material as THREE.MeshStandardMaterial).color.set(0x555555);
                renderer.render(scene, camera);
                return;
            }

            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();
            const moveSpeed = 8 * delta;

            if (keysPressed.current['w']) player.position.z -= moveSpeed;
            if (keysPressed.current['s']) player.position.z += moveSpeed;
            if (keysPressed.current['a']) player.position.x -= moveSpeed;
            if (keysPressed.current['d']) player.position.x += moveSpeed;
            
            // Physics & Fall Damage
            if (!isGrounded.current) {
                velocityY.current -= GRAVITY * delta;
            }
            player.position.y += velocityY.current * delta;

            if (player.position.y <= 1) {
                player.position.y = 1;
                isGrounded.current = true;
                if (velocityY.current < -FALL_DAMAGE_THRESHOLD) {
                    const damage = Math.floor((Math.abs(velocityY.current) - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_MULTIPLIER);
                    playerHealth.current = Math.max(0, playerHealth.current - damage);
                    onHealthUpdate(playerHealth.current);
                }
                velocityY.current = 0;
            } else {
                isGrounded.current = false;
            }

            // Day/Night Cycle
            const sunAngle = (elapsedTime / dayDuration) * Math.PI * 2;
            directionalLight.position.x = 50 * Math.cos(sunAngle);
            directionalLight.position.y = 50 * Math.sin(sunAngle);

            const dayNightRatio = (Math.sin(sunAngle) + 1) / 2;
            directionalLight.intensity = 2.5 * dayNightRatio + 0.1;
            ambientLight.intensity = 0.5 * dayNightRatio + 0.1;
            // FIX: Add type check to ensure scene.background is a Color before using Color-specific methods.
            if (scene.background instanceof THREE.Color) {
                scene.background.lerpColors(nightColor, dayColor, dayNightRatio);
                if(scene.fog) scene.fog.color.copy(scene.background);
            }
            onTimeUpdate(dayNightRatio > 0.2 ? 'Day' : 'Night');

            // Rain animation
            if(rain.visible) {
                const positions = rain.geometry.attributes.position.array as Float32Array;
                for (let i = 0; i < rainCount; i++) {
                    positions[i * 3 + 1] -= 20 * delta;
                    if (positions[i * 3 + 1] < -10) {
                        positions[i * 3 + 1] = 100;
                    }
                }
                rain.geometry.attributes.position.needsUpdate = true;
            }

            // Make player face camera
            player.quaternion.copy(camera.quaternion);

            // Camera follows player
            const cameraOffset = new THREE.Vector3(0, 8, 10);
            const cameraPosition = player.position.clone().add(cameraOffset);
            camera.position.lerp(cameraPosition, 0.1);
            camera.lookAt(player.position);

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, [onResourceCollected, onTimeUpdate, onHealthUpdate]);

    return <div ref={mountRef} className="w-full h-full" />;
};

export default Game;
