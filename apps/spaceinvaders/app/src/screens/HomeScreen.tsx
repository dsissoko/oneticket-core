/**
 * HomeScreen Component
 *
 * Landing page of the application served at `/`.
 * Now serves as the main Space Invaders game screen.
 */

import React from 'react'
import Game from '@/components/Game'

export function HomeScreen(): React.ReactElement {
  return <Game />
}

export default HomeScreen
