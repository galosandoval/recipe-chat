import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextRequest } from 'next/server'
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi
} from 'openai-edge'
import { z } from 'zod'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export const config = {
  runtime: 'edge'
}

const chatParams = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ),
  filters: z.array(z.string()),

  locale: z.string()
})

export default async function handler(req: NextRequest) {
  const request = await req.json()

  const input = chatParams.parse(request)

  const { filters, messages, locale } = input

  let filtersMessage = ''

  if (filters.length) {
    filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
      ', '
    )}.`

    if (locale === 'es') {
      filtersMessage = ` Los siguientes filtros deben aplicarse a la receta: ${filters.join(
        ', '
      )}.`
    }
  }

  let systemMessage =
    'You are a helpful assistant that only responds with recipes. The response you give should contain the name of the recipe, a description, preparation time, cook time, category, ingredients and instructions. Include a friendly intro and outro to the response.'

  if (locale === 'es') {
    systemMessage =
      'Eres un asistente útil que solo responde con recetas. La respuesta que proporcionas debe contener el nombre de la receta, una descripción, el tiempo de preparación, el tiempo de cocción, la categoría, los ingredientes e instrucciones. Incluye un saludo amigable al principio y un mensaje de despedida al final de la respuesta.'
  }

  systemMessage += filtersMessage

  const params: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: systemMessage
    }
  ]

  if (messages.length > 1) {
    params.push(...messages)
  } else {
    let userContent = 'What should I make for dinner tonight?'
    if (locale === 'es') {
      userContent = '¿Qué debo hacer para cenar esta noche?'
    }

    let assitantContent =
      "Hello there! I'd be happy to help you decide what to make for dinner tonight. How about trying out a delicious recipe for Lemon Garlic Butter Salmon? This recipe is sure to be a hit at the dinner table!\n\nName: Lemon Garlic Butter Salmon\nDescription: Easy to make to make and packed with flavor.\nPreparation time: 10 minutes\nCook time: 10-15 minutes\nCategory: Seafood, Dinner, American\n\nIngredients:\n4 salmon fillets\n4 cloves garlic, minced\n6 tbsp butter\n2 tbsp honey\n2 tbsp lemon juice\nSalt and pepper, to taste\n1 tbsp parsley, chopped\n\nInstructions:\nPreheat your oven to 400°F and line a baking pan with foil.\nIn a saucepan, melt the butter over medium heat. Add the minced garlic and stir for 1-2 minutes. Remove from heat and mix in the honey and lemon juice.\nPlace the salmon fillets on the prepared baking pan and season with salt and pepper.\nPour the lemon garlic butter mixture over the salmon fillets.\n Bake the salmon for 10-15 minutes, or until it flakes easily with a fork.\n Once cooked, garnish the salmon with chopped parsley and serve immediately.\n\nI hope you enjoy making and eating this delicious Lemon Garlic Butter Salmon recipe! Let me know if you need any further assistance."

    if (locale === 'es') {
      assitantContent =
        '¡Hola! Estoy encantado de ayudarte a decidir qué preparar para la cena esta noche. ¿Qué te parece probar una deliciosa receta de Salmón con Mantequilla, Ajo y Limón? ¡Esta receta seguramente será un éxito en la mesa de la cena!\n\nNombre: Salmón con Mantequilla, Ajo y Limón\nDescripción: Fácil de hacer y repleto de sabor.\nTiempo de preparación: 10 minutos\nTiempo de cocción: 10-15 minutos\nCategoría: Mariscos, Cena, Estadounidense\n\nIngredientes:\n4 filetes de salmón\n4 dientes de ajo, picados\n6 cucharadas de mantequilla\n2 cucharadas de miel\n2 cucharadas de jugo de limón\nSal y pimienta al gusto\n1 cucharada de perejil picado\n\nInstrucciones:\nPrecalienta tu horno a 400°F y forra una bandeja para hornear con papel de aluminio.\nEn una cacerola, derrite la mantequilla a fuego medio. Agrega el ajo picado y revuelve durante 1-2 minutos. Retira del fuego y mezcla con la miel y el jugo de limón.\nColoca los filetes de salmón en la bandeja para hornear preparada y sazona con sal y pimienta.\nVierte la mezcla de mantequilla, ajo y limón sobre los filetes de salmón.\nHornea el salmón durante 10-15 minutos, o hasta que se desmenuce fácilmente con un tenedor.\nUna vez cocido, decora el salmón con perejil picado y sírvelo de inmediato.\n\n¡Espero que disfrutes preparando y comiendo esta deliciosa receta de Salmón con Mantequilla, Ajo y Limón! Déjame saber si necesitas más ayuda.'
    }

    params.push(
      {
        role: 'user',
        content: userContent
      },
      {
        role: 'assistant',
        content: assitantContent
      },
      ...messages
    )
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    stream: true,
    messages: params
    // functions: [
    //   {
    //     name: 'save_recipe',
    //     description: 'Saves a generated recipe to the database',
    //     parameters: {
    //       type: 'object',

    //       properties: {
    //         name: {
    //           type: 'string',
    //           description: 'The name of the recipe'
    //         },
    //         description: {
    //           type: 'string',
    //           description: 'A description of the recipe'
    //         },
    //         prepTime: {
    //           type: 'string',
    //           description: 'The preparation time of the recipe'
    //         },
    //         cookTime: {
    //           type: 'string',
    //           description: 'The cook time of the recipe'
    //         },
    //         category: {
    //           type: 'string',
    //           description: 'The category of the recipe, e.g. Italian'
    //         },
    //         ingredients: {
    //           type: 'array',
    //           items: {
    //             type: 'string'
    //           },
    //           description: 'The ingredients of the recipe'
    //         },
    //         instructions: {
    //           type: 'array',
    //           items: {
    //             type: 'string'
    //           },
    //           description: 'The instructions of the recipe'
    //         }
    //       },

    //       required: [
    //         'name',
    //         'description',
    //         'prepTime',
    //         'cookTime',
    //         'category',
    //         'ingredients',
    //         'instructions'
    //       ]
    //     }
    //   }
    // ],
    // function_call: 'auto'
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
