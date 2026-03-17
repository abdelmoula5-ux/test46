@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;

    --background: 40 33% 97%;
    --foreground: 220 40% 13%;

    --card: 0 0% 100%;
    --card-foreground: 220 40% 13%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 40% 13%;

    --primary: 220 60% 20%;
    --primary-foreground: 40 33% 97%;

    --secondary: 40 30% 93%;
    --secondary-foreground: 220 40% 13%;

    --muted: 40 20% 94%;
    --muted-foreground: 220 15% 50%;

    --accent: 12 80% 60%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --border: 220 20% 88%;
    --input: 220 20% 88%;
    --ring: 220 60% 20%;

    --radius: 0.75rem;

    --coral: 12 80% 60%;
    --coral-foreground: 0 0% 100%;
    --navy: 220 60% 20%;
    --navy-light: 220 40% 35%;
    --cream: 40 33% 97%;
    --cream-dark: 40 20% 90%;

    --sidebar-background: 220 60% 20%;
    --sidebar-foreground: 40 33% 97%;
    --sidebar-primary: 12 80% 60%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 220 40% 28%;
    --sidebar-accent-foreground: 40 33% 97%;
    --sidebar-border: 220 40% 28%;
    --sidebar-ring: 12 80% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
  }
}

@layer utilities {
  .gradient-hero {
    background: linear-gradient(135deg, hsl(220 60% 20%) 0%, hsl(220 40% 35%) 50%, hsl(12 80% 60%) 100%);
  }
  .gradient-coral {
    background: linear-gradient(135deg, hsl(12 80% 60%) 0%, hsl(20 90% 55%) 100%);
  }
  .glass-card {
    background: hsla(0, 0%, 100%, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid hsla(220, 20%, 88%, 0.5);
  }
}
