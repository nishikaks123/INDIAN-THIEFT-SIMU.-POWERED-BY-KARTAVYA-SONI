import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface GameProps {
    onResourceCollected: () => void;
    onHealthUpdate: (health: number) => void;
}

// Physics & Damage Constants
const GRAVITY = 30;
const JUMP_FORCE = 10;
const FALL_DAMAGE_THRESHOLD = 15;
const FALL_DAMAGE_MULTIPLIER = 3;

// Combat Constants
const ENEMY_HEALTH = 50;
const ENEMY_SPEED = 2.5;
const ENEMY_DAMAGE = 10;
const ENEMY_ATTACK_COOLDOWN = 1.5; // seconds
const PLAYER_ATTACK_RANGE = 2.5;
const PLAYER_ATTACK_DAMAGE = 25;
const PLAYER_ATTACK_COOLDOWN = 0.5; // seconds

type Enemy = {
    mesh: THREE.Mesh;
    health: number;
    lastAttackTime: number;
    originalColor: THREE.Color;
    hitTime: number;
};

const Game: React.FC<GameProps> = ({ onResourceCollected, onHealthUpdate }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    
    // Game state refs
    const buildings = useRef<THREE.Mesh[]>([]);
    const resourceObjects = useRef<THREE.Mesh[]>([]);
    const healthPacks = useRef<THREE.Mesh[]>([]);
    const enemies = useRef<Enemy[]>([]);
    const playerHealth = useRef(100);
    const velocityY = useRef(0);
    const isGrounded = useRef(true);
    const playerAttackCooldown = useRef(0);


    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050515);
        scene.fog = new THREE.Fog(0x050515, 50, 200);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        currentMount.appendChild(renderer.domElement);

        const textureLoader = new THREE.TextureLoader();

        // Player
        const playerTexture = textureLoader.load('assets/character.png');
        const playerGeometry = new THREE.PlaneGeometry(1.5, 2);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            map: playerTexture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
         });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(0, 1, 5);
        player.castShadow = true;
        scene.add(player);
        
        // Ground
        const groundTexture = textureLoader.load('assets/city_map.png');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            map: groundTexture,
            emissive: 0xffffff,
            emissiveMap: groundTexture,
            emissiveIntensity: 0.6
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // --- Procedural City Generation ---
        const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.5 });
        
        const createBuilding = (x: number, z: number, width: number, depth: number, height: number) => {
            const buildingGeo = new THREE.BoxGeometry(width, height, depth);
            const building = new THREE.Mesh(buildingGeo, buildingMaterial.clone());
            building.position.set(x, height / 2, z);
            building.castShadow = true;
            building.receiveShadow = true;
            scene.add(building);
            buildings.current.push(building);
        };

        // Downtown area
        for(let i = 0; i < 50; i++) {
            const x = THREE.MathUtils.randFloat(-60, 60);
            const z = THREE.MathUtils.randFloat(-60, 60);
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue; // central park
            const width = THREE.MathUtils.randFloat(5, 15);
            const depth = THREE.MathUtils.randFloat(5, 15);
            const height = THREE.MathUtils.randFloat(20, 100);
            createBuilding(x, z, width, depth, height);
        }
        // Suburbs
         for(let i = 0; i < 100; i++) {
            const x = THREE.MathUtils.randFloatSpread(200);
            const z = THREE.MathUtils.randFloatSpread(200);
            if(Math.abs(x) < 60 && Math.abs(z) < 60) continue;
            const width = THREE.MathUtils.randFloat(4, 8);
            const depth = THREE.MathUtils.randFloat(4, 8);
            const height = THREE.MathUtils.randFloat(5, 20);
            createBuilding(x, z, width, depth, height);
        }
        // --- End City Generation ---

        // --- Spawn Gameplay Objects ---
        const spawnPoints = [
            new THREE.Vector3(10, 0, 10), new THREE.Vector3(-15, 0, -20), new THREE.Vector3(30, 0, -10),
            new THREE.Vector3(5, 0, 40), new THREE.Vector3(-25, 0, 15), new THREE.Vector3(-40, 0, 40)
        ];

        spawnPoints.forEach((pos, index) => {
            if (index % 3 === 0) { // Health Pack
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                const pack = new THREE.Mesh(geometry, material);
                pack.position.copy(pos);
                pack.position.y = 0.5;
                pack.castShadow = true;
                scene.add(pack);
                healthPacks.current.push(pack);
            } else if (index % 3 === 1) { // Enemy
                 const geometry = new THREE.CapsuleGeometry(0.5, 0.5, 4, 8);
                const material = new THREE.MeshStandardMaterial({ color: 0x8A2BE2 });
                const enemyMesh = new THREE.Mesh(geometry, material);
                enemyMesh.position.copy(pos);
                enemyMesh.position.y = 0.75;
                enemyMesh.castShadow = true;
                scene.add(enemyMesh);
                enemies.current.push({ 
                    mesh: enemyMesh, 
                    health: ENEMY_HEALTH, 
                    lastAttackTime: 0,
                    originalColor: material.color.clone(),
                    hitTime: -1,
                });
            } else { // Resource
                const height = 1.5;
                const geometry = new THREE.BoxGeometry(1, height, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                const resource = new THREE.Mesh(geometry, material);
                resource.position.copy(pos);
                resource.position.y = height / 2;
                resource.castShadow = true;
                scene.add(resource);
                resourceObjects.current.push(resource);
            }
        });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x4040ff, 0.3);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x8080ff, 0.5);
        directionalLight.position.set(-100, 100, -50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        scene.add(directionalLight);

        // Controls
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            keysPressed.current[key] = true;

            if (key === ' ' && isGrounded.current) velocityY.current = JUMP_FORCE;

            if (key === 'f' && playerAttackCooldown.current <= 0) {
                playerAttackCooldown.current = PLAYER_ATTACK_COOLDOWN;
                // Attack logic
                enemies.current.forEach(enemy => {
                    if (player.position.distanceTo(enemy.mesh.position) < PLAYER_ATTACK_RANGE) {
                        enemy.health -= PLAYER_ATTACK_DAMAGE;
                        enemy.hitTime = clock.getElapsedTime();
                    }
                });
            }

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
        
        const animate = () => {
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            if (playerHealth.current <= 0) {
                (player.material as THREE.MeshStandardMaterial).color.set(0x555555);
                 renderer.render(scene, camera);
                 requestAnimationFrame(animate); // Keep rendering but stop updates
                 return;
            }

            // Player movement with collision
            const playerSpeed = 8;
            const moveDistance = playerSpeed * delta;
            const playerSize = new THREE.Vector3(1.5, 2, 1.5);

            // Z-axis movement & collision
            const futurePosZ = player.position.clone();
            if (keysPressed.current['w']) futurePosZ.z -= moveDistance;
            if (keysPressed.current['s']) futurePosZ.z += moveDistance;
            const playerBBoxZ = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(player.position.x, futurePosZ.y, futurePosZ.z), playerSize);
            let collisionZ = false;
            for (const building of buildings.current) {
                const buildingBBox = new THREE.Box3().setFromObject(building);
                if (playerBBoxZ.intersectsBox(buildingBBox)) {
                    collisionZ = true;
                    break;
                }
            }
            if (!collisionZ) {
                player.position.z = futurePosZ.z;
            }

            // X-axis movement & collision
            const futurePosX = player.position.clone();
            if (keysPressed.current['a']) futurePosX.x -= moveDistance;
            if (keysPressed.current['d']) futurePosX.x += moveDistance;
            const playerBBoxX = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(futurePosX.x, player.position.y, player.position.z), playerSize);
            let collisionX = false;
            for (const building of buildings.current) {
                const buildingBBox = new THREE.Box3().setFromObject(building);
                if (playerBBoxX.intersectsBox(buildingBBox)) {
                    collisionX = true;
                    break;
                }
            }
            if (!collisionX) {
                player.position.x = futurePosX.x;
            }

            // Player Physics & Fall Damage
            if (!isGrounded.current) {
                velocityY.current -= GRAVITY * delta;
            }
            player.position.y += velocityY.current * delta;

            if (player.position.y <= 1) {
                player.position.y = 1;
                if (!isGrounded.current && velocityY.current < -FALL_DAMAGE_THRESHOLD) {
                    const damage = Math.floor((Math.abs(velocityY.current) - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_MULTIPLIER);
                    playerHealth.current = Math.max(0, playerHealth.current - damage);
                    onHealthUpdate(playerHealth.current);
                }
                isGrounded.current = true;
                velocityY.current = 0;
            } else {
                isGrounded.current = false;
            }
            
            // Player attack cooldown
            if (playerAttackCooldown.current > 0) {
                playerAttackCooldown.current -= delta;
            }

            // Enemy AI and Logic
            for (let i = enemies.current.length - 1; i >= 0; i--) {
                const enemy = enemies.current[i];
                if(enemy.health <= 0) {
                    scene.remove(enemy.mesh);
                    enemies.current.splice(i, 1);
                    continue;
                }

                if (enemy.hitTime > 0 && elapsedTime - enemy.hitTime < 0.2) {
                    (enemy.mesh.material as THREE.MeshStandardMaterial).color.set(0xff0000);
                } else {
                    (enemy.mesh.material as THREE.MeshStandardMaterial).color.copy(enemy.originalColor);
                }

                const distanceToPlayer = player.position.distanceTo(enemy.mesh.position);
                if (distanceToPlayer < 25) { // Aggro range
                    const direction = player.position.clone().sub(enemy.mesh.position).normalize();
                    enemy.mesh.position.add(direction.multiplyScalar(ENEMY_SPEED * delta));
                    enemy.mesh.position.y = 0.75; // Keep slime on the ground
                    enemy.mesh.lookAt(player.position);
                }

                if (distanceToPlayer < 1.5 && elapsedTime - enemy.lastAttackTime > ENEMY_ATTACK_COOLDOWN) {
                    enemy.lastAttackTime = elapsedTime;
                    playerHealth.current = Math.max(0, playerHealth.current - ENEMY_DAMAGE);
                    onHealthUpdate(playerHealth.current);
                }
            }

            // Make player face camera
            player.quaternion.copy(camera.quaternion);

            // Camera follows player
            const cameraOffset = new THREE.Vector3(0, 10, 12);
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
    }, [onResourceCollected, onHealthUpdate]);

    return <div ref={mountRef} className="w-full h-full" />;
};

export default Game;