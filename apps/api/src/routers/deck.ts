import { TRPCError } from '@trpc/server'
import { db } from 'src/lib/db'
import { isAuth } from 'src/trpc/middleware'
import { publicProcedure, router } from 'src/trpc/utils'
import { z } from 'zod'

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
})
