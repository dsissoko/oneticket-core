/**
 * Game Component - Main Space Invaders game
 * Layout: Breakout pattern — canvas fills flex-grow container, fully responsive
 */

import React, { useRef, useEffect } from 'react'
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
import type { GameLoopState, GameState } from '@/game/types'

export function Game(): React.ReactElement {
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
  const lastFireTimeRef = useRef<number>(0)

  // Touch state — Breakout pattern
  const touchRef = useRef<{
    active: boolean
    startX: number
    currentX: number
    startY: number
    hasFired: boolean
  }>({ active: false, startX: 0, currentX: 0, startY: 0, hasFired: false })

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

  // Separate ref for render-only state (no React re-renders)
  const uiStateRef = useRef<{
    score: number
    lives: number
    waveNumber: number
    victoryCountdown: number
  }>({ score: 0, lives: 3, waveNumber: 1, victoryCountdown: 0 })

  const handleStartGame = (): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width
    const h = canvas.height
    const state = gameStateRef.current

    waveManagerRef.current = new WaveManager(1)
    scoreManagerRef.current = new ScoreManager(0)
    livesManagerRef.current = new LivesManager(3)
    victoryDetectorRef.current = new VictoryDetector()
    victoryTransitionTimerRef.current = 0
    lastFireTimeRef.current = 0

    stateMachineRef.current.transitionTo('Playing')
    state.gameState = 'Playing'

    state.formation = new Formation(w, h)
    state.formation.initialize(1)
    state.player = new PlayerImpl(w, h)
    state.bullets = []

    const currentTime = performance.now()
    state.mysteryShipSpawner = new MysteryShipSpawner(currentTime)
    state.mysteryShip = null

    const shieldWidth = Math.round(w * 0.06)
    const shieldY = Math.round(h * 0.75)
    const shieldPositions = [0.25, 0.41, 0.59, 0.75].map(p => Math.round(w * p) - shieldWidth / 2)
    state.shields = shieldPositions.map(x => new ShieldImpl(x, shieldY))

    state.score = 0
    state.lives = 3
    state.waveNumber = 1
    uiStateRef.current = { score: 0, lives: 3, waveNumber: 1, victoryCountdown: 0 }
  }

  const handleRestart = (): void => {
    restartHandlerRef.current.reset(gameStateRef.current)
    waveManagerRef.current = new WaveManager(1)
    scoreManagerRef.current = new ScoreManager(0)
    livesManagerRef.current = new LivesManager(3)
    victoryDetectorRef.current = new VictoryDetector()
    victoryTransitionTimerRef.current = 0
    lastFireTimeRef.current = 0
    stateMachineRef.current.reset()
    gameStateRef.current.gameState = 'Start'
    uiStateRef.current = { score: 0, lives: 3, waveNumber: 1, victoryCountdown: 0 }
  }

  const handleGameUpdate = (deltaTime: number): void => {
    const state = gameStateRef.current
    const stateMachine = stateMachineRef.current
    const ui = uiStateRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    state.deltaTime = deltaTime

    if (stateMachine.getState() === 'Playing') {
      // Apply touch input each frame — Breakout pattern
      if (inputSystemRef.current) {
        const touch = touchRef.current
        if (touch.active) {
          const rect = canvas.getBoundingClientRect()
          const normalizedY = (touch.startY - rect.top) / rect.height
          const deltaX = touch.currentX - touch.startX
          if (normalizedY > 0.7) {
            inputSystemRef.current.setLeft(deltaX < -5)
            inputSystemRef.current.setRight(deltaX > 5)
            inputSystemRef.current.setFire(false)
            touchRef.current.startX = touch.currentX
          } else {
            inputSystemRef.current.setLeft(false)
            inputSystemRef.current.setRight(false)
            if (!touch.hasFired) {
              inputSystemRef.current.setFire(true)
              touchRef.current.hasFired = true
            }
          }
        } else {
          inputSystemRef.current.setLeft(false)
          inputSystemRef.current.setRight(false)
          inputSystemRef.current.setFire(false)
        }
      }

      const inputState = inputSystemRef.current?.getInputState() ?? state.inputState

      if (state.player) {
        const player = state.player as PlayerImpl
        player.update(deltaTime, inputState)

        if (inputState.fire && player.bullets.length < player.maxBullets) {
          const now = Date.now()
          if (now - lastFireTimeRef.current > 150) {
            const bullet = player.fire()
            if (bullet) {
              state.bullets.push(bullet)
              lastFireTimeRef.current = now
            }
          }
        }
      }

      if (state.formation) {
        state.formation.update(deltaTime, state.waveNumber)
        if (state.formation.hasReachedBottom()) {
          stateMachine.transitionTo('GameOver')
          state.gameState = 'GameOver'
        }
      }

      if (state.mysteryShipSpawner) {
        const currentTime = performance.now()
        if (!state.mysteryShip || !state.mysteryShip.alive) {
          if (state.mysteryShipSpawner.isSpawnTime(currentTime)) {
            const shipParams = state.mysteryShipSpawner.createShip(currentTime, canvas.width)
            state.mysteryShip = new MysteryShipImpl(shipParams.x, shipParams.y, shipParams.vx, shipParams.pointValue, currentTime)
            state.mysteryShipSpawner.scheduleNextSpawn(currentTime)
          }
        }
        if (state.mysteryShip && state.mysteryShip.alive) {
          const stillOnScreen = state.mysteryShip.update(deltaTime, canvas.width)
          if (!stillOnScreen) state.mysteryShip = null
        }
      }

      state.bullets = state.bullets.filter((bullet) => {
        if (bullet.type === 'player') return (bullet as any).active && bullet.y >= 0 && bullet.y <= canvas.height
        return bullet.y >= 0 && bullet.y <= canvas.height
      })

      if (physicsSystemRef.current && state.player) {
        const playerBullets = state.bullets.filter(b => b.type === 'player')
        const enemyBullets = state.bullets.filter(b => b.type === 'enemy')
        const result = physicsSystemRef.current.update(
          state.formation, state.player,
          playerBullets as any, enemyBullets as any,
          state.shields, state.mysteryShip,
          { score: state.score, lives: state.lives }
        )
        state.score = result.score
        state.lives = result.lives
        ui.score = state.score
        ui.lives = state.lives
        if (result.gameOverTriggered) {
          stateMachine.transitionTo('GameOver')
          state.gameState = 'GameOver'
        }
        state.bullets = state.bullets.filter(b => (b as any).active)
      }

      if (victoryDetectorRef.current && state.formation) {
        if (victoryDetectorRef.current.checkVictory(state.formation) && stateMachine.getState() === 'Playing') {
          stateMachine.transitionTo('Victory')
          state.gameState = 'Victory'
          victoryTransitionTimerRef.current = WAVE_CONFIG.VICTORY_TRANSITION_DELAY
          ui.victoryCountdown = WAVE_CONFIG.VICTORY_TRANSITION_DELAY
        }
      }
    } else if (stateMachine.getState() === 'Victory') {
      victoryTransitionTimerRef.current -= deltaTime
      ui.victoryCountdown = Math.max(0, victoryTransitionTimerRef.current)

      if (victoryTransitionTimerRef.current <= 0) {
        waveManagerRef.current.incrementWave()
        const newWave = waveManagerRef.current.getWave()
        livesManagerRef.current.resetLives()
        const newLives = livesManagerRef.current.getLives()

        if (state.formation) state.formation.resetForWave(newWave)
        state.bullets = []
        state.waveNumber = newWave
        state.lives = newLives
        state.gameState = 'Playing'
        ui.waveNumber = newWave
        ui.lives = newLives
        stateMachine.transitionTo('Playing')
      }
    }
  }

  const handleGameRender = (): void => {
    const rs = renderingSystemRef.current
    if (!rs) return
    const state = gameStateRef.current
    const ui = uiStateRef.current
    const sm = stateMachineRef.current.getState()

    rs.clear()

    if (sm === 'Playing') {
      rs.drawFormation(state.formation)
      rs.drawPlayer(state.player)
      rs.drawBullets(state.player?.bullets ?? [])
      rs.drawShields(state.shields)
      rs.drawMysteryShip(state.mysteryShip)
      rs.drawHUD(ui.score, ui.lives, ui.waveNumber)
    } else if (sm === 'Victory') {
      rs.drawFormation(state.formation)
      rs.drawPlayer(state.player)
      rs.drawShields(state.shields)
      rs.drawVictory(ui.score, ui.waveNumber, ui.victoryCountdown)
    } else if (sm === 'GameOver') {
      rs.drawGameOver(ui.score, ui.lives, ui.waveNumber)
    } else {
      // Start screen
      rs.drawStartScreen()
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Responsive sizing — Breakout pattern
    const updateCanvasSize = () => {
      const parent = canvas.parentElement
      canvas.width = parent ? parent.clientWidth : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Initialize systems
    renderingSystemRef.current = new RenderingSystem(canvas)
    inputSystemRef.current = new InputSystem(window)
    physicsSystemRef.current = new PhysicsSystem({
      onScoreChange: () => {},
      onLivesChange: () => {},
      onGameStateChange: () => {}
    })
    bulletPoolRef.current = new BulletPool(10, 150)
    gameLoopRef.current = new GameLoopManager(canvas, handleGameUpdate, handleGameRender)
    gameLoopRef.current.start()

    // Touch listeners on canvas — Breakout pattern (passive: false prevents page scroll)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return
      const touch = e.touches[0]
      const sm = stateMachineRef.current.getState()

      if (sm === 'Start') {
        // Check start button hit
        const rect = canvas.getBoundingClientRect()
        const x = (touch.clientX - rect.left) * (canvas.width / rect.width)
        const y = (touch.clientY - rect.top) * (canvas.height / rect.height)
        if (renderingSystemRef.current?.isStartButtonHit(x, y)) handleStartGame()
        return
      }
      if (sm === 'GameOver') {
        const rect = canvas.getBoundingClientRect()
        const x = (touch.clientX - rect.left) * (canvas.width / rect.width)
        const y = (touch.clientY - rect.top) * (canvas.height / rect.height)
        if (renderingSystemRef.current?.isRestartButtonHit(x, y)) handleRestart()
        return
      }

      touchRef.current = { active: true, startX: touch.clientX, currentX: touch.clientX, startY: touch.clientY, hasFired: false }
      e.preventDefault()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchRef.current.active || e.touches.length === 0) return
      touchRef.current.currentX = e.touches[0].clientX
      e.preventDefault()
    }
    const onTouchEnd = () => { touchRef.current.active = false }

    // Click handler for Start/Restart buttons on desktop
    const onCanvasClick = (e: MouseEvent) => {
      const sm = stateMachineRef.current.getState()
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)
      if (sm === 'Start' && renderingSystemRef.current?.isStartButtonHit(x, y)) handleStartGame()
      if (sm === 'GameOver' && renderingSystemRef.current?.isRestartButtonHit(x, y)) handleRestart()
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('click', onCanvasClick)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      gameLoopRef.current?.stop()
      inputSystemRef.current?.destroy()
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('click', onCanvasClick)
    }
  }, [])

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', cursor: 'default' }}
      />
    </div>
  )
}

export default Game
