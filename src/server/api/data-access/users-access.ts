import { cuid } from '~/lib/createId'
import { hash } from 'bcryptjs'
import { DataAccess } from './data-access'
import { initialFilters } from '~/lib/stock-filters'
import type { SignUpSchema } from '~/schemas/sign-up-schema'
import type { CreateChatAndRecipe } from '~/schemas/chats-schema'
import { slugify } from '~/lib/utils'

export class UsersAccess extends DataAccess {
  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id }
    })
  }

  async updatePreferredUnits(
    userId: string,
    data: {
      preferredWeightUnit?: string | null
      preferredVolumeUnit?: string | null
    }
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.preferredWeightUnit !== undefined && {
          preferredWeightUnit: data.preferredWeightUnit
        }),
        ...(data.preferredVolumeUnit !== undefined && {
          preferredVolumeUnit: data.preferredVolumeUnit
        })
      }
    })
  }

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  async createUser(input: SignUpSchema) {
    const { email, password } = input
    const username = email.toLowerCase()
    const hashedPassword = await hash(password, 10)
    return await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        list: { create: {} },
        filter: {
          createMany: {
            data: initialFilters.map((filter) => ({
              name: filter,
              checked: false
            }))
          }
        }
      }
    })
  }

  /**
   * Seeds a brand-new chat and its recipe in one nested write, linking the
   * recipe to the chat's final message. Returns the recipe's slug, which is the
   * only thing the caller routes on.
   */
  async createChatAndRecipe(userId: string, input: CreateChatAndRecipe) {
    const { recipe, messages } = input
    const { ingredients, instructions, ...rest } = recipe
    const messageId = cuid()
    const slug = slugify(recipe.name)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        chats: {
          create: {
            id: cuid(),
            messages: {
              createMany: {
                data: messages.map((message, i, array) => ({
                  content: message.content,
                  role: message.role,
                  // Only the last message anchors the recipe link below.
                  ...(i === array.length - 1 && { id: messageId })
                }))
              }
            }
          }
        },
        recipes: {
          create: {
            id: cuid(),
            slug,
            ingredients: {
              create: ingredients.map((ingredient) => ({
                rawString: ingredient
              }))
            },
            instructions: {
              create: instructions.map((instruction) => ({
                description: instruction
              }))
            },
            ...rest,
            messages: { create: { messageId } }
          }
        }
      }
    })

    return { slug }
  }
}

export const usersAccess = new UsersAccess()
