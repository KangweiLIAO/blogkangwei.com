import { Button } from '@/components/Button'
import { Github, Linkedin, FileText } from 'lucide-react'
import Link from '@/components/Link'
import { InteractiveDots } from '@/components/InteractiveDots'
import siteMetadata from '@/data/siteMetadata'

export default function Home() {
  return (
    <div className="from-background to-background/95 relative h-[calc(100vh-25vh)] overflow-hidden bg-gradient-to-b">
      {/* Interactive dot pattern background */}
      <div className="absolute inset-0 h-full w-full" aria-hidden="true">
        <InteractiveDots />
      </div>

      {/* Main content */}
      <main className="container relative z-10 mx-auto px-6 pt-20 lg:pt-32">
        <div className="max-w-[640px]">
          <div className="space-y-6">
            <h1 className="space-y-4">
              <span className="text-muted-foreground block text-lg font-medium">Hi, I am</span>
              <span className="block text-6xl font-bold tracking-tight lg:text-7xl">
                {siteMetadata.author}
              </span>
            </h1>
            <p className="text-muted-foreground text-xl">{siteMetadata.description}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="pill" size="pill" asChild>
                <Link href="/resume" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Resume
                </Link>
              </Button>
              <Button variant="pill" size="pill" asChild>
                <Link
                  href={siteMetadata.github || '#'}
                  className="gap-2"
                  aria-label="GitHub Profile"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="pill" size="pill" asChild>
                <Link
                  href={siteMetadata.linkedin || '#'}
                  className="gap-2"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
