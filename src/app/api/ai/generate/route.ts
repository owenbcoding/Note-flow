import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, type = 'general' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Create different prompts based on the type of note
    let systemPrompt = ''
    switch (type) {
      case 'meeting':
        systemPrompt = 'You are a helpful assistant that creates structured meeting notes. Include key points, decisions made, action items, and next steps. Format it clearly with headings and bullet points.'
        break
      case 'study':
        systemPrompt = 'You are a helpful assistant that creates comprehensive study notes. Include key concepts, definitions, examples, and important points. Organize information in a clear, educational format.'
        break
      case 'idea':
        systemPrompt = 'You are a creative assistant that helps expand and develop ideas. Provide detailed exploration of the concept, potential applications, considerations, and next steps.'
        break
      case 'journal':
        systemPrompt = 'You are a thoughtful writing assistant that helps create reflective journal entries. Encourage self-reflection, insights, and personal growth.'
        break
      default:
        systemPrompt = 'You are a helpful assistant that creates well-structured, informative notes. Organize the content clearly with headings, bullet points, and logical flow.'
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey.length < 20) {
      console.error('OpenAI API key is missing or invalid. See AI_SETUP.md to configure one.')
      return NextResponse.json(
        { error: 'AI features are not configured. Please set OPENAI_API_KEY in your .env.local file and restart the server.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const generatedText = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ 
      success: true, 
      generatedText,
      usage: completion.usage 
    })

  } catch (error: unknown) {
    console.error('OpenAI API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate text'
    const err = error as { status?: number; message?: string }
    if (err?.status === 401) {
      errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local'
    } else if (err?.status === 429) {
      errorMessage = 'OpenAI API rate limit exceeded. Please try again later.'
    } else if (err?.status === 500) {
      errorMessage = 'OpenAI API service error. Please try again later.'
    } else if (err?.message) {
      errorMessage = err.message
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
}
