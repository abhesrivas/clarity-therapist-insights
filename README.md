# Clarity: AI-Powered Therapy Assistant

![Clarity Banner](clarity_logo.png)

A powerful AI assistant platform for therapists. Enhance your clinical work with data-driven insights, practice sessions, and advanced patient analysis.

![Clarity Dashboard](docs/images/dashboard.png)

## Features

- **Patient History Timeline** - Track progress and spot patterns
- **Therapeutic Rehearsal** - Practice with simulated patient responses
- **Topic Detection** - Identify key themes using ML
- **Treatment Planning** - Create evidence-based plans 
- **Condition Screening** - Get probability-based screening results

<p align="center">
  <img src="docs/images/demo.gif" alt="Clarity Demo" width="600px">
</p>

## Quick Setup

```bash
# Install dependencies
bun install

# Add OpenAI API key to .env.local
echo "VITE_OPENAI_API_KEY=your_key_here" > .env.local

# Run the app
bun run dev
```

## Technology

- React 19 with Vite
- Tailwind CSS
- Framer Motion
- OpenAI API integration
- Custom ML models for topic detection

## Security Note

This is a demonstration application. Do not use with real patient data.

[View Demo](https://your-demo-url.com) | [Documentation](docs/README.md)
