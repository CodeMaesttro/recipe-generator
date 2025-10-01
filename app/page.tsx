'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, Utensils, X, Sparkles } from 'lucide-react'

interface Recipe {
  name: string
  description: string
  prepTime: number
  cookTime: number
  totalTime: number
  servings: number
  difficulty: string
  ingredients: Array<{
    name: string
    amount: string
    notes?: string
  }>
  equipment: string[]
  instructions: Array<{
    step: number
    instruction: string
    time?: number
  }>
  tips: string[]
  nutritionHighlights: string[]
}

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [cuisine, setCuisine] = useState('')
  const [timeAvailable, setTimeAvailable] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const generateRecipe = async () => {
    if (ingredients.length === 0 || !cuisine || !timeAvailable) {
      alert('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          equipment,
          cuisine,
          timeAvailable: parseInt(timeAvailable),
          dietaryRestrictions,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recipe')
      }

      const data = await response.json()
      setRecipe(data.recipe)
    } catch (error) {
      console.error('Error generating recipe:', error)
      alert('Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const equipmentOptions = [
    'Stovetop', 'Oven', 'Microwave', 'Air Fryer', 'Slow Cooker', 'Pressure Cooker',
    'Grill', 'Blender', 'Food Processor', 'Stand Mixer', 'Hand Mixer', 'Toaster'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">AI Recipe Generator</h1>
            <Sparkles className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-lg text-gray-600">Create delicious recipes from your available ingredients using AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Recipe Preferences
              </CardTitle>
              <CardDescription>
                Tell us what you have and what you're craving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ingredients */}
              <div>
                <Label htmlFor="ingredients" className="text-sm font-medium">
                  Available Ingredients *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="ingredients"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="e.g., chicken breast, tomatoes, garlic"
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <Button onClick={addIngredient} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                      {ingredient}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeIngredient(ingredient)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <Label className="text-sm font-medium">Available Equipment</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {equipmentOptions.map((item) => (
                    <label key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={equipment.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEquipment([...equipment, item])
                          } else {
                            setEquipment(equipment.filter(eq => eq !== item))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine Type */}
              <div>
                <Label htmlFor="cuisine" className="text-sm font-medium">
                  Cuisine Type *
                </Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="mexican">Mexican</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="thai">Thai</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="comfort-food">Comfort Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Available */}
              <div>
                <Label htmlFor="time" className="text-sm font-medium">
                  Time Available (minutes) *
                </Label>
                <Select value={timeAvailable} onValueChange={setTimeAvailable}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How much time do you have?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes (Quick & Easy)</SelectItem>
                    <SelectItem value="30">30 minutes (Fast)</SelectItem>
                    <SelectItem value="45">45 minutes (Moderate)</SelectItem>
                    <SelectItem value="60">1 hour (Standard)</SelectItem>
                    <SelectItem value="90">1.5 hours (Elaborate)</SelectItem>
                    <SelectItem value="120">2+ hours (Slow Cook)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <Label htmlFor="dietary" className="text-sm font-medium">
                  Dietary Restrictions (Optional)
                </Label>
                <Textarea
                  id="dietary"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., vegetarian, gluten-free, dairy-free, low-sodium"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <Button 
                onClick={generateRecipe} 
                disabled={isGenerating || ingredients.length === 0 || !cuisine || !timeAvailable}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Recipe...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Recipe
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Recipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Your Generated Recipe
              </CardTitle>
              <CardDescription>
                {recipe ? 'Here\'s your personalized recipe!' : 'Your recipe will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-lg font-medium">Creating your perfect recipe...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                </div>
              ) : recipe ? (
                <div className="space-y-6">
                  {/* Recipe Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{recipe.name}</h3>
                    <p className="text-gray-600 mt-1">{recipe.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.totalTime} min total</span>
                      </div>
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                      <Badge variant="outline">{recipe.servings} servings</Badge>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Ingredients</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{ingredient.name}</span>
                          <span className="text-gray-600">{ingredient.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Equipment */}
                  {recipe.equipment.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Equipment Needed</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.equipment.map((item, index) => (
                          <Badge key={index} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Instructions</h4>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {instruction.step}
                          </span>
                          <div>
                            <p>{instruction.instruction}</p>
                            {instruction.time && (
                              <p className="text-sm text-gray-500 mt-1">⏱️ {instruction.time} minutes</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {recipe.tips.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Chef's Tips</h4>
                      <ul className="space-y-1">
                        {recipe.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-700">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nutrition Highlights */}
                  {recipe.nutritionHighlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Nutrition Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.nutritionHighlights.map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Fill out the form and click "Generate Recipe" to get started!</p>
                  <p className="text-sm mt-2">Try ingredients like: chicken, rice, tomatoes, garlic</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
