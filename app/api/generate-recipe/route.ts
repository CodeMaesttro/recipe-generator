import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string().describe('Creative and appetizing recipe name'),
    description: z.string().describe('Brief, enticing description of the dish'),
    prepTime: z.number().describe('Preparation time in minutes'),
    cookTime: z.number().describe('Cooking time in minutes'),
    totalTime: z.number().describe('Total time in minutes'),
    servings: z.number().describe('Number of servings'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level'),
    ingredients: z.array(z.object({
      name: z.string().describe('Ingredient name'),
      amount: z.string().describe('Amount needed (e.g., 2 cups, 1 lb)'),
      notes: z.string().optional().describe('Optional preparation notes')
    })).describe('List of ingredients with amounts'),
    equipment: z.array(z.string()).describe('Kitchen equipment needed from the available list'),
    instructions: z.array(z.object({
      step: z.number().describe('Step number'),
      instruction: z.string().describe('Detailed instruction for this step'),
      time: z.number().optional().describe('Time for this step in minutes if applicable')
    })).describe('Step-by-step cooking instructions'),
    tips: z.array(z.string()).describe('Helpful cooking tips and variations'),
    nutritionHighlights: z.array(z.string()).describe('Key nutritional benefits or highlights')
  })
})

// Mock recipe generator for when API is not available
function generateMockRecipe(ingredients: string[], cuisine: string, timeAvailable: number, equipment: string[]) {
  const cuisineRecipes = {
    italian: {
      name: "Rustic Italian Pasta",
      description: "A hearty pasta dish with fresh ingredients and authentic Italian flavors",
    },
    mexican: {
      name: "Zesty Mexican Bowl",
      description: "A vibrant and flavorful Mexican-inspired dish with fresh ingredients",
    },
    asian: {
      name: "Asian Fusion Stir-Fry",
      description: "A quick and delicious stir-fry with Asian-inspired flavors",
    },
    american: {
      name: "Classic American Comfort Food",
      description: "A satisfying American-style dish perfect for any occasion",
    },
    mediterranean: {
      name: "Mediterranean Delight",
      description: "A healthy and flavorful Mediterranean dish with fresh ingredients",
    },
    indian: {
      name: "Aromatic Indian Curry",
      description: "A fragrant and spicy Indian dish with warming spices",
    },
    french: {
      name: "French Bistro Classic",
      description: "An elegant French dish with sophisticated flavors",
    },
    thai: {
      name: "Thai Street Food Special",
      description: "A bold and flavorful Thai dish with authentic ingredients",
    },
    japanese: {
      name: "Japanese Home Cooking",
      description: "A simple yet refined Japanese dish with clean flavors",
    },
    "comfort-food": {
      name: "Ultimate Comfort Food",
      description: "A warming and satisfying comfort food dish",
    }
  }

  const recipeTemplate = cuisineRecipes[cuisine as keyof typeof cuisineRecipes] || cuisineRecipes.american
  
  // Use actual ingredients provided by user
  const recipeIngredients = ingredients.slice(0, 8).map((ingredient, index) => ({
    name: ingredient,
    amount: index === 0 ? "1 lb" : index === 1 ? "2 cups" : index === 2 ? "3 cloves" : index === 3 ? "1 cup" : "1/2 cup",
    notes: index === 0 ? "main ingredient" : undefined
  }))

  // Add some basic ingredients if needed
  if (recipeIngredients.length < 4) {
    recipeIngredients.push(
      { name: "olive oil", amount: "2 tbsp" },
      { name: "salt", amount: "to taste" },
      { name: "black pepper", amount: "to taste" }
    )
  }

  const difficulty = timeAvailable <= 30 ? 'Easy' : timeAvailable <= 60 ? 'Medium' : 'Hard'
  const prepTime = Math.min(15, Math.floor(timeAvailable * 0.3))
  const cookTime = timeAvailable - prepTime
  
  const steps = [
    {
      step: 1,
      instruction: `Prepare all ingredients by washing and chopping ${ingredients[0] || 'main ingredient'}. Gather your equipment and organize your workspace.`,
      time: prepTime
    },
    {
      step: 2,
      instruction: `Heat olive oil in your cooking vessel and add aromatics like garlic, onions, or ginger to build the flavor base.`,
      time: 3
    },
    {
      step: 3,
      instruction: `Add your main ingredients and cook according to the ${cuisine} style, stirring occasionally to prevent sticking.`,
      time: Math.floor(cookTime * 0.6)
    },
    {
      step: 4,
      instruction: `Season with salt, pepper, and cuisine-specific spices. Taste and adjust flavors as needed.`,
      time: 2
    },
    {
      step: 5,
      instruction: `Finish cooking and let rest briefly. Garnish appropriately and serve hot.`,
      time: Math.floor(cookTime * 0.2)
    }
  ]
  
  return {
    recipe: {
      name: recipeTemplate.name,
      description: recipeTemplate.description,
      prepTime,
      cookTime,
      totalTime: timeAvailable,
      servings: 4,
      difficulty,
      ingredients: recipeIngredients,
      equipment: equipment.slice(0, 3).length > 0 ? equipment.slice(0, 3) : ["Stovetop", "Pan", "Knife"],
      instructions: steps,
      tips: [
        "Taste and adjust seasoning throughout the cooking process",
        "Don't overcrowd the pan - cook in batches if necessary",
        "Fresh ingredients make a significant difference in flavor",
        `This ${cuisine} dish pairs well with rice, bread, or a simple salad`
      ],
      nutritionHighlights: [
        "Rich in vitamins and minerals",
        "Good source of protein",
        "Contains healthy fats",
        "Balanced macronutrients"
      ]
    }
  }
}

export async function POST(req: Request) {
  try {
    const { ingredients, equipment, cuisine, timeAvailable, dietaryRestrictions } = await req.json()

    // Check if we have an API key available
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0

    if (hasApiKey) {
      try {
        const equipmentList = equipment.length > 0 ? equipment.join(', ') : 'basic kitchen tools'
        const dietaryText = dietaryRestrictions ? ` The recipe should accommodate these dietary restrictions: ${dietaryRestrictions}.` : ''

        const prompt = `Create a delicious ${cuisine} recipe using these available ingredients: ${ingredients.join(', ')}. 
        
        Available equipment: ${equipmentList}
        Maximum total cooking time: ${timeAvailable} minutes
        ${dietaryText}
        
        Requirements:
        - Use as many of the provided ingredients as possible
        - Stay within the time limit of ${timeAvailable} minutes
        - Only use equipment from the available list
        - Make the recipe practical and delicious
        - Include helpful tips and cooking techniques
        - Ensure the recipe fits the ${cuisine} cuisine style
        - Provide realistic cooking times for each step
        - Include nutritional highlights of the dish
        
        If some ingredients don't work well together or with the cuisine type, prioritize the most important ones and suggest the best combination. Be creative but practical.`

        const { object } = await generateObject({
          model: openai('gpt-4o'),
          schema: recipeSchema,
          prompt,
        })

        return Response.json(object)
      } catch (aiError) {
        console.log('AI generation failed, falling back to mock recipe:', aiError)
        // Fall back to mock recipe if AI fails
        const mockRecipe = generateMockRecipe(ingredients, cuisine, timeAvailable, equipment)
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
        return Response.json(mockRecipe)
      }
    } else {
      // Use mock recipe generation when no API key is available
      console.log('No API key available, using mock recipe generation')
      const mockRecipe = generateMockRecipe(ingredients, cuisine, timeAvailable, equipment)
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
      return Response.json(mockRecipe)
    }
  } catch (error) {
    console.error('Error in recipe generation:', error)
    return Response.json(
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    )
  }
}
