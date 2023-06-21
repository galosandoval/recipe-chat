import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextRequest } from 'next/server'
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi
} from 'openai-edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export const config = {
  runtime: 'edge'
}

export default async function handler(req: NextRequest) {
  const request = await req.json()
  console.log('request', request)

  const messages = request.messages
  if (request?.messages) {
    console.log('messages', messages)
    const systemMessage =
      // 'You are a helpful assistant that only responds with recipes. The response you give should contain the name of the recipe, a description, preparation time, cook time, ingredients and instructions. Include a friendly intro and outro to the response. The reponse format should strictly be a javascript object with the following keys: intro, name, prepTime, cookTime, description, category, ingredients, instructions, outro.'
      'You are a helpful assistant that only responds with recipes. The response you give should contain the name of the recipe, a description, preparation time, cook time, category, ingredients and instructions. Include a friendly intro and outro to the response.'

    // if (filters && filters.length) {
    //   const filterMessage = ` You have filters enabled for this conversation. The filters are: ${filters.join(
    //     ', '
    //   )}.`

    //   systemMessage += filterMessage
    // }

    const params: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: systemMessage
      }
      // ...messages
    ]

    // const inputMessage: ChatCompletionRequestMessage = {
    //   role: 'user',
    //   content: prompt
    // }

    if (messages.length > 1) {
      params.push(...messages)
    } else {
      params.push(
        {
          role: 'user',
          content: 'What should I make for dinner tonight?'
        },
        {
          role: 'assistant',
          content:
            // '{"intro": "Here is a recipe for Mushroom Risotto. It is a classic Italian rice dish with earthy and savory mushrooms.","name": "Mushroom Risotto","prepTime": "10 minutes","cookTime": "30 minutes","category": "Italian","description":"A classic version of the Italian rice dish with earthy and savory mushrooms.","ingredients": ["1 cup Arborio rice","4 tablespoons unsalted butter, divided","1 onion, chopped","2 garlic cloves, minced","8 oz. mushrooms, sliced","4 cups chicken or vegetable broth","1/2 cup dry white wine","1/2 cup grated Parmesan cheese","Salt and pepper, to taste"],"instructions": ["1. In a large saucepan, melt 2 tablespoons of butter over medium heat. Add the onion and garlic and sauté until soft, about 2 minutes.","2. Add the mushrooms and sauté until browned and tender, about 5 minutes.","3. In another saucepan, heat the broth over medium heat until it comes to a simmer.","4. Add the rice to the mushroom mixture and stir to coat. Toast the rice for 2-3 minutes until it becomes translucent around the edges.","5. Add the wine and stir until it is absorbed by the rice.","6. Add the simmering broth, one ladleful at a time, stirring constantly and allowing the rice to absorb the liquid before adding more.","7. Repeat this process for about 20-25 minutes, or until the rice is tender but still firm to the bite.","8. Remove the risotto from heat and stir in the remaining butter and Parmesan cheese until it is melted and creamy.","9. Season with salt and pepper to taste and garnish with additional grated Parmesan cheese or chopped parsley, if desired."], "outro": "I hope you enjoy it!"}'
            "Hello there! I'd be happy to help you decide what to make for dinner tonight. How about trying out a delicious recipe for Lemon Garlic Butter Salmon? This recipe is sure to be a hit at the dinner table!\n\nName: Lemon Garlic Butter Salmon\nDescription: Easy to make to make and packed with flavor.\nPreparation time: 10 minutes\nCook time: 10-15 minutes\nCategory: Seafood, Dinner, American\n\nIngredients:\n4 salmon fillets\n4 cloves garlic, minced\n6 tbsp butter\n2 tbsp honey\n2 tbsp lemon juice\nSalt and pepper, to taste\n1 tbsp parsley, chopped\n\nInstructions:\nPreheat your oven to 400°F and line a baking pan with foil.\nIn a saucepan, melt the butter over medium heat. Add the minced garlic and stir for 1-2 minutes. Remove from heat and mix in the honey and lemon juice.\nPlace the salmon fillets on the prepared baking pan and season with salt and pepper.\nPour the lemon garlic butter mixture over the salmon fillets.\n Bake the salmon for 10-15 minutes, or until it flakes easily with a fork.\n Once cooked, garnish the salmon with chopped parsley and serve immediately.\n\nI hope you enjoy making and eating this delicious Lemon Garlic Butter Salmon recipe! Let me know if you need any further assistance."
        },
        ...messages
      )
    }

    console.log('params', params)
    // Ask OpenAI for a streaming chat completion given the prompt
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
}
