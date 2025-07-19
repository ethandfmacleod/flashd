import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { db } from '../lib/db'
import { isAuth } from '../trpc/middleware'
import { publicProcedure, router } from '../trpc/utils'

export const deckRouter = router({
  // Get all decks for user
  getUserDecks: publicProcedure.use(isAuth).query(async ({ ctx }) => {
    const decks = await db.deck.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return decks.map((deck) => ({
      ...deck,
      cardCount: deck._count.cards,
    }))
  }),

  // Get a single deck with cards
  getDeck: publicProcedure
    .use(isAuth)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const deck = await db.deck.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          cards: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          _count: {
            select: {
              cards: true,
            },
          },
        },
      })

      if (!deck) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deck not found' })

      return {
        ...deck,
        cardCount: deck._count.cards,
      }
    }),

  // Create new deck
  createDeck: publicProcedure
    .use(isAuth)
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z.string().optional(),
        isPublic: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const deck = await db.deck.create({
        data: {
          title: input.title,
          description: input.description,
          color: input.color,
          isPublic: input.isPublic,
          userId: ctx.user.id,
        },
        include: {
          _count: {
            select: {
              cards: true,
            },
          },
        },
      })

      return {
        ...deck,
        cardCount: deck._count.cards,
      }
    }),

  // Update a deck
  updateDeck: publicProcedure
    .use(isAuth)
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Verify deck ownership
      const existingDeck = await db.deck.findFirst({
        where: { id, userId: ctx.user.id },
      })

      if (!existingDeck) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deck not found' })

      const deck = await db.deck.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              cards: true,
            },
          },
        },
      })

      return {
        ...deck,
        cardCount: deck._count.cards,
      }
    }),

  // Delete a deck
  deleteDeck: publicProcedure
    .use(isAuth)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existingDeck = await db.deck.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      })

      if (!existingDeck) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deck not found' })

      await db.deck.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Get deck statistics
  getDeckStats: publicProcedure
    .use(isAuth)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const deck = await db.deck.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          cards: {
            select: {
              difficulty: true,
              reviewCount: true,
              correctCount: true,
              lastReviewed: true,
            },
          },
        },
      })

      if (!deck) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deck not found' })

      const totalCards = deck.cards.length
      const reviewedCards = deck.cards.filter((card) => card.lastReviewed).length
      const unReviewedCards = totalCards - reviewedCards
      const avgDifficulty =
        totalCards > 0 ? deck.cards.reduce((sum, card) => sum + card.difficulty, 0) / totalCards : 0
      const totalReviews = deck.cards.reduce((sum, card) => sum + card.reviewCount, 0)
      const totalCorrect = deck.cards.reduce((sum, card) => sum + card.correctCount, 0)
      const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0

      return {
        totalCards,
        reviewedCards,
        unReviewedCards,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        totalReviews,
        accuracy: Math.round(accuracy * 10) / 10,
      }
    }),

  // Create new card
  createCard: publicProcedure
    .use(isAuth)
    .input(
      z.object({
        deckId: z.string(),
        front: z.string().min(1).max(500),
        back: z.string().min(1).max(1000),
        hint: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Verify deck ownership
      const deck = await db.deck.findFirst({
        where: { id: input.deckId, userId: ctx.user.id },
      })

      if (!deck) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deck not found' })

      const card = await db.card.create({
        data: {
          front: input.front,
          back: input.back,
          hint: input.hint,
          deckId: input.deckId,
        },
      })

      return card
    }),

  // Update a card
  updateCard: publicProcedure
    .use(isAuth)
    .input(
      z.object({
        id: z.string(),
        front: z.string().min(1).max(500).optional(),
        back: z.string().min(1).max(1000).optional(),
        hint: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Verify card ownership through deck
      const existingCard = await db.card.findFirst({
        where: { id },
        include: { deck: true },
      })

      if (!existingCard || existingCard.deck.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card not found' })
      }

      const card = await db.card.update({
        where: { id },
        data: updateData,
      })

      return card
    }),

  // Delete a card
  deleteCard: publicProcedure
    .use(isAuth)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify card ownership through deck
      const existingCard = await db.card.findFirst({
        where: { id: input.id },
        include: { deck: true },
      })

      if (!existingCard || existingCard.deck.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card not found' })
      }

      await db.card.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
