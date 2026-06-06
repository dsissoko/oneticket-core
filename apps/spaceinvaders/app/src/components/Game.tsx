/**
 * Game Component - Main Space Invaders game
 */

import React, { useState, useRef, useEffect } from 'react'
import '../styles/responsive.css'
import { GameLoopManager } from '@/game/GameLoopManager'
import { RenderingSystem } from '@/game/RenderingSystem'
import { InputSystem } from '@/game/InputSystem'
import { StateMachine } from '@/game/StateMachine'
import { Formation } from '@/game/entities/Formation'
import { PlayerImpl, MysteryShipImpl } from '@/game/Entity'
import { ShieldImpl } from '@/game/Shield'
import { MysteryShipSpawner } from '@/game/entities/MysteryShip'
import { PhysicsSystem } from '@/game/physics/PhysicsSystem'
import { BulletPool } from '@/game/BulletPool'
import { WaveManager } from '@/game/managers/WaveManager'
import { ScoreManager } from '@/game/managers/ScoreManager'
import { LivesManager } from '@/game/managers/LivesManager'
import { VictoryDetector } from '@/game/systems/VictoryDetector'
import { RestartHandler } from '@/game/systems/RestartHandler'
import { WAVE_CONFIG } from '@/game/config/WaveConfig'
import StartScreen from './StartScreen'
import HUD from './HUD'
import VictoryScreen from './VictoryScreen'
import type { GameLoopState, GameState } from '@/game/types'

export function Game(): React.ReactElement {
  // React state for UI rendering
  const [gameState, setGameState] = useState<GameState>('Start')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [waveNumber, setWaveNumber] = useState(1)
  const [victoryCountdown, setVictoryCountdown] = useState(0)

  // Refs for game loop objects (not triggering re-renders)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<GameLoopManager | null>(null)
  const renderingSystemRef = useRef<RenderingSystem | null>(null)
  const inputSystemRef = useRef<InputSystem | null>(null)
  const stateMachineRef = useRef<StateMachine>(new StateMachine('Start'))
  const physicsSystemRef = useRef<PhysicsSystem | null>(null)
  const bulletPoolRef = useRef<BulletPool | null>(null)
  const waveManagerRef = useRef<WaveManager>(new WaveManager(1))
  const scoreManagerRef = useRef<ScoreManager>(new ScoreManager(0))
  const livesManagerRef = useRef<LivesManager>(new LivesManager(3))
  const victoryDetectorRef = useRef<VictoryDetector>(new VictoryDetector())
  const restartHandlerRef = useRef<RestartHandler>(new RestartHandler())
  const victoryTransitionTimerRef = useRef<number>(0)
  const lastFireTimeRef = useRef<number>(0) // Fire cooldown tracking
  const gameStateRef = useRef<GameLoopState>({
    formation: null,
    player: null,
    bullets: [],
    shields: [],
    mysteryShip: null,
    mysteryShipSpawner: null,
    inputState: { left: false, right: false, fire: false },
    score: 0,
    lives: 3,
    waveNumber: 1,
    gameState: 'Start',
    deltaTime: 0,
    lastFrameTime: 0
  })

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  /**
    * Initialize game when component mounts
    */
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // Initialize systems
    try {
      renderingSystemRef.current = new RenderingSystem(canvas)
      inputSystemRef.current = new InputSystem(window)

      // Initialize physics system with callbacks
      physicsSystemRef.current = new PhysicsSystem({
        onScoreChange: (newScore) => setScore(newScore),
        onLivesChange: (newLives) => setLives(newLives),
        onGameStateChange: (newState) => {
          if (newState === 'GameOver') {
            stateMachineRef.current.transitionTo('GameOver')
            setGameState('GameOver')
          }
        }
      })

      // Initialize bullet pool for enemy bullets
      bulletPoolRef.current = new BulletPool(10, 150)

      // Create game loop manager
      gameLoopRef.current = new GameLoopManager(
        canvas,
        handleGameUpdate,
        handleGameRender
      )

      // Start the game loop
      gameLoopRef.current.start()

      console.log('Game initialized successfully')
    } catch (error) {
      console.error('Failed to initialize game:', error)
    }

    // Cleanup on unmount
    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.stop()
      }
      if (inputSystemRef.current) {
        inputSystemRef.current.destroy()
      }
    }
  }, [])

  /**
    * Handle game state updates (called by game loop each frame)
    */
  const handleGameUpdate = (deltaTime: number): void => {
    const state = gameStateRef.current
    const stateMachine = stateMachineRef.current

    state.deltaTime = deltaTime

    // Only update entities if game is in Playing state
    if (stateMachine.getState() === 'Playing') {
      const inputState = inputSystemRef.current?.getInputState() ?? state.inputState

        // Update player
        if (state.player) {
          const player = state.player as PlayerImpl
          player.update(deltaTime, inputState)

          // Handle firing - fire only when input is pressed, max bullets not reached, and cooldown elapsed
          if (inputState.fire && player.bullets.length < player.maxBullets) {
            const now = Date.now()
            const timeSinceLastFire = now - lastFireTimeRef.current
            const FIRE_COOLDOWN = 150 // milliseconds

            if (timeSinceLastFire > FIRE_COOLDOWN) {
              const bullet = player.fire()
              if (bullet) {
                // Push bullet to state.bullets for collision detection
                state.bullets.push(bullet)
                lastFireTimeRef.current = now
              }
            }
          }
        }

      // Update formation
      if (state.formation) {
        state.formation.update(deltaTime, state.waveNumber)

        // Check if formation reached bottom (handled by collision system)
        // But keep this check as fallback
        if (state.formation.hasReachedBottom()) {
          console.log('Formation reached bottom — GameOver')
          stateMachine.transitionTo('GameOver')
          setGameState('GameOver')
        }
      }

      // ============================================================
      // MYSTERY SHIP UPDATE PHASE
      // ============================================================
      // Update mystery ship spawner
      if (state.mysteryShipSpawner) {
        const currentTime = performance.now()
        
        // Check if we need to spawn a new ship
        if (!state.mysteryShip || !state.mysteryShip.alive) {
          if (state.mysteryShipSpawner.isSpawnTime(currentTime)) {
            const shipParams = state.mysteryShipSpawner.createShip(
              currentTime,
              CANVAS_WIDTH
            )
            // Create new mystery ship using MysteryShipImpl
            state.mysteryShip = new MysteryShipImpl(
              shipParams.x,
              shipParams.y,
              shipParams.vx,
              shipParams.pointValue,
              currentTime
            )
            state.mysteryShipSpawner.scheduleNextSpawn(currentTime)
          }
        }
        
        // Update active mystery ship position
        if (state.mysteryShip && state.mysteryShip.alive) {
          const stillOnScreen = state.mysteryShip.update(
            deltaTime,
            CANVAS_WIDTH
          )
          if (!stillOnScreen) {
            console.log(
              `Mystery ship escaped. Next spawn in ${(state.mysteryShipSpawner.getNextSpawnTime() - currentTime).toFixed(0)}ms`
            )
            state.mysteryShip = null
          }
        }
      }

      // Update enemy bullets (future implementation)
      // For now, keep the simple bullet update for collision prep
      state.bullets = state.bullets.filter((bullet) => {
        if (bullet.type === 'player') {
          // Player bullets are managed by Player entity
          return (bullet as any).active && bullet.y >= 0 && bullet.y <= CANVAS_HEIGHT
        } else {
          // Enemy bullets will be handled in later slices
          return bullet.y >= 0 && bullet.y <= CANVAS_HEIGHT
        }
      })

      // ============================================================
      // COLLISION DETECTION & RESPONSE PHASE
      // ============================================================
      if (physicsSystemRef.current && state.player) {
        // Separate player and enemy bullets
        const playerBullets = state.bullets.filter((b) => b.type === 'player')
        const enemyBullets = state.bullets.filter((b) => b.type === 'enemy')

        // Run collision detection and response
        const physicsResult = physicsSystemRef.current.update(
          state.formation,
          state.player,
          playerBullets as any,
          enemyBullets as any,
          state.shields,
          state.mysteryShip,
          { score: state.score, lives: state.lives }
        )

        // Update game state with collision results
        state.score = physicsResult.score
        state.lives = physicsResult.lives

        // Update React state
        setScore(state.score)
        setLives(state.lives)

        // Handle game over from collision
        if (physicsResult.gameOverTriggered) {
          stateMachine.transitionTo('GameOver')
          setGameState('GameOver')
        }

        // Remove inactive bullets from game state
        state.bullets = state.bullets.filter((bullet) => (bullet as any).active)
      }

      // ============================================================
      // VICTORY DETECTION PHASE
      // ============================================================
      if (victoryDetectorRef.current && state.formation) {
        if (victoryDetectorRef.current.checkVictory(state.formation)) {
          // Victory condition met - all enemies destroyed
          if (stateMachine.getState() === 'Playing') {
            console.log(`Wave ${state.waveNumber} complete!`)
            stateMachine.transitionTo('Victory')
            setGameState('Victory')
            victoryTransitionTimerRef.current = WAVE_CONFIG.VICTORY_TRANSITION_DELAY
            setVictoryCountdown(WAVE_CONFIG.VICTORY_TRANSITION_DELAY)
          }
        }
      }
    } else if (stateMachine.getState() === 'Victory') {
      // ============================================================
      // VICTORY STATE - COUNTDOWN & WAVE PROGRESSION
      // ============================================================
      // Decrement victory transition timer
      victoryTransitionTimerRef.current -= deltaTime
      setVictoryCountdown(Math.max(0, victoryTransitionTimerRef.current))

      // When timer expires, progress to next wave
      if (victoryTransitionTimerRef.current <= 0) {
        console.log('Victory transition complete - progressing to next wave')

        // Increment wave
        waveManagerRef.current.incrementWave()
        const newWave = waveManagerRef.current.getWave()

        // Reset lives
        livesManagerRef.current.resetLives()
        const newLives = livesManagerRef.current.getLives()

        // Score persists (NOT reset)
        // Formation respawns with new wave
        if (gameStateRef.current.formation) {
          gameStateRef.current.formation.resetForWave(newWave)
        }

        // Clear all bullets
        gameStateRef.current.bullets = []

        // Update game state
        gameStateRef.current.waveNumber = newWave
        gameStateRef.current.lives = newLives
        gameStateRef.current.gameState = 'Playing'

        // Transition to Playing
        stateMachine.transitionTo('Playing')
        setGameState('Playing')
        setWaveNumber(newWave)
        setLives(newLives)
      }
    }
  }

  /**
   * Handle game rendering (called by game loop each frame)
   */
  const handleGameRender = (): void => {
    const renderingSystem = renderingSystemRef.current
    if (!renderingSystem) return

    const state = gameStateRef.current

    // Clear canvas
    renderingSystem.clear()

    // Draw game entities
    if (stateMachineRef.current.getState() === 'Playing') {
      renderingSystem.drawFormation(state.formation)
      renderingSystem.drawPlayer(state.player)
      renderingSystem.drawBullets(state.player?.bullets ?? [])
      renderingSystem.drawShields(state.shields)
      renderingSystem.drawMysteryShip(state.mysteryShip)
      renderingSystem.drawHUD(state.score, state.lives, state.waveNumber)
    } else if (stateMachineRef.current.getState() === 'Victory') {
      renderingSystem.drawHUD(state.score, state.lives, state.waveNumber)
      renderingSystem.drawMessage('VICTORY', '#00FF00')
    } else if (stateMachineRef.current.getState() === 'GameOver') {
      renderingSystem.drawHUD(state.score, state.lives, state.waveNumber)
      renderingSystem.drawMessage('GAME OVER', '#FF0000')
    }
  }

  /**
    * Handle start button click
    */
  const handleStartGame = (): void => {
    const state = gameStateRef.current

    // Initialize managers for fresh game
    waveManagerRef.current = new WaveManager(1)
    scoreManagerRef.current = new ScoreManager(0)
    livesManagerRef.current = new LivesManager(3)
    victoryDetectorRef.current = new VictoryDetector()
    victoryTransitionTimerRef.current = 0
    lastFireTimeRef.current = 0 // Reset fire cooldown

    // Transition state machine
    stateMachineRef.current.transitionTo('Playing')
    setGameState('Playing')

    // Initialize game entities
    state.formation = new Formation(CANVAS_WIDTH, CANVAS_HEIGHT)
    state.formation.initialize(1) // Wave 1
    state.player = new PlayerImpl(CANVAS_WIDTH, CANVAS_HEIGHT)
    state.bullets = []

    // Initialize mystery ship spawner
    const currentTime = performance.now()
    state.mysteryShipSpawner = new MysteryShipSpawner(currentTime)
    state.mysteryShip = null

    // Initialize 4 shields positioned horizontally across canvas
    // Shield width: 48 pixels (4x4 grid of 12px segments)
    // Positions: approximately 25%, 41%, 59%, 75% of canvas width
    // y position: 350 (between formation and player)
    const shieldWidth = 48
    const shieldY = 350
    const shieldPositions = [
      (CANVAS_WIDTH * 0.25) - (shieldWidth / 2), // 25% centered
      (CANVAS_WIDTH * 0.41) - (shieldWidth / 2), // 41% centered
      (CANVAS_WIDTH * 0.59) - (shieldWidth / 2), // 59% centered
      (CANVAS_WIDTH * 0.75) - (shieldWidth / 2) // 75% centered
    ]
    state.shields = shieldPositions.map((x) => new ShieldImpl(x, shieldY))
    state.score = 0
    state.lives = 3
    state.waveNumber = 1
    state.gameState = 'Playing'

    // Update React state
    setScore(0)
    setLives(3)
    setWaveNumber(1)
    setVictoryCountdown(0)

    console.log('Game started - Wave 1')
  }

  /**
    * Handle restart button click (from game over screen)
    */
  const handleRestart = (): void => {
    // Reset all game state
    restartHandlerRef.current.reset(gameStateRef.current)

    // Reset managers
    waveManagerRef.current = new WaveManager(1)
    scoreManagerRef.current = new ScoreManager(0)
    livesManagerRef.current = new LivesManager(3)
    victoryDetectorRef.current = new VictoryDetector()
    victoryTransitionTimerRef.current = 0
    lastFireTimeRef.current = 0 // Reset fire cooldown

    // Reset state machine
    stateMachineRef.current.reset()
    setGameState('Start')
    setScore(0)
    setLives(3)
    setWaveNumber(1)
    setVictoryCountdown(0)

    console.log('Game restarted - returning to Start screen')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        {/* Canvas element */}
        <canvas
          ref={canvasRef}
          className="border-4 border-green-400 block bg-black"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated'
          }}
        />

        {/* HUD overlay during gameplay */}
        {gameState === 'Playing' && (
          <HUD score={score} lives={lives} waveNumber={waveNumber} />
        )}

        {/* Start screen overlay */}
        {gameState === 'Start' && <StartScreen onStartGame={handleStartGame} />}

        {/* Victory overlay */}
        {gameState === 'Victory' && (
          <VictoryScreen
            waveNumber={waveNumber}
            score={score}
            countdown={victoryCountdown}
          />
        )}

        {/* Game Over overlay */}
        {gameState === 'GameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-red-500 mb-4 font-mono">
                GAME OVER
              </h1>
              <p className="text-xl text-red-400 mb-2 font-mono">
                Wave Reached: {waveNumber}
              </p>
              <p className="text-2xl text-red-400 font-bold mb-8 font-mono">
                Final Score: {score}
              </p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition font-mono"
              >
                RESTART
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="mt-4 text-green-400 font-mono text-sm">
        <p>Canvas: {CANVAS_WIDTH}×{CANVAS_HEIGHT}</p>
        <p>State: {gameState}</p>
      </div>
    </div>
  )
}

export default Game
