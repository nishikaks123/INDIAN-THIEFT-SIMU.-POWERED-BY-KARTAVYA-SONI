import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export interface Location {
    name: string;
    position: THREE.Vector3;
    size: THREE.Vector3;
    icon: string;
}

interface GameProps {
    onResourceCollected: () => void;
    onHealthUpdate: (health: number) => void;
    onPlayerMove: (pos: { x: number; z: number; rotationY: number }) => void;
    onLocationsLoaded: (locations: Location[]) => void;
}

// ... (constants remain largely the same)
const GRAVITY = 30, JUMP_FORCE = 10, FALL_DAMAGE_THRESHOLD = 15, FALL_DAMAGE_MULTIPLIER = 3;
const ENEMY_HEALTH = 50, ENEMY_SPEED = 2.5, ENEMY_DAMAGE = 10, ENEMY_ATTACK_COOLDOWN = 1.5;
const PLAYER_ATTACK_RANGE = 2.5, PLAYER_ATTACK_DAMAGE = 25, PLAYER_ATTACK_COOLDOWN = 0.5;

type Enemy = { mesh: THREE.Mesh; health: number; lastAttackTime: number; originalColor: THREE.Color; hitTime: number; };

const locations: Location[] = [
    { name: 'Hospital', position: new THREE.Vector3(50, 0, -80), size: new THREE.Vector3(20, 30, 15), icon: 'H' },
    { name: 'Police Station', position: new THREE.Vector3(-60, 0, 40), size: new THREE.Vector3(15, 25, 15), icon: 'P' },
    { name: 'Airport', position: new THREE.Vector3(150, 0, 150), size: new THREE.Vector3(80, 20, 100), icon: '✈' },
    { name: 'Safehouse', position: new THREE.Vector3(10, 0, 10), size: new THREE.Vector3(10, 15, 10), icon: '🏠' },
    { name: 'Ammu-Nation', position: new THREE.Vector3(-30, 0, -50), size: new THREE.Vector3(12, 10, 12), icon: '🔫' },
    { name: 'Car Mod Shop', position: new THREE.Vector3(80, 0, 20), size: new THREE.Vector3(25, 15, 20), icon: '🔧' },
    { name: 'Restaurant', position: new THREE.Vector3(0, 0, -60), size: new THREE.Vector3(15, 12, 15), icon: '🍔' },
    { name: 'Gas Station', position: new THREE.Vector3(90, 0, 90), size: new THREE.Vector3(18, 8, 12), icon: '⛽' },
    { name: 'Central Tower', position: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(20, 150, 20), icon: '✪' },
];

const Game: React.FC<GameProps> = ({ onResourceCollected, onHealthUpdate, onPlayerMove, onLocationsLoaded }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const buildings = useRef<THREE.Mesh[]>([]);
    const enemies = useRef<Enemy[]>([]);
    const playerHealth = useRef(100);
    const velocityY = useRef(0);
    const isGrounded = useRef(true);
    const playerAttackCooldown = useRef(0);
    const cameraMode = useRef(0); // 0: 3rd Person, 1: 2nd Person, 2: 1st Person

    useEffect(() => {
        if (!mountRef.current) return;
        onLocationsLoaded(locations);
        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 150, 400);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        currentMount.appendChild(renderer.domElement);
        
        // 2D Label Renderer
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        currentMount.appendChild(labelRenderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        
        const textureLoader = new THREE.TextureLoader();

        // Player
        const player = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 2),
            new THREE.MeshStandardMaterial({ map: textureLoader.load('assets/character.png'), transparent: true, side: THREE.DoubleSide, alphaTest: 0.1 })
        );
        player.position.set(0, 1, 5);
        player.castShadow = true;
        scene.add(player);
        
        // Ground
        const groundTexture = textureLoader.load('assets/utopia_map.png');
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500),
            new THREE.MeshStandardMaterial({ map: groundTexture })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // --- Location/Building Generation ---
        const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
        locations.forEach(loc => {
            const buildingGeo = new THREE.BoxGeometry(loc.size.x, loc.size.y, loc.size.z);
            const building = new THREE.Mesh(buildingGeo, buildingMaterial);
            building.position.set(loc.position.x, loc.size.y / 2, loc.position.z);
            building.castShadow = true;
            building.receiveShadow = true;
            scene.add(building);
            buildings.current.push(building);
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'label';
            labelDiv.textContent = loc.name;
            const label = new CSS2DObject(labelDiv);
            label.position.set(loc.position.x, loc.size.y + 5, loc.position.z);
            scene.add(label);
        });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(-100, 100, -50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Event Listeners
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            keysPressed.current[key] = true;
            if (key === ' ' && isGrounded.current) velocityY.current = JUMP_FORCE;
            if (key === 'v') cameraMode.current = (cameraMode.current + 1) % 3;
            if (key === 'f' && playerAttackCooldown.current <= 0) { /* ... attack logic ... */ }
            if (key === 'e') { /* ... collect logic ... */ }
        };
        const handleKeyUp = (event: KeyboardEvent) => { keysPressed.current[event.key.toLowerCase()] = false; };
        const handleMouseMove = (event: MouseEvent) => {
            if (cameraMode.current === 2) { // FPV mouse look
                player.rotation.y -= event.movementX * 0.002;
                camera.rotation.x -= event.movementY * 0.002;
                camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
            }
        };

        const handleClick = () => {
             if (cameraMode.current === 2) {
                currentMount.requestPointerLock();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        currentMount.addEventListener('click', handleClick);

        const clock = new THREE.Clock();
        const animate = () => {
            const delta = clock.getDelta();
            
            // Player Movement & Collision
            const playerSpeed = 8;
            const moveDistance = playerSpeed * delta;
            
            const moveDirection = new THREE.Vector3();
            if (keysPressed.current['w']) moveDirection.z -= 1;
            if (keysPressed.current['s']) moveDirection.z += 1;
            if (keysPressed.current['a']) moveDirection.x -= 1;
            if (keysPressed.current['d']) moveDirection.x += 1;
            moveDirection.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), player.rotation.y);

            const futurePos = player.position.clone().add(moveDirection.multiplyScalar(moveDistance));
            const playerBBox = new THREE.Box3().setFromCenterAndSize(futurePos, new THREE.Vector3(1, 2, 1));
            
            let collision = false;
            for (const building of buildings.current) {
                if (playerBBox.intersectsBox(new THREE.Box3().setFromObject(building))) {
                    collision = true;
                    break;
                }
            }
            if (!collision) player.position.copy(futurePos);
            
            // Physics
            if (!isGrounded.current) velocityY.current -= GRAVITY * delta;
            player.position.y += velocityY.current * delta;
            if (player.position.y <= 1) {
                player.position.y = 1; isGrounded.current = true; velocityY.current = 0;
            } else { isGrounded.current = false; }

            // Player Billboard
            player.quaternion.copy(camera.quaternion);

            // Camera Logic
            controls.enabled = cameraMode.current !== 2;
            player.visible = cameraMode.current !== 2;
            let cameraOffset: THREE.Vector3;
            switch(cameraMode.current) {
                case 0: // 3rd Person
                    cameraOffset = new THREE.Vector3(0, 10, 12);
                    break;
                case 1: // 2nd Person
                    cameraOffset = new THREE.Vector3(1.5, 3, 4);
                    break;
                case 2: // 1st Person
                    camera.position.copy(player.position).add(new THREE.Vector3(0, 1.6, 0));
                    camera.quaternion.setFromEuler(new THREE.Euler(camera.rotation.x, player.rotation.y, 0, 'YXZ'));
                    break;
            }

            if (cameraMode.current !== 2) {
                const targetPosition = player.position.clone().add(cameraOffset.applyQuaternion(camera.quaternion));
                camera.position.lerp(targetPosition, 0.1);
                controls.target.copy(player.position);
                controls.update();
            }

            // Update Minimap
            onPlayerMove({ x: player.position.x, z: player.position.z, rotationY: player.rotation.y });

            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        return () => { /* cleanup event listeners */ };
    }, [onResourceCollected, onHealthUpdate, onPlayerMove, onLocationsLoaded]);

    return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

export default Game;