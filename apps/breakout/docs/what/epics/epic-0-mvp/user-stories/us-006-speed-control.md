# User Story

## Story

En tant que joueur, je veux régler la vitesse de la balle via un slider accessible depuis le menu, afin d'ajuster la difficulté à mes préférences.

## Expected Behavior

Le slider de vitesse permet d'ajuster la vitesse de la balle de très lente à très rapide. Le changement est immédiat ou prend effet au prochain lancement de la partie. Le réglage persiste entre les parties.

## Acceptance Criteria

```gherkin
Given le menu accessible

When j'utilise le slider de vitesse (très lente à très rapide)
Then la vitesse change immédiatement ou au prochain lancement

When le slider est au minimum
Then la balle se déplace lentement

When au maximum
Then rapidement

Then le réglage persiste entre les parties
```

## Related Slices
