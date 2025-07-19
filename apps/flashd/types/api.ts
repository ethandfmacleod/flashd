import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../api/src/routers/index'

// Base tRPC Router Types
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

// Auth Types
export type AuthGetSessionOutput = RouterOutputs['auth']['getSession']
export type AuthSignUpInput = RouterInputs['auth']['signUp']
export type AuthSignUpOutput = RouterOutputs['auth']['signUp']
export type AuthSignInInput = RouterInputs['auth']['signIn']
export type AuthSignInOutput = RouterOutputs['auth']['signIn']
export type AuthSignOutOutput = RouterOutputs['auth']['signOut']
export type AuthUpdateProfileInput = RouterInputs['auth']['updateProfile']
export type AuthUpdateProfileOutput = RouterOutputs['auth']['updateProfile']
export type AuthDeleteAccountOutput = RouterOutputs['auth']['deleteAccount']

// Deck Types
export type DeckGetUserDecksOutput = RouterOutputs['deck']['getUserDecks']
export type Deck = DeckGetUserDecksOutput[0]
export type DeckGetDeckInput = RouterInputs['deck']['getDeck']
export type DeckGetDeckOutput = RouterOutputs['deck']['getDeck']
export type DeckWithCards = DeckGetDeckOutput
export type DeckCreateInput = RouterInputs['deck']['createDeck']
export type DeckCreateOutput = RouterOutputs['deck']['createDeck']
export type DeckUpdateInput = RouterInputs['deck']['updateDeck']
export type DeckUpdateOutput = RouterOutputs['deck']['updateDeck']
export type DeckDeleteInput = RouterInputs['deck']['deleteDeck']
export type DeckDeleteOutput = RouterOutputs['deck']['deleteDeck']
export type DeckGetStatsInput = RouterInputs['deck']['getDeckStats']
export type DeckGetStatsOutput = RouterOutputs['deck']['getDeckStats']
export type DeckStats = DeckGetStatsOutput

// Card Types (extracted from deck with cards)
export type Card = NonNullable<DeckWithCards['cards']>[0]

// User Types
export type User = NonNullable<AuthGetSessionOutput['user']>
export type Session = NonNullable<AuthGetSessionOutput['session']>